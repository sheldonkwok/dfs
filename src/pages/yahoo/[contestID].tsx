import React, { useState } from "react";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import * as processor from "@src/processor";
import Table from "@src/table";

const WEEK = 10;

interface FileInputProps {
  onFilesInput: (files: File[]) => Promise<void>;
}

interface RankingsProps {
  players: processor.Player[];
}

export default function Rankings({ players }: RankingsProps) {
  // const [playerData, setPlayerData] = useState<Player[]>([]);

  return (
    <div>
      <Table data={players}></Table>
    </div>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<RankingsProps>> {
  const contestID = context.query.contestID as string;
  const players = await processor.getRankingPlayers(contestID, WEEK);

  return { props: { players } };
}
