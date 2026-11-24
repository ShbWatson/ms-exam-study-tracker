/**
 * Everything the About page says lives here, so it can be edited without
 * touching the layout. Leave a link's `href` empty to hide that button.
 */

/** A paragraph is plain text mixed with inline links. */
export type StoryPart = string | { text: string; href: string };

export const ABOUT = {
  name: 'Shabnam Watson',
  tagline: 'Microsoft Data Platform MVP · Data & AI Architect · Founder of ABI Cube',
  /**
   * Path to a square image in `packages/frontend/public`, for example
   * '/about/shabnam-cartoon.png'. Leave empty to show initials instead.
   */
  photo: '',
  initials: 'SW',
  story: [
    [
      "Studying for a certification takes time, and sometimes weeks go by between study sessions. With so many topics to cover, it's hard to remember what you've already studied, what still needs work, and where to pick back up.",
    ],
    [
      'I ran into the same problem when I studied for DP-600 and DP-700, so I built my first study tracker in Excel and Power BI. Power Query pulled the skills from the official Microsoft Learn study guide into Excel, and a Power BI report showed my progress and where to focus next.',
    ],
    [
      'It worked, but updating my progress was clunky. I had to mark skills in Excel, save and close the file, then refresh the Power BI report to see where I stood. When it was time to study for my next exam, I wanted something more modern, so I rebuilt the idea as a Microsoft Fabric App. Now I update and track my progress in one place.',
    ],
    [
      'Behind the scenes, a Fabric notebook pulls the skills straight from the official Microsoft Learn study guides. Run it whenever you want a refresh, or schedule it to run daily, and the tracker stays in step with any changes to the study guide, with no list to maintain by hand.',
    ],
    [
      'You mark each skill as you go, and the app shows your progress and how ready you are, using the same topic weights as the exam.',
    ],
    [
      "And it's not just for Fabric exams. If you set up your own copy, you can add other Microsoft certifications by updating the list of exams in the notebook.",
    ],
    [
      'Want to go beyond the study guide? Join the ',
      { text: 'Microsoft Fabric Community', href: 'https://community.fabric.microsoft.com/' },
      ' to learn from your peers and catch the latest learning series, like ',
      // The series name changes; update the text and link here when it does.
      {
        text: 'Data Days: AI @Work',
        href: 'https://community.fabric.microsoft.com/c/campaign-form/page?campaignID=Y2FtcGFpZ24tMTc5MTkwNTc2MDQxMQ',
      },
      '.',
    ],
    [
      'I built this to keep myself on track. I hope it does the same for you, and that you walk into exam day feeling confident. Good luck!',
    ],
  ] satisfies readonly (readonly StoryPart[])[],
  /** Shown in a highlighted box under the story. */
  notice: {
    title: 'The official study guide comes first.',
    text: 'The Microsoft Learn study guide is the official source for every exam, so always check it before your exam. This app reads those pages automatically, so it may contain errors, or stop updating if Microsoft changes how the study guide pages are laid out.',
  },
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shabnamwatson/', kind: 'profile' },
    { label: 'Blog', href: 'https://shabnamwatson.com/', kind: 'blog' },
    { label: 'YouTube', href: 'https://www.youtube.com/watch?v=om0kJ2fbmko', kind: 'video' },
    { label: 'Code on GitHub', href: 'https://github.com/ShbWatson/ms-exam-study-tracker', kind: 'code' },
  ],
  /** "How I passed" write-ups shown under the story. */
  examStories: [
    {
      exam: 'DP-700',
      title: 'How I passed DP-700: Implementing Data Engineering Solutions Using Microsoft Fabric',
      href: 'https://shabnamwatson.com/2025/02/05/how-i-passed-dp-700-implementing-data-engineering-solutions-using-microsoft-fabric/',
    },
    {
      exam: 'DP-600',
      title: 'Getting ready for and taking Exam DP-600: Implementing Analytics Solutions Using Microsoft Fabric',
      href: 'https://shabnamwatson.com/2024/01/21/getting-ready-for-and-taking-exam-dp-600-implementing-analytics-solutions-using-microsoft-fabric/',
    },
  ],
} as const;

export type AboutLinkKind = (typeof ABOUT.links)[number]['kind'];
