import got from "got";
import lodash from "lodash";
import qs from "querystring";

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

const POSITIONS = ["QB", "RB", "WR", "TE"];

export async function getProjectedPoints(week: number, position: string): Promise<Map<string, number>> {
  const all = await Promise.all(POSITIONS.map((position) => getPositionPoints(week, position)));

  return lodash(all)
    .flatten()
    .reduce(
      (agg, player) => agg.set(player.player_yahoo_id, Number(player.r2p_pts)),
      new Map<string, number>()
    );
}

interface CacheValue {
  players: FantasyProsPlayer[];
  expires: number;
}

const CACHE = new Map<string, CacheValue>();
const EXPIRATION = 60 * 60 * 1000;

export async function getPositionPoints(week: number, position: string): Promise<FantasyProsPlayer[]> {
  const key = `${week}-${position}`;
  const cached = CACHE.get(key);

  if (cached?.expires > Date.now()) return cached.players;

  const query = qs.stringify({ experts: "available", type: "weekly", scoring: "HALF", position, week });
  const { body } = await fp.get<ConsensusRankings>(query);

  const players = body.players;
  const expires = Date.now() + EXPIRATION;

  CACHE.set(key, { players, expires });
  return players;
}
