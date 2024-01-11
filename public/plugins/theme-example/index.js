export default {
  onMounted: async (api) => {
    api.ui.applyTheme({
      blue: '#61afef',
      red: '#e06c75',
      bg: '#282c34',
      bgAlt: '#21252b',
      fg: '#abb2bf',
      white: '#abb2bf',
      green: '#98c379',
      orange: '#d19a66',
      yellow: '#e5c07b',
      violet: '#c678dd',
      cyan: '#56b6c2',
    });
  },
};

export const manifest = {
  category: 'theme',
  name: 'Atom One Dark Theme',
  apiVersion: '0.13.4',
  version: '0.0.1',
  description: 'Package for pretty hedaline print!',
  keywords: ['ui', 'theme'], //
  repo: 'https://github.com/artawower/orgnote',
};
