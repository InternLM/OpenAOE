import React from 'react';
import { models } from '@config/model-config.ts';

export const DefaultConfigInfo = {
    models,
};

export const GlobalConfigContext = React.createContext(DefaultConfigInfo);
