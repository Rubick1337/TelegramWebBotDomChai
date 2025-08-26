import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../../store/slice/orderSlice';
import './UserOrders.css';

const UserOrders = () => {
    const dispatch = useDispatch();
    const { orders, loading, error, pagination, updateLoading } = useSelector(state => state.orders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [statusFilter, setStatusFilter] = useState('all');

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = user?.role === 'admin';
    const userId = user?.id;

    const filteredOrders = React.useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [orders, statusFilter]);

    useEffect(() => {
        if (isAdmin) {
            // Для админа загружаем все заказы
            const params = { page: 1, limit: 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            dispatch(fetchOrders(params));
        } else if (userId) {
            // Для пользователя загружаем только его заказы
            const params = { userId, page: 1, limit: 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            dispatch(fetchOrders(params));
        }
    }, [dispatch, userId, statusFilter, isAdmin]);

    useEffect(() => {
        if (error) showSnackbar(error, 'error');
    }, [error]);

    const showSnackbar = (message, severity = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const handlePageChange = (event, page) => {
        if (isAdmin) {
            const params = { page, limit: pagination?.limit || 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            dispatch(fetchOrders(params));
        } else if (userId) {
            const params = { userId, page, limit: pagination?.limit || 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            dispatch(fetchOrders(params));
        }
    };

    const handleStatusFilterChange = (event) => setStatusFilter(event.target.value);

    const handleOrderClick = async (order) => {
        try {
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (error) {
            showSnackbar('Ошибка при загрузке заказа', 'error');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedOrder) return;

        try {
            await dispatch(updateOrderStatus({
                id: selectedOrder.id,
                status: newStatus
            })).unwrap();

            showSnackbar('Статус заказа обновлен', 'success');

            // Обновляем выбранный заказ
            setSelectedOrder(prev => ({
                ...prev,
                status: newStatus
            }));

            // Обновляем список заказов
            if (isAdmin) {
                const params = { page: pagination?.currentPage || 1, limit: pagination?.limit || 10 };
                if (statusFilter !== 'all') params.status = statusFilter;
                dispatch(fetchOrders(params));
            }

        } catch (error) {
            showSnackbar('Ошибка при обновлении статуса', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Ожидание',
            processing: 'В обработке',
            delivered: 'Доставлен',
            cancelled: 'Отменен'
        };
        return statusMap[status] || status;
    };

    const getStatusColorClass = (status) => {
        const colorMap = {
            pending: 'status-pending',
            processing: 'status-processing',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled'
        };
        return colorMap[status] || 'status-default';
    };

    const getFirstProductImage = (order) => {
        if (order.order_items?.[0]?.product?.img) {
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/${order.order_items[0].product.img}`;
        }
        return null;
    };

    if (loading && orders.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="auth-alert">
                Пожалуйста, войдите в систему
            </div>
        );
    }

    return (
        <div className="user-orders-container">
            {/* Заголовок и фильтр */}
            <div className="order-header">
                <div>
                    <h1 className="order-title">
                        {isAdmin ? 'Все заказы' : 'Мои заказы'}
                    </h1>
                    <p className="order-subtitle">
                        Добро пожаловать, {user.username}! {isAdmin && '(Администратор)'}
                    </p>
                </div>

                <div className="filter-container">
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="filter-select"
                    >
                        <option value="all">Все статусы</option>
                        <option value="pending">Ожидание</option>
                        <option value="processing">В обработке</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменен</option>
                    </select>
                    <span className="filter-icon">⚡</span>
                </div>
            </div>

            {/* Список заказов */}
            {filteredOrders.length === 0 ? (
                <div className="empty-orders">
                    <div className="empty-icon">🛍️</div>
                    <h2 className="empty-title">
                        {statusFilter === 'all' ? 'Заказы не найдены' : 'Заказы с таким статусом не найдены'}
                    </h2>
                    <p className="empty-text">
                        {statusFilter === 'all'
                            ? (isAdmin ? 'В системе пока нет заказов' : 'Совершите первую покупку, чтобы увидеть здесь свои заказы')
                            : 'Попробуйте выбрать другой статус'
                        }
                    </p>
                </div>
            ) : (
                <div>
                    {filteredOrders.map((order) => {
                        const imageUrl = getFirstProductImage(order);
                        return (
                            <div
                                key={order.id}
                                onClick={() => handleOrderClick(order)}
                                className="order-card"
                            >
                                <div className="order-content">
                                    <div className="order-grid" style={{
                                        gridTemplateColumns: imageUrl ? '80px 1fr auto' : '1fr auto'
                                    }}>
                                        {/* Изображение товара */}
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt="Товар"
                                                className="order-image"
                                            />
                                        )}

                                        {/* Информация о заказе */}
                                        <div>
                                            <div className="order-info">
                                                <span className="order-icon">📋</span>
                                                <h3 className="order-number">Заказ #{order.id}</h3>
                                            </div>

                                            {isAdmin && order.user && (
                                                <div className="user-info" style={{ marginBottom: '8px' }}>
                                                    <span style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        👤 <strong>{order.user.username}</strong>
                                                        {order.user.email && ` (${order.user.email})`}
                                                    </span>
                                                </div>
                                            )}

                                            <p className="order-date">
                                                📅 {formatDate(order.date || order.createdAt)}
                                            </p>

                                            <p className="order-items-count">
                                                🛍️ Товаров: {order.order_items?.length || 0}
                                            </p>

                                            {isAdmin && order.shippingAddress && (
                                                <p className="order-address" style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>
                                                    📍 {order.shippingAddress}
                                                </p>
                                            )}
                                        </div>

                                        {/* Сумма и статус */}
                                        <div style={{ textAlign: 'right' }}>
                                            <h2 className="order-amount">
                                                {parseFloat(order.totalAmount || 0).toLocaleString('ru-RU')} ₽
                                            </h2>

                                            <span
                                                className={`status-chip ${getStatusColorClass(order.status)}`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Пагинация */}
                    {pagination?.totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-buttons">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(null, page)}
                                        className={`pagination-button ${pagination.currentPage === page ? 'active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Модальное окно с деталями заказа */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* Заголовок модального окна */}
                        <div className="modal-header">
                            <div className="modal-title">
                                <span style={{ marginRight: '12px' }}>🚚</span>
                                <h2 style={{ margin: 0 }}>Заказ #{selectedOrder?.id}</h2>
                                {isAdmin && selectedOrder?.user && (
                                    <span style={{ marginLeft: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                        👤 {selectedOrder.user.username}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Содержимое модального окна */}
                        <div className="modal-body">
                            {selectedOrder && (
                                <div className="modal-grid">
                                    {/* Информация о заказе */}
                                    <div className="info-paper">
                                        <h3 className="section-title">📋 Информация о заказе</h3>

                                        {isAdmin && selectedOrder.user && (
                                            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                <h4 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '1rem' }}>
                                                    👤 Информация о пользователе
                                                </h4>
                                                <div style={{ display: 'grid', gap: '6px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#666', fontWeight: 'bold' }}>Имя пользователя:</span>
                                                        <span>{selectedOrder.user.username}</span>
                                                    </div>
                                                    {selectedOrder.user.email && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#666', fontWeight: 'bold' }}>Email:</span>
                                                            <span>{selectedOrder.user.email}</span>
                                                        </div>
                                                    )}
                                                    {selectedOrder.user.adress && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#666', fontWeight: 'bold' }}>Адрес:</span>
                                                            <span>{selectedOrder.user.adress}</span>
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#666', fontWeight: 'bold' }}>Роль:</span>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            backgroundColor: selectedOrder.user.role === 'admin' ? '#667eea' : '#28a745',
                                                            color: 'white',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {selectedOrder.user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="info-row">
                                            <span className="info-label">Статус:</span>
                                            <span
                                                className={`status-chip ${getStatusColorClass(selectedOrder.status)}`}
                                            >
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </div>

                                        {isAdmin && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <p style={{ color: '#666', margin: '0 0 8px 0' }}>
                                                    Изменить статус:
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {['pending', 'processing', 'delivered', 'cancelled'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(status)}
                                                            disabled={updateLoading || selectedOrder.status === status}
                                                            style={{
                                                                padding: '6px 12px',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                backgroundColor: selectedOrder.status === status ? '#667eea' : '#f0f0f0',
                                                                color: selectedOrder.status === status ? 'white' : '#333',
                                                                cursor: updateLoading ? 'not-allowed' : 'pointer',
                                                                fontSize: '0.8rem',
                                                                opacity: updateLoading ? 0.6 : 1
                                                            }}
                                                        >
                                                            {getStatusText(status)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '16px' }}>
                                            <p style={{ color: '#666', margin: '0 0 4px 0' }}>
                                                Дата создания:
                                            </p>
                                            <p style={{ margin: 0 }} className="data-order">
                                                {formatDate(selectedOrder.date || selectedOrder.createdAt)}
                                            </p>
                                        </div>

                                        <div>
                                            <p style={{ color: '#666', margin: '0 0 4px 0' }}>
                                                Общая сумма:
                                            </p>
                                            <p className="amount-text">
                                                {parseFloat(selectedOrder.totalAmount || 0).toLocaleString('ru-RU')} ₽
                                            </p>
                                        </div>
                                    </div>

                                    {/* Адрес доставки */}
                                    <div className="info-paper">
                                        <h3 className="section-title">📍 Адрес доставки</h3>
                                        <p className="address-text">
                                            {selectedOrder.shippingAddress || 'Адрес не указан'}
                                        </p>
                                    </div>

                                    {/* Товары в заказе */}
                                    <div className="info-paper">
                                        <h3 className="section-title">
                                            🛒 Товары в заказе ({selectedOrder.order_items?.length || 0})
                                        </h3>

                                        <div>
                                            {selectedOrder.order_items?.map((item, index) => {
                                                const product = item.product;
                                                const imageUrl = product?.img ?
                                                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/${product.img}` : null;

                                                return (
                                                    <div key={item.id || index}>
                                                        <div className="item-container">
                                                            {imageUrl && (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={product?.name}
                                                                    className="order-image"
                                                                />
                                                            )}

                                                            <div style={{ flex: 1 }}>
                                                                <h4 className="item-name">
                                                                    {product?.name || `Товар #${item.productId}`}
                                                                </h4>

                                                                <p className="item-detail">
                                                                    Количество: {item.quantity} шт.
                                                                </p>
                                                                <p className="item-detail">
                                                                    Цена: {parseFloat(item.price || 0).toLocaleString('ru-RU')} ₽
                                                                </p>
                                                                <p className="item-total">
                                                                    Итого: {(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                                                                </p>
                                                                {product?.description && (
                                                                    <p className="item-description">
                                                                        {product.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {index < selectedOrder.order_items.length - 1 && (
                                                            <hr className="item-divider" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Футер модального окна */}
                        <div className="modal-footer">
                            <button
                                onClick={closeModal}
                                className="close-button"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Уведомления */}
            {snackbarOpen && (
                <div className={`snackbar snackbar-${snackbarSeverity}`}>
                    <span>{snackbarMessage}</span>
                    <button
                        onClick={handleCloseSnackbar}
                        className="snackbar-close"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserOrders;