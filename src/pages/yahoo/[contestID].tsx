import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import * as processor from "@src/processor";
import * as costs from "@src/costs";

import Table from "@src/table";
interface FileInputProps {
  onFilesInput: (files: File[]) => Promise<void>;
}

function FileInput({ onFilesInput }: FileInputProps): JSX.Element {
  return (
    <Dropzone onDrop={(acceptedFiles) => onFilesInput(acceptedFiles)}>
      {({ getRootProps, getInputProps }) => (
        <div>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drop Fantasy Pros Superflex csv here</p>
          </div>
        </div>
      )}
    </Dropzone>
  );
}

async function processFiles(
  playerCosts: Record<string, number>,
  files: File[]
): Promise<processor.RankingPlayer[]> {
  let playerData = [];

  for (const file of files) {
    const newPlayerData = await processor.createRankings(file, playerCosts);
    playerData = playerData.concat(newPlayerData);
  }

  return playerData;
}

interface RankingsProps {
  playerCosts: Record<string, number>;
}

export default function Rankings({ playerCosts }: RankingsProps) {
  const [playerData, setPlayerData] = useState([]);

  const onFilesInput = async (files: File[]) => {
    const newPlayerData = await processFiles(playerCosts, files);
    setPlayerData(playerData.concat(newPlayerData));
  };

  return (
    <div>
      <FileInput onFilesInput={onFilesInput}></FileInput>
      {playerData.length > 1 ? <Table data={playerData}></Table> : <div></div>}
    </div>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<RankingsProps>> {
  const contestID = context.query.contestID as string;
  const playerCosts = await costs.getPlayerCosts(contestID);

  return { props: { playerCosts } };
}
