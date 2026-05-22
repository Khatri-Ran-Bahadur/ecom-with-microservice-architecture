import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URI!, {
    family: 4,
    connectTimeout: 10000,
    tls: {}
});

export default redis;
