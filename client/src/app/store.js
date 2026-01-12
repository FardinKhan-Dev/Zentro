import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/authSlice';
import cartUIReducer from '../features/cart/cartSlice';
import { adminApi } from '../features/admin/adminApi';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cartUI: cartUIReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, adminApi.middleware),
});

export default store;
