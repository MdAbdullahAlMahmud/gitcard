import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { formatNumber } from './utils/format.js';
import type { RepoSnapshot } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Register helpers
Handlebars.registerHelper('formatNum', (n: number) => formatNumber(n));
Handlebars.registerHelper('formatPercent', (n: number) => (Math.round(n * 10) / 10).toFixed(1));
Handlebars.registerHelper('formatDate', (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
});

let compiledTemplate: Handlebars.TemplateDelegate | null = null;
let cachedStyles: string | null = null;

async function getTemplate(): Promise<Handlebars.TemplateDelegate> {
  if (!compiledTemplate) {
    const src = await fs.readFile(path.join(TEMPLATES_DIR, 'card.hbs'), 'utf-8');
    compiledTemplate = Handlebars.compile(src);
  }
  return compiledTemplate;
}

async function getStyles(): Promise<string> {
  if (!cachedStyles) {
    cachedStyles = await fs.readFile(path.join(TEMPLATES_DIR, 'styles.css'), 'utf-8');
  }
  return cachedStyles;
}

export async function renderCard(snapshot: RepoSnapshot): Promise<string> {
  const [template, styles] = await Promise.all([getTemplate(), getStyles()]);
  return template({ ...snapshot, styles });
}
