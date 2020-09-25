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
      socketID1: null,
      socketID2: null,
      socketID3: null,
      connectionStarted1: false,
      connectionStarted2: false,
      connectionStarted3: false,
    };
    this.socket = new WebSocket(this.props.URL);
    //TODO create multiple peer connections
    this.rtcPeerConnection1 = new RTCPeerConnection({ iceServers: this.state.iceServers });
    //this.rtcPeerConnection2 = new RTCPeerConnection({ iceServers: this.state.iceServers });
    //this.rtcPeerConnection3 = new RTCPeerConnection({ iceServers: this.state.iceServers });
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

  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID1 } = this.state;
    const { payload } = data;
    await this.rtcPeerConnection1.setRemoteDescription(payload.message);
    let mediaStream = localMediaStream
    if (!mediaStream) mediaStream = await this.openCamera(true);
    this.setState({ connectionStarted1: true, localMediaStream: mediaStream }, async function() {
      const answer = await this.rtcPeerConnection1.createAnswer();
      await this.rtcPeerConnection1.setLocalDescription(answer);
      const payload = createPayload(roomKey, socketID1, answer);
      const answerMessage = createMessage(TYPE_ANSWER, payload);
      this.socket.send(JSON.stringify(answerMessage));
    });
  }

  handleAnswer = async (data) => {
    const { payload } = data;
    await this.rtcPeerConnection1.setRemoteDescription(payload.message);
  }

  handleIceCandidate = async (data) => {
    const { message } = data.payload;
    const candidate = JSON.parse(message);
    await this.rtcPeerConnection1.addIceCandidate(candidate);
  }

  sendRoomKey = () => {
    const { roomKey, socketID1 } = this.state;
    if (!roomKey) {
      const key = generateRoomKey();
      const roomData = createMessage(TYPE_ROOM, createPayload(key, socketID1));
      this.setState({ roomKey: key })
      this.socket.send(JSON.stringify(roomData));
      alert(key);
    }
  }

  handleSocketConnection = (socketID1) => {
    this.setState({ socketID1 });
  }

  handleConnectionReady = (message) => {
    console.log('Inside handleConnectionReady: ', message);
    if (message.startConnection) {
      this.setState({ connectionStarted1: message.startConnection });
    }
  }

  addRemoteStream = (remoteMediaStream1) => {
    this.setState({ remoteMediaStream1 });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { text, socketID1 } = this.state;
    // send the roomKey
    // Remove leading and trailing whitespace
    if (text.trim()) {
      const roomKeyMessage = createMessage(TYPE_ROOM, createPayload(text, socketID1));
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
      text,
      roomKey,
      socketID1,
      iceServers,
      connectionStarted1,
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
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection1}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted1}
          sendMessage={sendMessage}
          roomInfo={{ socketID1, roomKey }}
        />
        {/*Change layout to css grid and fromat from there*/}
        <section style={{minWidth: "500px", minHeight: "500px", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <RTCVideo mediaStream={localMediaStream} style={{width: "200px", height: "150px"}}/>
          <RTCVideo mediaStream={remoteMediaStream1}  style={{width: "200px", height: "150px"}} />
          <RTCVideo style={{width: "200px", height: "150px"}}/>
          <RTCVideo style={{width: "200px", height: "150px"}}/>
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
