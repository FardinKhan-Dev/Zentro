import { baseApi } from '../../app/api/baseApi';

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: (page = 1) => `/notifications?page=${page}&limit=10`,
            providesTags: ['Notifications'],
            merge: (currentCache, newItems, { arg: page }) => {
                if (page > 1) {
                    // Append if paginating (not strictly necessary if UI handles pages, but good for infinite scroll)
                    // For simplicity, we might just refetch or rely on UI state
                    // Actually, simplest is to just return newItems if we use per-page keys or simple list
                    return newItems;
                }
                return newItems;
            },
        }),
        getUnreadCount: builder.query({
            query: () => '/notifications/unread-count',
            providesTags: ['UnreadCount'],
        }),
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),
        markAllAsRead: builder.mutation({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApi;
