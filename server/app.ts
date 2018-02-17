import * as express from "express";
import * as body from "body-parser"
import * as http from "http";
import * as io from "socket.io";
import * as mongoose from "mongoose";
import * as knex from 'knex';
import * as passport from "passport";
import socketAuth from "./auth/socket/auth";

knex({
    client: 'mysql',
    connection: {
        host:MYSQL_URI,
        user: 'root',
        password: 'password',
        database: 'app_test'
    }
});

var MONGO_URI = "mongodb://localhost/merntest";
var MYSQL_URI = "127.0.0.1";

(<any>mongoose).connect(MONGO_URI, {
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