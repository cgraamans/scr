import express from "express";
import { Request, Response, NextFunction } from 'express';
import { getItems } from "../models/items";
import { T } from "../../types/index";

const router = express.Router();

const dataClass = class {

    public async getItems(req:Request, res:Response) {

        let paramsObj :T.Params.Items = {}

        if(req.params) {

            // if(typeof Number(req.params.dt) !== "number") return;
            
            // if(!req.params.dt) req.params.dt = toString((new Date()).getTime() - (24*60*60*1000));


            // if(req.params.dt > (new Date()).getTime()) return;

            // paramsObj.dt = req.params.dt;

        }

        let items = await getItems(paramsObj);
        // final editing

        console.log(items);

        res.status(200).send(items);

    };

};

const Data = new dataClass();

router.use(function(req:Request, res:Response, next:NextFunction) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.get("",Data.getItems);

export default router;