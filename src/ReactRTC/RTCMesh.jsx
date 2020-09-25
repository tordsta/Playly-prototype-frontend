import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Form from './Form.jsx';
import Websocket from './Websocket.jsx';
import PeerConnection from './PeerConnection.jsx';
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
      socketID: null, //identifier for the websocket server
      connectionStarted1: false,
      connectionStarted2: false,
      connectionStarted3: false,
      numPeerClients: 0,
      users: null,
    };
    this.socket = new WebSocket(this.props.URL);
    //TODO create multiple peer connections
    this.rtcPeerConnection1 = new RTCPeerConnection({ iceServers: this.state.iceServers });
    this.rtcPeerConnection2 = new RTCPeerConnection({ iceServers: this.state.iceServers });
    this.rtcPeerConnection3 = new RTCPeerConnection({ iceServers: this.state.iceServers });
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

  handleUsers = async (data) => {
    //console.log(data.payload);
    this.setState({users: data.payload})

    this.state.users.forEach(user => {
      if(user != this.state.socketID){
        console.log(user);
        let peerSender = this.state.socketID;
        let peerReceiver = user;
        
        const peerData = createMessage(
          "PEER_CONNECTION", 
          createPayload(
            this.state.roomKey,
            this.state.socketID,
            peerReceiver
          ));
        this.socket.send(JSON.stringify(peerData));
      }
    });
  }

  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID } = this.state;
    const { payload } = data;
    
    //TODO - this should be able to handle any number of clients
    if(this.state.numPeerClients == 0){
      await this.rtcPeerConnection1.setRemoteDescription(payload.message);
      let mediaStream = localMediaStream
      if (!mediaStream) mediaStream = await this.openCamera(true);
      this.setState({ connectionStarted1: true, localMediaStream: mediaStream }, async function() {
        const answer = await this.rtcPeerConnection1.createAnswer();
        await this.rtcPeerConnection1.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        this.socket.send(JSON.stringify(answerMessage));
      });
    } else if (this.state.numPeerClients == 1){
      await this.rtcPeerConnection2.setRemoteDescription(payload.message);
      //let mediaStream = localMediaStream
      //if (!mediaStream) mediaStream = await this.openCamera(true);
      this.setState({ connectionStarted2: true }, async function() {
        const answer = await this.rtcPeerConnection2.createAnswer();
        await this.rtcPeerConnection2.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        this.socket.send(JSON.stringify(answerMessage));
      });
    } else if (this.state.numPeerClients == 2){
      await this.rtcPeerConnection3.setRemoteDescription(payload.message);
      //let mediaStream = localMediaStream
      //if (!mediaStream) mediaStream = await this.openCamera(true);
      this.setState({ connectionStarted3: true }, async function() {
        const answer = await this.rtcPeerConnection3.createAnswer();
        await this.rtcPeerConnection3.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        this.socket.send(JSON.stringify(answerMessage));
      });
    } else {
      console.log("Handle Offer - Too many clients!")
    }

    //RTC clients ether gets an offer or an answer, so on both occations it counts up the number of connected clients
    this.setState({numPeerClients: this.state.numPeerClients + 1});
    console.log(this.state.numPeerClients)
  }

  handleAnswer = async (data) => {
    const { payload } = data;

    //TODO - this should be able to handle any number of clients
    if(this.state.numPeerClients == 0){
      await this.rtcPeerConnection1.setRemoteDescription(payload.message);
    } else if (this.state.numPeerClients == 1){
      await this.rtcPeerConnection2.setRemoteDescription(payload.message);
    } else if (this.state.numPeerClients == 2){
      await this.rtcPeerConnection3.setRemoteDescription(payload.message);
    } else {
      console.log("Handle answer - Too many clients!")
    }


    //RTC clients ether gets an offer or an answer, so on both occations it counts up the number of connected clients
    this.setState({numPeerClients: this.state.numPeerClients + 1});
    console.log(this.state.numPeerClients)
  }

  handleIceCandidate = async (data) => {
    const { message } = data.payload;
    const candidate = JSON.parse(message);
    //TODO - this should be able to handle any number of clients
    if(this.state.numPeerClients == 0){
      await this.rtcPeerConnection1.addIceCandidate(candidate);
    } else if (this.state.numPeerClients == 1){
      await this.rtcPeerConnection2.addIceCandidate(candidate);
    } else if (this.state.numPeerClients == 2){
      await this.rtcPeerConnection3.addIceCandidate(candidate);
    } else {
      console.log("Handle Ice candidate - Too many clients!")
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

  //START HERE!! THIS IS WHERE YOU LEFT OF - GO DIRECTLY FOR ANY NUMBER OF USERS
  handleConnectionReady = (message) => {
    console.log('Inside handleConnectionReady: ', message);
    //TODO - this should be able to handle any number of clients
    if (message.startConnection) {
      if(this.state.numPeerClients == 0){
        this.setState({ connectionStarted1: message.startConnection });
      } else if (this.state.numPeerClients == 1) {
        this.setState({ connectionStarted2: message.startConnection });
      } else if (this.state.numPeerClients == 2) {
        this.setState({ connectionStarted3: message.startConnection });
      }
    }
  }

  addRemoteStream = (remoteMediaStream) => {
    //TODO - this should be able to handle any number of clients
    if(this.state.numPeerClients == 0){
      this.setState({remoteMediaStream1: remoteMediaStream});
    } else if (this.state.numPeerClients == 1){
      this.setState({remoteMediaStream2: remoteMediaStream});
    } else if (this.state.numPeerClients == 2){
      this.setState({remoteMediaStream3: remoteMediaStream});
    } else {
      console.log("Add Remote Stream - Too many clients!")
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { text, socketID } = this.state;
    // send the roomKey
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
      iceServers,
      connectionStarted1,
      connectionStarted2,
      connectionStarted3,
    } = this.state;
    const sendMessage = this.socket.send.bind(this.socket);

    //one websocket connection to the server 
    //multiple peer connections to other clients

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
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection1}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted1}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection2}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted2}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection3}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted3}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
        />

        {/*Change layout to css grid and fromat from there*/}
        <section style={{minWidth: "500px", minHeight: "500px", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
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
          <div className='button button--start-color' onClick={this.openCamera}></div>
          {/*<div className='button button--stop-color' onClick={null}></div>*/}
        </section>
      </>
    );
  }
}

export default RTCMesh;
