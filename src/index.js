import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import websocket from "websocket"
import ErrorBoundary from './errorBoundary';


import LocalVideoSteam from './localVideoSteam';
import RemoteVideoSteam from './remoteVideoStream';

import RTCMesh from './ReactRTC/RTCMesh';
require("./ReactRTC/index.css")

//const url = "ws://localhost:3000"
//const url = "ws://playly-server-alb-732449255.us-east-2.elb.amazonaws.com";

class App extends Component {
  //ws = new WebSocket(url)

  //This is currently only for testing pourposes
  componentDidMount() {
    //this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
    //  console.log('connected')
    //}

    //this.ws.onclose = () => {
    //  console.log('disconnected')
      // fix this - automatically try to reconnect on connection loss
      //this.setState({
      //  ws: new WebSocket(URL),
      //})
    //}
  }

  render() {
    return (
      <div>        
        This is a ReactRTC component imported from outside webflow<br/>

        <ErrorBoundary>
          <RTCMesh URL="ws://playly-server-alb-732449255.us-east-2.elb.amazonaws.com"/>
        </ErrorBoundary>        
                
      </div>     
    )
  }
}

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-target')
);