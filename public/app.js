const socket = io();

const download_btn = document.getElementById('download');
const upload_btn = document.getElementById('upload');
const ping_btn = document.getElementById('ping');
const diagram = document.getElementById('diagram');
const info = document.getElementById('info');
const popupContainer = document.getElementById('popup-container');
const popupForward = document.getElementById('popup-forward');
const popupBack = document.getElementById('popup-back');
const popup = document.getElementById('popup');
const popup_timestamp = document.getElementById('popup_timestamp');
const popup_upload = document.getElementById('popup_upload');
const popup_upload_bar = document.getElementById('popup_upload_bar');
const popup_download = document.getElementById('popup_download');
const popup_download_bar = document.getElementById('popup_download_bar');
const popup_ping = document.getElementById('popup_ping');
const popup_server_name = document.getElementById('popup_server_name');
const popup_server_company = document.getElementById('popup_server_company');
const popup_server_country = document.getElementById('popup_server_country');
const popup_server_host = document.getElementById('popup_server_host');
const popup_server_maps = document.getElementById('popup_server_maps');
const pingview = document.getElementById('pingview');
const pingtext = document.getElementById('pingtext');

var currentData = -1;
let amount = 0;
var data = '';
var infoData = '';



socket.on('connect', function() {
	socket.emit('message', "clap");
});

socket.on('message', (message) => {
	console.log(message);
	if (message == 'clap') {
		clap();
	}
});


function clap() {
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const randomX = Math.floor(Math.random() * screenWidth - 200) + 100;
	const randomY = Math.floor(Math.random() * screenHeight - 200) + 100;
	
	const newDiv = document.createElement('div');
	newDiv.style.setProperty('--t', randomY + 'px');
	newDiv.style.setProperty('--l', randomX + 'px');
	const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-metal"><path d="M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4"/><path d="M14 11V9a2 2 0 1 0-4 0v2"/><path d="M10 10.5V5a2 2 0 1 0-4 0v9"/><path d="m7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5"/></svg>'
	newDiv.innerHTML = svg;
	newDiv.classList.add("reaction");
	document.body.appendChild(newDiv);
	setTimeout(function() {
		newDiv.remove();
	}, 2000);
}



document.addEventListener('mousemove', (e) => {
	let display = true;
	if (event.target.classList.contains('progress') || event.target.closest('.progress')) {
		const dataAttr = event.target.getAttribute('data') || event.target.closest('.progress').getAttribute('data');
		if (currentData != dataAttr) {
			if(dataAttr < data["data"].length) {
				let infovalue = ''
				if(data["cat"] != "ping") {
					infovalue = convertBytes(data["data"][dataAttr]["data"]);
				} else{
					infovalue = data["data"][dataAttr]["data"].toFixed(2) + " ms";
				}
				document.getElementById("info-value").innerHTML = infovalue;
				document.getElementById("info-timestamp").innerHTML = data["data"][dataAttr]["timestamp"];
				currentData = dataAttr;
			} else {
				display = false;
			}
		}
		if(display) {
			info.style.opacity = `1`;
		}
	} else {
		info.style.opacity = `0`;
	}
	const x = e.clientX;
	const y = e.clientY;
	info.style.top = `${y}px`;
	info.style.left = `${x}px`;
});

document.addEventListener('click', (event) => {
	if (!popupContainer.contains(event.target)) {
		closeInfo();
	}
});

document.addEventListener('click', (event) => {
	if (event.target.tagName === 'BUTTON' && event.target.classList.contains('progress')) {
		const dataAttr = event.target.getAttribute('data');
		id = data["data"][dataAttr]["id"];
		getInfo(id);
	}
});

popupForward.addEventListener("click", function() {
	skipInfo(1);
});

popupBack.addEventListener("click", function() {
	skipInfo(-1);
});



document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		closeInfo();
	}
	if (popup.classList.contains('active')) {
		if (event.key === 'ArrowRight' || event.keyCode === 39) {
			if (Number(infoData["id"]) < Number(infoData["last_id"])) {
				skipInfo(1);
			}
		}
		if (event.key === 'ArrowLeft' || event.keyCode === 37) {
			if (Number(infoData["id"]) > 1) {
				skipInfo(-1);
			}
		}
	}
});


download_btn.addEventListener('click', function() {
	selectCat("download");
})

upload_btn.addEventListener('click', function() {
	selectCat("upload");
})

ping_btn.addEventListener('click', function() {
	selectCat("ping");
})

function selectCat(cat) {
	setActive(cat);
	ping();
	fetch('/api/get?cat=' + cat)
		.then(response => response.json())
		.then(data => loadDiagram(data))
		.catch(error => console.error('Error:', error));
}

function loadDiagram(jsondata) {
	data = jsondata;
	currentData = -1;
	html = '';
	if (amount != parseInt(data["amount"])) {
		amount = parseInt(data["amount"]);
		const length = data["data"].length
		let classType = '';
		for (i = 0; i < amount; i++) {
			let disableBtn = '';
			if (length <= i) {
				disableBtn = "disabled";
			}
			html += '<button class="progress" data=' + i + ' style="--h: 0" ' + disableBtn + '><div class="bar"></div></button>';
		}
		diagram.innerHTML = html;
	}
	progressbars = document.querySelectorAll('.progress');
	values = data["data"].map(item => item.data);
	percentages = calcPercentage(values);
	for (let i = 0; i < progressbars.length; i++) {
		const element = progressbars[i];
		element.style.setProperty('--h', percentages[i] + '%');
		element.disabled = false;
	}
}

function setActive(cat) {
	download_btn.classList.remove("active");
	upload_btn.classList.remove("active");
	ping_btn.classList.remove("active");
	document.getElementById(cat).classList.add("active");
	
	diagram.classList.remove("ping");
	diagram.classList.remove("upload");
	diagram.classList.remove("download");
	diagram.classList.add(cat);
}



function skipInfo(v) {
	const infoId = Number(infoData["id"]) + v;
	getInfo(infoId);
}

function getInfo(id) {
	fetch('/api/get/info?id=' + id)
		.then(response => response.json())
		.then(idata => openInfo(idata))
		.catch(error => console.error('Error:', error));
}

function openInfo(idata) {
	infoData = idata;
	popup_timestamp.innerHTML = idata["timestamp"];
	const preData = [idata["download"], idata["upload"], 0, 0]
	percentages = calcPercentage(preData, 80)
	popup_download.innerHTML = convertBytes(idata["download"]);
	popup_download_bar.style.setProperty('--h', percentages[0] + '%');
	popup_upload.innerHTML = convertBytes(idata["upload"]);
	popup_upload_bar.style.setProperty('--h', percentages[1] + '%');
	popup_ping.innerHTML = idata["ping"].toFixed(2) + ' ms';
	popup_server_name.innerHTML = idata["server_name"];
	popup_server_company.innerHTML = idata["server_company"];
	popup_server_country.innerHTML = idata["server_country"];
	popup_server_host.href = 'http://' + idata["server_host"];
	popup_server_maps.src = 'https://maps.google.com/maps?q=' + idata["server_lat"] + ',' + idata["server_lon"] + '&output=embed';
	popupForward.disabled = (Number(idata["id"]) >= Number(idata["last_id"]));
	popupBack.disabled = (Number(idata["id"]) <= 1);
	popup.classList.add("active");
}

function closeInfo() {
	popup.classList.remove("active");
	popup_upload_bar.style.setProperty('--h', '0%');
	popup_download_bar.style.setProperty('--h', '0%');
	popup_server_maps.src = '';
}




function ping() {
	fetch('/api/ping')
		.then(response => response.json())
		.then(data => setPing(data))
		.catch(error => console.error('Error:', error));
}

function setPing(json) {
	if (json["online"]) {
		pingview.classList.remove("offline");
		pingtext.innerHTML = 'monitor online';
	} else{
		pingview.classList.add("offline");
		pingtext.innerHTML = 'monitor offline';
	}
}





function calcPercentage(numbers, maxPercentage = 100, minPercentage = 50) {
  const min = Math.min(...numbers);
  const shiftedNumbers = numbers.map(n => n - min);
  const max = Math.ceil(Math.max(...shiftedNumbers) + 0.000001);
  const proportions = shiftedNumbers.map(n => n / max);
  const percentages = proportions.map(p => (p * (maxPercentage - minPercentage)) + minPercentage);
  return percentages;
}

function convertBytes(bytes) {
	if (bytes >= 1073741824) {
		return (bytes / 1073741824).toFixed(2) + ' Gbps';
	} else if (bytes >= 1048576) {
		return (bytes / 1048576).toFixed(2) + ' Mbps';
	} else if (bytes >= 1024) {
		return (bytes / 1024).toFixed(2) + ' Kbps';
	} else {
		return bytes + ' Bps';
	}
}



function refreshData() {
	const cat = data["cat"];
	selectCat(cat);
}


selectCat("download");
setInterval(refreshData, 30000); // 30s refreshrate
