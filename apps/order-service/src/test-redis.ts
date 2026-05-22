import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";

// Load root .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testRedis() {
    const redisUri = process.env.REDIS_DATABASE_URI;
    console.log("Testing Redis URI:", redisUri ? "Found (masked)" : "NOT FOUND");

    if (!redisUri) {
        console.error("REDIS_DATABASE_URI is missing in .env");
        process.exit(1);
    }

    // Try multiple connection strategies to diagnose
    const configs = [
        { name: "Default", options: {} },
        { name: "IPv4 Only", options: { family: 4 } },
        { name: "IPv4 + TLS", options: { family: 4, tls: {} } },
        { name: "IPv4 + TLS + No Reject", options: { family: 4, tls: { rejectUnauthorized: false } } }
    ];

    for (const config of configs) {
        console.log(`\n--- Testing Configuration: ${config.name} ---`);
        const redis = new Redis(redisUri, {
            ...config.options,
            connectTimeout: 5000,
            maxRetriesPerRequest: 1
        });

        try {
            const start = Date.now();
            await redis.ping();
            console.log(`✅ SUCCESS! Ping returned in ${Date.now() - start}ms`);
            await redis.quit();
        } catch (err: any) {
            console.error(`❌ FAILED: ${err.message}`);
            if (err.name === "AggregateError") {
                console.error("AggregateError details:", err.errors);
            }
        } finally {
            redis.disconnect();
        }
    }
}

testRedis();
