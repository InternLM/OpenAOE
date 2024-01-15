import RootRouter from '@routes/root.tsx';
import { GlobalLang } from '@/components/global-lang';
import Header from '@/layout/header/header.tsx';
import './styles/index.less';
import 'sea-lion-ui/dist/index.css';

const App = () => {
    return (
        <GlobalLang>
            <Header />
            <RootRouter />
        </GlobalLang>
    );
};

export default App;
