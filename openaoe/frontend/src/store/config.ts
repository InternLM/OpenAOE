import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import PromptsTemplates, { PromptTemplate } from '@constants/prompts.ts';
import { SERIAL_MODE } from '@constants/models.ts';

export interface configStore {
    token: string;
    theme: string;
    username: string;
    mode: string;
    prompts: PromptTemplate[],
    updateToken: (token: string) => void;
    updateTheme: (theme: string) => void;
    updateUsername: (username: string) => void;
    addPrompts: (prompts: PromptTemplate) => void;
    updateMode: (mode: string) => void;
}
export const useConfigStore = create<configStore>()(
    persist(
        (set, get) => ({
            token: '',
            theme: 'light',
            username: 'user',
            mode: SERIAL_MODE, // 'parallel' | 'serial'
            prompts: PromptsTemplates,
            updateToken: (token: string) => {
                set({ token });
            },
            updateTheme: (theme: string) => {
                set({ theme });
            },
            updateUsername: (username: string) => {
                set({ username });
            },
            updateMode: (mode: string) => {
                set({ mode });
            },
            addPrompts: (prompts) => {
                set({ prompts: [prompts, ...get().prompts] });
            },
        }),
        {
            name: 'config',
            version: 2,
            migrate(persistedState, version) {
                const state = persistedState as any;
                const newState = JSON.parse(JSON.stringify(state)) as configStore;

                if (version < 2) {
                    newState.token = import.meta.env.VITE_ALLES_APIN_TOKEN;
                    newState.theme = 'light';
                    newState.username = 'user';
                    newState.mode = SERIAL_MODE;
                    newState.prompts = PromptsTemplates;
                }

                return newState;
            },
        }
    ),
);
