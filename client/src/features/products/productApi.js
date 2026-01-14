import { baseApi } from '../../app/api/baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, limit = 20, q = '', category = '', sort = '' } = {}) => {
        let url = `/products?page=${page}&limit=${limit}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (sort) url += `&sort=${encodeURIComponent(sort)}`;
        return { url, method: 'GET' };
      },
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => ({ url: `/products/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }, 'Products'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
