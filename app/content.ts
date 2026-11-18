export type ChoiceId = "A" | "B" | "C";

export type StepId =
  | "welcome"
  | "rules"
  | "landscape"
  | "anatomy"
  | "challenge-1"
  | "video"
  | "writing"
  | "tools"
  | "protocol"
  | "algorithm"
  | "challenge-2"
  | "round-1"
  | "round-2"
  | "round-3"
  | "finale";

export const STEPS: { id: StepId; chapter: string }[] = [
  { id: "welcome", chapter: "Open" },
  { id: "rules", chapter: "Open" },
  { id: "landscape", chapter: "Field guide" },
  { id: "anatomy", chapter: "Field guide" },
  { id: "challenge-1", chapter: "Challenge 1" },
  { id: "video", chapter: "Verify" },
  { id: "writing", chapter: "Verify" },
  { id: "tools", chapter: "Verify" },
  { id: "protocol", chapter: "Verify" },
  { id: "algorithm", chapter: "Verify" },
  { id: "challenge-2", chapter: "Challenge 2" },
  { id: "round-1", chapter: "Rounds" },
  { id: "round-2", chapter: "Rounds" },
  { id: "round-3", chapter: "Rounds" },
  { id: "finale", chapter: "Scores" },
];

export const CHAPTERS = [
  "Open",
  "Field guide",
  "Challenge 1",
  "Verify",
  "Challenge 2",
  "Rounds",
  "Scores",
];

export const TEAM_COLORS = ["#38bdf8", "#f472b6", "#4ade80", "#f59e0b"];

export const CHALLENGES = {
  "challenge-1": {
    id: "challenge-1",
    kicker: "03 / Classroom Challenge 1",
    title: "Spot the artifact",
    scene: "Viral post",
    prompt:
      "You see a viral photo of a famous athlete wearing a custom jacket. How do you confirm it's AI?",
    correct: "B" as ChoiceId,
    answerTitle: "Answer: B. Melted logo text",
    options: [
      {
        id: "A" as ChoiceId,
        text: "The lighting matches the background perfectly.",
        why: "Perfect lighting proves nothing. AI is good at making lighting look convincing.",
      },
      {
        id: "B" as ChoiceId,
        text: "The brand logo text is melted and asymmetric.",
        why: "Melted, asymmetric logo text is a classic AI tell. Always zoom in on lettering.",
      },
      {
        id: "C" as ChoiceId,
        text: "The image is high resolution.",
        why: "High resolution proves nothing, since AI images can be crisp too.",
      },
    ],
  },
  "challenge-2": {
    id: "challenge-2",
    kicker: "09 / Classroom Challenge 2",
    title: "What should you do next?",
    scene: "Action check",
    prompt:
      "You find a high-definition video of an emergency in your town, but no official news source has posted about it. What is your first action?",
    correct: "C" as ChoiceId,
    answerTitle: "Answer: C. Pause, then verify",
    options: [
      {
        id: "A" as ChoiceId,
        text: "Repost immediately to warn your classmates.",
        why: "Reposting spreads an unverified claim and can cause panic if it's fake.",
      },
      {
        id: "B" as ChoiceId,
        text: "Tag five friends in the comment section asking if it's real.",
        why: "Tagging friends spreads the post further and verifies nothing.",
      },
      {
        id: "C" as ChoiceId,
        text: "Pause sharing, check local emergency services accounts, and run a reverse image search.",
        why: "Pausing and checking official sources breaks the chain of misinformation.",
      },
    ],
  },
};

export type RoundId = "round-1" | "round-2" | "round-3";

export const ROUNDS: {
  id: RoundId;
  kicker: string;
  title: string;
  prompt: string;
  hint: string;
  correct: "A" | "B";
  revealTitle: string;
  revealBody: string;
  layout: "posts" | "photos" | "flags";
  options: { id: "A" | "B"; text: string }[];
}[] = [
  {
    id: "round-1",
    kicker: "Round 1 · Caption showdown",
    title: "Which post was written by AI?",
    prompt: "Read both captions. Each team locks an answer.",
    hint: "Look for buzzwords, a polished tone, slang, and a real personal detail.",
    correct: "A",
    revealTitle: "The AI one was A",
    revealBody:
      "Buzzwords (unleash, tapestry, delve) and a perfectly polished tone are classic AI captions. Post B has slang, a personal story, and real emotion.",
    layout: "posts",
    options: [
      {
        id: "A",
        text: "Unleash the tapestry of your day! Delve into 5 ways to elevate your morning routine and unlock your full potential.",
      },
      {
        id: "B",
        text: "ngl my alarm went off 3 times and i STILL missed the bus 😭 someone pls explain why mondays exist",
      },
    ],
  },
  {
    id: "round-2",
    kicker: "Round 2 · Photo face-off",
    title: "Which photo is AI-generated?",
    prompt: "Zoom with your eyes. Hands, lettering, earrings, skin.",
    hint: "These are classroom illustrations so the tells read from the back row. In a real feed you would zoom in the same way.",
    correct: "B",
    revealTitle: "The AI one was B",
    revealBody:
      "Zoom in. Check hands and fingers, text on signs or clothes, mismatched earrings, and skin that looks too smooth.",
    layout: "photos",
    options: [
      { id: "A", text: "Photo A" },
      { id: "B", text: "Photo B" },
    ],
  },
  {
    id: "round-3",
    kicker: "Round 3 · Red flag radar",
    title: "Which one is a deepfake red flag?",
    prompt: "One of these is a real clue. The other is a distraction.",
    hint: "High resolution is not evidence. Watch the mouth against the sound.",
    correct: "A",
    revealTitle: "The red flag was A",
    revealBody:
      "Lip-sync glitches are a top deepfake clue. High resolution proves nothing, since AI can be crisp too.",
    layout: "flags",
    options: [
      {
        id: "A",
        text: 'Mouth stays open on the "M", "B", and "P" sounds while the audio plays.',
      },
      { id: "B", text: "The video is filmed in 4K quality." },
    ],
  },
];

export const REFERENCES = [
  {
    name: "Adaptive Security",
    site: "www.adaptivesecurity.com",
    href: "https://www.adaptivesecurity.com",
    image:
      "https://cdn.sanity.io/images/jod7h86p/production/93f9db9b94f008e137cae86509f693516749725c-2000x1125.webp?w=1600&h=900&fit=max&auto=format",
  },
  {
    name: "Agile Engine",
    site: "agileengine.com",
    href: "https://agileengine.com",
    image:
      "https://agileengine.com/wp-content/uploads/2026/03/Social-media-app-development-in-2026_-features-tech-stack-and-cost-breakdown.webp",
  },
];
