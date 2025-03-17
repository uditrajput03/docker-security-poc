import { createClient, RedisClientType } from 'redis';

import 'dotenv/config'
// @ts-ignore
const redis = process.env.REDIS || ""

export class GetRedis {
    private static instance: GetRedis;
    private client: RedisClientType;

    private constructor() {
        this.client = createClient(    {
            url: redis
        });
        this.client.connect()
            .then(() => console.log('✅ Redis connected'))
            .catch((err) => console.error('❌ Redis connection failed:', err));
    }

    public static getInstance(): GetRedis {
        if (!this.instance) {
            this.instance = new GetRedis();
        }
        return this.instance;
    }

    public getClient(): RedisClientType {
        return this.client;
    }
}

const redisInstance = GetRedis.getInstance();
const client = redisInstance.getClient();

// client.set('key', 'sdfsfs')
//     .then(() => client.get('key'))
//     .then((value) => console.log('🔹 Redis value:', value))
//     .catch((err) => console.error('❌ Redis error:', err));
