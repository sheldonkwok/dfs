import got from "got";
import * as qs from "querystring";

// This is just the desired subset of Yahoo results
export interface ContestPlayer {
  code: string;
  firstName: string;
  lastName: string;
  teamAbbr: string;
  salary: number;
  primaryPosition: string;
}

const CACHE = new Map<string, ContestPlayer[]>();

interface ContestPlayersResponse {
  players: {
    result: ContestPlayer[];
  };
}

export async function getContestPlayers(contestID: string): Promise<ContestPlayer[]> {
  const cached = CACHE.get(contestID);
  if (cached) return cached;

  const query = qs.stringify({
    lang: "en-US",
    region: "US",
    contestId: contestID,
  });

  const data = await got.get<ContestPlayersResponse>(
    `https://dfyql-ro.sports.yahoo.com/v2/contestPlayers?${query}`,
    { responseType: "json" }
  );

  const players = data.body.players.result.map((p) => ({
    code: parseID(p.code),
    firstName: fixFirstName(p.firstName),
    lastName: fixLastName(p.lastName),
    teamAbbr: p.teamAbbr,
    salary: p.salary,
    primaryPosition: p.primaryPosition,
  }));

  CACHE.set(contestID, players);
  return players;
}

function parseID(code: string): string {
  const match = code.match(/^nfl\.p\.(\d+)$/);
  if (!match) return code;

  return match[1];
}

function fixFirstName(name: string): string {
  if (name === "DJ") return "D.J.";
  if (name === "DK") return "D.K.";

  return name;
}

function fixLastName(name: string): string {
  if (name === "Mahomes") return "Mahomes II";

  return name;
}
