import React, { ContextType, useRef } from "react";
import Dropzone from "react-dropzone";

import * as types from "@src/types";
import * as processor from "@src/processor";

import Table from "@src/table";

const DEFAULT_CONTEST_ID = 7542354;

interface ContestInputProps {
  onContestID: (contestID: number) => Promise<void>;
}

function ContestInput({ onContestID }: ContestInputProps): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onContestID(Number(ref.current.value));
      }}
    >
      <label>
        Contest ID:
        <input ref={ref} type="text" defaultValue={DEFAULT_CONTEST_ID} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

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

interface AppProps {}

interface AppState {
  contestID?: number;

  playerData: types.RankingPlayer[];
  playerCosts: Map<string, number>;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = { contestID: undefined, playerData: [], playerCosts: new Map<string, number>() };
  }

  async onContestID(contestID: number) {
    this.setState({ ...this.state, contestID });

    const req = await fetch(`/api/contest-costs/${contestID}`);
    const data = await req.json();
    const contestPlayers: types.ContestPlayer[] = data.playerCosts;

    this.setState({ ...this.state, playerCosts: processor.getPlayerCostMap(contestPlayers) });
  }

  async onDrop(acceptedFiles: File[]): Promise<void> {
    for (const file of acceptedFiles) {
      const playerData = await processor.createRankings(file, this.state.playerCosts);
      this.setState({ ...this.state, playerData: this.state.playerData.concat(playerData) });
    }
  }

  render() {
    if (!this.state.contestID) return <ContestInput onContestID={this.onContestID.bind(this)}></ContestInput>;

    return (
      <div>
        <FileInput onFilesInput={this.onDrop.bind(this)}></FileInput>
        {this.state.playerData.length > 1 ? <Table data={this.state.playerData}></Table> : <div></div>}
      </div>
    );
  }
}
