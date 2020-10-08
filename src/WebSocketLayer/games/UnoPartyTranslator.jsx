import React, { Component } from 'react';
import Game from "./UnoParty/unoparty-client/src/App";

class UnoPartyTranslator extends Component {
    constructor(props) {
      super(props);
    }

    render() {
        return(
          <div>
              hello from uno party translator
              <Game/>
          </div>
        );
      }
}  

export default UnoPartyTranslator;