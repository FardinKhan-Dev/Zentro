import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';

const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    // Additional slices will be added here (auth, cart, etc.)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
