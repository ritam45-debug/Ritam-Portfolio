import type { Interest } from "./types";

// Interests beyond academics. `lens` is the short front-of-card line,
// `story` is revealed when a visitor opens the card. Rewrite in your own words.

export const interests: Interest[] = [
  {
    id: "cricket",
    title: "Cricket",
    lens: "A game of run rates, matchups and pressure.",
    story:
      "Cricket is one of the most data-rich sports there is. Every over updates the required rate, every bowling change is a bet on a matchup. It's a good reminder that numbers only matter when they change a decision.",
    motif: "cricket",
  },
  {
    id: "movies",
    title: "Movies",
    lens: "Stories, structure and the business behind the screen.",
    story:
      "A good film is a lesson in structure: set-up, tension, resolution. The business side is just as interesting, from how a release is positioned to how a studio decides what to greenlight.",
    motif: "film",
  },
  {
    id: "acting",
    title: "Acting",
    lens: "Reading a room and holding attention.",
    story:
      "Acting is about understanding a character's motivation and making an audience believe it. Presenting an analysis asks for something similar: know your audience and keep the story clear.",
    motif: "stage",
  },
  {
    id: "creativity",
    title: "Creativity",
    lens: "The other half of analysis.",
    story:
      "Data tells you what is happening; creativity helps you ask a better question and present the answer in a way people remember. This site is part of that experiment.",
    motif: "spark",
  },
  {
    id: "technology",
    title: "Technology & how businesses work",
    lens: "Curious about the machinery behind companies.",
    story:
      "From how a product makes money to how AI is changing everyday work, I like taking businesses apart to see how the pieces fit.",
    motif: "circuit",
  },
];
