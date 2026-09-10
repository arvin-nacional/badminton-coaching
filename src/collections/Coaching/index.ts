import { AssessmentBookings } from './AssessmentBookings'
import { Assignments } from './Assignments'
import { CoachAvailability } from './CoachAvailability'
import { CoachAvailabilityRules } from './CoachAvailabilityRules'
import { CoachingEvents } from './CoachingEvents'
import { Drills } from './Drills'
import { IndependentPractices } from './IndependentPractices'
import { PracticeLibrary } from './PracticeLibrary'
import { Programs } from './Programs'
import { SessionSkillScores } from './SessionSkillScores'
import { SkillProgress } from './SkillProgress'
import { Skills } from './Skills'
import { StudentProfiles } from './StudentProfiles'
import { TrainingSessions } from './TrainingSessions'

export {
  AssessmentBookings,
  Assignments,
  CoachAvailability,
  CoachAvailabilityRules,
  CoachingEvents,
  Drills,
  IndependentPractices,
  PracticeLibrary,
  Programs,
  SessionSkillScores,
  SkillProgress,
  Skills,
  StudentProfiles,
  TrainingSessions,
}

// Order is preserved from the original single-file module: it determines the
// order collections appear in the admin sidebar and in generated types.
export const coachingCollections = [
  Programs,
  Skills,
  Drills,
  PracticeLibrary,
  StudentProfiles,
  TrainingSessions,
  SkillProgress,
  SessionSkillScores,
  Assignments,
  IndependentPractices,
  CoachingEvents,
  CoachAvailability,
  CoachAvailabilityRules,
  AssessmentBookings,
]
