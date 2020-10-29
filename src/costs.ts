import got from "got";
import * as qs from "querystring";

import * as utils from "./utils";

// This is just the desired subset of Yahoo results
export interface ContestPlayer {
  code: string;
  firstName: string;
  lastName: string;
  teamAbbr: string;
  salary: number;
  primaryPosition: string;
}

export async function getPlayerCosts(contestID: string): Promise<Record<string, number>> {
  const players = await getContestPlayers(contestID);

  const playerCosts: Record<string, number> = {};

  for (const player of players) {
    const key = utils.getPlayerKey({
      name: `${player.firstName} ${player.lastName}`,
      position: player.primaryPosition,
      teamAbbr: player.teamAbbr,
    });

    if (player.firstName === utils.TEST_FIRST_NAME) console.log("Yahoo:", key);

    playerCosts[key] = player.salary;
  }

  return playerCosts;
}

interface ContestPlayersResponse {
  players: {
    result: ContestPlayer[];
  };
}

async function getContestPlayers(contestID: string): Promise<ContestPlayer[]> {
  const query = qs.stringify({
    lang: "en-US",
    region: "US",
    contestId: contestID,
  });

  const data = await got.get<ContestPlayersResponse>(
    `https://dfyql-ro.sports.yahoo.com/v2/contestPlayers?${query}`,
    { responseType: "json" }
  );

  return data.body.players.result.map((p) => ({
    code: parseID(p.code),
    firstName: fixFirstName(p.firstName),
    lastName: fixLastName(p.lastName),
    teamAbbr: p.teamAbbr,
    salary: p.salary,
    primaryPosition: p.primaryPosition,
  }));
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
