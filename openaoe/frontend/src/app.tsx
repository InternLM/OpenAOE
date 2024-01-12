import { GlobalLang } from '@/components/global-lang';
import './styles/index.less';
import 'sea-lion-ui/dist/index.css';
import RootRouter from '@routes/root.tsx';
import Header from '@/layout/header/header.tsx';

const App = () => {
    return (
        <GlobalLang>
            <Header />
            <RootRouter />
        </GlobalLang>
    );
};

export default App;
