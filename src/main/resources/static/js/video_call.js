/**
 * video call js
 */
import myDefault, {common} from './common.js';

var roomNo;
var localStream;
var localPeerConn;

/** connection ID */
var connId = new Date().getTime(); 

/** 접근 허용 권한 */
var constraints = { audio: true, video: { facingMode: 'environment'}};

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

const startButton = document.getElementById('startButton');
const joinButton = document.getElementById('joinButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

var pcConfig = {
		'iceServers' : [
			{url:'stun:stun2.l.google.com:19302'},
			{url:'stun:stun3.l.google.com:19302'},
			{url:'stun:stun4.l.google.com:19302'},
			{
				url: 'turn:numb.viagenie.ca',
				credential: 'muazkh',
				username: 'webrtc@live.com'
			},
			{
				url: 'turn:192.158.29.39:3478?transport=udp',
				credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
				username: '28224511:1379330808'
			}
		]
};

/** connecting to our signaling server */ 
var conn = new WebSocket( common.address);

/** 소켓 연결시 */
conn.onopen = function() {
	console.log('Open Socket Connection');
};

/** 메세지 받을시 */
conn.onmessage = function(msg) {
	
	var content = JSON.parse(msg.data);
	var data = content.data;
	var dataObj = data;
	
	console.log(`content connId : ${content.connId}, myConnId : ${connId}`);
	console.log(dataObj);
	
	if( content.connId != connId) {
		if( data.ice != undefined) {
			localPeerConn.addIceCandidate( new RTCIceCandidate( data.ice));
			
		} else if( dataObj.sdp) {
			if( dataObj.sdp.type === 'offer') {
				
				/** 입력한 방번호가 같은경우만 연결가능하도록함 */
				if( roomNo == dataObj.roomNo) {
					localPeerConn
						.setRemoteDescription( new RTCSessionDescription( dataObj.sdp))
						.then(() => localPeerConn.createAnswer())
						.then( answer => localPeerConn.setLocalDescription( answer))
						.then(() => send( connId, {'sdp' : localPeerConn.localDescription}));
				} else {
					console.log(`offer error => content.connId : ${content.connId}, roomNo : ${roomNo}, connId : ${connId}, dataObj.roomNo : ${dataObj.roomNo}`);
				}
			} else if( dataObj.sdp.type === 'answer') {
				localPeerConn.setRemoteDescription( new RTCSessionDescription( dataObj.sdp));
			}
		}
	}
};

/** peer connection init */
function initialize() {
	localPeerConn = new RTCPeerConnection( pcConfig);
	
	localPeerConn.onicecandidate = function( event) {
		if( event.candidate) {
			send( connId , {'ice': event.candidate});
		}
	};
	
	localPeerConn.onaddstream = function( event) {
		remoteVideo.srcObject = event.stream;
	};
	
	getUserMediaStream();
}

/** 카메라 화면을 불러옴 */
function getUserMediaStream() {
	
	navigator
		.mediaDevices
		.getUserMedia( constraints)
		.then(localStream => localVideo.srcObject = localStream)
		.then(localStream => localPeerConn.addStream(localStream))
		.catch( error =>  console.log(error));
}

/** 메세지 전송 */
function send( connId, message) {
	var obj = {connId : connId, data : message};
	conn.send(JSON.stringify(obj));
}

/** 방만들기 버튼 액션 */
function startButtonAction() {
	roomNo = window.prompt('방번호를 입력하세요.');
	
	if( roomNo) {
		document.getElementById('roomNo').innerHTML = roomNo;
		
		startButton.disabled = true;
		joinButton.disabled = true;
		
		initialize();
	}
}

/** 들어가기 버튼 액션 */
function joinButtonAction() {
	roomNo = window.prompt('방번호를 입력하세요.');
	
	if( roomNo) {
		
		startButton.disabled = true;
		joinButton.disabled = true;
		callButton.disabled = true;
		
		initialize();
		
		callButtonAction();
	}
}

/** 연결 버튼 액션 */
function callButtonAction() {
	callButton.disabled = true;
	
	localPeerConn
		.createOffer()
		.then(offer => localPeerConn.setLocalDescription(offer))
		.then(() => send(connId, {'sdp': localPeerConn.localDescription, roomNo : roomNo}))
		.catch( error =>  console.log(error));
}

/** 끊기 버튼 액션 */
function hangupButtonAction() {
	localPeerConn.close();
	localPeerConn = null;
	
	remoteVideo.srcObject = null;
	
	startButton.disabled = false;
	joinButton.disabled = false;
	callButton.disabled = false;
}

startButton.addEventListener('click', startButtonAction);
joinButton.addEventListener('click', joinButtonAction);
callButton.addEventListener('click', callButtonAction);
hangupButton.addEventListener('click', hangupButtonAction);