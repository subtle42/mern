import * as path from "path";
import * as express from "express";

export default (app:express.Application) => {
    app.use("/api/auth", require("./auth"));
    app.use("/api/user", require("./api/user"));
    app.use("/api/books", require("./api/book"));
    app.use("/api/pages", require("./api/page"));
    app.use("/api/widgets", require("./api/widget"));
    app.use("/api/sources", require("./api/source"));

    app.use("/index", express.static(path.join(__dirname, "../client/index.html")));
    app.use("/.dist", express.static(path.join(__dirname, "../client/.dist")));
    app.use("/", express.static(path.join(__dirname, "../client/.dist")));
    app.use("*", (req:express.Request, res) => {
        console.log(`Redirecting: ${req.method}: ${req.originalUrl}`);
        return res.redirect('/index');
    })
}