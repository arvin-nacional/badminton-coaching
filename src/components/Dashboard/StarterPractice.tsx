import type { Drill } from '@/payload-types'
import { IndependentPracticeDrills } from './IndependentPracticeDrills'
import { TrainingVideoLinks } from './TrainingVideoLinks'
import { trainingVideosFromDrills } from '@/utilities/trainingVideos'

export function StarterPractice({ drills }: { drills: Drill[] }) {
  const videos = trainingVideosFromDrills(drills)

  return (
    <div id="starter-practice" className="scroll-mt-24">
      <p className="mb-5 text-sm leading-7 text-[#607286]">
        Explore these introductory drills at your own pace. This free starter material is not a
        personalized assignment and does not count toward coaching sessions or assessed progress. No
        assessment booking is required. Open a drill to start a guided timer; starter workout time
        stays on this page and is not saved to your coaching record.
      </p>
      {drills.length ? (
        <>
          {videos.length ? (
            <div className="mb-5 rounded-3xl border border-[#1677ff]/15 bg-[#eef6ff] p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#1677ff]">
                Watch before you practice
              </p>
              <p className="mt-2 mb-4 text-sm leading-6 text-[#607286]">
                Use these technique demonstrations as a visual reference. You can watch them here
                without leaving your starter training.
              </p>
              <TrainingVideoLinks videos={videos} />
            </div>
          ) : null}
          {/* No practice ID: browse and run the local timer without creating an
              assignment, persisting timer state, or recording program completion. */}
          <IndependentPracticeDrills drills={drills} />
        </>
      ) : (
        <div className="rounded-2xl bg-[#f3f7fc] p-5 text-sm leading-7 text-[#607286]">
          <p className="font-bold text-[#092c59]">Prepare your first practice goal</p>
          <p>
            Think about a recent game: what felt reliable, what was difficult, and what would you
            like your coach to help you improve? Keep these notes for your assessment.
          </p>
          <p className="mt-2">
            Introductory drill demonstrations will appear here when they are available.
          </p>
        </div>
      )}
    </div>
  )
}
