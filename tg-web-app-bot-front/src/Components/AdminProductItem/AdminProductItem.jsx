import React from 'react';
import './AdminProductItemStyle.css';

const AdminProductItem = ({type, product, className, onEdit, onDelete }) => {
    return (
        <div className={'admin-product ' + className}>
            {product.img && (
                <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/${product.img}`}
                    alt={product.name}
                    className={'admin-product-img'}
                />
            )}
            <div className={'admin-product-info'}>
                <div className={'admin-product-title'}>{product.name}</div>
                <div className={'admin-product-title'}>{type}</div>
                <div className={'admin-product-description'}>{product.description}</div>
                <div className={'admin-product-price'}>
                    <span>Цена: <b>{product.price} ₽</b></span>
                </div>
                <div className={'admin-product-stock ' + (product.inStock ? 'in-stock' : 'out-of-stock')}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </div>
            </div>

            <div className="admin-product-actions">
                <button
                    onClick={() => onEdit(product)}
                    className="admin-product-edit-btn"
                    title="Редактировать"
                >
                    Изменить
                </button>
                <button
                    onClick={onDelete}
                    className="admin-product-delete-btn"
                    title="Удалить"
                >
                    Удалить
                </button>
            </div>
        </div>
    );
};

export default AdminProductItem;