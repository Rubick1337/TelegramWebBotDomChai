    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    import OrderService from '../../service/OrderService';

    // Асинхронные действия
    export const fetchOrders = createAsyncThunk(
        'orders/fetchOrders',
        async (params = {}, { rejectWithValue }) => {
            try {
                const response = await OrderService.fetchOrders(params);
                return response;
            } catch (error) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
        }
    );

    export const fetchOrderById = createAsyncThunk(
        'orders/fetchOrderById',
        async (id, { rejectWithValue }) => {
            try {
                const response = await OrderService.getOrderById(id);
                return response;
            } catch (error) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
        }
    );

    export const createOrder = createAsyncThunk(
        'orders/createOrder',
        async (orderData, { rejectWithValue }) => {
            try {
                const response = await OrderService.createOrder(orderData);
                return response;
            } catch (error) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
        }
    );

    export const updateOrderStatus = createAsyncThunk(
        'orders/updateOrderStatus',
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const response = await OrderService.updateOrderStatus(id, status);
                return response;
            } catch (error) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
        }
    );

    const initialState = {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        success: false,
        createLoading: false,
        updateLoading: false,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10
        },
        filters: {
            status: '',
            search: ''
        }
    };

    const orderSlice = createSlice({
        name: 'orders',
        initialState,
        reducers: {
            clearError: (state) => {
                state.error = null;
            },
            clearSuccess: (state) => {
                state.success = false;
            },
            clearCurrentOrder: (state) => {
                state.currentOrder = null;
            },
            resetOrderState: () => initialState,
            setFilters: (state, action) => {
                state.filters = { ...state.filters, ...action.payload };
            },
            clearFilters: (state) => {
                state.filters = {
                    status: '',
                    search: ''
                };
            }
        },
        extraReducers: (builder) => {
            builder
                // Получение списка заказов
                .addCase(fetchOrders.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchOrders.fulfilled, (state, action) => {
                    state.loading = false;
                    state.orders = action.payload.orders;
                    state.pagination = {
                        currentPage: action.payload.currentPage,
                        totalPages: action.payload.totalPages,
                        totalCount: action.payload.totalCount,
                        limit: action.payload.limit || 10
                    };
                })
                .addCase(fetchOrders.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })

                // Получение заказа по ID
                .addCase(fetchOrderById.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchOrderById.fulfilled, (state, action) => {
                    state.loading = false;
                    state.currentOrder = action.payload;
                })
                .addCase(fetchOrderById.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })

                // Создание заказа
                .addCase(createOrder.pending, (state) => {
                    state.createLoading = true;
                    state.error = null;
                    state.success = false;
                })
                .addCase(createOrder.fulfilled, (state, action) => {
                    state.createLoading = false;
                    state.success = true;
                    state.orders.unshift(action.payload); // Добавляем в начало списка
                    state.pagination.totalCount += 1;
                })
                .addCase(createOrder.rejected, (state, action) => {
                    state.createLoading = false;
                    state.error = action.payload;
                })

                // Обновление статуса заказа
                .addCase(updateOrderStatus.pending, (state) => {
                    state.updateLoading = true;
                    state.error = null;
                })
                .addCase(updateOrderStatus.fulfilled, (state, action) => {
                    state.updateLoading = false;
                    // Обновляем заказ в списке
                    const index = state.orders.findIndex(order => order.id === action.payload.id);
                    if (index !== -1) {
                        state.orders[index] = action.payload;
                    }
                    // Обновляем текущий заказ если он открыт
                    if (state.currentOrder && state.currentOrder.id === action.payload.id) {
                        state.currentOrder = action.payload;
                    }
                })
                .addCase(updateOrderStatus.rejected, (state, action) => {
                    state.updateLoading = false;
                    state.error = action.payload;
                });
        }
    });

    export const {
        clearError,
        clearSuccess,
        clearCurrentOrder,
        resetOrderState,
        setFilters,
        clearFilters,
        addOrder,
        removeOrder
    } = orderSlice.actions;

    export default orderSlice.reducer;