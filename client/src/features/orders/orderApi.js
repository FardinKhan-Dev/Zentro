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
            invalidatesTags: ['Cart'],
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
    }),
    overrideExisting: false,
});

export const {
    useCreateOrderMutation,
    useGetUserOrdersQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
} = orderApi;

export default orderApi;
