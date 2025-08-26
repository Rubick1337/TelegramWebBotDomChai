import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../service/ProductService';

// Асинхронные действия
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            console.log(params)
            const response = await ProductService.fetchProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await ProductService.getProductById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await ProductService.createProduct(formData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при создании товара');
        }
    }
);

// Редактирование продукта
export const editProduct = createAsyncThunk(
    'products/editProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await ProductService.editProduct(id, productData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении товара');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await ProductService.deleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    products: [],
    currentProduct: null,
    totalCount: 0,
    loading: false,
    error: null,
    success: false,
    createLoading: false,
    editLoading: false,
    deleteLoading: false
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        resetProductState: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Получение списка продуктов
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.rows || action.payload.items || [];
                state.totalCount = action.payload.count || action.payload.total || 0;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Получение продукта по ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Создание продукта
            .addCase(createProduct.pending, (state) => {
                state.createLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.createLoading = false;
                state.success = true;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Редактирование продукта
            .addCase(editProduct.pending, (state) => {
                state.editLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(editProduct.fulfilled, (state, action) => {
                state.editLoading = false;
                state.success = true;
                const index = state.products.findIndex(product => product.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                if (state.currentProduct && state.currentProduct.id === action.payload.id) {
                    state.currentProduct = action.payload;
                }
            })
            .addCase(editProduct.rejected, (state, action) => {
                state.editLoading = false;
                state.error = action.payload;
            })

            // Удаление продукта
            .addCase(deleteProduct.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.products = state.products.filter(product => product.id !== action.payload);
                if (state.currentProduct && state.currentProduct.id === action.payload) {
                    state.currentProduct = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearError,
    clearSuccess,
    clearCurrentProduct,
    resetProductState
} = productSlice.actions;

export default productSlice.reducer;