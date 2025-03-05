export interface ClobApiKeyCreds {
    key: string;
    secret: string;
    passphrase: string;
}
export interface GammaAuth {
    address: string;
}

export interface SubscriptionMessage {
    subscriptions: {
        topic: string;
        type: string;
        filters?: string;
        clob_auth?: ClobApiKeyCreds;
        gamma_auth?: GammaAuth;
    }[];
}

export interface Message {
    topic: string;
    type: string;
    timestamp: number;
    payload: object;
}
