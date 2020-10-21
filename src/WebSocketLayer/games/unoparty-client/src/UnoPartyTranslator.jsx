import React, { Component } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './redux/store';
import './index.css'; //is this empty all the time???
import App from './App';

class UnoPartyTranslator extends Component {
    constructor(props) {
      super(props);
    }

    //Confirm i have websocket
    componentDidMount(){
      console.log(this.props.socket)
    }

    render() {
        return(
          <div style={{backgroundColor: "blue"}}>
              <Provider store = {store}>
                <MemoryRouter>
                  <App userID={this.props.userID} wsSocket={this.props.socket} />
                </MemoryRouter>
              </Provider>
          </div>
        );
      }
}  

export default UnoPartyTranslator;