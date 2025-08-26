import React, { useState } from 'react';
import Button from "../Button/Button";
import './ProductItemStyle.css';

const ProductItem = ({ type,product, className, onAdd, isAdded }) => {
    const [quantity, setQuantity] = useState(1);

    const onAddHandler = () => {
        onAdd(product, quantity);
        setQuantity(1); // Сбрасываем количество после добавления
    }

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    }

    return (
        <div className={'product ' + className}>
            {product.img && (
                <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${product.img}`}
                    alt={product.name}
                    className={'product-img'}
                />
            )}
            <div className={'product-title'}>{product.name}</div>
            <div className={'product-title'}>{type}</div>
            <div className={'product-description'}>{product.description}</div>
            <div className={'product-price'}>
                <span>Стоимость: <b>{product.price} ₽</b></span>
            </div>
            <div className={'product-stock'}>
                {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </div>

            {product.inStock && (
                <div className="quantity-controls">
                    <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="quantity-btn"
                    >
                        -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                        onClick={incrementQuantity}
                        className="quantity-btn"
                    >
                        +
                    </button>
                </div>
            )}

            <Button
                className={'button ' + (isAdded ? 'added' : '')}
                onClick={onAddHandler}
                disabled={!product.inStock}
            >
                {isAdded ? '✓ В корзине' : `Добавить ${quantity} шт.`}
            </Button>
        </div>
    );
};

export default ProductItem;