/**
 * chat js
 */

import myDefault, {common} from './common.js';


var peerConnection;
var dataChannel;
const $startButton = $('#startButton');
const $sendMsgButton = $('#sendMessage');

/** connecting to our signaling server */ 
var conn = new WebSocket( common.address);

conn.onopen = function() {
    console.log("Connected to the signaling server");
    initialize();
};

conn.onmessage = function(msg) {
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
    // when somebody wants to call us
    case "offer":
    	console.log('offer');
        handleOffer(data);
        break;
    case "answer":
    	console.log('answer');
        handleAnswer(data);
        break;
    // when a remote peer sends an ice candidate to us
    case "candidate":
    	console.log('remote');
        handleCandidate(data);
        break;
    default:
        break;
    }
};

/** 메세지 전송 */
function send(message) {
    conn.send(JSON.stringify(message));
}

function initialize() {
    var configuration = null;

    peerConnection = new RTCPeerConnection(configuration, {
        optional : [ {
            RtpDataChannels : true
        } ]
    });

    /** Setup ice handling */
    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            send({
                event : "candidate",
                data : event.candidate
            });
        }
    };

    /** data channel을 생성 */
    dataChannel = peerConnection.createDataChannel("dataChannel", {
        reliable : true
    });

    dataChannel.onerror = function(error) {
        console.log("Error occured on datachannel:", error);
    };

    /** receive a message from the other peer */
    dataChannel.onmessage = function(event) {
        $('.chat-ul').append(`<li class="get"><span>${event.data}</span></li>`);
    };

    dataChannel.onclose = function() {
        console.log("data channel is closed");
    };
}

/** call을 시작하는 유저가 offer를 생성 */
function createOffer() {
    peerConnection.createOffer(function(offer) {
        send({
            event : "offer",
            data : offer
        });
        peerConnection.setLocalDescription(offer);
    }, function(error) {
        alert("Error creating an offer");
    });
}

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // create and send an answer to an offer
    peerConnection.createAnswer(function(answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });
    }, function(error) {
        alert("Error creating an answer");
    });

};

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("connection established successfully!!");
};

function sendMessage() {
	var msg = $('#message').val();
	
	msg = msg.trim();
	
	if( msg) {
		$('.chat-ul').append(`<li class="sent"><span>${msg}</span></li>`);
	
	    dataChannel.send(msg);
	    $('#message').val('');
	}
}

$startButton.click( createOffer);
$sendMsgButton.click( sendMessage);