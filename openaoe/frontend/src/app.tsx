import RootRouter from '@routes/root.tsx';
import GlobalConfig from '@components/global-config';
import { GlobalLang } from '@/components/global-lang';
import Header from '@/layout/header/header.tsx';
import './styles/index.less';
import 'sea-lion-ui/dist/index.css';

const App = () => {
    return (
        <GlobalConfig>
            <GlobalLang>
                <Header />
                <RootRouter />
            </GlobalLang>
        </GlobalConfig>
    );
};

export default App;
