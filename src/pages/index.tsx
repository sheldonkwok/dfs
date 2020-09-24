import React from "react";
import Dropzone from "react-dropzone";

interface IProps {}

interface IState {
  contestID?: number;
  fileData?: string;
}

export default class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = { contestID: undefined, fileData: "" };
  }

  async onDrop(acceptedFiles: File[]): Promise<void> {
    const file = acceptedFiles[0];
    const text = await file.text();

    this.setState({ ...this.state, fileData: text });
  }

  render() {
    if (this.state.fileData) {
      return <div style={{ whiteSpace: "pre" }}>{this.state.fileData}</div>;
    }

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
