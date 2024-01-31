import React from 'react';

export const DefaultConfigInfo = {
    models: null,
    streamProviders: [
        'internlm',
        'openai',
        'claude',
        'minimax'
    ]
};

export const GlobalConfigContext = React.createContext(DefaultConfigInfo);
