import { describe, expect, it } from 'vitest'

import {
  homePracticeName,
  programHomePracticeSuccessCriteria,
} from '@/collections/Coaching/syncProgramHomePractices'
import {
  homeDrillsForLesson,
  programHomeDrillAssignments,
  type LessonSeed,
} from '@/endpoints/seed/coaching'

describe('program home-practice integration', () => {
  it('uses a stable program/week lesson name for generated home-practice plans', () => {
    expect(homePracticeName('Foundations', 3, 'Split, move and recover')).toBe(
      'Foundations - Week 3: Split, move and recover',
    )
    expect(programHomePracticeSuccessCriteria).toContain('saved workout time and exercise logs')
  })

  it('reserves reset rehearsal for pressure and game-plan weeks', () => {
    const development = programHomeDrillAssignments['Player Development']
    const competitive = programHomeDrillAssignments['Competitive Performance']

    expect(development[9]).toEqual(['Lunge Balance and Leg Strength', 'Reactive Split-Step Cues'])
    expect(development[14]).toContain('Reset and Rally Rehearsal')
    expect(competitive[1]).not.toContain('Reset and Rally Rehearsal')
    expect(competitive[13]).toContain('Reset and Rally Rehearsal')
    expect(competitive[20]).not.toContain('Reset and Rally Rehearsal')
    expect(Object.values(development).flat()).not.toContain('Match Visualization and Reset')
    expect(Object.values(competitive).flat()).not.toContain('Match Visualization and Reset')
  })

  it('assigns Week 1 baseline drills without premature reset rehearsal', () => {
    const weekOneLesson: LessonSeed = {
      week: 1,
      title: 'Starting profile and court orientation',
      lessonType: 'assessment',
      objective: 'Establish a safe movement and racket-control baseline.',
      durationMinutes: 60,
      drills: ['Grip Change Tap-Ups', 'Four-Corner Shadow Rhythm'],
      independentPractice: 'Complete 3 x 20 tap-ups and rehearse each corner slowly.',
      successCriteria: 'Uses a suitable grip and reaches four corners without losing balance.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekOneLesson, 'foundations')).toEqual([
      'Solo Racket Control Circuit',
      'Compact Home Footwork',
      'Lunge Balance and Leg Strength',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekOneLesson, 'foundations'),
    ).not.toContain('Reset and Rally Rehearsal')
  })

  it('progresses Week 2 from grip control into serving without repeating strength work', () => {
    const weekTwoLesson: LessonSeed = {
      week: 2,
      title: 'Grip changes and ready position',
      lessonType: 'technical',
      objective:
        'Change grip with the fingers while keeping the racket available for the next shot.',
      durationMinutes: 60,
      drills: ['Grip Change Tap-Ups', 'Low Serve Gate'],
      independentPractice: 'Complete 50 alternating contacts and 20 low serves.',
      successCriteria: 'Changes grip without looking at the handle in 8 of 10 attempts.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekTwoLesson, 'foundations')).toEqual([
      'Solo Racket Control Circuit',
      'Low Serve Floor Targets',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekTwoLesson, 'foundations'),
    ).not.toContain('Lunge Balance and Leg Strength')
  })

  it('uses spaced repetition in Week 3 before adding reactive movement', () => {
    const weekThreeLesson: LessonSeed = {
      week: 3,
      title: 'Split, move and recover',
      lessonType: 'movement',
      objective: 'Introduce a repeatable split-step and recovery rhythm.',
      durationMinutes: 60,
      drills: ['Four-Corner Shadow Rhythm', 'Lunge, Net and Recover'],
      independentPractice: 'Perform four controlled 30-second shadow rounds.',
      successCriteria: 'Returns to a balanced base after 8 of 10 movements.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekThreeLesson, 'foundations')).toEqual([
      'Compact Home Footwork',
      'Reactive Split-Step Cues',
      'Lunge Balance and Leg Strength',
    ])

    const weekOneRetention = new Set([
      'Solo Racket Control Circuit',
      'Compact Home Footwork',
      'Lunge Balance and Leg Strength',
    ])
    const retainedDrills = homeDrillsForLesson(
      'Badminton Foundations',
      weekThreeLesson,
      'foundations',
    ).filter((drill) => weekOneRetention.has(drill))
    expect(retainedDrills).toEqual(['Compact Home Footwork', 'Lunge Balance and Leg Strength'])
  })

  it('introduces the overhead in Week 4 while retaining relaxed grip control', () => {
    const weekFourLesson: LessonSeed = {
      week: 4,
      title: 'Overhead clear foundations',
      lessonType: 'technical',
      objective: 'Create safe height and length using early preparation and overhead contact.',
      durationMinutes: 60,
      drills: ['Clear to Targets', 'Grip Change Tap-Ups'],
      independentPractice:
        'Complete 3 x 8 controlled overhead shadows, then reinforce relaxed grip changes with one racket-control circuit.',
      successCriteria: 'Places 8 of 10 clears beyond the doubles service line.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekFourLesson, 'foundations')).toEqual([
      'Overhead Shadow Technique',
      'Solo Racket Control Circuit',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekFourLesson, 'foundations'),
    ).not.toContain('Lunge Balance and Leg Strength')
    expect(weekFourLesson.independentPractice).not.toContain('target attempts')
  })

  it('repeats the Week 4 overhead in Week 5 and adds rear-court recovery', () => {
    const weekFiveLesson: LessonSeed = {
      week: 5,
      title: 'Clear and rear-court recovery',
      lessonType: 'movement',
      objective: 'Link the overhead clear to an immediate balanced recovery.',
      durationMinutes: 60,
      drills: ['Rear-Court Clear and Recovery', 'Clear to Targets'],
      independentPractice:
        'Rehearse controlled rear-court movement, then complete 3 x 8 overhead shadow repetitions with an immediate balanced recovery.',
      successCriteria: 'Recovers before the feeder begins the next action in 8 of 10 feeds.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekFiveLesson, 'foundations')).toEqual([
      'Compact Home Footwork',
      'Overhead Shadow Technique',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekFiveLesson, 'foundations'),
    ).not.toContain('Lunge Balance and Leg Strength')
    expect(weekFiveLesson.independentPractice).toContain('immediate balanced recovery')
  })

  it('revisits the Week 2 low serve in Week 6 after priming the thumb-led grip', () => {
    const weekSixLesson: LessonSeed = {
      week: 6,
      title: 'Reliable service starts',
      lessonType: 'technical',
      objective: 'Develop a repeatable low serve and understand legal service preparation.',
      durationMinutes: 60,
      drills: ['Low Serve Gate', 'Twenty-Shot Cooperative Rally'],
      independentPractice:
        'Prime the thumb-led grip with one racket-control circuit, then complete 4 rounds of 10 low serves and record target hits.',
      successCriteria: 'Achieves at least 80% legal serves with controlled height.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekSixLesson, 'foundations')).toEqual([
      'Solo Racket Control Circuit',
      'Low Serve Floor Targets',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekSixLesson, 'foundations'),
    ).not.toContain('Compact Home Footwork')
    expect(weekSixLesson.independentPractice).toContain('4 rounds of 10 low serves')
    expect(weekSixLesson.independentPractice).not.toContain('5 sets')
  })

  it('supports the Week 7 lift with retained forecourt movement and lunge stability', () => {
    const weekSevenLesson: LessonSeed = {
      week: 7,
      title: 'Lift for time and length',
      lessonType: 'technical',
      objective: 'Use the lift to move the opponent back and regain court position.',
      durationMinutes: 60,
      drills: ['Lift for Length', 'Lunge, Net and Recover'],
      independentPractice:
        'Rehearse controlled front-corner approach and recovery, then complete the lunge-and-balance circuit that supports a stable underarm lift.',
      successCriteria: 'Reaches the rear target and recovers on 8 of 10 feeds.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekSevenLesson, 'foundations')).toEqual([
      'Compact Home Footwork',
      'Lunge Balance and Leg Strength',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekSevenLesson, 'foundations'),
    ).not.toContain('Overhead Shadow Technique')
    expect(weekSevenLesson.independentPractice).not.toContain('30 controlled lift actions')
    expect(weekSevenLesson.independentPractice).toContain('supports a stable underarm lift')
  })

  it('progresses Week 8 forecourt movement with retained footwork and reactive cues', () => {
    const weekEightLesson: LessonSeed = {
      week: 8,
      title: 'Forecourt control',
      lessonType: 'technical',
      objective: 'Approach, play and recover from the forecourt with a stable lunge.',
      durationMinutes: 60,
      drills: ['Lunge, Net and Recover', 'Lift for Length'],
      independentPractice:
        'Complete the compact footwork circuit with extra attention to balanced front-corner lunges, then respond to random direction cues and recover to the same base.',
      successCriteria: 'Selects net or lift appropriately and finishes balanced in 8 of 10 feeds.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekEightLesson, 'foundations')).toEqual([
      'Compact Home Footwork',
      'Reactive Split-Step Cues',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekEightLesson, 'foundations'),
    ).not.toContain('Lunge Balance and Leg Strength')
    expect(weekEightLesson.independentPractice).not.toContain('20 shadow net shots')
    expect(weekEightLesson.independentPractice).toContain('random direction cues')
  })

  it('revisits serving in Week 9 and retains the reaction needed for the first recovery', () => {
    const weekNineLesson: LessonSeed = {
      week: 9,
      title: 'Serve, return and first recovery',
      lessonType: 'tactical',
      objective: 'Start the rally with a clear serve, return and recovery intention.',
      durationMinutes: 60,
      drills: ['Low Serve Gate', 'Lift for Length'],
      independentPractice:
        'Complete the low-serve target circuit, then use reactive split-step cues to practise the first movement after serving or returning.',
      successCriteria:
        'Completes the first three actions without an unforced error in 7 of 10 rallies.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekNineLesson, 'foundations')).toEqual([
      'Low Serve Floor Targets',
      'Reactive Split-Step Cues',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekNineLesson, 'foundations'),
    ).not.toContain('Reset and Rally Rehearsal')
    expect(weekNineLesson.independentPractice).not.toContain('Practise 20 serves')
    expect(weekNineLesson.independentPractice).toContain('first movement')
  })

  it('supports the Week 10 rally goal with solo contact control and rear-court recovery', () => {
    const weekTenLesson: LessonSeed = {
      week: 10,
      title: 'Build a controlled rally',
      lessonType: 'match-play',
      objective: 'Sustain a rally using safe height, length and recovery.',
      durationMinutes: 60,
      drills: ['Twenty-Shot Cooperative Rally', 'Rear-Court Clear and Recovery'],
      independentPractice:
        'Complete the solo racket-control circuit for repeatable contacts, then rehearse controlled overhead preparation and recovery to base.',
      successCriteria: 'Completes three rallies of at least 20 shots with functional recovery.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekTenLesson, 'foundations')).toEqual([
      'Solo Racket Control Circuit',
      'Overhead Shadow Technique',
    ])
    expect(
      homeDrillsForLesson('Badminton Foundations', weekTenLesson, 'foundations'),
    ).not.toContain('Reset and Rally Rehearsal')
    expect(weekTenLesson.independentPractice).not.toContain('longest rally')
    expect(weekTenLesson.independentPractice).toContain('recovery to base')
  })

  it('consolidates full-court movement in Week 11 with a spaced repeat of the Week 8 pair', () => {
    const weekElevenLesson: LessonSeed = {
      week: 11,
      title: 'Connect the full court',
      lessonType: 'match-play',
      objective: 'Move between forecourt and rear court while selecting a safe response.',
      durationMinutes: 60,
      drills: [
        'Four-Corner Shadow Rhythm',
        'Rear-Court Clear and Recovery',
        'Lunge, Net and Recover',
      ],
      independentPractice:
        'Complete the compact six-corner footwork and reactive split-step cue circuits, then note the least stable direction to review with your coach.',
      successCriteria: 'Maintains balance and returns to a suitable base in 8 of 10 rallies.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekElevenLesson, 'foundations')).toEqual([
      'Compact Home Footwork',
      'Reactive Split-Step Cues',
    ])
    expect(weekElevenLesson.independentPractice).not.toContain('sequence twice')
    expect(weekElevenLesson.independentPractice).toContain('least stable direction')
  })

  it('uses three comparable Week 12 benchmarks to identify the next training priority', () => {
    const weekTwelveLesson: LessonSeed = {
      week: 12,
      title: 'Foundations progress assessment',
      lessonType: 'assessment',
      objective: 'Demonstrate the core movement, serve, clear, lift and rally standards.',
      durationMinutes: 60,
      drills: ['Low Serve Gate', 'Clear to Targets', 'Twenty-Shot Cooperative Rally'],
      independentPractice:
        'Complete the low-serve, overhead-shadow and compact-footwork benchmarks at a controlled pace, then record the weakest result as the next training priority.',
      successCriteria:
        'Meets the completion target for at least three drills and identifies the next priority.',
      sessionPlan: {
        warmUp: '',
        movementPreparation: '',
        conditionedGame: '',
        matchPlay: '',
        cooldownAndFeedback: '',
      },
    }

    expect(homeDrillsForLesson('Badminton Foundations', weekTwelveLesson, 'foundations')).toEqual([
      'Low Serve Floor Targets',
      'Overhead Shadow Technique',
      'Compact Home Footwork',
    ])
    expect(weekTwelveLesson.independentPractice).not.toContain('one short practice')
    expect(weekTwelveLesson.independentPractice).toContain('weakest result')
  })
})
