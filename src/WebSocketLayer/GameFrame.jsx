import React, { Component } from 'react';
import UnoPartyTranslator from "./games/UnoPartyTranslator";

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
          <div style={{height: "500px", width: "1000px", backgroundColor: "red"}}>
              Selected game: {this.state.selectedGame}
              <UnoPartyTranslator/>
          </div>
        );
      }
}  

export default GameFrame;