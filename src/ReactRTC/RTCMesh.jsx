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

      //receiver is bad - fix it
      receiver: false, //the user which currently, only one RTC connection should be active at the time,  
      users: {}, // object with users and connection state (true/false)

    };
    this.socket = new WebSocket(this.props.URL);
  }

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
    console.log("state users", this.state.users)

    //Send out connection requests
    for (const [user, obj] of Object.entries(this.state.users)) {
      //console.log(`${user}: ${connected}`);
      if(!obj.connected && this.state.receiver == false ){
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
    console.log('Inside handleConnectionReady: ', message);
    console.log("Is sender:", message.sender == this.state.socketID);
    if (message.startConnection && message.sender == this.state.socketID) {
      //this.setState({receiver: message.receiver})
      //this.setState({ connectionStarted1: message.startConnection }); //this triggers the addMediaStreamTrack, which triggers the onNegotiationNeeded event
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        users[message.receiver].connection = true;   // this one activates the add track 
        return {users};
      });

    //this is the problem 
    } else { // if not sender sett start connection
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        let rtcPeerConnection = new RTCPeerConnection({ iceServers: this.state.iceServers });
        users[message.sender] = {connection: false, rtcPeerConnection: rtcPeerConnection};    //this does not activate add track
        return {users};
      });
    }
    console.log("state users", this.state.users);
  }



  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID, users } = this.state;
    const { payload } = data;

    //check if i am reciever 
    console.log("In offer handle: me -", payload.receiver)
    console.log("In offer handle: the other one - ", payload.socketID)
    const receiver = payload.socketID
    
    if(payload.receiver == socketID){
      await users[receiver].rtcPeerConnection.setRemoteDescription(payload.message);
      let mediaStream = localMediaStream
      if (!mediaStream) mediaStream = await this.openCamera(true);
      //set user state to true

      //hack to activate add track media only once
      this.setState(prevState => {
        let users = Object.assign({}, prevState.users);
        users[payload.socketID].connection = true;   // this one activates the add track 
        return {users};
      });      
      

      this.setState({ connectionStarted1: true, localMediaStream: mediaStream }, async function() {
        const answer = await users[receiver].rtcPeerConnection.createAnswer();
        await users[receiver].rtcPeerConnection.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer, receiver);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        this.socket.send(JSON.stringify(answerMessage));
      });
    } else {
      console.log("Handle Offer - Not valid")
    }
  }

  handleAnswer = async (data) => {
    const { payload } = data;
    //console.log("here");
    //console.log(data)
    //console.log(data.payload)
    //console.log(payload.socketID)
    //console.log(this.state.users[payload.socketID])
    if(payload.receiver == this.state.socketID){
      await this.state.users[payload.socketID].rtcPeerConnection.setRemoteDescription(payload.message);
    } else {
      console.log("Handle answer - Not valid")
    }
  }

  handleIceCandidate = async (data) => {
    const { message } = data.payload;
    const candidate = JSON.parse(message);
    //console.log(data);
    //console.log(data.payload);
    //console.log(data.payload.receiver);
    //console.log(this.state.socketID)
    //console.log(data.payload.receiver == this.state.socketID)

    //TODO - this should be able to handle any number of clients
    if(data.payload.receiver == this.state.socketID){
      await this.state.users[data.payload.socketID].rtcPeerConnection.addIceCandidate(candidate);
    } else {
      console.log("Handle Ice candidate - Not valid")
    }

  }

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
      iceServers, //used to be passed into the websocket component
      receiver,
      users
    } = this.state;
    const sendMessage = this.socket.send.bind(this.socket);

    //one websocket connection to the server 
    //multiple peer connections to other clients

    const peerExist = Boolean(Object.keys(users).length > 0 );
    const peerExist1 = Boolean(Object.keys(users).length > 1 );
    const peerExist2 = Boolean(Object.keys(users).length > 2 );
    //console.log("peer exist", peerExist, Object.keys(users).length, users)
    //console.log("reciverID: ", Object.keys(users)[0]);

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

        {/*
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection1}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted1}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey, receiver }}
        />
        */}

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
