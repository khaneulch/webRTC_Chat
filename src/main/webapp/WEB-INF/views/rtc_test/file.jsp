<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>FILE DROP WEB RTC TEST</title>
		
		<link  href="css/style.css" rel="stylesheet"/>
	</head>
	<body>
		<h1 id="roomNo">화상 지원 서비스</h1>
		
		<div class="video-section">
			<div class="local-section">
				<video id="localVideo" muted="muted" autoplay></video>
			</div>
			<div class="remote-section">
				<video id="remoteVideo" autoplay></video>
			</div>
		</div>
	
		<div class="button-section">
			<button id="startButton">방만들기</button>
			<button id="joinButton">들어가기</button>
			<button id="changeButton">화면전환</button>
			<button id="callButton">연결</button>
			<button id="hangupButton">끊기</button>
		</div>
		
		<div class="camera-selection">
			<select id="camera">
				<option value="all">선택가능한 카메라가 없습니다.</option>
			</select>
			<button id="cameraButton">카메라전환</button>
		</div>
		
		<div class="file-section">
			<div class="file-wrap">
				<input type="file" id="file" class="folding"/>
				<div class="file-text">
					<span>선택된 파일 없음</span>
				</div>
			</div>
		</div>
		
		<div class="chat-section">
			<div class="chat-wrap">
				<ul class="chat-ul">
				</ul>
			</div>
			<div class="input-wrap">
				<input type="text" id="message"/>
				<button id="sendMessage">전송</button>
			</div>
		</div>
		
		<span class="moblie-console">
		</span>
		
	</body>
	
	<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=" crossorigin="anonymous"></script>
	<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
	<script type="module" src="js/file_share.js"></script>
</html>