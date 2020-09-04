const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
  socket.emit('request', "You've entered the book"); // emit an event to the socket
  io.emit('broadcast', "Now Broadcasting"); // emit an event to all connected sockets
  socket.on('reply', () => { "Now Replying" }); // listen to the event
});
// Configure body parsing for AJAX requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb+srv://joshw:Chopper11@cluster0.dpyxa.mongodb.net/dbgbooks?retryWrites=true&w=majority",
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Start the API server
app.listen(PORT, () =>
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`)
);
