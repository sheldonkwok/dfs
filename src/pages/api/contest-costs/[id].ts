import { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import * as qs from "querystring";

import * as types from "@src/types";

interface ContestPlayersResponse {
  players: {
    result: types.ContestPlayer[];
  };
}

async function getPlayerCosts(contestId: number): Promise<types.ContestPlayer[]> {
  const query = qs.stringify({
    lang: "en-US",
    region: "US",
    contestId,
  });

  const data = await got.get<ContestPlayersResponse>(
    `https://dfyql-ro.sports.yahoo.com/v2/contestPlayers?${query}`,
    { responseType: "json" }
  );

  return data.body.players.result.map((p) => ({
    firstName: fixFirstName(p.firstName),
    lastName: fixLastName(p.lastName),
    teamAbbr: p.teamAbbr,
    salary: p.salary,
    primaryPosition: p.primaryPosition,
  }));
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const str = req.query.id as string;

  const contestId = parseInt(str, 10);
  if (!contestId) throw new Error(`Invalid competition id ${str}`);

  const playerCosts = await getPlayerCosts(contestId);

  res.json({ playerCosts });
};

function fixFirstName(name: string): string {
  if (name === "DJ") return "D.J.";
  if (name === "DK") return "D.K.";

  return name;
}

function fixLastName(name: string): string {
  if (name === "Mahomes") return "Mahomes II";

  return name;
}
