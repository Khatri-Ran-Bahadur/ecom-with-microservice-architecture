"use server"

import { kafka } from "@packages/libs/kafka";

import { Partitioners } from "kafkajs";
const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

export async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action?: string;
    device?: string;
    country?: string;
    city?: string;
}) {
    try {
        await producer.connect();
        await producer.send({
            topic: "user-events",
            messages: [{ value: JSON.stringify(eventData) }],
        });
    } catch (error) {
        console.log(error)
    } finally {
        await producer.disconnect();
    }
}