import {
    FC, ReactNode, useEffect, useRef, useState
} from 'react';
import { useClickOutside } from 'sea-lion-ui';
import classNames from 'classnames';
import styles from './dropdown.module.less';

export interface Item {
    key: string;
    label: ReactNode;
}
interface MenuProps {
    items: Item[];
    onClick?: ({ key }) => void;
}
export interface DropdownProps {
    content?: ReactNode;
    theme?: 'light' | 'dark';
    menu?: MenuProps;
    className?: string;
    placement?: 'right-bottom' | 'left-bottom' | 'left-top' | 'right-top';
    trigger?: ('click' | 'hover')[];
    children?: ReactNode;
}

const Dropdown: FC<DropdownProps> = (props) => {
    const {
        children,
        content: dropdown,
        placement = 'bottom-right',
        className,
        theme = 'light',
        menu,
        trigger = ['hover'],
    } = props;
    const wrapperRef = useRef(null);
    const ref = useRef(null);
    const gap = 0;

    const [selectedItem, setSelectedItem] = useState('');
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState({
        bottom: undefined,
        right: undefined,
        top: undefined,
        left: undefined,
    });

    const handleOpen = () => {
        if (!ref.current) {
            return;
        }
        const {
            right, top, left, bottom
        } = ref.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setRect({
            top: placement.includes('bottom') ? bottom + gap : undefined,
            left: placement.includes('left') ? left : undefined,
            bottom: placement.includes('top') ? windowHeight - top + gap : undefined,
            right: placement.includes('right') ? windowWidth - right : undefined,
        });
        setOpen(true);
    };

    const handleMouseEnter = () => {
        if (trigger.includes('hover')) {
            handleOpen();
        }
    };

    const handleClick = () => {
        if (trigger.includes('click')) {
            handleOpen();
        }
    };

    const handleMouseLeave = (e) => {
        if (trigger.includes('hover')) {
            if (!wrapperRef.current?.contains(e.nativeEvent.relatedTarget as HTMLElement)) {
                setOpen(false);
            }
        }
    };

    useClickOutside(wrapperRef, () => {
        if (trigger.includes('click')) {
            setOpen(false);
        }
    });

    useEffect(() => {
        // re-calculate the position when the scroll event triggered
        const handleScroll = () => {
            if (open) {
                handleOpen();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [open]);

    return (
        <div
            style={{ display: 'contents' }}
            ref={wrapperRef}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            <div
                ref={ref}
                onClick={handleClick}
                style={{ display: 'inline-block' }}
            >
                {children}
            </div>
            {open && (
                <div
                    className={classNames(styles.dropdown, {
                        [styles.light]: theme === 'light',
                        [styles.dark]: theme === 'dark',
                    }, className)}
                    style={{ ...rect }}
                >
                    {menu && Array.isArray(menu.items) && menu.items.map((item) => (
                        <div
                            className={classNames(styles.menuItem, { [styles.selected]: item.key === selectedItem })}
                            key={item.key}
                            onClick={() => {
                                if (menu.onClick) {
                                    menu.onClick({
                                        key: item.key,
                                    });
                                }
                                setSelectedItem(item.key);
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                    {!menu && dropdown}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
