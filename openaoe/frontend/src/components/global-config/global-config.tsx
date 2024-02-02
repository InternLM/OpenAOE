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
    const [streamModels, setStreamProviders] = useState(STREAM_BOT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/config/json')
            .then(res => res.json())
            .then(res => {
                if (res && typeof res.models === 'object') {
                    const rspModels = res.models;
                    const streamArray = [];
                    setModels(rspModels);
                    // stream status for every model
                    Object.keys(rspModels).forEach((model) => {
                        if (rspModels[model].webui.isStream !== false && !streamArray.includes(model)) {
                            streamArray.push(model);
                        }
                    });
                    if (streamArray.length > 0) {
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
        streamModels,
    }), [models]);

    return (
        <GlobalConfigContext.Provider value={values}>
            {!loading && children}
        </GlobalConfigContext.Provider>
    );
};

export default GlobalConfig;
