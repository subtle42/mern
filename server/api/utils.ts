import {Response} from "express";

export default class Util {
    public static handleError = (res:Response, statusCode?:number):any => {
        statusCode = statusCode || 500;
        return (err) => {
            res.status(statusCode).send(err);
        }
    }

    public static handleNoResult = (res:Response):any => {
        return (entity) => {
            if(!entity) {
                res.status(401).end();
                return null;
            }
            return entity;
        }
    }

    public static handleResponse = (res:Response, statusCode?:number):any => {
        statusCode = statusCode || 200;
        return (entity) => {
            res.status(statusCode).json(entity)
            return entity;
        };
    }

    public static handleResponseNoData = (res:Response, statusCode?:number):any => {
        statusCode = statusCode || 200;
        return (entity) => res.status(statusCode).json();
    }
}
