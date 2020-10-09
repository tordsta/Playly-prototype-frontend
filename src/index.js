import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import websocket from "websocket"
import ErrorBoundary from './errorBoundary';


import LocalVideoSteam from './localVideoSteam';
import RemoteVideoSteam from './remoteVideoStream';

import RTCMesh from './ReactRTC/RTCMesh';
require("./ReactRTC/index.css")

//const url = "ws://localhost:3000"
const url = "wss://playlyserver.net";

class App extends Component {

  render() {
    return (
      <div>        

        <ErrorBoundary>
          <RTCMesh URL={url}/>
        </ErrorBoundary>        
                
      </div>     
    )
  }
}

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-target')
);