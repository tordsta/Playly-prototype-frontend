import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import ErrorBoundary from './errorBoundary';


import LocalVideoSteam from './localVideoSteam';
import RemoteVideoSteam from './remoteVideoStream';

import RTCMesh from './ReactRTC/RTCMesh';
require("./ReactRTC/index.css")

class App extends Component {

  componentDidMount() {
    //console.log('something something');
    
    //transmitter
    let servers = null;
    let localPeerConnection = new RTCPeerConnection(servers);
      //create iceCandidate
    //localPeerConnection.addEventListener('icecandidate', handleConnection);
    //handleConnection(event)
    //const newIceCandidate = new RTCIceCandidate(event.candicate); 
    //event.target.addIceCandidate(newIceCandidate);
    
      //give sdp offer



    //reciver
      //create ice candicate
      //create anwnser
      //create remote video steams 

  }
//todo fix ws to wss in backend and stuff 
  render() {
    return (
      <div>This is a React component inside of Webflow!<br/><br/>
        
        Your video steam <br/>
        {/*<LocalVideoSteam/>*/}

        Remote video stream <br/>
        {/*<RemoteVideoSteam remoteSteam={null} />*/}

        This is ReactRTC imported component
        <ErrorBoundary>
          <RTCMesh URL="wss://playly.azurewebsites.net:443"/>
        </ErrorBoundary>

      </div>     
    )
  }
}

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-target')
);