import { baseApi } from '../../app/api/baseApi';

/**
 * Cart API Slice - RTK Query integration for cart operations
 * Connects to Phase 5 backend cart endpoints
 */
export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/cart - Get user's cart
        getCart: builder.query({
            query: () => '/cart',
            providesTags: ['Cart'],
        }),

        // POST /api/cart/items - Add item to cart
        addToCart: builder.mutation({
            query: ({ productId, quantity }) => ({
                url: '/cart/items',
                method: 'POST',
                body: { productId, quantity },
            }),
            invalidatesTags: ['Cart'],
            // Optimistic update
            async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Update cart cache with new data
                    dispatch(
                        cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                            return data.data;
                        })
                    );
                } catch (error) {
                    // Handle error silently, invalidation will refetch
                }
            },
        }),

        // PATCH /api/cart/items/:productId - Update item quantity
        updateCartItem: builder.mutation({
            query: ({ productId, quantity }) => ({
                url: `/cart/items/${productId}`,
                method: 'PATCH',
                body: { quantity },
            }),
            invalidatesTags: ['Cart'],
            // Optimistic update
            async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        const item = draft.cart?.items?.find(
                            (item) => item.product._id === productId || item.product === productId
                        );
                        if (item) {
                            item.quantity = quantity;
                            // Recalculate total
                            const newTotal = draft.cart.items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                            );
                            draft.cart.totalPrice = newTotal;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        // DELETE /api/cart/items/:productId - Remove item from cart
        removeFromCart: builder.mutation({
            query: (productId) => ({
                url: `/cart/items/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
            // Optimistic update
            async onQueryStarted(productId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft.cart?.items) {
                            draft.cart.items = draft.cart.items.filter(
                                (item) => item.product._id !== productId && item.product !== productId
                            );
                            // Recalculate total
                            draft.cart.totalPrice = draft.cart.items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                            );
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        // DELETE /api/cart - Clear entire cart
        clearCart: builder.mutation({
            query: () => ({
                url: '/cart',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData('getCart', undefined, (draft) => {
                        if (draft.cart) {
                            draft.cart.items = [];
                            draft.cart.totalPrice = 0;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
    }),
    overrideExisting: false,
});

// Export hooks for usage in components
export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi;

export default cartApi;
