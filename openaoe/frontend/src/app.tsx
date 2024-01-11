import { GlobalLang } from '@components/global-lang';
import './styles/index.less';
import 'sea-lion-ui/dist/index.css';
import RootRouter from '@routes/root.tsx';
import Header from '@/layout/header/header.tsx';

console.log(import.meta.env.VITE_NODE);
console.log(import.meta.env.VITE_COOKIE_DOMAIN);
console.log(import.meta.env.VITE_QUERY_URL);

const App = () => {
    return (
        <GlobalLang>
            <Header />
            <RootRouter />
        </GlobalLang>
    );
};

export default App;
