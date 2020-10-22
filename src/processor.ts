import { kIsNormalizedAlready } from "got/dist/source";
import * as types from "./types";

const TEST_FIRST_NAME = ""; // Used to debug name mismatches

export function getPlayerCostMap(players: types.ContestPlayer[]): Map<string, number> {
  return players.reduce((map, player) => {
    const key = getPlayerKey({
      name: `${player.firstName} ${player.lastName}`,
      position: player.primaryPosition,
      teamAbbr: player.teamAbbr,
    });

    if (player.firstName === TEST_FIRST_NAME) console.log("Yahoo:", key);

    return map.set(key, player.salary);
  }, new Map<string, number>());
}

export async function createRankings(
  file: File,
  playerCosts: Map<string, number>
): Promise<types.RankingPlayer[]> {
  const csv = await file.text();

  const { position } = parseFilename(file.name);
  const lines = csv
    .trim()
    .split("\n")
    .slice(1)
    .filter((line) => !line.startsWith('""'));

  return lines.map((line) => parseLine(line, position, playerCosts));
}

function parseLine(line: string, position: string, playerCosts: Map<string, number>): types.RankingPlayer {
  const columns = line.split(",");

  const name = clean(columns[1]);
  const teamAbbr = clean(columns[2]);

  const key = getPlayerKey({ name, position, teamAbbr });
  if (TEST_FIRST_NAME && name.startsWith(TEST_FIRST_NAME)) console.log("FP:", key);

  const cost = Number(playerCosts.get(key) ?? 0);
  const projectedPoints = Number(clean(columns[6]));
  const pointsPerDollar = (projectedPoints / cost).toFixed(3);
  const matchupRating = Number(clean(columns[4]));

  return {
    position,
    name,
    teamAbbr,
    cost,
    matchupRating,
    projectedPoints,
    pointsPerDollar,
  };
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
  return csvStr.trim().replace(/"/g, "").trim();
}

interface PlayerKeyInput {
  name: string;
  position: string;
  teamAbbr: string;
}

function getPlayerKey({ name, position, teamAbbr }: PlayerKeyInput): string {
  const team = fixTeamName(teamAbbr);
  return [position, team, name].join("-");
}

function fixTeamName(badTeam: string): string {
  if (badTeam === "JAC") return "JAX";
  return badTeam;
}
