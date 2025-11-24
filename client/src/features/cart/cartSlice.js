import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart UI State Slice
 * Manages cart drawer visibility and local UI state
 */
const initialState = {
    isDrawerOpen: false,
    lastAddedProduct: null, // For showing "Added to cart" notification
};

const cartSlice = createSlice({
    name: 'cartUI',
    initialState,
    reducers: {
        openCartDrawer: (state) => {
            state.isDrawerOpen = true;
        },
        closeCartDrawer: (state) => {
            state.isDrawerOpen = false;
        },
        toggleCartDrawer: (state) => {
            state.isDrawerOpen = !state.isDrawerOpen;
        },
        setLastAddedProduct: (state, action) => {
            state.lastAddedProduct = action.payload;
        },
        clearLastAddedProduct: (state) => {
            state.lastAddedProduct = null;
        },
    },
});

export const {
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    setLastAddedProduct,
    clearLastAddedProduct,
} = cartSlice.actions;

// Selectors
export const selectIsCartDrawerOpen = (state) => state.cartUI.isDrawerOpen;
export const selectLastAddedProduct = (state) => state.cartUI.lastAddedProduct;

export default cartSlice.reducer;
