// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightTheme = themes.github;
const darkTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Programming Tutorials',
  tagline: 'Comprehensive development guides and tutorials',
  favicon: 'img/favicon-simple.svg',

  url: 'https://chevp.github.io',
  baseUrl: '/',

  organizationName: 'chevp',
  projectName: 'tutorials',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/chevp/tutorials/tree/main/',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-S6NWLDYF7M',
        anonymizeIP: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Programming Tutorials',
        logo: {
          alt: '🐧',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorials',
          },
          {
            href: 'https://github.com/chevp/tutorials',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Frontend Technologies',
            items: [
              {
                label: 'Angular CLI',
                to: '/frontend-technologies/Angular_CLI_Tutorial',
              },
              {
                label: 'React.js',
                to: '/frontend-technologies/ReactJS_Tutorial',
              },
              {
                label: 'Playwright',
                to: '/development-tools/Playwright_Tutorial',
              },
            ],
          },
          {
            title: 'Backend & Frameworks',
            items: [
              {
                label: 'Java Spring Boot',
                to: '/platforms-and-frameworks/Java_Spring_Boot_Tutorial',
              },
              {
                label: 'Node.js',
                to: '/development-tools/NodeJS_Tutorial',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/chevp/tutorials',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Programming Tutorials. Built with Docusaurus.`,
      },
      prism: {
        theme: lightTheme,
        darkTheme: darkTheme,
        additionalLanguages: ['java', 'csharp', 'php', 'kotlin', 'swift', 'dart'],
      },
    }),
};

module.exports = config;