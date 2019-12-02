/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { graphql } from 'gatsby'

import Layout from '../components/layout/'
import Grid from '../components/grid'
import Image from '../components/image'
import BlogPost from '../components/blog-post'

function BlogPostPage({ data }) {
  const { post } = data
  return (
    <Layout>
      {post && (
        <BlogPost
          as="article"
          sx={{
            maxWidth: '100%',
            margin: '0 auto',
            '@media only screen and (min-width: 768px)': {
              padding: '1rem',
              maxWidth: '60%',
            },
          }}
          {...post}
        >
          {post.gallery && (
            <div
              sx={{
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: 'text',
                borderTopStyle: 'solid',
              }}
            >
              <Styled.h3>Gallery</Styled.h3>
              <Grid>
                {post.gallery.map(img => (
                  <Image {...img} />
                ))}
              </Grid>
            </div>
          )}
        </BlogPost>
      )}
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    post: contentfulBlogPost(fields: { slug: { eq: $slug } }) {
      ...BlogPostDetails
      gallery {
        fluid(maxWidth: 1000) {
          ...GatsbyContentfulFluid
        }
      }
    }
  }
`

export default BlogPostPage