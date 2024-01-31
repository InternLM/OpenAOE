import {
    FC, ReactNode, useEffect, useMemo, useState
} from 'react';
import { GlobalConfigContext } from '@components/global-config/global-config-context.tsx';
import { models as defaultModels } from '@config/model-config.ts';
import { STREAM_BOT } from '@constants/models.ts';

export interface GlobalInfoProps {
    children?: ReactNode;
}

const GlobalConfig: FC<GlobalInfoProps> = ({ children }) => {
    const [models, setModels] = useState(defaultModels);
    const [streamProviders, setStreamProviders] = useState(STREAM_BOT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/config/json')
            .then(res => res.json())
            .then(res => {
                if (res && res.models) {
                    setModels(res.models);
                    const streamArray = [];
                    Object.keys(models).forEach((model) => {
                        if (models[model].webui.isStream !== false && !streamArray.includes(models[model].provider)) {
                            streamArray.push(models[model].provider);
                        }
                    });
                    if (Array.isArray(streamArray) && streamArray.length > 0) {
                        setStreamProviders(streamArray);
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const values = useMemo(() => ({
        models,
        streamProviders,
    }), [models]);

    return (
        <GlobalConfigContext.Provider value={values}>
            {!loading && children}
        </GlobalConfigContext.Provider>
    );
};

export default GlobalConfig;
