import React from 'react';

export const DefaultConfigInfo = {
    models: null,
    streamModels: []
};

export const GlobalConfigContext = React.createContext(DefaultConfigInfo);
