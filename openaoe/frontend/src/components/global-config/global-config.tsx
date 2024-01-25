import {
    FC, ReactNode, useEffect, useMemo, useState
} from 'react';
import { GlobalConfigContext } from '@components/global-config/global-config-context.tsx';
import { models as defaultModels } from '@config/model-config.ts';

export interface GlobalInfoProps {
    children?: ReactNode;
}

const GlobalConfig: FC<GlobalInfoProps> = ({ children }) => {
    const [models, setModels] = useState(defaultModels);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('/config/json')
            .then(res => res.json())
            .then(res => {
                if (res) {
                    setModels(res);
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
        models
    }), [models]);

    return (
        <GlobalConfigContext.Provider value={values}>
            {!loading && children}
        </GlobalConfigContext.Provider>
    );
};

export default GlobalConfig;
