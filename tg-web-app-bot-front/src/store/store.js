import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slice/productSlice';
import typeReducer from './slice/productTypeSlice';
import orderReducer from './slice/orderSlice';
import userReducer from './slice/userSlice';

const store = configureStore({
    reducer: {
        products: productReducer,
        types: typeReducer,
        orders: orderReducer,
        user: userReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export default store;