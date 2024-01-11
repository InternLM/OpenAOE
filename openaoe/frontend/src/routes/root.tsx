import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from '@pages/chat/chat.tsx';

const RootRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Chat />} />
            </Routes>
        </BrowserRouter>
    );
};

export default RootRouter;
