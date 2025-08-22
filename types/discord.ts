export interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    public_flags: number;
    global_name: string | null;
}

export interface AuthenticateResponse {
    access_token: string;
    user: User;
    scopes: any[];
    expires: string;
    application: {
        id: string;
        description: string;
        name: string;
        icon: string | null;
        rpc_origins: string[];
    };
}

export interface Participant {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    nick: string;
    bot: boolean;
    flags: number;
    global_name: string | null;
    avatar_decoration_data: any | null;
    premium_type: number | null;
}


export declare class DiscordSDK {
    constructor(clientId: string, options?: { frameId: string });
    commands: {
        authenticate(payload: { client_id: string; response_type: string; state: string; prompt: string; scope: string[]; }): Promise<AuthenticateResponse>;
        getInstanceParticipants(): Promise<{ participants: Participant[] }>;
    };
    subscribe(event: string, callback: (payload: any) => void): Promise<void>;
    close(): void;
    readonly frameId: string;
}
