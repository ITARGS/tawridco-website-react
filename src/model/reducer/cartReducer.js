// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    cart: null,
    checkout: null,
    promo_code: null,
};

export const cartReducer = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.status = "fulfill";
            state.cart = action.payload.data;
        },
        setCartCheckout: (state, action) => {
            state.status = "fulfill";
            state.checkout = action.payload.data;
        },
        setCartPromo: (state, action) => {
            state.status = "fulfill";
            state.promo_code = action.payload.data;
        },
        clearCartPromo:(state) => {
            state.cart.promo_code = null
            state.promo_code = null
        }
    }
    // switch (type) {
    //     case ActionTypes.SET_CART:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             cart: payload,
    //         };
    //     case ActionTypes.SET_CART_CHECKOUT:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             checkout: payload,
    //         };
    //     case ActionTypes.SET_CART_PROMO:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             promo_code: payload,
    //         };
    //     default:
    //         return state;
    // }
});

export const { setCart, setCartCheckout, setCartPromo, clearCartPromo } = cartReducer.actions;
export default cartReducer.reducer;