import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession } from '@/store/chat.ts';

export interface ShareStore {
    isPreview: boolean;
    isSharing: boolean;
    chosenChats: ChatSession[];
    totalSessions: number,
    totalMessages: number,
    updateIsPreview: (isPreview: boolean) => void;
    updateIsSharing: (isSharing: boolean) => void;
    updateChosenChats: (sessionId: number, message: ChatMessage, show: boolean, sessionInfo: Partial<ChatSession>) => void;
    reset: () => void;
}

export const useShareStore = create<ShareStore>()(
    persist(
        (set, get) => ({
            isPreview: false,
            isSharing: false,
            chosenChats: [],
            totalSessions: 0,
            totalMessages: 0,
            updateIsPreview: (isPreview: boolean) => {
                set({ isPreview });
            },
            updateIsSharing: (isSharing: boolean) => {
                set({ isSharing });
            },
            updateChosenChats: (sessionId: number, message: ChatMessage, show: boolean, sessionInfo) => {
                const { chosenChats } = get();

                const targetSessionIdx = chosenChats.findIndex((item) => item.id === sessionId);
                const targetSession = chosenChats[targetSessionIdx];

                if (targetSession) {
                    const messageIndex = targetSession.messages.findIndex((item) => item.id === message.id);
                    if (messageIndex === -1 && show) {
                        targetSession.messages.push(message);
                        set({ totalMessages: get().totalMessages + 1 });
                    }
                    if (messageIndex > -1 && !show) {
                        targetSession.messages.splice(messageIndex, 1);
                        set({ totalMessages: get().totalMessages - 1 });

                        if (targetSession.messages.length === 0 && get().totalSessions > 0) {
                            set({ totalSessions: get().totalSessions - 1 });
                            chosenChats.splice(targetSessionIdx, 1);
                            set({ chosenChats });
                        }
                    }
                } else if (show) {
                    set({ totalSessions: get().totalSessions + 1 });
                    set({ totalMessages: get().totalMessages + 1 });
                    chosenChats.push({
                        ...sessionInfo,
                        name: sessionInfo?.name || 'Unknown',
                        bot: sessionInfo?.bot || 'Unknown',
                        id: sessionId,
                        messages: [message],
                    });
                }
            },
            reset: () => {
                set({ chosenChats: [] });
                set({ totalSessions: 0 });
                set({ totalMessages: 0 });
            }
        }),
        {
            name: 'share-store',
            version: 1
        }
    )
);
