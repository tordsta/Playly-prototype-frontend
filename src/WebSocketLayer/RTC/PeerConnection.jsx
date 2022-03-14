import React, { Component } from 'react';
import { createMessage, createPayload } from '../functions/utils';
import { TYPE_OFFER, TYPE_ICECANDIDATE } from '../functions/constants';

class PeerConnection extends Component {
  constructor(props) {
    super(props)
  }

  addMediaStreamTrack = async () => {
    const { localMediaStream, rtcPeerConnection } = this.props
    //console.log('addMediaStream: ', localMediaStream);
    if (localMediaStream) {
      await localMediaStream.getTracks().forEach((mediaStreamTrack) => {
        rtcPeerConnection.addTrack(mediaStreamTrack); //This fires the "onNegotiationNeeded" event
      });
    }
  }

  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    const { socketID, sendMessage, roomInfo, rtcPeerConnection, receiverID } = this.props;
    if(socketID != receiverID){
      try {
        //Here the offer is created
        const offer = await rtcPeerConnection.createOffer();
        await rtcPeerConnection.setLocalDescription(offer);
        const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, rtcPeerConnection.localDescription, receiverID);
        const offerMessage = createMessage(TYPE_OFFER, payload);
        sendMessage(JSON.stringify(offerMessage));
      } catch(error) {
        console.error('handleNegotiationNeeded Error: ', error)
      }  
    }
  }

  handleOnIceEvent = (rtcPeerConnectionIceEvent) => {
    //console.log("handleOnIceEvent")
    if (rtcPeerConnectionIceEvent.candidate) {
      const { sendMessage, roomInfo, receiverID } = this.props;
      const { candidate } = rtcPeerConnectionIceEvent;
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, JSON.stringify(candidate), receiverID);
      const iceCandidateMessage = createMessage(TYPE_ICECANDIDATE, payload);
      sendMessage(JSON.stringify(iceCandidateMessage));
    }
  }

  handleOnTrack = (trackEvent) => {
    //console.log("handleOnTrack")
    const { index } = this.props;
    const remoteMediaStream = new MediaStream([ trackEvent.track ]);
    this.props.addRemoteStream(remoteMediaStream, index);
  }

  componentDidMount() {
    const { rtcPeerConnection } = this.props;
    //These functions are activated on RTC events (Browser API functions)
    rtcPeerConnection.onnegotiationneeded = this.handleOnNegotiationNeeded;
    rtcPeerConnection.onicecandidate = this.handleOnIceEvent;
    rtcPeerConnection.ontrack = this.handleOnTrack;
  }

  componentDidUpdate(prevProps) {
    //If the user was not connected (users -> connection: false) in previous state, but is in this state, add the track and create offer via negotiation 
    if (this.props.startConnection !== prevProps.startConnection){
      this.addMediaStreamTrack();
    }
  }

  render() {
    return(
      <>
      </>
    );
  }
}

export default PeerConnection;
