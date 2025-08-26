import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTelegram } from "../../hooks/useTelegram";
import {
    fetchTypes,
    deleteType,
    clearError,
    clearSuccess
} from '../../store/slice/productTypeSlice';
import AdminTypeItem from "../AdminTypeItem/AdminTypeItem";
import TypeForm from "../TypeForm/TypeForm";
import {
    Pagination,
    Box,
    CircularProgress,
    Alert,
    Dialog,
    Snackbar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import './AdminTypeListStyle.css';

const AdminTypeList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearch, setTempSearch] = useState('');
    const [editType, setEditType] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });

    const searchInputRef = useRef(null);
    const { tg, isDark } = useTelegram();
    const dispatch = useDispatch();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    const { types, loading, error, success, deleteLoading } = useSelector(state => state.types);
    const limit = 6;

    // Функция для загрузки типов
    const loadTypes = useCallback(() => {
        const params = {
            limit,
            page: currentPage,
            search: searchQuery
        };
        dispatch(fetchTypes(params));
    }, [dispatch, currentPage, searchQuery, limit]);

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

    // Обработчик удаления типа
    const handleDelete = (typeId) => {
        dispatch(deleteType(typeId))
            .unwrap()
            .then(() => {
                setNotification({ open: true, message: 'Тип успешно удален', type: 'success' });
                setDeleteConfirm(null);
                // Перезагружаем список типов после удаления
                loadTypes();
            })
            .catch((error) => {
                setNotification({ open: true, message: `Ошибка удаления: ${error}`, type: 'error' });
            });
    };

    // Обработчик открытия формы редактирования
    const handleEdit = (type) => {
        setEditType(type);
        setIsFormOpen(true);
    };

    // Обработчик открытия формы создания
    const handleCreate = () => {
        setEditType(null);
        setIsFormOpen(true);
    };

    // Обработчик закрытия формы
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditType(null);
    };

    // Обработчик успешного сохранения
    const handleSaveSuccess = (message) => {
        setIsFormOpen(false);
        setEditType(null);
        setNotification({ open: true, message, type: 'success' });

        // Перезагружаем список типов после создания/редактирования
        loadTypes();
    };

    // Загружаем типы при монтировании компонента и при изменении параметров
    useEffect(() => {
        loadTypes();
    }, [loadTypes]);

    // Обработка ошибок и успешных операций
    useEffect(() => {
        if (error) {
            setNotification({ open: true, message: error, type: 'error' });
            dispatch(clearError());
        }

        if (success) {
            dispatch(clearSuccess());
        }
    }, [error, success, dispatch]);

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

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(types.count / limit);

    if (loading && currentPage === 1) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div
            className="admin-type-list-container"
            style={{
                backgroundColor: isDark ? 'var(--tg-theme-bg-color, #212121)' : 'var(--tg-theme-bg-color, #ffffff)',
                color: isDark ? 'var(--tg-theme-text-color, #ffffff)' : 'var(--tg-theme-text-color, #000000)'
            }}
        >
            {/* Заголовок и кнопка добавления */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Управление типами продуктов</h2>
                <button
                    onClick={handleCreate}
                    className="add-type-btn"
                    style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <AddIcon fontSize="small" />
                    Добавить тип
                </button>
            </Box>

            {/* Поиск */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Кастомный поиск */}
                <div className="custom-search-container">
                    <SearchIcon className="search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Поиск типов..."
                        value={tempSearch}
                        onChange={handleTempSearchChange}
                        onKeyPress={handleKeyPress}
                        onBlur={handleBlur}
                        className="custom-search-input"
                    />
                </div>
            </Box>

            <div className={'admin-type-list'}>
                {types.rows && types.rows.map(type => (
                    <AdminTypeItem
                        key={type.id}
                        type={type}
                        onEdit={handleEdit}
                        onDelete={() => setDeleteConfirm(type)}
                        className={'admin-type-item'}
                    />
                ))}
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

            {types.rows && types.rows.length === 0 && !loading && (
                <Box textAlign="center" p={4} sx={{ color: isDark ? '#ffffff' : '#000000' }}>
                    Типы продуктов отсутствуют
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

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                PaperProps={{
                    style: {
                        backgroundColor: isDark ? '#2d2d2d' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        padding: '20px',
                        borderRadius: '8px'
                    }
                }}
            >
                <Box p={2}>
                    <h3>Подтверждение удаления</h3>
                    <p>Вы уверены, что хотите удалить тип "{deleteConfirm?.name}"?</p>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: isDark ? '#fff' : '#000',
                                cursor: 'pointer'
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm.id)}
                            disabled={deleteLoading}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {deleteLoading ? <CircularProgress size={16} /> : 'Удалить'}
                        </button>
                    </Box>
                </Box>
            </Dialog>

            {/* Форма редактирования/создания типа */}
            <TypeForm
                open={isFormOpen}
                onClose={handleCloseForm}
                type={editType}
                onSaveSuccess={handleSaveSuccess}
            />

            {/* Уведомления */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={notification.type}
                    onClose={() => setNotification({ ...notification, open: false })}
                    sx={{
                        backgroundColor: isDark ? '#2d2d2d' : undefined,
                        color: isDark ? '#fff' : undefined
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminTypeList;