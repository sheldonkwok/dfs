import got from "got";
import * as qs from "querystring";

// This is pulled from  https://cdn.fantasypros.com/assets/js/min/pages/rankings/bundle-01b0b3ae8d.js
// so it's not really a "secret"
const API_KEY = "zjxN52G3lP4fORpHRftGI2mTU8cTwxVNvkjByM3j";

const fp = got.extend({
  prefixUrl: "https://api.fantasypros.com/v2/json/nfl/2020/consensus-rankings?",
  headers: { "x-api-key": API_KEY },
  responseType: "json",
});

interface ConsensusRankings {
  players: FantasyProsPlayer[];
}

interface FantasyProsPlayer {
  player_name: string;
  player_yahoo_id: string;
  r2p_pts: string;
}

export interface PlayerProjection {
  playerName: string;
  yahooID: string;
  points: string;
}

export async function getProjectedPoints(week: number, position: string) {
  const query = qs.stringify({ experts: "available", type: "weekly", scoring: "HALF", position, week });
  const { body } = await fp.get<ConsensusRankings>(query);

  const data = body.players.map((fpp) => {
    return { playerName: fpp.player_name, yahooID: fpp.player_yahoo_id, points: fpp.r2p_pts };
  });

  return data;
}
