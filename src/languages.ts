export interface LanguageInfo {
  name: string;
  color: string;
}

// Extension → language name + GitHub-style color
export const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  // TypeScript / JavaScript
  ts: { name: 'TypeScript', color: '#3178c6' },
  tsx: { name: 'TypeScript', color: '#3178c6' },
  mts: { name: 'TypeScript', color: '#3178c6' },
  js: { name: 'JavaScript', color: '#f1e05a' },
  jsx: { name: 'JavaScript', color: '#f1e05a' },
  mjs: { name: 'JavaScript', color: '#f1e05a' },
  cjs: { name: 'JavaScript', color: '#f1e05a' },

  // Web
  html: { name: 'HTML', color: '#e34c26' },
  htm: { name: 'HTML', color: '#e34c26' },
  css: { name: 'CSS', color: '#563d7c' },
  scss: { name: 'SCSS', color: '#c6538c' },
  sass: { name: 'Sass', color: '#a53b70' },
  less: { name: 'Less', color: '#1d365d' },
  vue: { name: 'Vue', color: '#41b883' },
  svelte: { name: 'Svelte', color: '#ff3e00' },

  // Python
  py: { name: 'Python', color: '#3572A5' },
  pyw: { name: 'Python', color: '#3572A5' },
  pyi: { name: 'Python', color: '#3572A5' },

  // Rust
  rs: { name: 'Rust', color: '#dea584' },

  // Go
  go: { name: 'Go', color: '#00ADD8' },

  // Java / JVM
  java: { name: 'Java', color: '#b07219' },
  kt: { name: 'Kotlin', color: '#A97BFF' },
  kts: { name: 'Kotlin', color: '#A97BFF' },
  scala: { name: 'Scala', color: '#c22d40' },
  groovy: { name: 'Groovy', color: '#4298b8' },

  // C / C++ / C#
  c: { name: 'C', color: '#555555' },
  h: { name: 'C', color: '#555555' },
  cpp: { name: 'C++', color: '#f34b7d' },
  cc: { name: 'C++', color: '#f34b7d' },
  cxx: { name: 'C++', color: '#f34b7d' },
  hpp: { name: 'C++', color: '#f34b7d' },
  cs: { name: 'C#', color: '#178600' },

  // Ruby
  rb: { name: 'Ruby', color: '#701516' },
  erb: { name: 'Ruby', color: '#701516' },

  // PHP
  php: { name: 'PHP', color: '#4F5D95' },

  // Swift / Objective-C
  swift: { name: 'Swift', color: '#F05138' },
  m: { name: 'Objective-C', color: '#438eff' },
  mm: { name: 'Objective-C', color: '#438eff' },

  // Shell
  sh: { name: 'Shell', color: '#89e051' },
  bash: { name: 'Shell', color: '#89e051' },
  zsh: { name: 'Shell', color: '#89e051' },
  fish: { name: 'Shell', color: '#89e051' },

  // Data / Config
  json: { name: 'JSON', color: '#292929' },
  yaml: { name: 'YAML', color: '#cb171e' },
  yml: { name: 'YAML', color: '#cb171e' },
  toml: { name: 'TOML', color: '#9c4221' },
  xml: { name: 'XML', color: '#0060ac' },

  // Dart / Flutter
  dart: { name: 'Dart', color: '#00B4AB' },

  // Elixir / Erlang
  ex: { name: 'Elixir', color: '#6e4a7e' },
  exs: { name: 'Elixir', color: '#6e4a7e' },
  erl: { name: 'Erlang', color: '#B83998' },

  // Haskell
  hs: { name: 'Haskell', color: '#5e5086' },
  lhs: { name: 'Haskell', color: '#5e5086' },

  // Other
  lua: { name: 'Lua', color: '#000080' },
  r: { name: 'R', color: '#198CE7' },
  jl: { name: 'Julia', color: '#a270ba' },
  vim: { name: 'Vim Script', color: '#199f4b' },
  tf: { name: 'HCL', color: '#844FBA' },
  hcl: { name: 'HCL', color: '#844FBA' },
  sql: { name: 'SQL', color: '#e38c00' },
  md: { name: 'Markdown', color: '#083fa1' },
  mdx: { name: 'MDX', color: '#fcb32c' },
};

export function getLanguageInfo(ext: string): LanguageInfo | null {
  return LANGUAGE_MAP[ext.toLowerCase()] ?? null;
}
