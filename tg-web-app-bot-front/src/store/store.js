import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slice/productSlice';
import typeReducer from './slice/productTypeSlice';
import orderReducer from './slice/orderSlice';

const store = configureStore({
    reducer: {
        products: productReducer,
        types: typeReducer,
        orders: orderReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export default store;