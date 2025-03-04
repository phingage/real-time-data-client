import { WebSocket, RawData } from "ws";
import { SubscriptionMessage } from "./model";

const DEFAULT_HOST = "wss://ws-live-data.polymarket.com";
const DEFAULT_PING_INTERVAL = 5000;

export class RealTimeDataClient {
    private readonly host: string;
    private readonly pingInterval: number;
    private readonly autoReconnect: boolean;
    private readonly onMessage: (event: RawData) => void;
    private readonly onConnect?: (client: RealTimeDataClient) => void;

    private ws!: WebSocket;

    constructor(
        onMessage?: (event: RawData) => void,
        onConnect?: (client: RealTimeDataClient) => void,
        host?: string,
        pingInterval?: number,
        autoReconnect?: boolean,
    ) {
        this.host = host || DEFAULT_HOST;
        this.pingInterval = pingInterval || DEFAULT_PING_INTERVAL;
        this.autoReconnect = autoReconnect || true;
        this.onMessage =
            onMessage ||
            ((event: RawData) => {
                console.log(event.toString());
            });
        this.onConnect = onConnect;
    }

    public connect() {
        this.ws = new WebSocket(this.host);
        this.ws.on("open", this.onOpen);
        this.ws.on("message", this.onMessage);
        this.ws.on("pong", this.onPong);
        this.ws.on("error", this.onError);
        this.ws.on("close", this.onClose);
    }

    private onOpen = async () => {
        this.ping();
        if (this.onConnect) {
            this.onConnect(this);
        }
    };
    private onPong = async () => {
        delay(this.pingInterval).then(() => this.ping());
    };
    private onError = async (err: Error) => {
        console.error("error", err);
        if (this.autoReconnect) {
            return this.connect();
        }
    };
    private onClose = async (code: number, reason: Buffer) => {
        console.error("disconnected", "code", code, "reason", reason.toString());
        if (this.autoReconnect) {
            return this.connect();
        }
    };
    private ping = async () => {
        this.ws.ping(undefined, false, (err: Error) => {
            if (err) {
                console.error("ping error", err);
            }
        });
    };

    public subscribe(msg: SubscriptionMessage) {
        (msg as any).action = "subscribe";
        this.ws.send(JSON.stringify(msg), (err?: Error) => {
            if (err) {
                console.error("subscribe error", err);
                this.ws.close();
            }
        });
    }

    public unsubscribe(msg: SubscriptionMessage) {
        (msg as any).action = "unsubscribe";
        this.ws.send(JSON.stringify(msg), (err?: Error) => {
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
