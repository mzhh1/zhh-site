import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '纸灰灰的网站',
  tagline: '「Tracing footprints on the wind」',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://me.mzhh.xyz',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mzhh1', // Usually your GitHub org/user name.
  projectName: 'zhh-site', // Usually your repo name.
  trailingSlash: undefined,
  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: false, // 禁用默认的 docs 插件，改用多实例
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'projects',
        path: 'docs',
        routeBasePath: 'docs',
        sidebarPath: './sidebars.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'thoughts',
        path: 'docs2',
        routeBasePath: 'thoughts',
        sidebarPath: './sidebars2.ts',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '纸的航迹',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'thoughtsSidebar',
          position: 'left',
          label: 'Thoughts',
          docsPluginId: 'thoughts',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Projects',
          docsPluginId: 'projects',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/mzhh1/zhh-site',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '想法',
              to: '/thoughts/intro',
            },
            {
              label: '项目文档',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '项目',
          items: [
            {
              label: '星枢沙盒',
              href: 'https://nexus.mzhh.xyz',
            },
            {
              label: '纸核',
              href: 'https://114.132.91.247/',
            }
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '生活',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} zhh-site. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
