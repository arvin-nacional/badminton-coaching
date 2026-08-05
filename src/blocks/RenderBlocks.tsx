import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  AssessmentStepsBlock,
  CoachHeroBlock,
  CoachingCTABlock,
  CoachingQuoteBlock,
  DevelopmentLoopBlock,
  ProgramsGridBlock,
  ProgressProfileBlock,
  TrainingCycleBlock,
} from '@/blocks/CoachHome/Components'

const blockComponents = {
  assessmentSteps: AssessmentStepsBlock,
  archive: ArchiveBlock,
  coachHero: CoachHeroBlock,
  coachingCTA: CoachingCTABlock,
  coachingQuote: CoachingQuoteBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  developmentLoop: DevelopmentLoopBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  programsGrid: ProgramsGridBlock,
  progressProfile: ProgressProfileBlock,
  trainingCycle: TrainingCycleBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const isCoachBlock = [
                'assessmentSteps',
                'coachHero',
                'coachingCTA',
                'coachingQuote',
                'developmentLoop',
                'programsGrid',
                'progressProfile',
                'trainingCycle',
              ].includes(blockType)

              const renderedBlock = (
                // @ts-expect-error block props are narrowed by blockType at runtime
                <Block {...block} disableInnerContainer />
              )

              return isCoachBlock ? (
                <React.Fragment key={index}>{renderedBlock}</React.Fragment>
              ) : (
                <div className="my-16" key={index}>{renderedBlock}</div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
