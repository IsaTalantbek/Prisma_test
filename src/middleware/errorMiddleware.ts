import { Request, Response } from "express";

const errorHandler = (err: Error, _: Request, res: Response) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
};

export default errorHandler;
