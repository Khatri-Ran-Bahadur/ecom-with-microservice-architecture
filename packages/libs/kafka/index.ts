import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "eshop-client",
    brokers: process.env.KAFKA_URL ? process.env.KAFKA_URL.split(",").map(b => b.trim()) : ['pkc-921jm.us-east-2.aws.confluent.cloud:9092'],
    ssl: {
        rejectUnauthorized: false
    },
    sasl: {
        mechanism: "plain",
        username: (process.env.KAFKA_API_KEY || "").replace(/"/g, ''),
        password: (process.env.KAFKA_API_SECRET || "").replace(/"/g, ''),
    },
    connectionTimeout: 10000,
    authenticationTimeout: 10000,
    retry: {
        initialRetryTime: 300,
        retries: 10
    }
} as any);

