import React from 'react';
import './ButtonStyle.css'
const Button = (props) => {
    return (
        <button {...props} className={'button' + props.className}/>
    );
};

export default Button;