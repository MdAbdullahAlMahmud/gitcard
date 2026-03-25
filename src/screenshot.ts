import puppeteer from 'puppeteer';
import path from 'node:path';
import type { CLIOptions } from './types.js';

export async function takeScreenshot(
  html: string,
  options: Pick<CLIOptions, 'format' | 'output' | 'width' | 'height'>,
): Promise<string> {
  const ext = options.format;
  const outputPath = `${options.output}.${ext}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const absPath = path.resolve(outputPath);

    if (ext === 'pdf') {
      await page.pdf({
        path: absPath,
        width: `${options.width}px`,
        height: `${options.height}px`,
        printBackground: true,
      });
    } else if (ext === 'svg') {
      // Export as PNG then note: SVG from Puppeteer isn't natively supported
      // We embed the HTML as a foreign object in SVG
      const pngBuffer = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: options.width, height: options.height } });
      const base64 = pngBuffer.toString('base64');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}">
  <image href="data:image/png;base64,${base64}" width="${options.width}" height="${options.height}"/>
</svg>`;
      const fs = await import('node:fs/promises');
      await fs.writeFile(absPath, svg, 'utf-8');
    } else {
      await page.screenshot({
        path: absPath,
        type: 'png',
        clip: { x: 0, y: 0, width: options.width, height: options.height },
      });
    }

    return absPath;
  } finally {
    await browser.close();
  }
}
