const chatForm = document.getElementById("chat-form");
const formInput = document.getElementById("msg");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersUl = document.getElementById("users");

//Get username and room-name from url

const { username, room } = Qs.parse(window.location.search, {
	ignoreQueryPrefix: true,
});

const socket = io();

//passOn the username and room to server
socket.emit("joinRoom", { username, room });

//Get room and its users

socket.on("roomUsers", ({ room, users }) => {
	displayRoomName(room);
	displayRoomUsers(users);
});
//Msg from server
socket.on("message", (msg) => {
	serverMsg(msg);
});

//Looking for form submit event to fwd data to backend
chatForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const msg = formInput.value;

	//exmit a msg to server
	socket.emit("chatMessage", msg);
	formInput.value = "";
});

function serverMsg(message) {
	const div = document.createElement("div");
	div.classList.add("message");
	div.innerHTML = `
	<p class="meta">${message.username} <span>${message.time}</span>
	</p>
	<p class="text">
	    ${message.text}
	</p>`;
	chatMessages.appendChild(div);
}

function displayRoomName(room) {
	roomName.innerText = room;
}

function displayRoomUsers(users) {
	usersUl.innerHTML = `
	${users.map((user) => `<li>${user.username}</li>`).join("")}
	`;
}
