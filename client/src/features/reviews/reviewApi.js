import { baseApi } from '../../app/api/baseApi';

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query({
            query: (productId) => `/reviews/${productId}`,
            transformResponse: (response) => response.data,
            providesTags: (result) =>
                Array.isArray(result)
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Review', id: _id })),
                        { type: 'Review', id: 'LIST' },
                    ]
                    : [{ type: 'Review', id: 'LIST' }],
        }),
        checkReviewEligibility: builder.query({
            query: (productId) => `/reviews/check-eligibility/${productId}`,
            transformResponse: (response) => response.data,
            keepUnusedDataFor: 0,
        }),
        createReview: builder.mutation({
            query: (body) => ({
                url: '/reviews',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: 'Review', id: 'LIST' },
                { type: 'Product', id: productId },
                'Products',
            ],
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Review', 'Products', 'Product'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetReviewsQuery,
    useCreateReviewMutation,
    useDeleteReviewMutation,
    useCheckReviewEligibilityQuery,
} = reviewApi;
