# Real time data client

This client provides a wrapper to connect to the `real-time-data-streaming` `WebSocket` service.

## How to use it

Here is a quick example about how to connect to the service and start receiving messages (you can find more in the folder `examples/`):

```typescript
import { RealTimeDataClient } from "../src/client";
import { Message } from "../src/model";

const onMessage = (message: Message): void => {
    console.log(message.topic, message.type, message.payload);
};

const onConnect = (client: RealTimeDataClient): void => {
    // Subscribe to a topic
    client.subscribe({
        subscriptions: [
            {
                topic: "activity",
                type: "trades",
            },
        ],
    });
};

new RealTimeDataClient(onMessage, onConnect).connect();
```

## How to subscribe and unsubscribe from messages

Once the connection is stablished and you have a `client: RealTimeDataClient` object, you can `subscribe` and `unsubscribe` to many messages streamings using the same connection.

### Subscribe

Subscribe to all messages from the topic 'activity' and to the new messages of the event id 100.

```typescript
client.subscribe({
    subscriptions: [
        {
            topic: "activity",
            type: "*",
        },
    ],
});

client.subscribe({
    subscriptions: [
        {
            topic: "comments",
            type: "new-comment",
            filters: "parent_entity_id=100",
        },
    ],
});
```

### Unsubscribe

Unsubscribe from the new trades messages of the topic 'activity'. If 'activity' has more messages types and I used '\*' to connect to all of them, this will only unsubscribe from the type 'trades'.

```typescript
client.subscribe({
    subscriptions: [
        {
            topic: "activity",
            type: "trades",
        },
    ],
});
```

## Messages hierarchy

| Topic    | Type   | Auth | Schema |
| -------- | ------ | ---- | ------ |
| activity | trades | -    | Trade  |

## Trade

| Name                  | Type    | Description                                        |
| --------------------- | ------- | -------------------------------------------------- |
| asset                 | string  | ERC1155 token ID of conditional token being traded |
| bio                   | string  | Bio of the user of the trade                       |
| conditionId           | string  | Id of market which is also the CTF condition ID    |
| eventSlug             | string  | Slug of the event                                  |
| icon                  | string  | URL to the market icon image                       |
| name                  | string  | Name of the user of the trade                      |
| outcome               | string  | Human readable outcome of the market               |
| outcomeIndex          | integer | Index of the outcome                               |
| price                 | float   | Price of the trade                                 |
| profileImage          | string  | URL to the user profile image                      |
| profileImageOptimized | string  | -                                                  |
| proxyWallet           | string  | Address of the user proxy wallet                   |
| pseudonym             | string  | Pseudonym of the user                              |
| side                  | string  | Side of the trade (BUY/SELL)                       |
| size                  | integer | Size of the trade                                  |
| slug                  | string  | Slug of the market                                 |
| timestamp             | integer | Timestamp of the trade                             |
| title                 | string  | Title of the event                                 |
| transactionHash       | string  | Hash of the transaction                            |
