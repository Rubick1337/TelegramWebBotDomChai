// src/components/ProductList/ProductList.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTelegram } from "../../hooks/useTelegram";
import { fetchProducts } from '../../store/slice/productSlice';
import { fetchTypes } from '../../store/slice/productTypeSlice';
import ProductItem from "../ProductItem/ProductItem";
import {
    Pagination,
    Box,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './ProductListStyle.css';
import AdminProductItem from "../AdminProductItem/AdminProductItem";

const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc + (Number(item.price) * (item.quantity || 1));
    }, 0);
}

const getTotalItemsCount = (items = []) => {
    return items.reduce((acc, item) => {
        return acc + (item.quantity || 1);
    }, 0);
}

const ProductList = () => {
    const [addedItems, setAddedItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('expensive');
    const [tempSearch, setTempSearch] = useState('');

    const searchInputRef = useRef(null);
    const { tg, queryId, isDark } = useTelegram();
    const dispatch = useDispatch();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    const { products, loading, error, totalCount } = useSelector(state => state.products);
    const { types, loading: typesLoading } = useSelector(state => state.types);
    const limit = 6;

    const paginationStyles = {
        '& .MuiPaginationItem-root': {
            margin: '0 2px',
            minWidth: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            borderRadius: '50%',
            fontSize: isMobile ? '12px' : '14px',
            color: isDark ? '#ffffff !important' : '#000000 !important',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.3) !important' : 'rgba(0, 0, 0, 0.3) !important',
            '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1) !important' : 'rgba(0, 91, 255, 0.1) !important',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.5) !important' : 'rgba(0, 91, 255, 0.3) !important',
            },
            '&.Mui-selected': {
                backgroundColor: isDark ? '#1976d2 !important' : '#1976d2 !important',
                color: '#ffffff !important',
                border: 'none !important',
                '&:hover': {
                    backgroundColor: isDark ? '#1565c0 !important' : '#1565c0 !important',
                }
            },
            '&.Mui-disabled': {
                color: isDark ? 'rgba(255, 255, 255, 0.3) !important' : 'rgba(0, 0, 0, 0.3) !important',
            }
        },
        '& .MuiPagination-ul': {
            justifyContent: 'center',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
        }
    };

    // Функция для отправки данных
    // Функция для отправки данных
    const onSendData = useCallback(async () => {
        try {
            const data = {
                products: addedItems,
                totalPrice: getTotalPrice(addedItems),
                queryId,
                chatId: tg.initDataUnsafe?.user?.id || tg.initDataUnsafe?.chat?.id
            };

            console.log('Отправка данных:', data);

            const response = await fetch('http://localhost:8000/web-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                if (result.status === 'confirmation_sent') {
                    setAddedItems([]);
                    tg.MainButton.hide();
                    tg.close();
                }
            } else {
                // Обработка ошибки авторизации
                if (result.error === 'not_authenticated') {
                    tg.showAlert('❌ Для оформления заказа необходимо авторизоваться в боте!');
                } else {
                    tg.showAlert('Ошибка при оформлении заказа: ' + (result.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            tg.showAlert('Произошла ошибка при отправке данных');
        }
    }, [addedItems, queryId, tg]);

    // Обработчик клика по кнопке "Добавить в корзину"
    const onAdd = (product, quantity = 1) => {
        const existingItemIndex = addedItems.findIndex(item => item.id === product.id);
        let newItems = [];

        if (existingItemIndex !== -1) {
            // Если товар уже в корзине, обновляем количество
            newItems = addedItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: (item.quantity || 1) + quantity }
                    : item
            );
        } else {
            // Добавляем новый товар с количеством
            newItems = [...addedItems, {
                ...product,
                quantity: quantity
            }];
        }

        setAddedItems(newItems);

        if (newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            const totalPrice = getTotalPrice(newItems);
            const totalItems = getTotalItemsCount(newItems);

            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Купить ${totalItems} шт. за ${totalPrice} ₽`
            });
        }
    }

    // Функция для удаления товара из корзины
    const onRemove = (productId) => {
        const newItems = addedItems.filter(item => item.id !== productId);
        setAddedItems(newItems);

        if (newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            const totalPrice = getTotalPrice(newItems);
            const totalItems = getTotalItemsCount(newItems);

            tg.MainButton.setParams({
                text: `Купить ${totalItems} шт. за ${totalPrice} ₽`
            });
        }
    }

    // Функция для изменения количества товара в корзине
    const onUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            onRemove(productId);
            return;
        }

        const newItems = addedItems.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        );

        setAddedItems(newItems);

        const totalPrice = getTotalPrice(newItems);
        const totalItems = getTotalItemsCount(newItems);

        tg.MainButton.setParams({
            text: `Купить ${totalItems} шт. за ${totalPrice} ₽`
        });
    }

    // Настройка кнопки Telegram
    useEffect(() => {
        if (addedItems.length > 0) {
            const totalPrice = getTotalPrice(addedItems);
            const totalItems = getTotalItemsCount(addedItems);

            tg.MainButton.setParams({
                text: `Купить ${totalItems} шт. за ${totalPrice} ₽`,
                color: '#1976d2'
            });
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    }, [addedItems, tg]);

    // Обработчик события клика по кнопке
    useEffect(() => {
        const handleMainButtonClick = () => {
            onSendData();
        };

        tg.onEvent('mainButtonClicked', handleMainButtonClick);

        return () => {
            tg.offEvent('mainButtonClicked', handleMainButtonClick);
        };
    }, [tg, onSendData]);

    // Загружаем типы продуктов при монтировании компонента
    useEffect(() => {
        dispatch(fetchTypes());
    }, [dispatch]);

    useEffect(() => {
        const params = {
            limit,
            page: currentPage,
            search: searchQuery,
            productTypeId: selectedCategory,
            sortOrder: sortOrder === 'expensive' ? 'desc' : 'asc'
        };
        console.log('Отправляемые параметры:', params);
        dispatch(fetchProducts(params));
    }, [dispatch, currentPage, searchQuery, selectedCategory, sortOrder]);

    useEffect(() => {
        setTempSearch(searchQuery);
    }, [searchQuery]);

    const handleTempSearchChange = (e) => {
        setTempSearch(e.target.value);
    };

    const applySearch = () => {
        if (tempSearch !== searchQuery) {
            setSearchQuery(tempSearch);
            setCurrentPage(1);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            applySearch();
            searchInputRef.current?.blur();
        }
    };

    const handleBlur = () => {
        applySearch();
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(totalCount / limit);

    if (loading && currentPage === 1) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ margin: 2 }}>
                Ошибка загрузки: {error}
            </Alert>
        );
    }

    return (
        <div
            className="product-list-container"
            style={{
                backgroundColor: isDark ? 'var(--tg-theme-bg-color, #212121)' : 'var(--tg-theme-bg-color, #ffffff)',
                color: isDark ? 'var(--tg-theme-text-color, #ffffff)' : 'var(--tg-theme-text-color, #000000)'
            }}
        >
            {/* Корзина */}
            {addedItems.length > 0 && (
                <Box sx={{
                    p: 2,
                    backgroundColor: isDark ? '#2d2d2d' : '#f0f8ff',
                    borderRadius: '8px',
                    margin: '10px',
                    border: isDark ? '1px solid #444' : '1px solid #d4e6f1'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: isDark ? '#fff' : '#333' }}>
                        🛒 Корзина ({getTotalItemsCount(addedItems)} товаров)
                    </h3>
                    {addedItems.map(item => (
                        <div key={item.id} style={{
                            marginBottom: '8px',
                            padding: '8px',
                            backgroundColor: isDark ? '#3d3d3d' : '#fff',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#333' }}>
                                    {item.name}
                                </div>
                                <div style={{ color: isDark ? '#ccc' : '#666', fontSize: '14px' }}>
                                    {item.price} ₽ × {item.quantity || 1} шт. = {(item.price * (item.quantity || 1))} ₽
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                    style={{
                                        width: '25px',
                                        height: '25px',
                                        border: '1px solid #ddd',
                                        background: isDark ? '#444' : '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: isDark ? '#fff' : '#333'
                                    }}
                                >
                                    -
                                </button>
                                <span style={{ minWidth: '30px', textAlign: 'center' }}>
                                    {item.quantity || 1}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                    style={{
                                        width: '25px',
                                        height: '25px',
                                        border: '1px solid #ddd',
                                        background: isDark ? '#444' : '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: isDark ? '#fff' : '#333'
                                    }}
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '4px 8px',
                                        border: 'none',
                                        background: '#ff6b6b',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))}
                    <div style={{
                        marginTop: '10px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: isDark ? '#fff' : '#333',
                        textAlign: 'right'
                    }}>
                        Итого: {getTotalPrice(addedItems)} ₽
                    </div>
                </Box>
            )}

            {/* Поиск и фильтры */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Кастомный поиск */}
                <div className="custom-search-container">
                    <SearchIcon className="search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Поиск товаров..."
                        value={tempSearch}
                        onChange={handleTempSearchChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        className="custom-search-input"
                    />
                </div>

                {/* Кастомный select для категории с динамическими типами */}
                <div className="custom-select-container">
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="custom-select"
                        disabled={typesLoading}
                    >
                        <option value="">Все категории</option>
                        {types.rows && types.rows.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    {typesLoading && (
                        <CircularProgress size={16} sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                </div>

                <div className="custom-select-container">
                    <select
                        value={sortOrder}
                        onChange={handleSortChange}
                        className="custom-select"
                    >
                        <option value="expensive">Сначала дорогие</option>
                        <option value="cheap">Сначала дешевые</option>
                    </select>
                </div>
            </Box>

            <div className={'product-list'}>
                {products.map(product => {
                    console.log(types)
                    const productType = types.rows.find(t => t.id === product.productTypeId);
                    const typeName = productType ? productType.name : 'Неизвестный тип';
                    console.log(productType)
                    console.log(typeName)
                    return (
                        <ProductItem
                            type = {typeName}
                            key={product.id}
                            product={product}
                            onAdd={onAdd}
                            className={'product-item'}
                            isAdded={addedItems.some(item => item.id === product.id)}
                        />
                    );
                })}
            </div>

            {totalPages > 1 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    p={2}
                    sx={{
                        mt: 2,
                        ...paginationStyles
                    }}
                >
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size={isMobile ? "small" : "medium"}
                    />
                </Box>
            )}

            {products.length === 0 && !loading && (
                <Box textAlign="center" p={4} sx={{ color: isDark ? '#ffffff' : '#000000' }}>
                    Продукты отсутствуют
                </Box>
            )}

            {loading && currentPage > 1 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={2}
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: isDark ? 'rgba(33, 33, 33, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        padding: '16px',
                        zIndex: 2000,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    <CircularProgress size={40} />
                </Box>
            )}
        </div>
    );
};

export default ProductList;