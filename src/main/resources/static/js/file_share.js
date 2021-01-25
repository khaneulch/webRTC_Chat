/**
 * file share js
 */
import myDefault, {common} from './common.js';

var roomNo;
var localStream;
var localPeerConn;

/** connection ID */
var connId = new Date().getTime(); 

/** cam : 카메라, dis : 화면 */
var displayType = 'cam';

/** front : 전면, back : 후면 */
var cameraType = 'front';

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

const $startButton = $('#startButton');
const $joinButton = $('#joinButton');
const $changeButton = $('#changeButton');
const $callButton = $('#callButton');
const $hangupButton = $('#hangupButton');
const $sendMsgButton = $('#sendMessage');

const $cameraSelect = $('.camera-selection select');
const $cameraButton = $('#cameraButton');


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
	console.log(data);
	
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
			} else if( data.fileMessage) {
				getFileAction( data.fileMessage, data.last, data.fileName);
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
		.catch( error =>  console.log(error));
	
	/** 카메라 리스트를 불러옴 */
	navigator.mediaDevices.enumerateDevices()
		.then( getDevices)
		.catch( error => console.log(error));
}

function setLocalStream( stream) {
	localStream = stream;
	
	localVideo.srcObject = stream;
	localPeerConn.addStream(stream);
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
	
	if( displayType == 'cam') {
		
		navigator
			.mediaDevices
			.getDisplayMedia( common.constraints)
			.then( replaceVideoTreack)
			.catch( error => console.log(error));
		
	} else if( displayType == 'dis') {
		
		navigator
			.mediaDevices
			.getUserMedia( common.constraints)
			.then( replaceVideoTreack)
			.catch( error =>  console.log(error));
	}
	
	displayType = displayType == 'cam' ? 'dis' : 'cam';
}

function replaceConstraint( stream) {
	
	setTimeout( function() {
		
		let videoTrack = stream.getVideoTracks()[0];
		
		let sender = localPeerConn.getSenders().find( function( s) {
			return s.track.kind == videoTrack.kind;
		});
		
		sender.replaceTrack( videoTrack);
		
		localVideo.srcObject = stream;
		localPeerConn.addStream(stream);
	}, 2000);
}

/** video track 전환 */
function replaceVideoTreack( stream) {
	
	let videoTrack = stream.getVideoTracks()[0];
	
	let sender = localPeerConn.getSenders().find( function( s) {
		return s.track.kind == videoTrack.kind;
	});
	
	sender.replaceTrack( videoTrack);
	
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

$('.file-text').click( function() {
    $('#file').trigger('click');
});

$('#file').change( fileChangeAction);

/** 파일 선택 액션 */
function fileChangeAction( e) {
	if( common.filePending === false) {
		if( confirm( '파일을 전송하시겠습니까?')) {
			if( e.target) {
				if( e.target.files) {
					common.filePending = true;
					
					common.fileName = e.target.files[0].name;
					
					fileRead( e.target.files[0]);
					
					$('.file-text span').html(`파일[${common.fileName}]이 전송중입니다.`);
				}
			}
		}
	} else {
		alert('현재 전송중인 파일이 있습니다. 잠시후 다시 시도하세요.');
	}
}

/** 파일 읽기 */
function fileRead( file, fileName) {
	var reader = new window.FileReader();
	reader.readAsDataURL( file);
	reader.onload = onReadAsDataURL;
}

/** 파일 전송 */
function onReadAsDataURL( event, text) {
	var chunkLength = 1000;
    var data = {};

    if( event) {
    	text = event.target.result;
    }

    if( text.length > chunkLength) {
        data.fileMessage = text.slice(0, chunkLength);
    } else {
        data.fileMessage = text;
        data.last = true;
        data.fileName = common.fileName;
        
        common.filePending = false;
        $('.file-text span').html(`파일[${common.fileName}]이 전송되었습니다.`);
    }

    send(connId, data);

    var remainingDataURL = text.slice( data.fileMessage.length);
    
    if ( remainingDataURL.length) {
    	setTimeout( function() {
    		onReadAsDataURL( null, remainingDataURL);
    	}, 500)
    }
}

/** 전송받은 파일을 array에 저장 */
function getFileAction( fileMessage, last, fileName) {
	
	common.fileDataArray.push( fileMessage);
	
	if( last) {
      saveToDisk( common.fileDataArray.join(''), fileName);
      common.fileDataArray = [];
	}
}

/** 전송이 완료된 파일 다운로드 링크 생성 */
function saveToDisk( fileUrl, fileName) {
	var $a = $(`<a><span>파일다운로드[${fileName}]</span></a>`);
    
	$a.attr('href', fileUrl);
    $a.attr('target', '_blank');
    $a.attr('download', fileName);
    
    var $li = $('<li class="get"></li>');
    
    $li.append($a);
    
    $('.chat-ul').append($li);
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
			.then( getStream)
			.then( getDevices)
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
function getStream( stream) {
	
	let videoTrack = stream.getVideoTracks()[0];
	let audioTrack = stream.getAudioTracks()[0];
	
	let sender = localPeerConn.getSenders().find( function( s) {
		return s.track.kind == videoTrack.kind;
	});
	
	let senderAudio = localPeerConn.getSenders().find( function( s) {
		return s.track.kind == audioTrack.kind;
	});
	
	sender.replaceTrack( videoTrack);
	senderAudio.replaceTrack( audioTrack);
	
	localStream = stream;
	localPeerConn.addStream(stream);
	localVideo.srcObject = stream;
	
	return navigator.mediaDevices.enumerateDevices();
}

/** 카메라 리스트를 불러옴 */
function getDevices( deviceInfos) {
	
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