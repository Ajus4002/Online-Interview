const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:openrelay.metered.ca:80",
        },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
    ],
});

peerConnection.ontrack = ({ streams: [stream] }) => {
    setIsInterviewOn(true)
    remoteVideo.srcObject = stream;
}

peerConnection.onicecandidate = e => {
    if (e.candidate) {
        send({ from: application._id, to: '', subject: 'ice-candidate', candidate: e.candidate });
    }
}

peerConnection.onconnectionstatechange = _ => {
    switch(peerConnection.iceConnectionState) {
        case "closed":
        case "failed":
            endSession();
            break;
    }
}

peerConnection.onsignalingstatechange = _ => {
    switch(peerConnection.signalingState) {
        case "closed":
            endSession();
            break;
    }
}

function createPeerConnection({ startSession, endSession, }) {

}
