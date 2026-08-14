import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import {
  badmintonBodyweightStrengthContent,
  buildHomePracticeSequence,
  compactHomeFootworkContent,
  highIntensityShadowIntervalsContent,
  lowServeFloorTargetContent,
  lungeBalanceLegStrengthContent,
  overheadShadowTechniqueContent,
  resetRallyRehearsalContent,
  reactiveSplitStepCuesContent,
  shoulderAndCoreControlContent,
  soloRacketControlContent,
  wallDriveAndDefenceContent,
} from '@/data/homePracticeSteps'

const payload = await getPayload({ config })
const homeDrills = await payload.find({
  collection: 'drills',
  depth: 0,
  limit: 100,
  overrideAccess: true,
  where: { practiceSetting: { equals: 'home' } },
})

let updated = 0
for (const drill of homeDrills.docs) {
  const sequence = buildHomePracticeSequence(drill.name, drill.instructions)
  if (!sequence) continue

  await payload.update({
    collection: 'drills',
    id: drill.id,
    depth: 0,
    overrideAccess: true,
    data: {
      ...(drill.name === 'Solo Racket Control Circuit' ? soloRacketControlContent : {}),
      ...(drill.name === 'Low Serve Floor Targets' ? lowServeFloorTargetContent : {}),
      ...(drill.name === 'Overhead Shadow Technique' ? overheadShadowTechniqueContent : {}),
      ...(drill.name === 'Compact Home Footwork' ? compactHomeFootworkContent : {}),
      ...(drill.name === 'Lunge Balance and Leg Strength' ? lungeBalanceLegStrengthContent : {}),
      ...(drill.name === 'Wall Drive and Defence' ? wallDriveAndDefenceContent : {}),
      ...(drill.name === 'Reactive Split-Step Cues' ? reactiveSplitStepCuesContent : {}),
      ...(drill.name === 'High-Intensity Shadow Intervals'
        ? highIntensityShadowIntervalsContent
        : {}),
      ...(drill.name === 'Badminton Bodyweight Strength Circuit'
        ? badmintonBodyweightStrengthContent
        : {}),
      ...(drill.name === 'Shoulder and Core Control' ? shoulderAndCoreControlContent : {}),
      ...(['Reset and Rally Rehearsal', 'Match Visualization and Reset'].includes(drill.name)
        ? { name: 'Reset and Rally Rehearsal', ...resetRallyRehearsalContent }
        : {}),
      practiceSteps: sequence.steps,
      stepIllustrationColumns: sequence.columns,
      stepIllustrationRows: sequence.rows,
      stepIllustrationURL: sequence.sheetURL,
    },
  })
  updated += 1
}

payload.logger.info(`Synced illustrated exercise steps for ${updated} home drills.`)
console.log(`Synced illustrated exercise steps for ${updated} home drills.`)
process.exit(updated === 11 ? 0 : 1)
