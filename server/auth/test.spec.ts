import "mocha";
import {expect} from "chai";
import * as authService from "./auth.service";
import {Request, Response} from "express";

describe("Auth Service", () => {
    let res;

    beforeEach(() => {
        res = {
            status: () => {
                return {
                    send: () => {}
                }
            }
        };
    })
    
    describe("isAuthenticated", () => {
        it ("should do", done => {
            const req = {
                body: {},
                query: {},
                headers: {
                    authorization: "TOKEN"
                }
            };
            authService.isAuthenticated({} as Request, res as Response, () => {
                done();
            });
        })
    })
});