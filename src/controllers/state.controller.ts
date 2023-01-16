import { redisService } from "../services/redis";

export class StateController {
    public async read(req: any, res: any) {
        const docId = req.params.docId;
        if (!docId) {
            return res.send({
                elements: {}
            });
        }
        const state = await redisService.client.json.GET(`state-${docId}`);
        return res.send(state);
    }
}