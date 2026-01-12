import { baseApi } from '../../app/api/baseApi';

/**
 * Order API Slice - RTK Query integration for order operations
 */
export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /api/orders - Create new order
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: ['Cart', 'Orders'],
        }),

        // GET /api/orders - Get user's orders with pagination
        getUserOrders: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `/orders?page=${page}&limit=${limit}`,
            providesTags: ['Orders'],
        }),

        // GET /api/orders/:id - Get specific order by ID
        getOrderById: builder.query({
            query: (orderId) => `/orders/${orderId}`,
            providesTags: (result, error, orderId) => [{ type: 'Orders', id: orderId }],
        }),

        // POST /api/orders/:id/cancel - Cancel order
        cancelOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/orders/${orderId}/cancel`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (result, error, { orderId }) => [{ type: 'Orders', id: orderId }, 'Orders'],
        }),

        // POST /api/orders/:id/confirm-cod
        confirmCodOrder: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/confirm-cod`,
                method: 'POST',
            }),
            invalidatesTags: ['Cart', 'Orders'],
        }),

        // POST /api/orders/:id/sync-courier
        syncOrderWithCourier: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/sync-courier`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, orderId) => [{ type: 'Orders', id: orderId }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateOrderMutation,
    useGetUserOrdersQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
    useConfirmCodOrderMutation,
    useSyncOrderWithCourierMutation,
} = orderApi;

export default orderApi;
