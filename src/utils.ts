interface PlayerKeyInput {
  name: string;
  position: string;
  teamAbbr: string;
}

export function getPlayerKey({ name, position, teamAbbr }: PlayerKeyInput): string {
  const team = fixTeamName(teamAbbr);
  return [position, team, name].join("-");
}

function fixTeamName(badTeam: string): string {
  if (badTeam === "JAC") return "JAX";
  return badTeam;
}

export const TEST_FIRST_NAME = ""; // Used to debug name mismatches