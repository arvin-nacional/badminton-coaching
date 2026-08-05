import type { Media } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

import { homeStatic } from './home-static'

type HomeArgs = {
  heroImage: Media
  metaImage: Media
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  metaImage,
}) => ({
  ...homeStatic,
  meta: {
    ...homeStatic.meta,
    image: metaImage.id,
  },
})
