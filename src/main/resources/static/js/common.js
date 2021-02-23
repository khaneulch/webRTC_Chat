/**
 * webRTC Common Script
 */

export var common = {
	address 		: 'WSS://x.x.x.x:13443/socket',
	constraints 	: {audio : true, video : true},
	fileName		: '',
	filePending		: false,
	fileDataArray	: []
};

export default function jsonToString( obj) {
	return JSON.stringify(obj);
}
