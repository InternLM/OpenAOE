export interface ConfigState {
    name: string;
    title: string;
    description: string;
}

export const Configs: ConfigState[] = [
    {
        name: 'Serial Mode',
        title: 'Toggle between serial and parallel mode',
        description: 'Serial mode will send your message to one bot each time.',
    },
    {
        name: 'Parallel Mode',
        title: 'Toggle between serial and parallel mode',
        description: 'Parallel mode will send your message to all bots at once.',
    },
];
