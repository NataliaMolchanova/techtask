import { createClient, RedisClientType } from 'redis';
interface RedisJSONArray extends Array<RedisJSON> {
}
interface RedisJSONObject {
    [key: string]: RedisJSON;
    [key: number]: RedisJSON;
}
type RedisJSON = null | boolean | number | string | Date | RedisJSONArray | RedisJSONObject;


class RedisService {
    public readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            username: process.env.c || 'default',
            password: process.env.REDIS_PASSWORD || 'super_secure_password',
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number.parseInt(process.env.REDIS_PORT || "6379") 
            }
        });
    }

    public async connect() {
        return this.client.connect();
    }

    public async disconnect() {
        return this.client.disconnect();
    }
}

export const redisService = new RedisService();



