import React, { Component } from 'react';
import RTCVideo from './RTC/RTCVideo.jsx';
import Form from './RTC/Form.jsx';
import Websocket from './Websocket.jsx';
import PeerConnection from './RTC/PeerConnection.jsx';
import GameFrame from "./GameFrame";
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS, TYPE_ROOM, TYPE_ANSWER } from './functions/constants';
import { buildServers, generateRoomKey, createMessage, createPayload } from './functions/utils';

class RTCMesh extends Component {
  constructor(props) {
    super(props);
    const {mediaConstraints, iceServers, URL } = props;
    // build iceServers config for RTCPeerConnection
    const iceServerURLs = buildServers(iceServers);
    this.state = {
      text: '',
      roomKey: null, //roomKey is the trimmed text
      iceServers: iceServerURLs || DEFAULT_ICE_SERVERS,
      mediaConstraints: mediaConstraints || DEFAULT_CONSTRAINTS,
      localMediaStream: null,
      remoteMediaStream1: null,
      remoteMediaStream2: null,
      remoteMediaStream3: null,
      socketID: null, //identifier for self (this client). The websocket ID is the same as the user ID
      users: {}, // object format {userID : {user object}, ...} 
    };
    this.socket = new WebSocket(this.props.URL);
  }

  //The function in this class is in the order they are "called" in relation to the 
  componentDidMount(prevProps, prevState) {
    this.openCamera();

  }


  openCamera = async (fromHandleOffer) => {    
    const { mediaConstraints, localMediaStream } = this.state;
    try {
      if (!localMediaStream) {
        let mediaStream;
        mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        return fromHandleOffer === true ? mediaStream : this.setState({ localMediaStream: mediaStream });
      }
    } catch(error) {
      console.error('getUserMedia Error: ', error)
    }
    
  }

  sendRoomKey = () => {
    const { roomKey, socketID } = this.state;
    if (!roomKey) {
      const key = generateRoomKey();
      const roomData = createMessage(TYPE_ROOM, createPayload(key, socketID));
      this.setState({ roomKey: key })
      this.socket.send(JSON.stringify(roomData));
      alert(key);
    }
  }


  handleSocketConnection = (socketID) => {
    this.setState({socketID});
  }


  handleUsers = async (data) => {
    this.setState(prevState => {
      let users = Object.assign({}, prevState.users);      
      data.payload.forEach(user => {
        if(!(user in this.state.users) && user != this.state.socketID){
          let rtcPeerConnection = new RTCPeerConnection({ iceServers: this.state.iceServers });
          users[user] = {connection: false, rtcPeerConnection: rtcPeerConnection};     
        }
      });
      return {users};
    });
    //console.log("state users", this.state.users)

    //Send out connection requests
    for (const [user, obj] of Object.entries(this.state.users)) {
      if(!obj.connected){
        let peerReceiver = user;        
        const peerData = createMessage(
          "PEER_CONNECTION", 
          createPayload(
            this.state.roomKey,
            this.state.socketID, //socketID / userID of sender / this client
            peerReceiver
          ));
        this.socket.send(JSON.stringify(peerData));
      }
    }
  }


  handleConnectionReady = (message) => {
    //console.log('Inside handleConnectionReady: ', message);
    //console.log("Is sender:", message.sender == this.state.socketID);

    //We only want one of the clients (sender/receiver) to create and send an offer
    //If sender is self, set receiver connection to true -> makes offer
    if (message.startConnection && message.sender == this.state.socketID) {
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        users[message.receiver].connection = true;   // this one activates the addMediaTrack in peerConnection.jsx 
        return {users};
      });

    } else { // Else create new user and set connection to false -> no offer
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        let rtcPeerConnection = new RTCPeerConnection({ iceServers: this.state.iceServers });
        users[message.sender] = {connection: false, rtcPeerConnection: rtcPeerConnection};    //this does not activate addMediaTrack in pperConnection.jsx
        return {users};
      });
    }
    //console.log("state users", this.state.users);
  }


  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID, users } = this.state;
    const { payload } = data;
    const receiver = payload.socketID
    
    if(payload.receiver == socketID){
      await users[receiver].rtcPeerConnection.setRemoteDescription(payload.message);
      let mediaStream = localMediaStream
      if (!mediaStream) mediaStream = await this.openCamera(true);

      //Setts connection to true after receiving offer
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        users[payload.socketID].connection = true;   //This one activates the addMediaTrack
        return {users};
      });            

      //Creates and returns an awnser
      this.setState({ localMediaStream: mediaStream }, async function() {
        const answer = await users[receiver].rtcPeerConnection.createAnswer();
        await users[receiver].rtcPeerConnection.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer, receiver);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        this.socket.send(JSON.stringify(answerMessage));
      });
    } else {
      //console.log("Handle Offer - Not valid")
    }
  }


  handleAnswer = async (data) => {
    const { payload } = data;
    if(payload.receiver == this.state.socketID){
      await this.state.users[payload.socketID].rtcPeerConnection.setRemoteDescription(payload.message);
    } else {
      //console.log("Handle answer - Not valid")
    }
  }


  handleIceCandidate = async (data) => {
    const { message } = data.payload; 
    const candidate = JSON.parse(message);
    if(data.payload.receiver == this.state.socketID){
      await this.state.users[data.payload.socketID].rtcPeerConnection.addIceCandidate(candidate);
    } else {
      //console.log("Handle Ice candidate - Not valid")
    }
  }


  //TODO - make dynamic or selectable or just expand
  addRemoteStream = (remoteMediaStream, index) => {
    if(index == 0){
      this.setState({remoteMediaStream1: remoteMediaStream});
    } else if (index == 1){
      this.setState({remoteMediaStream2: remoteMediaStream});
    } else if (index == 2){
      this.setState({remoteMediaStream3: remoteMediaStream});
    }
  }

  
  handleSubmit = (event) => {
    event.preventDefault();
    const { text, socketID } = this.state;
    // Remove leading and trailing whitespace
    if (text.trim()) {
      const roomKeyMessage = createMessage(TYPE_ROOM, createPayload(text, socketID));
      this.socket.send(JSON.stringify(roomKeyMessage));
    };
    this.setState({ text: '', roomKey: text.trim() });
  }


  handleChange = (event) => {
    this.setState({
      text: event.target.value
    });
  }


  render() {
    const { 
      localMediaStream,
      remoteMediaStream1,
      remoteMediaStream2,
      remoteMediaStream3,
      text,
      roomKey,
      socketID,
      iceServers, //used to be passed into the websocket component
      users
    } = this.state;
    const sendMessage = this.socket.send.bind(this.socket);

    //One websocket connection to the server 
    //Multiple RTC PeerConnections the other clients

    //TODO expand or make dynamic or make selectable
    const peerExist = Boolean(Object.keys(users).length > 0 );
    const peerExist1 = Boolean(Object.keys(users).length > 1 );
    const peerExist2 = Boolean(Object.keys(users).length > 2 );

    const gamePath = "../games/uno/index.html";

    return (
      <>
        <Websocket 
          socket={this.socket}
          setSendMethod={this.setSendMethod}
          handleSocketConnection={this.handleSocketConnection}
          handleConnectionReady={this.handleConnectionReady}
          handleOffer={this.handleOffer}
          handleAnswer={this.handleAnswer}
          handleIceCandidate={this.handleIceCandidate}
          handleUsers={this.handleUsers}
          socketID={this.state.socketID}
        />

        {peerExist ?
          <PeerConnection
          rtcPeerConnection={users[Object.keys(users)[0]].rtcPeerConnection}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={users[Object.keys(users)[0]].connection}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
          receiverID={Object.keys(users)[0]}
          index={0}
          ></PeerConnection>
          : <div> Peer not connected </div>
        }

        {peerExist1 ?
          <PeerConnection
          rtcPeerConnection={users[Object.keys(users)[1]].rtcPeerConnection}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={users[Object.keys(users)[1]].connection}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
          receiverID={Object.keys(users)[1]}
          index={1}
          ></PeerConnection>
          : <div> Peer not connected </div>
        }

        {peerExist2 ?
          <PeerConnection
          rtcPeerConnection={users[Object.keys(users)[2]].rtcPeerConnection}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={users[Object.keys(users)[2]].connection}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
          receiverID={Object.keys(users)[2]}
          index={2}
          ></PeerConnection>
          : <div> Peer not connected </div>
        }

        {/*Change layout to css grid and fromat from there*/}
        <section style={{minWidth: "500px", minHeight: "200px", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <RTCVideo mediaStream={localMediaStream} style={{width: "200px", height: "150px"}}/>
          <RTCVideo mediaStream={remoteMediaStream1} style={{width: "200px", height: "150px"}} />
          <RTCVideo mediaStream={remoteMediaStream2} style={{width: "200px", height: "150px"}}/>
          <RTCVideo mediaStream={remoteMediaStream3} style={{width: "200px", height: "150px"}}/>
        </section>

        <Form
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
          hasRoomKey={roomKey}
          text={text}
        /> 

        <section className='button-container'>
          <div className='button button--start-color' onClick={this.openCamera}>
            <p style={{fontSize: "0.8em", textAlign: "center"}}>Reconnect camera</p>
          </div>
        </section>
        
        <section>
          { this.state.roomKey && 
            <GameFrame socket={this.socket} userID={this.state.socketID} roomKey={this.state.roomKey}/>            
          }
        </section>


      </>
    );
  }
}

export default RTCMesh;
