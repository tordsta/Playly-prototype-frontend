import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import websocket from "websocket"
import ErrorBoundary from './errorBoundary';


import LocalVideoSteam from './localVideoSteam';
import RemoteVideoSteam from './remoteVideoStream';

import RTCMesh from './WebSocketLayer/RTCMesh';
require("./WebSocketLayer/index.css")

const url = "ws://localhost:3000"

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