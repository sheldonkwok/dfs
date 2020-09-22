import { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import * as qs from "querystring";

interface ContestPlayersResponse {
  players: {
    result: ContestPlayer[];
  };
}

// This is just the desired subset
interface ContestPlayer {
  firstName: string;
  lastName: string;
  teamAbbr: string;
  salary: number;
  projectedPoints: number;
}

async function getPlayerCosts(contestId: number): Promise<ContestPlayer[]> {
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
    firstName: p.firstName,
    lastName: p.lastName,
    teamAbbr: p.teamAbbr,
    salary: p.salary,
    projectedPoints: p.projectedPoints,
  }));
}
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const str = req.query.id as string;

  const contestId = parseInt(str, 10);
  if (!contestId) throw new Error(`Invalid competition id ${str}`);

  const playerCosts = await getPlayerCosts(contestId);

  res.json({ playerCosts });
};
