import React from 'react';
import './AdminTypeItemStyle.css';

const AdminTypeItem = ({ type, onEdit, onDelete }) => {
    return (
        <div className="admin-type">
            <div className="admin-type-content">
                <h3 className="admin-type-title">{type.name}</h3>
                <div className="admin-type-actions">
                    <button
                        onClick={() => onEdit(type)}
                        className="admin-type-edit-btn"
                    >
                        Редактировать
                    </button>
                    <button
                        onClick={() => onDelete(type)}
                        className="admin-type-delete-btn"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTypeItem;