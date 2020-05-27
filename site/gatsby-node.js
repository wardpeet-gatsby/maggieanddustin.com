const slugify = require('limax')
const path = require('path')
const fs = require('fs-extra')

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if (node.internal.type === 'ContentfulBlogPost') {
    actions.createNodeField({
      node,
      name: `slug`,
      value: `/blog/${node.slug}/`,
    })
  } else if (node.internal.type === `ContentfulPage`) {
    actions.createNodeField({
      node,
      name: `slug`,
      value: node.slug === `/` ? node.slug : `/${node.slug}/`,
    })
  } else if (node.internal.type === `ContentfulTrip`) {
    actions.createNodeField({
      node,
      name: `slug`,
      value: `/trips/${node.slug}/`,
    })
  } else if (
    node.title &&
    (node.internal.type === `ContentfulSection` ||
      node.internal.type === `ContentfulGallery`)
  ) {
    actions.createNodeField({
      node,
      name: `slug`,
      value: slugify(node.title),
    })
  }
}

exports.onCreatePage = function onCreatePage({ actions, page }) {
  const showRsvp = process.env.GATSBY_SHOW_RSVP === 'true'
  const showRegistry = process.env.GATSBY_SHOW_REGISTRY === 'true'
  if (!showRsvp && page.path === `/rsvp/`) {
    actions.deletePage(page)
  }

  if (!showRegistry && page.path === '/registry/') {
    actions.deletePage(page)
  }
}

exports.createPages = async function createPages({ actions, graphql }) {
  const {
    data: { posts, pages, trips },
  } = await graphql(`
    {
      posts: allContentfulBlogPost {
        nodes {
          fields {
            slug
          }
        }
      }

      pages: allContentfulPage {
        nodes {
          fields {
            slug
          }
        }
      }

      trips: allContentfulTrip {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `)

  posts.nodes.forEach(post => {
    const {
      fields: { slug },
    } = post
    actions.createPage({
      component: require.resolve(`./src/templates/blog-post.js`),
      path: slug,
      context: {
        slug,
      },
    })
  })

  pages.nodes.forEach(page => {
    const {
      fields: { slug },
    } = page

    actions.createPage({
      component: require.resolve(`./src/templates/page.js`),
      path: slug,
      context: {
        slug,
      },
    })
  })

  trips.nodes.forEach(trip => {
    const {
      fields: { slug },
    } = trip

    actions.createPage({
      component: require.resolve(`./src/templates/trip.js`),
      path: slug,
      context: {
        slug,
      },
    })
  })
}

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  // add preact to the framework bundle
  if (stage === `build-javascript`) {
    const webpackConfig = getConfig()

    webpackConfig.module.rules.push({
      test: /core-js/,
      use: 'null-loader',
    })

    // webpackConfig.module.rules.splice(dependencyRulesIndex, 1)

    if (webpackConfig.optimization.splitChunks.cacheGroups.framework.test) {
      const regex =
        webpackConfig.optimization.splitChunks.cacheGroups.framework.test
      // replace react libs with preact
      webpackConfig.optimization.splitChunks.cacheGroups.framework.test = module => {
        return (
          /(?<!node_modules.*)[\\/]node_modules[\\/](preact)[\\/]/.test(
            module
          ) || regex.test(module)
        )
      }
    }
    actions.replaceWebpackConfig(webpackConfig)
  }
}

exports.onPostBuild = () => {
  const fs = require('fs')
  const fonts = require('../font-preload-cache.json')

  const headers = fs
    .readFileSync('./public/_headers')
    .toString()
    .split('\n')

  const indexes = new Map()
  headers.forEach((line, index) => {
    if (line.startsWith('/')) {
      indexes.set(line, index)
    }
  })

  let addedFonts = 0
  for (const path in fonts.assets) {
    const index = indexes.get(path)
    if (index) {
      Object.keys(fonts.assets[path]).forEach(font => {
        headers.splice(
          index + 1 + addedFonts,
          0,
          `  Link: <${font}>; rel=preload; as=font; type=font/woff2; crossorigin`
        )
        addedFonts++
      })
    }
  }

  fs.writeFileSync(`./public/_headers`, headers.join('\n'))
}
