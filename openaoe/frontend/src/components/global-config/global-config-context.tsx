import React from 'react';

export const DefaultConfigInfo = {
    models: null,
    streamProviders: []
};

export const GlobalConfigContext = React.createContext(DefaultConfigInfo);
