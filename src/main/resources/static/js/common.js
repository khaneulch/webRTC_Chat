/**
 * webRTC Common Script
 */

export var common = {
	address 		: 'WSS://14.36.55.80:13443/socket',
	constraints 	: {audio : true, video : true},
	fileName		: '',
	filePending		: false,
	fileDataArray	: []
};

export default function jsonToString( obj) {
	return JSON.stringify(obj);
}