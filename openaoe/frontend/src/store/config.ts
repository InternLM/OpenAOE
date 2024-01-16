import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { SERIAL_MODE } from '@constants/models.ts';

export interface configStore {
    token: string;
    theme: string;
    username: string;
    mode: string;
    updateTheme: (theme: string) => void;
    updateMode: (mode: string) => void;
}
export const useConfigStore = create<configStore>()(
    persist(
        (set, get) => ({
            token: '',
            theme: 'light',
            username: 'user',
            mode: SERIAL_MODE, // 'parallel' | 'serial'
            updateTheme: (theme: string) => {
                set({ theme });
            },
            updateMode: (mode: string) => {
                set({ mode });
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
                }

                return newState;
            },
        }
    ),
);
