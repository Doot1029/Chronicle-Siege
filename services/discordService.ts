import type { DiscordSDK, AuthenticateResponse, Participant } from '../types/discord';

declare global {
    interface Window {
        Discord: {
            new (clientId: string, options?: { frameId: string }): DiscordSDK;
        };
    }
}

// IMPORTANT: Replace this with your own Client ID from the Discord Developer Portal
const CLIENT_ID = '1408352859485114388';

class DiscordService {
    public sdk: DiscordSDK | null = null;
    private isInitialized = false;

    async initialize(): Promise<DiscordSDK> {
        if (this.isInitialized && this.sdk) {
            return this.sdk;
        }

        if (!window.Discord) {
            throw new Error("Discord SDK not found. This app must be run inside Discord.");
        }

        this.sdk = new window.Discord(CLIENT_ID);
        await this.sdk.subscribe('READY', () => {});
        this.isInitialized = true;
        return this.sdk;
    }

    async authenticate(): Promise<AuthenticateResponse> {
        if (!this.sdk) throw new Error("SDK not initialized");
        
        const auth = await this.sdk.commands.authenticate({
            client_id: CLIENT_ID,
            response_type: 'token',
            state: '',
            prompt: 'none',
            scope: ['identify', 'rpc.activities.write']
        });

        return auth;
    }

    async getParticipants(): Promise<Participant[]> {
        if (!this.sdk) throw new Error("SDK not initialized");
        const { participants } = await this.sdk.commands.getInstanceParticipants();
        return participants;
    }
}

export const discordService = new DiscordService();
