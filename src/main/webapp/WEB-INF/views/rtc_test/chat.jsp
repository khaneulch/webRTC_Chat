<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>CHAT WEB RTC TEST</title>
		
		<link  href="css/style.css" rel="stylesheet"/>
	</head>
	<body>
		<div class="center mt20">
			<button id="startButton">시작하기</button>
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
	</body>
	<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=" crossorigin="anonymous"></script>
	<script type="module" src="js/chat.js"></script>
</html>