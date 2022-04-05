const express = require ("express")
const config = require ("config")
const mongoose = require("mongoose")


const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
// app.use(cors());

const app = express()

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(express.json({extended: true}))

app.use('/api/auth', require("./routes/auth.routes"))
app.use('/api/link/', require('./routes/link.routes'))

const PORT = config.get("port") || 5000


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(3001, () => {
    console.log("SERVER RUNNING");
});

async function start() {
    try{
       await mongoose.connect(config.get("mongoUri"))
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
    } catch (e) {
        console.log("Server Error", e.message)
        process.exit(1)
    }
}

 start()

