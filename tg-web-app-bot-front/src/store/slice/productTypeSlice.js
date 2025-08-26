// store/slice/typeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductTypeService from '../../service/ProductTypeService';

// Асинхронные действия
export const fetchTypes = createAsyncThunk(
    'types/fetchTypes',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log(params)
            const response = await ProductTypeService.fetchTypes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchTypeById = createAsyncThunk(
    'types/fetchTypeById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await ProductTypeService.getTypeById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createType = createAsyncThunk(
    'types/createType',
    async (typeData, { rejectWithValue }) => {
        try {
            const response = await ProductTypeService.createType(typeData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const editType = createAsyncThunk(
    'types/editType',
    async ({ id, typeData }, { rejectWithValue }) => {
        try {
            const response = await ProductTypeService.editType(id, typeData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteType = createAsyncThunk(
    'types/deleteType',
    async (id, { rejectWithValue }) => {
        try {
            console.log(id);
            await ProductTypeService.deleteType(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    types: [],
    currentType: null,
    loading: false,
    error: null,
    success: false,
    createLoading: false,
    editLoading: false,
    deleteLoading: false
};

const typeSlice = createSlice({
    name: 'types',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearCurrentType: (state) => {
            state.currentType = null;
        },
        resetTypeState: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Получение списка типов
            .addCase(fetchTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.types = action.payload;
            })
            .addCase(fetchTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Получение типа по ID
            .addCase(fetchTypeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTypeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentType = action.payload;
            })
            .addCase(fetchTypeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Создание типа
            .addCase(createType.pending, (state) => {
                state.createLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createType.fulfilled, (state, action) => {
                state.createLoading = false;
                state.success = true;
                // Убрано прямое добавление в массив
            })
            .addCase(createType.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Редактирование типа
            .addCase(editType.pending, (state) => {
                state.editLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(editType.fulfilled, (state, action) => {
                state.editLoading = false;
                state.success = true;
                // Убрано прямое обновление в массиве

                if (state.currentType && state.currentType.id === action.payload.id) {
                    state.currentType = action.payload;
                }
            })
            .addCase(editType.rejected, (state, action) => {
                state.editLoading = false;
                state.error = action.payload;
            })

            // Удаление типа
            .addCase(deleteType.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteType.fulfilled, (state, action) => {
                state.deleteLoading = false;
                // Убрано прямое удаление из массива
                if (state.currentType && state.currentType.id === action.payload) {
                    state.currentType = null;
                }
            })
            .addCase(deleteType.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearError,
    clearSuccess,
    clearCurrentType,
    resetTypeState
} = typeSlice.actions;

export default typeSlice.reducer;