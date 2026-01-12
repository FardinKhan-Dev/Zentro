import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

/**
 * Admin API - RTK Query endpoints for admin operations
 * All endpoints protected with admin role
 */
export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery,
    tagTypes: ['AdminStats', 'Sales', 'Products', 'Orders', 'Users', 'Settings'],
    endpoints: (builder) => ({
        // Dashboard & Analytics
        getAdminStats: builder.query({
            query: () => '/admin/stats',
            providesTags: ['AdminStats'],
        }),

        getSalesAnalytics: builder.query({
            query: ({ startDate, endDate }) =>
                `/admin/analytics/sales?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Sales'],
        }),

        getProductAnalytics: builder.query({
            query: () => '/admin/analytics/products',
            providesTags: ['Products'],
        }),

        getUserAnalytics: builder.query({
            query: () => '/admin/analytics/users',
            providesTags: ['Users'],
        }),

        // Order Management
        getAllOrders: builder.query({
            query: ({ status, page = 1, limit = 20, search } = {}) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                params.append('page', page);
                params.append('limit', limit);
                if (search) params.append('search', search);

                return `/admin/orders?${params.toString()}`;
            },
            providesTags: ['Orders'],
        }),

        updateOrderStatus: builder.mutation({
            query: ({ orderId, status, notes, paymentStatus, trackingNumber }) => ({
                url: `/admin/orders/${orderId}/status`,
                method: 'PATCH',
                body: { status, notes, paymentStatus, trackingNumber },
            }),
            invalidatesTags: ['Orders', 'AdminStats'],
        }),

        syncOrderWithCourier: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/sync-courier`,
                method: 'POST',
            }),
            invalidatesTags: ['Orders'],
        }),

        // User Management
        getAllUsers: builder.query({
            query: ({ page = 1, limit = 20, search, role } = {}) => {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('limit', limit);
                if (search) params.append('search', search);
                if (role) params.append('role', role);

                if (role) params.append('role', role);

                return `/admin/users?${params.toString()}`;
            },
            providesTags: ['Users'],
        }),

        getUserDetails: builder.query({
            query: (userId) => `/admin/users/${userId}`,
            providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
        }),

        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `/admin/users/${userId}/role`,
                method: 'PATCH',
                body: { role },
            }),
            invalidatesTags: ['Users'],
        }),

        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),

        // AI Service
        generateDescription: builder.mutation({
            query: (data) => ({
                url: '/ai/generate-description',
                method: 'POST',
                body: data,
            }),
        }),

        generateTags: builder.mutation({
            query: (data) => ({
                url: '/ai/generate-tags',
                method: 'POST',
                body: data,
            }),
        }),

        // Platform Settings
        getPlatformSettings: builder.query({
            query: () => '/settings',
            providesTags: ['Settings'],
        }),

        updatePlatformSettings: builder.mutation({
            query: (data) => ({
                url: '/settings',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetSalesAnalyticsQuery,
    useGetProductAnalyticsQuery,
    useGetUserAnalyticsQuery,
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation,
    useSyncOrderWithCourierMutation,
    useGetAllUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useGenerateDescriptionMutation,
    useGenerateTagsMutation,
    useGetPlatformSettingsQuery,
    useUpdatePlatformSettingsMutation,
} = adminApi;
