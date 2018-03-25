import "mocha";
import {assert} from "chai";
import {spy, SinonSpy, stub, SinonStub} from "sinon";
import * as jwt from "jsonwebtoken";
import auth from "./auth";
import config from "../../config/environment";


describe("Socket Auth", () => {
    let socketServer,
        mySocket,
        myNext:SinonSpy,
        myJwt:SinonStub;

    beforeEach(() => {
        myJwt = stub(jwt, "verify");
        mySocket = {
            emit: spy(),
            handshake: {
                query: {}
            }
        };
        myNext = spy();

        socketServer = {
            use: (callback) => callback(mySocket, myNext)
        }
    });

    afterEach(() => {
        myJwt.restore();
    })

    describe("Login logic", () => {
        let test = "foiwelevoihjwev";

        it("should not call next if socket.handshake.query.token does not exist", () => {
            auth(socketServer);
            assert(myNext.callCount === 0);
        });

        it("should call jwt.verify if socket.handshake.query.token exists", () => {
            mySocket.handshake.query.token = "test";
            auth(socketServer);
            assert(myJwt.callCount === 1);
        });

        it("should call jwt.verify with socket.handshake.query.token and the secret key", () => {
            mySocket.handshake.query.token = test;

            myJwt.callsFake((secret, token, cb) => {
                assert(secret === test);
                assert(token === config.shared.secret);
            })
            auth(socketServer);
        });

        it("should do a socket.emit an error if jwt.verify fails", () => {
            let error = "kajwehfojvlkw";
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb(error, null);
            });
            assert(mySocket.emit.callCount === 0);
            auth(socketServer);
            assert(mySocket.emit.callCount === 1);
            assert(mySocket.emit.calledWith("error", error));
        });

        it("should not call nextFn if jwt.verify fails", () => {
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb("error", null);
            });
            auth(socketServer);
            assert(myNext.callCount === 0);
        });

        it("should call nextFn if jwt.verify has no error", () => {
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb(undefined, "");
            });
            auth(socketServer);
            assert(myNext.callCount === 1);
        })
    });
});