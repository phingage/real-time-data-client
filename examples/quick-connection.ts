import { RealTimeDataClient } from "../src/client";
import { RawData } from "ws";

const onMessage = (event: RawData): void => {
    console.log(event.toString());
};

const onConnect = (client: RealTimeDataClient): void => {
    // Subscribe to a topic
    client.subscribe({
        subscriptions: [
            {
                topic: "activity",
                type: "trades", // "*"" can be used to connect to all the types of the topic
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

new RealTimeDataClient(onMessage, onConnect).connect();
