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
    const file = acceptedFiles[0];
    const text = await file.text();

    const playerData = processor.convertCSV(text);

    this.setState({ ...this.state, playerData });
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
    let contestID = 7354953;

    return (
      <form onSubmit={(event) => this.onContestID(contestID, event)}>
        <label>
          Contest ID:
          <input type="text" value={contestID} onChange={(e) => (contestID = Number(e.target.value))} />
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
