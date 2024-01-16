import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BOT } from '@constants/models.ts';

export interface BotState {
    provider: string;
    avatar: string;
    model: string;
    background: string;
    border?: string;
    description?: string;
    url?: string;
}

interface BotStore {
    chosenBotNames: string[];
    currentBot: string;
    updateCurrentBot: (botName: string) => void;
    addBot: (botId: string) => void;
    removeBot: (botId: string) => void;
    getCurrentBot: () => string;
    clearBots: () => void;
}
export const useBotStore = create<BotStore>()(
    persist(
        (set, get) => ({
            chosenBotNames: [DEFAULT_BOT],
            currentBot: DEFAULT_BOT,
            updateCurrentBot: (botName: string) => {
                set({ currentBot: botName });
            },
            addBot: (botName: string) => {
                const { chosenBotNames } = get();
                if (chosenBotNames.includes(botName)) {
                    return;
                }
                set({ chosenBotNames: [...chosenBotNames, botName] });
            },
            removeBot: (botName: string) => {
                const { chosenBotNames } = get();
                set({ chosenBotNames: chosenBotNames.filter((name) => name !== botName) });
            },
            getCurrentBot: () => {
                return get().currentBot || DEFAULT_BOT;
            },
            clearBots: () => {
                localStorage.removeItem('bot');
                set({ chosenBotNames: [DEFAULT_BOT] });
            }
        }),
        {
            name: 'bot',
            version: 2,
            migrate(persistedState, version) {
                const state = persistedState as any;
                const newState = JSON.parse(state) as BotStore;

                if (version < 2) {
                    newState.chosenBotNames = [DEFAULT_BOT];
                    newState.currentBot = DEFAULT_BOT;
                }

                return newState;
            },
        }
    )
);
