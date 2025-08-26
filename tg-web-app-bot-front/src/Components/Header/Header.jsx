import React from 'react';
import Button from "../Button/Button";
import {useTelegram} from "../../hooks/useTelegram";
import "./HeaderStyle.css"

const tg = window.Telegram.WebApp;
const Header = () => {
    const{tg,user,onClose} = useTelegram();
    return (
        <div className={'header'}>
            <span className={'username'}>
                {user?.username}
            </span>
            <div className={"cart"}></div>
        </div>
    );
};

export default Header;