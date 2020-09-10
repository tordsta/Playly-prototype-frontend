import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import websocket from "websocket"
import ErrorBoundary from './errorBoundary';


import LocalVideoSteam from './localVideoSteam';
import RemoteVideoSteam from './remoteVideoStream';

import RTCMesh from './ReactRTC/RTCMesh';
require("./ReactRTC/index.css")

const url = "wss://localhost:3000/wss";

class App extends Component {
  ws = new WebSocket(url)

  componentDidMount() {
    //This is currently only for testing pourposes
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    this.ws.onclose = () => {
      console.log('disconnected')
      // fix this - automatically try to reconnect on connection loss
      //this.setState({
      //  ws: new WebSocket(URL),
      //})
    }
  }

//todo fix ws to wss in backend and stuff 
  render() {

    fetch('https://localhost:3000/up')
      .then(response => response.text())
      .then(response => console.log(response));

    
    return (
      <div>        

        Your video steam <br/>
        {/*<LocalVideoSteam/>*/}

        Remote video stream <br/>
        {/*<RemoteVideoSteam remoteSteam={null} />*/}

        This is ReactRTC imported component <br/>
        {/*
        <ErrorBoundary>
          <RTCMesh URL="wss://localhost:3000"/>
        </ErrorBoundary>        
        */}
        
      </div>     
    )
  }
}

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-target')
);