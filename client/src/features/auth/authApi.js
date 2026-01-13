import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    verifyOTP: builder.mutation({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Reset entire RTK Query cache on logout
          dispatch(baseApi.util.resetApiState());
        } catch (err) {
          // Logout failed - don't reset cache
        }
      },
    }),
    refresh: builder.query({
      query: () => ({ url: '/auth/refresh', method: 'GET' }),
    }),
    requestReset: builder.mutation({
      query: (body) => ({ url: '/auth/request-reset', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    verifyEmail: builder.query({
      query: (token) => `/auth/verify-email/${token}`,
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    getMe: builder.query({
      query: () => ({ url: '/users/me', method: 'GET' }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    addAddress: builder.mutation({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({ url: `/users/me/addresses/${addressId}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation({
      query: ({ addressId, ...body }) => ({ url: `/users/me/addresses/${addressId}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOTPMutation,
  useLogoutMutation,
  useRefreshQuery,
  useRequestResetMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} = authApi;
