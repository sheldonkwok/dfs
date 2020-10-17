import { kIsNormalizedAlready } from "got/dist/source";
import * as types from "./types";


const TEST_FIRST_NAME = ''; // Used to debug name mismatches

export function getPlayerCostMap(players: types.ContestPlayer[]): Map<string, number> {
  return players.reduce((map, player) => {
    const key = getPlayerKey({
      name: `${player.firstName} ${player.lastName}`,
      position: player.primaryPosition,
      teamAbbr: player.teamAbbr,
    });

    if (player.firstName === TEST_FIRST_NAME) console.log('Yahoo:', key);

    return map.set(key, player.salary);
  }, new Map<string, number>());
}

export async function createRankings(
  file: File,
  playerCosts: Map<string, number>
): Promise<types.RankingPlayer[]> {
  const csv = await file.text();

  const { position } = parseFilename(file.name);
  const lines = csv.trim().split("\n").slice(1);

  return lines
    .filter((line) => !line.startsWith('""'))
    .map((line) => {
      const columns = line.split(",");
      const { name, teamAbbr } = parsePlayerTeam(clean(columns[1]));

      const key = getPlayerKey({ name, position, teamAbbr });
      if (name.startsWith(TEST_FIRST_NAME)) console.log('FP:', key);

      const cost = Number(playerCosts.get(key) || 0);
      const projectedPoints = Number(clean(columns[5]));
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

export interface PlayerTeam {
  name: string;
  teamAbbr: string;
}

function parsePlayerTeam(playerTeamStr: string): PlayerTeam {
  const match = playerTeamStr.match(/(.*) \((\w+)\)/);
  const [_, name, teamAbbr] = match;
  return { name, teamAbbr};
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
  const team = fixTeamName(teamAbbr)
  return [position, team, name].join("-");
}

function fixTeamName(badTeam: string): string {
  if (badTeam === "JAC") return "JAX";
  return badTeam;
}
