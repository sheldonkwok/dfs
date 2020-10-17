import React from "react";
import Dropzone from "react-dropzone";

import * as types from "@src/types";
import * as processor from "@src/processor";

import Table from "@src/table";

interface IProps {}

interface IState {
  contestID?: number;

  playerData: types.RankingPlayer[];
  playerCosts: Map<string, number>;
}

let DEFAULT_CONTEST_ID = 7511907;

export default class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { contestID: undefined, playerData: [], playerCosts: new Map<string, number>() };
  }

  async onContestID(contestID: number, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
    if (!this.state.contestID) return this.renderContestInput();

    return (
      <div>
        {this.renderFileInput()}
        {this.state.playerData.length > 1 ? <Table data={this.state.playerData}></Table> : <div></div>}
      </div>
    );
  }

  renderContestInput(): JSX.Element {
    return (
      <form onSubmit={(event) => this.onContestID(DEFAULT_CONTEST_ID, event)}>
        <label>
          Contest ID:
          <input
            type="text"
            value={DEFAULT_CONTEST_ID}
            onChange={(e) => (DEFAULT_CONTEST_ID = Number(e.target.value))}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }

  renderFileInput(): JSX.Element {
    return (
      <Dropzone onDrop={(acceptedFiles) => this.onDrop(acceptedFiles)}>
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
}
