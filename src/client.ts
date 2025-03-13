import { WebSocket, RawData } from "ws";
import { SubscriptionMessage, Message } from "./model";

const DEFAULT_HOST = "wss://ws-live-data.polymarket.com";
const DEFAULT_PING_INTERVAL = 5000;

/**
 * Interface representing the arguments for initializing a RealTimeDataClient.
 */
export interface RealTimeDataClientArgs {
    /**
     * Optional callback function that is called when the client successfully connects.
     * @param client - The instance of the RealTimeDataClient that has connected.
     */
    onConnect?: (client: RealTimeDataClient) => void;

    /**
     * Optional callback function that is called when the client receives a message.
     * @param client - The instance of the RealTimeDataClient that received the message.
     * @param message - The message received by the client.
     */
    onMessage?: (client: RealTimeDataClient, message: Message) => void;

    /**
     * Optional host address to connect to.
     */
    host?: string;

    /**
     * Optional interval in milliseconds for sending ping messages to keep the connection alive.
     */
    pingInterval?: number;

    /**
     * Optional flag to enable or disable automatic reconnection when the connection is lost.
     */
    autoReconnect?: boolean;
}

/**
 * A client for managing real-time WebSocket connections, handling messages, subscriptions,
 * and automatic reconnections.
 */
export class RealTimeDataClient {
    /** WebSocket server host URL */
    private readonly host: string;

    /** Interval (in milliseconds) for sending ping messages */
    private readonly pingInterval: number;

    /** Determines whether the client should automatically reconnect on disconnection */
    private autoReconnect: boolean;

    /** Callback function executed when the connection is established */
    private readonly onConnect?: (client: RealTimeDataClient) => void;

    /** Callback function executed when a custom message is received */
    private readonly onCustomMessage?: (client: RealTimeDataClient, message: Message) => void;

    /** WebSocket instance */
    private ws!: WebSocket;

    /**
     * Constructs a new RealTimeDataClient instance.
     * @param args Configuration options for the client.
     */
    constructor(args?: RealTimeDataClientArgs) {
        this.host = args!.host || DEFAULT_HOST;
        this.pingInterval = args!.pingInterval || DEFAULT_PING_INTERVAL;
        this.autoReconnect = args!.autoReconnect || true;
        this.onCustomMessage = args!.onMessage;
        this.onConnect = args!.onConnect;
    }

    /**
     * Establishes a WebSocket connection to the server.
     */
    public connect() {
        this.ws = new WebSocket(this.host);
        this.ws.on("open", this.onOpen);
        this.ws.on("message", this.onMessage);
        this.ws.on("pong", this.onPong);
        this.ws.on("error", this.onError);
        this.ws.on("close", this.onClose);
    }

    /**
     * Handles WebSocket 'open' event. Executes the `onConnect` callback and starts pinging.
     */
    private onOpen = async () => {
        this.ping();
        if (this.onConnect) {
            this.onConnect(this);
        }
    };

    /**
     * Handles WebSocket 'pong' event. Continues the ping cycle.
     */
    private onPong = async () => {
        delay(this.pingInterval).then(() => this.ping());
    };

    /**
     * Handles WebSocket errors. Logs the error and attempts reconnection if `autoReconnect` is enabled.
     * @param err Error object describing the issue.
     */
    private onError = async (err: Error) => {
        console.error("error", err);
        if (this.autoReconnect) {
            return this.connect();
        }
    };

    /**
     * Handles WebSocket 'close' event. Logs the disconnect reason and attempts reconnection if `autoReconnect` is enabled.
     * @param code Close event code.
     * @param reason Buffer containing the reason for closure.
     */
    private onClose = async (code: number, reason: Buffer) => {
        console.error("disconnected", "code", code, "reason", reason.toString());
        if (this.autoReconnect) {
            return this.connect();
        }
    };

    /**
     * Sends a ping message to keep the connection alive.
     */
    private ping = async () => {
        this.ws.ping(undefined, false, (err: Error) => {
            if (err) {
                console.error("ping error", err);
            }
        });
    };

    /**
     * Handles incoming WebSocket messages. Parses and processes custom messages if applicable.
     * @param event Raw WebSocket message data.
     */
    private onMessage = (event: RawData): void => {
        const eventS = event.toString();
        if (eventS && eventS.length) {
            if (this.onCustomMessage && eventS.includes("payload")) {
                const message = JSON.parse(eventS);
                this.onCustomMessage(this, message as Message);
            } else {
                console.log(eventS);
            }
        }
    };

    /**
     * Closes the WebSocket connection.
     */
    public disconnect() {
        this.autoReconnect = false;
        this.ws.close();
    }

    /**
     * Subscribes to a data stream by sending a subscription message.
     * @param msg Subscription request message.
     */
    public subscribe(msg: SubscriptionMessage) {
        this.ws.send(JSON.stringify({ action: "subscribe", ...msg }), (err?: Error) => {
            if (err) {
                console.error("subscribe error", err);
                this.ws.close();
            }
        });
    }

    /**
     * Unsubscribes from a data stream by sending an unsubscription message.
     * @param msg Unsubscription request message.
     */
    public unsubscribe(msg: SubscriptionMessage) {
        this.ws.send(JSON.stringify({ action: "unsubscribe", ...msg }), (err?: Error) => {
            if (err) {
                console.error("unsubscribe error", err);
                this.ws.close();
            }
        });
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
