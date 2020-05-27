/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import Image from 'gatsby-image'
import { SkipNavContent } from '@reach/skip-nav'

import Gallery from '../components/gallery'
import Timeline from '../components/timeline'
import Section from '../components/section'
import WeddingParty from '../components/wedding-party'
import SEO from '../components/seo'

import partials from '../components/partials'

function Page({
  slug,
  children,
  description,
  title,
  featuredImage,
  contentBlocks,
}) {
  const page = contentBlocks.reduce((merged, block) => {
    switch (block.__typename) {
      case 'ContentfulTimeline':
        merged.timeline = (merged.timeline || []).concat(block)
        break
      case 'ContentfulGallery':
        merged.gallery = (merged.gallery || []).concat(block)
        break
      case 'ContentfulSection':
        merged.section = (merged.section || []).concat(block)
        break
      case 'ContentfulHero':
        merged.hero = (merged.hero || []).concat(block)
        break
      case 'ContentfulWeddingParty':
        merged.party = (merged.party || []).concat(block)
        break
      default:
        break
    }
    return merged
  }, {})
  const Partial = partials(slug)
  return (
    <React.Fragment>
      <SEO
        description={description}
        title={title}
        {...(featuredImage
          ? {
              image: featuredImage.localFile.childImageSharp.resize,
            }
          : {})}
      />
      {page.hero &&
        page.hero
          .filter(
            img =>
              img.hero &&
              img.hero.localFile &&
              img.hero.localFile.childImageSharp
          )
          .map(img => (
            <Image
              key={img.hero.id}
              alt={img.hero.title || img.hero.description}
              {...img.hero.localFile.childImageSharp}
            />
          ))}
      <SkipNavContent>{Partial && <Partial />}</SkipNavContent>
    </React.Fragment>
  )
}

export default Page
