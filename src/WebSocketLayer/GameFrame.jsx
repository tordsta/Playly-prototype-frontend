import React, { Component } from 'react';
import UnoPartyTranslator from "./games/unoparty/src/UnoPartyTranslator";

class GameFrame extends Component {
    constructor(props) {
      super(props);
      this.state = {
          games: ["uno"],
          selectedGame: "uno"
      }
    }

    render() {
        return(
          <div style={{display: "flex", alignItems: "stretch", height: "500px", width: "1000px", backgroundColor: "red"}}>
            <UnoPartyTranslator userID={this.props.userID} socket={this.props.socket} roomKey={this.props.roomKey}/>
          </div>
        );
      }
}  

export default GameFrame;