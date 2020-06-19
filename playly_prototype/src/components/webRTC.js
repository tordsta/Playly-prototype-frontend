import React from 'react';
import * as SWRTC from '@andyet/simplewebrtc';

const API_KEY = '';

const ROOM_NAME = 'roomTord';
const ROOM_PASSWORD = '123';
const CONFIG_URL = `https://api.simplewebrtc.com/config/guest/${API_KEY}`;


    function WebRTC() {
        return(
            <SWRTC.Provider configUrl={CONFIG_URL}>
            {/* Render based on the connection state */}
            <SWRTC.Connecting>
                <h1>Connecting...</h1>
            </SWRTC.Connecting>
            <p>hello this is the webRTC component</p>
            <SWRTC.Connected>
                <h1>Connected!</h1>
                {/* Request the user's media */}
                <SWRTC.RequestUserMedia audio video auto />

                {/* Enable playing remote audio. */}
                <SWRTC.RemoteAudioPlayer />

                {/* Connect to a room with a name and optional password */}
                <SWRTC.Room name={ROOM_NAME} password={ROOM_PASSWORD}>
                <SWRTC.Video/>
                    
                {props => {
                    /* Use the rest of the SWRTC React Components to render your UI */
                    
                }}

                </SWRTC.Room>
            </SWRTC.Connected>
            </SWRTC.Provider>
        );
}

export default WebRTC;