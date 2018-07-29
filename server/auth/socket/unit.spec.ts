import "mocha";
import {expect} from "chai";
import {spy, SinonSpy, stub, SinonStub} from "sinon";
import * as jwt from "jsonwebtoken";
import {socketAuth as auth} from "./auth";
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
            expect(myNext.callCount).equals(0);
        });

        it("should call jwt.verify if socket.handshake.query.token exists", () => {
            mySocket.handshake.query.token = "test";
            auth(socketServer);
            expect(myJwt.callCount).equals(1);
        });

        it("should call jwt.verify with socket.handshake.query.token and the secret key", done => {
            mySocket.handshake.query.token = test;

            myJwt.callsFake((secret, token, cb) => {
                expect(secret).equals(test);
                expect(token).equals(config.shared.secret);
                done();
            })
            auth(socketServer);
        });

        xit("should do a socket.emit an error if jwt.verify fails", () => {
            let error = "kajwehfojvlkw";
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb(error, null);
            });
            expect(mySocket.emit.callCount).equals(0);
            auth(socketServer);
            expect(mySocket.emit.callCount).equals(1);
            expect(mySocket.emit.calledWith("error", error)).equals(true);
        });

        it("should not call nextFn if jwt.verify fails", () => {
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb("error", null);
            });
            auth(socketServer);
            expect(myNext.callCount).equals(0);
        });

        it("should call nextFn if jwt.verify has no error", () => {
            mySocket.handshake.query.token = test;
            myJwt.callsFake((secret, token, cb) => {
                cb(undefined, "");
            });
            auth(socketServer);
            expect(myNext.callCount).equals(1);
        })
    });
});