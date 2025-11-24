import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import cartUIReducer from '../features/cart/cartSlice';

const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    cartUI: cartUIReducer,
    // Additional slices will be added here (auth, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
