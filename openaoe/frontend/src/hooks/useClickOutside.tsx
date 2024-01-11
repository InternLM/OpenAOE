import React, { RefObject, useEffect } from 'react';

const useClickOutside = (ref: RefObject<HTMLElement>, handler: React.MouseEventHandler) => {
    useEffect(() => {
        const clickHandler = (e) => {
            if (!ref.current || ref.current.contains(e.target as HTMLElement)) return;
            handler?.(e);
        };
        document.addEventListener('click', clickHandler, false);

        return () => {
            document.removeEventListener('click', clickHandler, false);
        };
    }, [ref, handler]);
};

export default useClickOutside;
