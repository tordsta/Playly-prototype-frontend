import React, { useEffect, useState} from 'react' 

export default function LocalVideoSteam(props) {
    const [video,]=useState(React.createRef());

    const videoError=(error)=>{
        console.log("error",error);
    }

    const handleVideo=(stream)=>{
        video.current.srcObject = stream;
    }

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true})
        .then(handleVideo)
        .catch(videoError);
    });

    return (
    <div>
        <video 
            id="localVideo" 
            autoPlay 
            playsInline 
            style={{"maxWidth":"100%", width:"400px"}}
            ref={video}
        />        
    </div>
    );
}