import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

const initialState = {
    user: null,
    isAuthenticated: false,
    authDrawerOpen: false,
    authView: 'login',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        openAuthDrawer: (state, action) => {
            state.authDrawerOpen = true;
            state.authView = action.payload || 'login';
        },
        closeAuthDrawer: (state) => {
            state.authDrawerOpen = false;
        },
        switchAuthView: (state, action) => {
            state.authView = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload.data;
                    state.isAuthenticated = true;
                    state.authDrawerOpen = false;
                }
            )

            .addMatcher(
                authApi.endpoints.getMe.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload.data;
                    state.isAuthenticated = true;
                }
            );
    },
});

export const { setCredentials, logout, updateUser, openAuthDrawer, closeAuthDrawer, switchAuthView } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthDrawerOpen = (state) => state.auth.authDrawerOpen;
export const selectAuthView = (state) => state.auth.authView;

export default authSlice.reducer;
