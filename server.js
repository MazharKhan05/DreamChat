//All the backend code goes here...
const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require("./utils/messages");
const {
	getCurrentUser,
	joinUser,
	getRoomUsers,
	userLeave,
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socket(server);

io.on("connection", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		const user = joinUser(socket.id, username, room);
		socket.join(user.room);
		//Only seen by user himself
		socket.emit(
			"message",
			formatMessage("DreamChat Bot", "Welcome to DreamChat!")
		);

		//broadcast when user connects to all users excepts userhimself
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(
					"DreamChat Bot",
					`${user.username} had just connected the room`
				)
			);

		//send users and room details
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});

		socket.on("chatMessage", (msg) => {
			//Sending back msgs to client
			io.to(user.room).emit("message", formatMessage(user.username, msg));
		});
	});

	// socket.on("chatMessage", (msg) => {
	// 	//Sending back msgs to client
	// 	io.emit("message", formatMessage("Admin", msg));
	// });
	//calls when user leaves room, brdcast msg to all using io obj
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage("DreamChat Bot", `${user.username} had just disconnected`)
			);

			//send users and room details
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

const PORT = 3000 || process.env.PORT;
//In order to set our public folder as static folder we need to tell express
app.use(express.static(path.join(__dirname, "Public")));

server.listen(PORT, () => {
	console.log(`server listening to port: ${PORT}`);
});
