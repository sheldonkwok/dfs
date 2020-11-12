import lodash from "lodash";

import * as yahoo from "@src/yahoo";
import * as fp from "@src/fp";

export interface Player extends yahoo.ContestPlayer {
  name: string;
  points: number;
  pointsPerDollar: string;
}

export async function getRankingPlayers(contestID: string, week: number): Promise<Player[]> {
  const players = await yahoo.getContestPlayers(contestID);
  const playerPoints = await fp.getProjectedPoints(week, "WR");

  const rankingPlayers = lodash(players)
    .filter((p) => !!playerPoints.get(p.code))
    .map((p) => {
      const points = playerPoints.get(p.code) || 0;
      const pointsPerDollar = (points / p.salary).toFixed(3);

      return {
        ...p,
        name: `${p.firstName} ${p.lastName}`,
        points,
        pointsPerDollar,
      };
    })
    .value();

  return rankingPlayers;
}
