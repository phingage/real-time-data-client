import { RealTimeDataClient } from "../src/client";
import { Message } from "../src/model";

const onMessage = (_: RealTimeDataClient, message: Message): void => {
    const now = new Date().getTime();
    console.log(
        message.topic,
        message.type,
        //message.payload,
        `latency: ${now - message.timestamp * 1000} milliseconds`,
    );
};

const onConnect = (client: RealTimeDataClient): void => {
    // Subscribe to a topic
    client.subscribe({
        subscriptions: [
            {
                topic: "comments",
                type: "*", // "*"" can be used to connect to all the types of the topic
                filters: ``,
            },
        ],
    });
    /*
    // Unsubscribe from a topic
    client.subscribe({
        subscriptions: [
            {
                topic: "activity",
                type: "trades",
            },
        ],
    });
    */
};

new RealTimeDataClient(onConnect, onMessage).connect();
