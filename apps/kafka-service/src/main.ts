import { kafka } from "@packages/libs/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-events-group" })

const eventQueue: any[] = [];



const processQueue = async () => {
  if (eventQueue.length == 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === 'shop_visit') {
      //update shop analytics
    }

    const validActions = [
      'add_to_cart', 
      'product_view', 
      'remove_from_cart', 
      'add_to_wishlist',
      'remove_from_wishlist', 
      'checkout', 
      'wishlist',
      'product_purchase'
    ];

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }
    try {
      await updateUserAnalytics(event)
    } catch (error) {
      console.log(error)
    }
  }

  setTimeout(processQueue, 1000)
}

setInterval(processQueue, 3000)

//kafka consumer for user events
export const consumerKafkaMessages = async () => {
  try {
    await consumer.connect()
    await consumer.subscribe({ topic: 'user-events', fromBeginning: false })

    await consumer.run({
      eachMessage: async ({ topic, partition, message }: { topic: string, partition: number, message: any }) => {
        if (!message || !message.value) return;
        try {
            const event = JSON.parse(message.value.toString());
            console.log(`[Kafka Consumer] Received event: ${event.action} for product: ${event.productId}`);
            eventQueue.push(event);
        } catch (err) {
            console.error("[Kafka Consumer] Error parsing message:", err);
        }
      },
    })
  } catch (error) {
    console.error("[Kafka Consumer] Connection error:", error);
  }
}

consumerKafkaMessages().catch(console.error)