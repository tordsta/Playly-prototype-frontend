import React, { PureComponent } from 'react';

class RTCVideo extends PureComponent {
  constructor(props) {
    super(props) //Takes in a media stream
  }

  addMediaStream = (video) => {
    const { mediaStream } = this.props;
    // Prevents throwing error upon a setState change when mediaStream is null
    // upon initial render
    if (mediaStream) video.srcObject = mediaStream;
  }
  
  render() {
    const { mediaStream } = this.props;
    //console.log('mediaStream: ', mediaStream);

    return (
      <video
        className="rtc__video"
        style={{width: '400px', height: "300px", backgroundColor: 'black'}}
        autoPlay
        ref={mediaStream ? this.addMediaStream : null}
      >
      </video>
    );
  }
};

export default RTCVideo;
