import { baseApi } from '../../app/api/baseApi';

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create payment intent
        createPaymentIntent: builder.mutation({
            query: ({ orderId, currency = 'usd' }) => ({
                url: '/payments/create-intent',
                method: 'POST',
                body: { orderId, currency },
            }),
        }),
        // Request cancel/refund (might not be used in checkout flow but good to have)
        refundOrder: builder.mutation({
            query: ({ orderId, amount, reason }) => ({
                url: '/payments/refund',
                method: 'POST',
                body: { orderId, amount, reason },
            }),
        }),
        // Verify payment (manual check)
        verifyPayment: builder.mutation({
            query: ({ paymentIntentId, orderId }) => ({
                url: '/payments/verify',
                method: 'POST',
                body: { paymentIntentId, orderId },
            }),
            invalidatesTags: ['Cart', 'Orders'],
        }),
    }),
});

export const { useCreatePaymentIntentMutation, useRefundOrderMutation, useVerifyPaymentMutation } = paymentApi;
