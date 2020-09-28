import React, { Component } from 'react';
import { TYPE_CONNECTION, TYPE_OFFER, TYPE_ANSWER, TYPE_NEW_USER, TYPE_ICECANDIDATE } from './functions/constants';

class Websocket extends Component {
  constructor(props) {
    super(props);
  }

  setupConnection = () => {
    const {
      socket,
      handleConnectionReady,
      handleSocketConnection,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      handleUsers,
      socketID,
    } = this.props;

    socket.onopen = () => {
      console.log('Websocket connected');
    }

    socket.onmessage = (message) => {
      let res = null;
      try{
        res = message.payload.receiver;
      } catch {
      }
      
      if(res == socketID){
        console.log('Recieving Websocket message: ', message);
      } else {
        console.log('Unknown receiver - Recieving Websocket message: ', message);
      }
      const data = JSON.parse(message.data);
      switch (data.type) {
        case TYPE_NEW_USER:
          handleSocketConnection(data.id); //Uses the server socket id for this client
          break;
        case TYPE_CONNECTION:
          handleConnectionReady(data);
          break;
        case TYPE_OFFER:
          console.log('case Offer')
          handleOffer(data);
          break;
        case TYPE_ANSWER:
          console.log('case Answer')
          handleAnswer(data);
          break;
        case TYPE_ICECANDIDATE:
          console.log('case Ice Candidate')
          handleIceCandidate(data);
          break;
        case "USERS_IN_ROOM":
          console.log(" case Users in room")
          handleUsers(data);
          break;
        default:
          console.error('Recieving message failed');
      }
    }

    socket.onclose = (event) => {
      console.log('Websocket closed: ', event);
    }

    socket.onerror = (error) => {
      console.error('Websocket error: ', error);
    }
  }

  componentDidMount() {
    this.setupConnection();
  }

  render() {
    return (
      <>
      </>
    )
  }
}

export default Websocket;
