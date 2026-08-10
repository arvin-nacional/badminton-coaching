import type { RequiredDataFromCollectionSlug } from 'payload'

// Preview fallback only. Once a Home page exists in Payload, editors control all values below.
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  title: 'Home',
  _status: 'published',
  hero: { type: 'none' },
  layout: [
    {
      blockType: 'coachHero',
      eyebrow: 'Structured coaching. Measurable progress.',
      heading: 'Know what to',
      highlight: 'train next.',
      description:
        'Personal badminton coaching built around your current ability, goals, and playing style. Start with a complete assessment, follow a clear training plan, and see your progress after every session.',
      primaryButton: { label: 'Book an assessment', url: '/book-assessment' },
      secondaryButton: { label: 'Explore programs', url: '#programs' },
      benefits: [
        { text: 'Personalized development roadmap' },
        { text: 'Session-by-session coach feedback' },
        { text: 'Clear skill progression standards' },
      ],
      dashboard: {
        label: 'Player development plan',
        title: 'Your next focus',
        status: 'CURRENTLY DEVELOPING',
        stage: 'Controlled',
        skill: 'Rear-court recovery',
        feedback:
          'Your overhead clear is becoming consistent. Your next priority is recovering earlier so you can prepare properly for the following shot.',
        progress: 62,
        drillLabel: 'View assigned drill',
        stats: [
          { value: '8', label: 'Sessions completed' },
          { value: '74%', label: 'Drill consistency' },
          { value: '3', label: 'Game-ready skills' },
        ],
      },
    },
    {
      blockType: 'developmentLoop',
      label: 'Your player development journey',
      steps: ['Assess', 'Plan', 'Train', 'Track', 'Reassess', 'Progress'].map((title) => ({
        title,
      })),
    },
    {
      blockType: 'programsGrid',
      anchor: 'programs',
      eyebrow: 'Find your pathway',
      heading: 'One development journey.\nThe right starting point for you.',
      description:
        'Your pathway is based on what you can currently perform - not simply your age or chosen package. We identify your starting level and help you progress at the pace your skills require.',
      programs: [
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
    },
    {
      blockType: 'assessmentSteps',
      anchor: 'assessment',
      eyebrow: 'Start with clarity',
      heading: 'No guessing.\nJust a plan built around your game.',
      description:
        'Every new player begins with a complete assessment. You will leave knowing your current level, your three main development priorities, and what your first four training sessions should cover.',
      stepLabel: 'Step',
      button: { label: 'Book your assessment', url: '/book-assessment' },
      steps: [
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
    },
    {
      blockType: 'trainingCycle',
      eyebrow: 'Badminton Foundations',
      heading: 'Your 12-session foundation,\nmapped from day one.',
      note: 'Progress is personal. Players move forward when their skills are ready - not simply when the training cycle ends.',
      sessions: [
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
    },
    {
      blockType: 'progressProfile',
      eyebrow: 'Progress that means something',
      heading: 'See the player\nyou are becoming.',
      description:
        'Instead of relying on one overall score, every skill is tracked through clear development stages. You will know what improved, what is limiting your game, and what you should train next.',
      stages: ['Not introduced', 'Learning', 'Controlled', 'Game ready', 'Pressure ready'].map(
        (label) => ({ label }),
      ),
      profileLabel: 'Current skill profile',
      profileTitle: 'Technical and game skills',
      skills: [
        { name: 'Forehand overhead clear', progress: 76, stage: 'Game ready' },
        { name: 'Backhand short serve', progress: 63, stage: 'Controlled' },
        { name: 'Defensive lift', progress: 42, stage: 'Learning' },
        { name: 'Rear-court recovery', progress: 58, stage: 'Controlled' },
      ],
    },
    {
      blockType: 'coachingQuote',
      quote:
        'Great coaching does more than identify what went wrong. It gives you a clear path to improve it.',
      attribution: 'A player-first coaching philosophy',
    },
    {
      blockType: 'coachingCTA',
      anchor: 'contact',
      eyebrow: 'Ready to improve with purpose?',
      heading: 'Let us find your\nnext step.',
      button: { label: 'Book your assessment', url: '/book-assessment' },
    },
  ],
  meta: {
    title: 'Next Shot Badminton Coaching',
    description:
      'Structured badminton coaching with personal assessments, progressive training plans, and measurable player development.',
  },
}
