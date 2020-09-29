import * as types from "./types";

export function getPlayerCostMap(players: types.ContestPlayer[]): Map<string, number> {
  return players.reduce((map, player) => {
    return map.set(getPlayerKey(player), player.salary);
  }, new Map<string, number>());
}

function getPlayerKey(player: types.ContestPlayer): string {
  return [player.primaryPosition, player.teamAbbr, player.firstName, player.lastName].join("-");
}

export function convertCSV(csv: string): types.RankingPlayer[] {
  const lines = csv.trim().split("\n").slice(2);

  return lines
    .filter((line) => !line.startsWith('""'))
    .map((line) => {
      const columns = line.split(",");

      return {
        position: "RB",
        name: clean(columns[3]),
        teamAbbr: clean(columns[4]),
        cost: 10,
        projectedPoints: Number(clean(columns[10])),
      };
    });
}

function clean(csvStr: string): string {
  return csvStr.trim().slice(1, -1);
}
