# Spring boot + webRTC 화상채팅
webRTC를 이용한 1:1 화상회의 및 파일공유

JavaScript
Spring Boot
WebSocket

## 1. 공통
### /static/js/common.js
- default port : 13443
- common.address에 ip주소세팅 필요

## 2. 대화
### /chat
- '시작하기' 클릭후 상대방이 '시작하기' 클릭시 대화 연결됨
- 메세지 입력후 전송 클릭

## 3. 영상/음성 대화
### /video
- 사용자1이 방만든후 사용자2가 들어가기 클릭후 동일 방번호 입력시 해당 방으로 들어가지며, 연결클릭시 대화시작

## 4. 영상회의
### /display
- 사용자1이 방만든후 사용자2가 들어가기 클릭후 동일 방번호 입력시 해당 방으로 들어가지며, 연결클릭시 대화시작
- 화면전환 클릭시 화면 공유가능
- 현재 화면을 공유중 화면전환을 재클릭시 카메라 화면으로 돌아옴
- 하단의 박스에서 채팅가능

## 5. 파일공유
### /file
- 사용자1이 방만든후 사용자2가 들어가기 클릭후 동일 방번호 입력시 해당 방으로 들어가지며, 연결클릭시 대화시작
- 화면전환 클릭시 화면 공유가능
- 현재 화면을 공유중 화면전환을 재클릭시 카메라 화면으로 돌아옴
- 하단의 박스에서 채팅가능
- 파일을 등록하면 상대방에게 파일이 전송됨
- 전달받은 파일은 대화창에서 다운로드 가능

## 6. 참고
### sample site : https://webrtc.github.io/samples/
