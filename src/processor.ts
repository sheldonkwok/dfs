import * as types from "./types";

export function getPlayerCostMap(players: types.ContestPlayer[]): Map<string, number> {
  return players.reduce((map, player) => {
    const key = getPlayerKey({
      name: `${player.firstName} ${player.lastName}`,
      position: player.primaryPosition,
      teamAbbr: player.teamAbbr,
    });

    return map.set(key, player.salary);
  }, new Map<string, number>());
}

export async function createRankings(
  file: File,
  playerCosts: Map<string, number>
): Promise<types.RankingPlayer[]> {
  const csv = await file.text();

  const { position } = parseFilename(file.name);
  const lines = csv.trim().split("\n").slice(2);

  return lines
    .filter((line) => !line.startsWith('""'))
    .map((line) => {
      const columns = line.split(",");
      const name = clean(columns[3]);
      const teamAbbr = fixTeamName(clean(columns[4]));

      const key = getPlayerKey({ name, position, teamAbbr });
      const cost = Number(playerCosts.get(key) || 0);
      const projectedPoints = Number(clean(columns[10]));
      const pointsPerDollar = (projectedPoints / cost).toFixed(3);

      return {
        position,
        name,
        teamAbbr,
        cost,
        projectedPoints,
        pointsPerDollar,
      };
    });
}

interface ParseFilenameOutput {
  week: number;
  position: string;
}

function parseFilename(filename: string): ParseFilenameOutput {
  const match = filename.match(/^FantasyPros_2020_Week_(\d+)_(\w+)_Rankings\.csv$/);
  if (!match) throw new Error("Invalid csv filename");

  const [_, week, position] = match;
  return { week: Number(week), position };
}

function clean(csvStr: string): string {
  return csvStr.trim().slice(1, -1).trim();
}

interface PlayerKeyInput {
  name: string;
  position: string;
  teamAbbr: string;
}

function getPlayerKey({ name, position, teamAbbr }: PlayerKeyInput): string {
  return [position, teamAbbr, name].join("-");
}

function fixTeamName(badTeam: string): string {
  if (badTeam === "JAC") return "JAX";
  return badTeam;
}
