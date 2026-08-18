export type ProgramEventPreference = 'singles' | 'doubles' | 'both' | 'not-sure'

type EventVariants<T> = {
  singlesDrills?: T[] | null
  doublesDrills?: T[] | null
  singlesHomeDrills?: T[] | null
  doublesHomeDrills?: T[] | null
}

type EventBranchedLesson<T> = {
  week?: number | null
  drills?: T[] | null
  homeDrills?: T[] | null
  eventVariants?: EventVariants<T> | null
}

const selectedVariant = <T>(
  preference: ProgramEventPreference | null | undefined,
  week: number | null | undefined,
  singlesValues: T[] | null | undefined,
  doublesValues: T[] | null | undefined,
  fallback: T[] | null | undefined,
): T[] => {
  if (preference === 'singles' && singlesValues?.length) return [...singlesValues]
  if (preference === 'doubles' && doublesValues?.length) return [...doublesValues]
  if (singlesValues?.length && doublesValues?.length) {
    if (preference === 'both' && typeof week === 'number' && week % 2 === 0) {
      return [...doublesValues]
    }
    return [...singlesValues]
  }
  return [...(fallback || [])]
}

export const programLessonDrillsForEvent = <T>(
  lesson: EventBranchedLesson<T>,
  preference: ProgramEventPreference | null | undefined,
): T[] =>
  selectedVariant(
    preference,
    lesson.week,
    lesson.eventVariants?.singlesDrills,
    lesson.eventVariants?.doublesDrills,
    lesson.drills,
  )

export const programLessonHomeDrillsForEvent = <T>(
  lesson: EventBranchedLesson<T>,
  preference: ProgramEventPreference | null | undefined,
): T[] =>
  selectedVariant(
    preference,
    lesson.week,
    lesson.eventVariants?.singlesHomeDrills,
    lesson.eventVariants?.doublesHomeDrills,
    lesson.homeDrills,
  )
