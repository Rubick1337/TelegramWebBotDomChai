// src/components/ProductForm/ProductForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, editProduct } from '../../store/slice/productSlice';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Box,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProductForm = ({ open, onClose, product, onSaveSuccess }) => {
    const dispatch = useDispatch();
    const { types } = useSelector(state => state.types);
    const { createLoading, editLoading, error } = useSelector(state => state.products);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        inStock: true,
        productTypeId: ''
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formError, setFormError] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    const fileInputRef = useRef(null);

    const typesArray = types?.rows || types || [];

    useEffect(() => {
        if (open && !isInitialized) {
            if (product) {
                console.log('Заполняем форму данными продукта:', product);
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    inStock: product.inStock !== undefined ? product.inStock : true,
                    productTypeId: product.productTypeId || product.productType?.id || ''
                });

                if (product.img) {
                    setImagePreview(`${process.env.REACT_APP_API_BASE_URL}/${product.img}`);
                } else {
                    setImagePreview('');
                }
            } else {
                // Сброс формы для создания нового товара
                console.log('Сбрасываем форму для нового товара');
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    inStock: true,
                    productTypeId: ''
                });
                setImage(null);
                setImagePreview('');
            }
            setFormError('');
            setIsInitialized(true);
        }
    }, [open, product, isInitialized]);

    // Сбрасываем флаг инициализации при закрытии диалога
    useEffect(() => {
        if (!open) {
            setIsInitialized(false);
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);

            // Создаем превью изображения
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setFormError('Название товара обязательно');
            return false;
        }
        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            setFormError('Цена должна быть положительным числом');
            return false;
        }
        if (!formData.productTypeId) {
            setFormError('Выберите категорию');
            return false;
        }
        setFormError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('price', parseFloat(formData.price));
        submitData.append('inStock', formData.inStock);
        submitData.append('productTypeId', formData.productTypeId);

        if (image && typeof image !== 'string') {
            submitData.append('img', image);
        }

        console.log('Отправляемые данные:');
        for (let [key, value] of submitData.entries()) {
            console.log(key, value);
        }

        if (product) {
            console.log('Редактирование товара:', product.id);
            dispatch(editProduct({ id: product.id, productData: submitData }))
                .unwrap()
                .then(() => {
                    onSaveSuccess('Товар успешно обновлен');
                    onClose();
                })
                .catch(error => {
                    console.error('Ошибка при обновлении товара:', error);
                    setFormError(error || 'Ошибка при обновлении товара');
                });
        } else {
            // Создание нового товара
            dispatch(createProduct(submitData))
                .unwrap()
                .then(() => {
                    onSaveSuccess('Товар успешно создан');
                    onClose();
                })
                .catch(error => {
                    console.error('Ошибка при создании товара:', error);
                    setFormError(error || 'Ошибка при создании товара');
                });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {product ? 'Редактирование товара' : 'Создание нового товара'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formError}
                            </Alert>
                        )}

                        <TextField
                            label="Название товара"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                            error={!formData.name.trim()}
                        />

                        <TextField
                            label="Описание"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            label="Цена"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            error={!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0}
                        />

                        <FormControl fullWidth required error={!formData.productTypeId}>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                name="productTypeId"
                                value={formData.productTypeId}
                                onChange={handleChange}
                                label="Категория"
                            >
                                {/* Safe mapping with optional chaining */}
                                {typesArray.map(type => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="inStock"
                                    checked={formData.inStock}
                                    onChange={handleChange}
                                />
                            }
                            label="В наличии"
                        />

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                id="product-image-input"
                            />
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleUploadClick}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                {image ? 'Изменить изображение' : 'Загрузить изображение'}
                            </Button>

                            {imagePreview && (
                                <Box
                                    component="img"
                                    src={imagePreview}
                                    alt="Превью"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        display: 'block',
                                        marginTop: '10px',
                                        borderRadius: 1
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    display: 'flex',
                    gap: 1,
                    '& > :not(style) ~ :not(style)': {
                        marginLeft: 0
                    },
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    '@media (max-width: 394px)': {
                        '& .MuiButton-root': {
                            width: '100%',
                            maxWidth: '261px',

                        }
                    }
                }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            minWidth: { xs: '261px', sm: 'auto' },
                            width: { xs: '261px', sm: 'auto' },
                            '@media (max-width: 394px)': {
                                width: '261px !important',
                                maxWidth: '261px !important'
                            }
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createLoading || editLoading}
                        sx={{
                            maxHeight: "36px",
                            textWrap: 'nowrap',
                            minWidth: { xs: '261px', sm: 'auto' },
                            width: { xs: '261px', sm: 'auto' },
                            '@media (max-width: 394px)': {
                                width: '261px !important',
                                maxWidth: '261px !important'
                            }
                        }}
                    >
                        {(createLoading || editLoading) ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            product ? 'Сохранить изменения' : 'Создать товар'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProductForm;