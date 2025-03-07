import { RealTimeDataClient } from "../src/client";
import { Message } from "../src/model";

const onMessage = (_: RealTimeDataClient, message: Message): void => {
    console.log(message.topic, message.type, message.payload);
};

const onConnect = (client: RealTimeDataClient): void => {
    // Subscribe to a topic
    client.subscribe({
        subscriptions: [
            {
                topic: "comments",
                type: "*", // "*"" can be used to connect to all the types of the topic
                filters: `{"parentEntityID":100,"parentEntityType":"Event"}`,
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
