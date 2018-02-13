import * as express from "express";
import * as body from "body-parser"
import * as http from "http";
import * as io from "socket.io";
import * as mongoose from "mongoose";
import * as passport from "passport";

import socketAuth from "./auth/socket/auth";

var mongoUri = "mongodb://localhost/merntest";

(<any>mongoose).connect(mongoUri, {
    // useMongoClient: true
});
(<any>mongoose).Promise = global.Promise;
mongoose.connection.on("error", () => {
    console.error("MongoDB connection error!");
    process.exit(-1);
});

var app = express();
var server = http.createServer(app);

declare var global:any;
var myIO = io(server, {});
global.myIO = myIO;

myIO.on("connection", socket => {
    console.log("connected");
    socket.emit("message", "connected");
});
socketAuth(myIO);

app.use(body.json());
app.use(passport.initialize());

require("./routes").default(app);

server.listen(3333);

module.exports = app