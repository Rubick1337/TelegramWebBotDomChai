// src/components/TypeForm/TypeForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTelegram } from "../../hooks/useTelegram";
import { createType, editType } from '../../store/slice/productTypeSlice';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';

const TypeForm = ({ open, onClose, type, onSaveSuccess }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { isDark } = useTelegram();
    const dispatch = useDispatch();

    // Исправленный селектор - обращаемся к правильному состоянию
    const { createLoading, editLoading } = useSelector(state => state.types);

    useEffect(() => {
        if (type) {
            setName(type.name || '');
        } else {
            setName('');
        }
        setError('');
    }, [type, open]);

    const validateForm = () => {
        if (!name.trim()) {
            setError('Название обязательно');
            return false;
        }
        if (name.trim().length < 2) {
            setError('Название должно содержать минимум 2 символа');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const typeData = { name: name.trim() };

        if (type) {
            dispatch(editType({ id: type.id, typeData }))
                .unwrap()
                .then(() => {
                    onSaveSuccess('Тип успешно обновлен');
                    onClose();
                })
                .catch((error) => {
                    setError(error?.message || 'Ошибка при обновлении типа');
                });
        } else {
            dispatch(createType(typeData))
                .unwrap()
                .then(() => {
                    onSaveSuccess('Тип успешно создан');
                    onClose();
                })
                .catch((error) => {
                    setError(error?.message || 'Ошибка при создании типа');
                });
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    backgroundColor: isDark ? '#2d2d2d' : '#fff',
                }
            }}
        >
            <DialogTitle sx={{ color: isDark ? '#fff' : '#000' }}>
                {type ? 'Редактирование типа' : 'Создание типа'}
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Название типа"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!!error}
                            variant="outlined"
                            InputLabelProps={{
                                style: { color: isDark ? '#fff' : '#000' }
                            }}
                            InputProps={{
                                style: { color: isDark ? '#fff' : '#000' }
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={onClose}
                        sx={{ color: isDark ? '#fff' : '#000' }}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createLoading || editLoading}
                    >
                        {(createLoading || editLoading) ? (
                            <CircularProgress size={24} />
                        ) : (
                            type ? 'Сохранить' : 'Создать'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TypeForm;