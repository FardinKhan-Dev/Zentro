import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  credentials: 'include', // Include cookies in requests
  prepareHeaders: (headers, { getState }) => {
    // Add custom headers if needed
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    // Endpoints will be defined in feature slices
  }),
});
