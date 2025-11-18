import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
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
    verifyEmail: builder.mutation({
      query: ({ token }) => ({ url: `/auth/verify-email?token=${encodeURIComponent(token)}`, method: 'GET' }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshQuery,
  useRequestResetMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
} = authApi;
