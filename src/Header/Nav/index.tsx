import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

import { getHeaderNavItems } from '../defaultNavItems'

export function HeaderNav({ data }: { data: HeaderType }) {
  return (
    <nav className="hidden items-center gap-8 text-sm font-bold text-[#405d7d] md:flex">
      {getHeaderNavItems(data).map(({ id, link }, index) => (
        <CMSLink
          {...link}
          className="transition hover:text-[#1677ff]"
          key={id || `${link.label}-${index}`}
        />
      ))}
    </nav>
  )
}
