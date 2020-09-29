// This is just the desired subset of Yahoo results
export interface ContestPlayer {
  firstName: string;
  lastName: string;
  teamAbbr: string;
  salary: number;
  primaryPosition: string;
}

export interface RankingPlayer {
  position: string;
  name: string;
  teamAbbr: string;
  cost: number;
  projectedPoints: number;
}
