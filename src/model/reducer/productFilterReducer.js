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
    search_sizes: [],
    seller_id: "",
    country_id: ""
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
            // state.category_id = null;
            // state.country_id = "";
            // state.seller_id = "";
            // state.brand_ids = [];
        },
        setFilterBrands: (state, action) => {
            state.brand_ids = action.payload.data;
            // state.category_id = null;
            // state.country_id = "";
            // state.seller_id = "";
            // state.section_id = null;
        },
        setFilterCategory: (state, action) => {
            state.category_id = action.payload.data;
            // state.brand_ids = [];
            // state.country_id = "";
            // state.seller_id = "";
            // state.section_id = null;
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
        },
        setFilterBySeller: (state, action) => {
            state.seller_id = action.payload.data;
            // state.brand_ids = [];
            // state.country_id = "";
            // state.category_id = "";
            // state.section_id = null;
        },
        setFilterByCountry: (state, action) => {
            state.country_id = action.payload.data;
            // state.brand_ids = [];
            // state.seller_id = "";
            // state.category_id = "";
            // state.section_id = null;
        },
        clearAllFilter: (state, action) => {
            state.country_id = "";
            state.brand_ids = [];
            state.seller_id = "";
            state.category_id = "";
            state.section_id = null;
        }

    }
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
    setFilterProductSizes,
    setFilterByCountry,
    setFilterBySeller,
    clearAllFilter
} = productFilterReducer.actions;

export default productFilterReducer.reducer;