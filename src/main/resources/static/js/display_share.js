/**
 * display share js
 */
import myDefault, {common} from './common.js';

var roomNo;
var localPeerConn;
var localStream;

/** connection ID */
var connId = new Date().getTime(); 

/** cam : 카메라, dis : 화면 */
var displayType = 'cam';

/** 접근 허용 권한 */
var constraints = { audio: true, video: { facingMode: 'user'}};

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

const $startButton = $('#startButton');
const $joinButton = $('#joinButton');
const $changeButton = $('#changeButton');
const $cameraButton = $('#cameraButton');
const $callButton = $('#callButton');
const $hangupButton = $('#hangupButton');
const $sendMsgButton = $('#sendMessage');
const $cameraSelect = $('.camera-selection select');


var pcConfig = {};

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
	
	if( content.connId != connId) {
		if( data) {
			if( data.ice != undefined) {
				localPeerConn.addIceCandidate( new RTCIceCandidate( data.ice));
				
			} else if( dataObj.sdp) {
				if( dataObj.sdp.type === 'offer') {
					
					/** 입력한 방번호가 같은경우만 연결가능하도록함 */
					if( content.connId == roomNo || roomNo == dataObj.roomNo) {
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
			} else if( data.textMessage) {
				getMsgAction( data.textMessage);
			}
		}
	}
};

/** peer connection init */
function initialize() {
	localPeerConn = new RTCPeerConnection( pcConfig);
	
	localPeerConn.onicecandidate = function( event) {
		console.log('onicecandidate');
		if( event.candidate) {
			send( connId , {'ice': event.candidate});
		}
	};
	
	localPeerConn.onaddstream = function( event) {
		console.log('onaddstream');
		remoteVideo.srcObject = event.stream;
	};
	
	getUserMediaStream();
}

/** 카메라 화면을 불러옴 */
function getUserMediaStream() {
	navigator
		.mediaDevices
		.getUserMedia( common.constraints)
		.then( setLocalStream)
		.catch( error => console.log(error));
	
	/** 카메라 리스트를 불러옴 */
	navigator.mediaDevices.enumerateDevices()
		.then( gotDevices)
		.catch( error => console.log(error));
}

function setLocalStream( stream) {
	
	localStream = stream;
	localVideo.srcObject = stream;
	localPeerConn.addStream( stream);
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
		$('#roomNo').html( roomNo);
		
		$startButton.prop('disabled', true);
		$joinButton.prop('disabled', true);
		
		initialize();
	}
}

/** 들어가기 버튼 액션 */
function joinButtonAction() {
	roomNo = window.prompt('방번호를 입력하세요.');
	
	if( roomNo) {
		$('#roomNo').html( roomNo);
		
		$startButton.prop('disabled', true);
		$joinButton.prop('disabled', true);
		$callButton.prop('disabled', true);
		
		initialize();
		
		callButtonAction();
	}
}

/** 화면전환 버튼 액션 */
function changeButtonAction() {
	
	/** 모바일 기기 화면 공유 불가 */
	var mobileArray = ["iPhone", "iPod", "BlackBerry", "Android", "Windows CE", "LG", "MOT", "SAMSUNG", "SonyEricsson"];
	
	var userAgent = navigator.userAgent;
	
	var isNonMobile = true;
	
	for( var type of mobileArray) {
		if( userAgent.indexOf( type) > -1) {
			isNonMobile = false;
		}
	}
	
	if( isNonMobile) {
		if( displayType == 'cam') {
			
			navigator
				.mediaDevices
				.getDisplayMedia( common.constraints)
				.then( replaceVideoTreack)
				.catch( error => console.log(error));
			
		} else if( displayType == 'dis') {
			
			navigator
				.mediaDevices
				.getUserMedia( constraints)
				.then( replaceVideoTreack)
				.catch( error =>  console.log(error));
		}
	
		displayType = displayType == 'cam' ? 'dis' : 'cam';
	} else {
		alert('모바일 기기는 화면전환을 제공하지 않습니다.');
	}
}

/** 전면/후면 카메라 전환 */
function cameraButtonAction() {
	
	if( displayType == 'cam') {
	
		const videoSource = $cameraSelect.val();
		
		var arr = videoSource.split('_');
		
		const tempConstraint = {
			audio : true,
			video : { deviceId: { exact: arr[1]}}
		};
		
		if( localStream) {
			stopMediaTracks( localStream);
		}
		
		navigator
			.mediaDevices
			.getUserMedia( tempConstraint)
			.then( gotStream)
			.then( gotDevices)
			.catch( error => console.log(error.message));
	} else {
		alert('화면 공유중에는 카메라 전환이 불가능합니다.');
	}
}

/** 기존 트랙을 제거함 */
function stopMediaTracks( stream) {
	stream.getTracks().forEach( track => {
		track.stop();
	});
}

/** video element에 스트림 설정 */
function gotStream( stream) {
	localStream = stream;
	localPeerConn.addStream(stream);
	localVideo.srcObject = stream;
	
	return navigator.mediaDevices.enumerateDevices();
}

function replaceConstraint( localStream) {
	console.log('replaceConstraint');

	let videoTrack = localStream.getVideoTracks()[0];
	
	let sender = localPeerConn.getSenders().find( function( s) {
		console.log(s.track.kind);
		console.log(videoTrack.kind);
		return s.track.kind == videoTrack.kind;
	});
	
	sender.replaceTrack( videoTrack);
	
	localVideo.srcObject = localStream;
	localPeerConn.addStream(localStream);
}

/** video track 전환(화면/카메라) */
function replaceVideoTreack( stream) {
	
	let videoTrack = stream.getVideoTracks()[0];
	
	let sender = localPeerConn.getSenders().find( function( s) {
		return s.track.kind == videoTrack.kind;
	});
	
	sender.replaceTrack( videoTrack);
	
	localStream = stream;
	localVideo.srcObject = stream;
	localPeerConn.addStream(stream);
}

/** 연결 버튼 액션 */
function callButtonAction() {
	$callButton.prop('disabled', false);
	
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
	
	$startButton.prop('disabled', false);
	$joinButton.prop('disabled', false);
	$callButton.prop('disabled', false);
}

/** 전송 버튼 액션 */
function sendMsgButtonAction() {
	let msg = $('#message').val();
	
	msg = msg.trim();
	
	if( msg) {
		$('.chat-ul').append(`<li class="sent"><span>${msg}</span></li>`);
		$('#message').val('');
		
		chatAutoFocus();
		send(connId, {textMessage : msg});
	}
}

/** 메세지 받기 */
function getMsgAction( msg) {
	$('.chat-ul').append(`<li class="get"><span>${msg}</span></li>`);
	chatAutoFocus();
}

function chatAutoFocus() {
	$('.chat-wrap').scrollTop($('.chat-wrap').height());
}

$startButton.click( startButtonAction);
$joinButton.click( joinButtonAction);
$changeButton.click( changeButtonAction);
$cameraButton.click( cameraButtonAction);
$callButton.click( callButtonAction);
$hangupButton.click( hangupButtonAction);
$sendMsgButton.click( sendMsgButtonAction);

$('#message').keyup( function( e) {
	if( e.keyCode == 13) {
		sendMsgButtonAction();
	}
});

/** 카메라 리스트를 불러옴 */
function gotDevices( deviceInfos) {
	
	$cameraSelect.html('');
	
	for( var i = 0; i !== deviceInfos.length; i++) {
		var deviceInfo = deviceInfos[i];
		
		if (deviceInfo.kind === 'videoinput') {
			
			if( $cameraSelect.find('option[value=all]').length > 0) {
				$cameraSelect.find('option[value=all]').remove();
			}
			
			var count = $cameraSelect.find('option').length;
			$cameraSelect.append(`<option value="${count}_${deviceInfo.deviceId}">camera-${count + 1}</option>`);
		}
	}
}