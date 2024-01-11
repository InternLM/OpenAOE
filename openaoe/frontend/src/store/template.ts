import { persist } from 'zustand/middleware';
import { create } from 'zustand';

export interface PromptTemplate {
    id: string;
    name: string;
    prompt: string;
}
interface PromptStore {
    templates: PromptTemplate[];
    lastTemplateId: number;
    newTemplate: (template: PromptTemplate) => void;
    deleteTemplate: (id: string) => void;
    updateTemplate: (id: string, updater: (template: PromptTemplate) => void) => void;
    clearTemplates: () => void;
}
export const usePromptStore = create<PromptStore>()(
    persist(
        (set, get) => ({
            templates: [],
            lastTemplateId: 0,
            newTemplate(template) {
                const templates = get().templates;
                templates.push(template);
                set(() => ({ templates }));
            },
            deleteTemplate(id) {
                const templates = get().templates;
                set(() => ({ templates: templates.filter((t) => t.id !== id) }));
            },
            updateTemplate(id, updater) {
                const templates = get().templates;
                const index = templates.findIndex((t) => t.id === id);
                if (index !== -1) {
                    updater(templates[index]);
                    set(() => ({ templates }));
                }
            },
            clearTemplates() {
                set(() => ({ templates: [], lastTemplateId: 0 }));
            }
        }),
        {
            name: 'prompt',
        },
    ),
);
