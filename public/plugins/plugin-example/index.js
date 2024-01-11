console.log(`✎: [index.js][${new Date().toString()}] MY EXTERNAL SCRIPT!`);

export default {
  onMounted: () => {
    console.log(`✎: [index.js][${new Date().toString()}] on mounted`);
  },
  onUnmounted: () => {
    console.log(`✎: [index.js][${new Date().toString()}] on before mount`);
  },
};

export const manifest = {
  category: 'ui',
  name: 'Colorful Headlines',
  apiVersion: '0.13.4',
  version: '0.0.1',
  description: 'Package for pretty hedaline print!',
  keywords: ['ui', 'headline'], //
  repo: 'https://github.com/artawower/org-note',
};
