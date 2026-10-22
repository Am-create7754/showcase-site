// REPRESENTATIVE SAMPLE DATA for the portfolio demonstration.
// Teams and players are fictional. Nothing here is output from the IPL Intelligence repository.

export interface Innings {
  team: string;
  short: string;
  runsPerOver: number[];
  wicketsPerOver: number[];
}

export const MATCH = {
  title: "Team Indigo vs Team Saffron",
  venue: "Sample venue",
  innings: [
    {
      team: "Team Indigo",
      short: "IND",
      runsPerOver: [8, 10, 7, 12, 9, 11, 6, 7, 5, 8, 9, 7, 10, 6, 8, 14, 12, 9, 13, 15],
      wicketsPerOver: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
    },
    {
      team: "Team Saffron",
      short: "SAF",
      runsPerOver: [12, 9, 14, 8, 10, 6, 4, 3, 5, 6, 9, 8, 7, 10, 8, 11, 9, 13, 7, 9],
      wicketsPerOver: [0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
    },
  ] as Innings[],
};

export const BATTING = [
  { name: "R. Menon", team: "IND", runs: 68, balls: 44, fours: 6, sixes: 3 },
  { name: "D. Kulkarni", team: "SAF", runs: 57, balls: 38, fours: 5, sixes: 2 },
  { name: "S. Bhat", team: "IND", runs: 41, balls: 23, fours: 3, sixes: 3 },
  { name: "N. Joshi", team: "SAF", runs: 33, balls: 29, fours: 2, sixes: 1 },
];

export const BOWLING = [
  { name: "A. Pillai", team: "IND", overs: 4, runs: 22, wickets: 3 },
  { name: "V. Sethi", team: "SAF", overs: 4, runs: 31, wickets: 2 },
  { name: "K. Das", team: "IND", overs: 4, runs: 36, wickets: 1 },
  { name: "M. Rawat", team: "SAF", overs: 4, runs: 44, wickets: 1 },
];

/** Representative average first-innings score by season (S1–S6 are placeholders, not real seasons). */
export const SEASONS = [
  { season: "S1", avgFirstInnings: 158, matches: 60 },
  { season: "S2", avgFirstInnings: 163, matches: 60 },
  { season: "S3", avgFirstInnings: 161, matches: 70 },
  { season: "S4", avgFirstInnings: 170, matches: 70 },
  { season: "S5", avgFirstInnings: 176, matches: 74 },
  { season: "S6", avgFirstInnings: 189, matches: 74 },
];

export const SUGGESTED_QUESTIONS = [
  "Who was the top scorer in this match?",
  "Which bowler was most economical?",
  "How did the death overs compare?",
  "Where did the chase turn?",
];
