// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    search: null,
    section_id: null,
    brand_ids: [],
    category_id: null,
    grid_view: true,
    price_filter: null,
    sort_filter: 'new',  //new,old,high,low,discount,popular
    section_products: null,
    search_sizes: []
};

export const productFilterReducer = createSlice({
    name: "productFilter",
    initialState,
    reducers: {
        setFilterSearch: (state, action) => {
            state.search = action.payload.data;
        },
        setFilterSection: (state, action) => {
            state.section_id = action.payload.data;
        },
        setFilterBrands: (state, action) => {
            state.brand_ids = action.payload.data;
        },
        setFilterCategory: (state, action) => {
            state.category_id = action.payload.data;
        },
        setFilterView: (state, action) => {
            state.grid_view = action.payload.data;
        },
        setFilterMinMaxPrice: (state, action) => {
            state.price_filter = action.payload.data;
        },
        setFilterSort: (state, action) => {
            state.sort_filter = action.payload.data;
        },
        setFilterProducts: (state, action) => {
            state.section_products = action.payload.data;
        },
        setFilterProductSizes: (state, action) => {
            state.search_sizes = action.payload.data;
        }

    }
    // switch (type) {
    //     case ActionTypes.SET_FILTER_SEARCH:
    //         return {
    //             ...state,
    //             search: payload,
    //         };
    //     case ActionTypes.SET_FILTER_SECTION:
    //         return {
    //             ...state,
    //             section_id: payload,
    //         };
    //     case ActionTypes.SET_FILTER_BRANDS:
    //         return {
    //             ...state,
    //             brand_ids: payload,
    //         };

    //     case ActionTypes.SET_FILTER_CATEGORY:
    //         return {
    //             ...state,
    //             category_id: payload,
    //         };
    //     case ActionTypes.SET_FILTER_VIEW:
    //         return {
    //             ...state,
    //             grid_view: payload,
    //         };
    //     case ActionTypes.SET_FILTER_MIN_MAX_PRICE:
    //         return {
    //             ...state,
    //             price_filter: payload,
    //         };
    //     case ActionTypes.SET_FILTER_SORT:
    //         return {
    //             ...state,
    //             sort_filter: payload,
    //         };
    //     case ActionTypes.SET_FILTER_PRODUCTS:
    //         return {
    //             ...state,
    //             section_products: payload,
    //         };
    //     default:
    //         return state;
    // }
});

export const {
    setFilterSearch,
    setFilterBrands,
    setFilterCategory,
    setFilterMinMaxPrice,
    setFilterProducts,
    setFilterSection,
    setFilterSort,
    setFilterView,
    setFilterProductSizes
} = productFilterReducer.actions;

export default productFilterReducer.reducer;