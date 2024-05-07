// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    cart: null,
    checkout: null,
    promo_code: null,
    is_wallet_checked: 0,
    same_seller_flag: 0,
    cartProducts: [],
    cartSubTotal: 0

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
        clearCartPromo: (state) => {
            state.cart.promo_code = null;
            state.promo_code = null;
        },
        setWallet: (state, action) => {
            state.status = "fulfill";
            state.is_wallet_checked = action.payload.data;
        },
        setSellerFlag: (state, action) => {
            state.status = "fulfill";
            state.same_seller_flag = action.payload.data;
        },
        setCartProducts: (state, action) => {
            state.cartProducts = action.payload.data;
        },
        setCartSubTotal: (state, action) => {
            state.cartSubTotal = action.payload.data;
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

export const { setCart, setCartCheckout, setCartPromo, clearCartPromo, setWallet, setSellerFlag, setCartProducts, setCartSubTotal } = cartReducer.actions;
export default cartReducer.reducer;