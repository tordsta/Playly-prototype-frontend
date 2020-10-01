import React, { Component } from 'react';
import UnoTranslator from "./UnoTranslator";

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
          <div style={{height: "500px", width: "500px", backgroundColor: "red"}}>
              Selected game: {this.state.selectedGame}
              <UnoTranslator/>
          </div>
        );
      }
}  

export default GameFrame;