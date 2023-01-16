import { Router, Response, Request} from "express";
import { stateController } from "../controllers";

export const stateRouter = Router();

stateRouter.get('/:docId', (req:Request, res: Response) => stateController.read(req, res));