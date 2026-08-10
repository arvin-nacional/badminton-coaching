import type { Block, Field } from 'payload'

const buttonFields = (label: string, url: string): Field[] => [
  { name: 'label', type: 'text', required: true, defaultValue: label },
  { name: 'url', type: 'text', required: true, defaultValue: url },
]

export const CoachHero: Block = {
  slug: 'coachHero',
  interfaceName: 'CoachHeroBlock',
  labels: { singular: 'Coaching Hero', plural: 'Coaching Heroes' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      defaultValue: 'Structured coaching. Measurable progress.',
    },
    { name: 'heading', type: 'text', required: true, defaultValue: 'Know what to' },
    { name: 'highlight', type: 'text', required: true, defaultValue: 'train next.' },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Personal badminton coaching built around your current ability, goals, and playing style. Start with a complete assessment, follow a clear training plan, and see your progress after every session.',
    },
    {
      name: 'primaryButton',
      type: 'group',
      fields: buttonFields('Book an assessment', '/book-assessment'),
    },
    {
      name: 'secondaryButton',
      type: 'group',
      fields: buttonFields('Explore programs', '#programs'),
    },
    {
      name: 'benefits',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      defaultValue: [
        { text: 'Personalized development roadmap' },
        { text: 'Session-by-session coach feedback' },
        { text: 'Clear skill progression standards' },
      ],
      admin: { initCollapsed: true },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'dashboard',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'Player development plan' },
        { name: 'title', type: 'text', required: true, defaultValue: 'Your next focus' },
        { name: 'status', type: 'text', required: true, defaultValue: 'CURRENTLY DEVELOPING' },
        { name: 'stage', type: 'text', required: true, defaultValue: 'Controlled' },
        { name: 'skill', type: 'text', required: true, defaultValue: 'Rear-court recovery' },
        {
          name: 'feedback',
          type: 'textarea',
          required: true,
          defaultValue:
            'Your overhead clear is becoming consistent. Your next priority is recovering earlier so you can prepare properly for the following shot.',
        },
        { name: 'progress', type: 'number', min: 0, max: 100, required: true, defaultValue: 62 },
        { name: 'drillLabel', type: 'text', required: true, defaultValue: 'View assigned drill' },
        {
          name: 'stats',
          type: 'array',
          minRows: 1,
          maxRows: 4,
          defaultValue: [
            { value: '8', label: 'Sessions completed' },
            { value: '74%', label: 'Drill consistency' },
            { value: '3', label: 'Game-ready skills' },
          ],
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}

export const DevelopmentLoop: Block = {
  slug: 'developmentLoop',
  interfaceName: 'DevelopmentLoopBlock',
  labels: { singular: 'Development Loop', plural: 'Development Loops' },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'Your player development journey',
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 2,
      maxRows: 8,
      defaultValue: ['Assess', 'Plan', 'Train', 'Track', 'Reassess', 'Progress'].map((title) => ({
        title,
      })),
      fields: [{ name: 'title', type: 'text', required: true }],
    },
  ],
}

export const ProgramsGrid: Block = {
  slug: 'programsGrid',
  interfaceName: 'ProgramsGridBlock',
  labels: { singular: 'Programs Grid', plural: 'Programs Grids' },
  fields: [
    { name: 'anchor', type: 'text', defaultValue: 'programs' },
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Find your pathway' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'One development journey.\nThe right starting point for you.',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Your pathway is based on what you can currently perform - not simply your age or chosen package. We identify your starting level and help you progress at the pace your skills require.',
    },
    {
      name: 'programs',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      defaultValue: [
        {
          number: '01',
          audience: 'New and developing players',
          name: 'Badminton Foundations',
          accent: 'sky',
          description:
            'Build dependable technique, confident court movement, and the essential game knowledge needed to enjoy longer and more controlled rallies.',
          skills: [
            'Grip changes and racket preparation',
            'Ready position and split step',
            'Six-corner court movement',
            'Serve, clear, drop, lift, and net shot',
            'Basic singles and doubles positioning',
          ].map((skill) => ({ skill })),
          linkLabel: 'Start with Foundations',
          linkURL: '#assessment',
        },
        {
          number: '02',
          audience: 'Recreational and school players',
          name: 'Player Development',
          accent: 'blue',
          description:
            'Turn your basic skills into reliable rally patterns. Improve movement efficiency, shot consistency, decision-making, and confidence during real games.',
          skills: [
            'Efficient movement and recovery',
            'Clear-and-drop combinations',
            'Serve and return patterns',
            'Rally construction and shot selection',
            'Singles coverage and doubles rotation',
          ].map((skill) => ({ skill })),
          linkLabel: 'Explore Player Development',
          linkURL: '#assessment',
        },
        {
          number: '03',
          audience: 'Varsity and tournament players',
          name: 'Competitive Performance',
          accent: 'navy',
          description:
            'Develop an individualized competition plan and train your technical, tactical, and physical skills under realistic match pressure.',
          skills: [
            'Player-specific technical correction',
            'Attack, defense, and counterattack',
            'Match and opponent analysis',
            'Speed, pressure, and recovery training',
            'Tournament preparation and review',
          ].map((skill) => ({ skill })),
          linkLabel: 'Train for competition',
          linkURL: '#assessment',
        },
      ],
      admin: { initCollapsed: true },
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'audience', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'skills',
          type: 'array',
          minRows: 1,
          fields: [{ name: 'skill', type: 'text', required: true }],
        },
        { name: 'linkLabel', type: 'text', required: true },
        { name: 'linkURL', type: 'text', required: true },
        {
          name: 'accent',
          type: 'select',
          required: true,
          defaultValue: 'sky',
          options: [
            { label: 'Sky', value: 'sky' },
            { label: 'Blue', value: 'blue' },
            { label: 'Navy', value: 'navy' },
          ],
        },
      ],
    },
  ],
}

export const AssessmentSteps: Block = {
  slug: 'assessmentSteps',
  interfaceName: 'AssessmentStepsBlock',
  labels: { singular: 'Assessment Steps', plural: 'Assessment Steps' },
  fields: [
    { name: 'anchor', type: 'text', defaultValue: 'assessment' },
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Start with clarity' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'No guessing.\nJust a plan built around your game.',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Every new player begins with a complete assessment. You will leave knowing your current level, your three main development priorities, and what your first four training sessions should cover.',
    },
    { name: 'stepLabel', type: 'text', required: true, defaultValue: 'Step' },
    { name: 'button', type: 'group', fields: buttonFields('Book your assessment', '#contact') },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      defaultValue: [
        {
          title: 'Player Profile',
          description:
            'We discuss your playing experience, goals, preferred event, training availability, competition plans, and relevant injury history.',
        },
        {
          title: 'Movement Screen',
          description:
            'We evaluate your ready position, split step, balance, coordination, court movement, and recovery after each shot.',
        },
        {
          title: 'Skill Baseline',
          description:
            'We assess your grip, overhead technique, serves, net control, consistency, tactical understanding, and match application.',
        },
        {
          title: 'Personal Roadmap',
          description:
            'You receive a recommended program, three priority areas, suggested training frequency, and an initial four-session plan.',
        },
      ],
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
}

export const TrainingCycle: Block = {
  slug: 'trainingCycle',
  interfaceName: 'TrainingCycleBlock',
  labels: { singular: 'Training Cycle', plural: 'Training Cycles' },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Badminton Foundations' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Your 12-session foundation,\nmapped from day one.',
    },
    {
      name: 'note',
      type: 'text',
      defaultValue:
        'Progress is personal. Players move forward when their skills are ready - not simply when the training cycle ends.',
    },
    {
      name: 'sessions',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      defaultValue: [
        [
          '01',
          'Starting profile and court orientation',
          'Establish a safe movement and racket-control baseline.',
        ],
        [
          '02',
          'Grip changes and ready position',
          'Change grip efficiently while keeping the racket ready for the next shot.',
        ],
        ['03', 'Split, move and recover', 'Build a repeatable split-step and recovery rhythm.'],
        [
          '04',
          'Overhead clear foundations',
          'Create safe height and length with early preparation and overhead contact.',
        ],
        [
          '05',
          'Clear and rear-court recovery',
          'Connect the overhead clear to an immediate balanced recovery.',
        ],
        [
          '06',
          'Reliable service starts',
          'Develop a repeatable legal low serve with controlled placement.',
        ],
        [
          '07',
          'Lift for time and length',
          'Use the lift to move the opponent back and regain court position.',
        ],
        [
          '08',
          'Forecourt control',
          'Approach, play, and recover from the forecourt with a stable lunge.',
        ],
        [
          '09',
          'Serve, return and first recovery',
          'Start the rally with a clear serve, return, and recovery intention.',
        ],
        [
          '10',
          'Build a controlled rally',
          'Sustain rallies using safe height, length, and consistent recovery.',
        ],
        [
          '11',
          'Connect the full court',
          'Move between forecourt and rear court while selecting a safe response.',
        ],
        [
          '12',
          'Foundations progress assessment',
          'Reassess the core skills and map the player’s next training phase.',
        ],
      ].map(([number, title, description]) => ({ number, title, description })),
      admin: { initCollapsed: true },
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
      ],
    },
  ],
}

export const ProgressProfile: Block = {
  slug: 'progressProfile',
  interfaceName: 'ProgressProfileBlock',
  labels: { singular: 'Progress Profile', plural: 'Progress Profiles' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      defaultValue: 'Progress that means something',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'See the player\nyou are becoming.',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Instead of relying on one overall score, every skill is tracked through clear development stages. You will know what improved, what is limiting your game, and what you should train next.',
    },
    {
      name: 'stages',
      type: 'array',
      minRows: 1,
      defaultValue: [
        'Not introduced',
        'Learning',
        'Controlled',
        'Game ready',
        'Pressure ready',
      ].map((label) => ({ label })),
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'profileTitle',
      type: 'text',
      required: true,
      defaultValue: 'Technical and game skills',
    },
    { name: 'profileLabel', type: 'text', required: true, defaultValue: 'Current skill profile' },
    {
      name: 'skills',
      type: 'array',
      minRows: 1,
      defaultValue: [
        { name: 'Forehand overhead clear', progress: 76, stage: 'Game ready' },
        { name: 'Backhand short serve', progress: 63, stage: 'Controlled' },
        { name: 'Defensive lift', progress: 42, stage: 'Learning' },
        { name: 'Rear-court recovery', progress: 58, stage: 'Controlled' },
      ],
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'stage', type: 'text', required: true },
        { name: 'progress', type: 'number', min: 0, max: 100, required: true },
      ],
    },
  ],
}

export const CoachingQuote: Block = {
  slug: 'coachingQuote',
  interfaceName: 'CoachingQuoteBlock',
  labels: { singular: 'Coaching Quote', plural: 'Coaching Quotes' },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      defaultValue:
        'Great coaching does more than identify what went wrong. It gives you a clear path to improve it.',
    },
    {
      name: 'attribution',
      type: 'text',
      required: true,
      defaultValue: 'A player-first coaching philosophy',
    },
  ],
}

export const CoachingCTA: Block = {
  slug: 'coachingCTA',
  interfaceName: 'CoachingCTABlock',
  labels: { singular: 'Coaching CTA', plural: 'Coaching CTAs' },
  fields: [
    { name: 'anchor', type: 'text', defaultValue: 'contact' },
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      defaultValue: 'Ready to improve with purpose?',
    },
    { name: 'heading', type: 'text', required: true, defaultValue: 'Let us find your\nnext step.' },
    {
      name: 'button',
      type: 'group',
      fields: buttonFields(
        'Book your assessment',
        'mailto:coach@example.com?subject=Badminton%20Assessment',
      ),
    },
  ],
}

export const coachHomeBlocks = [
  CoachHero,
  DevelopmentLoop,
  ProgramsGrid,
  AssessmentSteps,
  TrainingCycle,
  ProgressProfile,
  CoachingQuote,
  CoachingCTA,
]
