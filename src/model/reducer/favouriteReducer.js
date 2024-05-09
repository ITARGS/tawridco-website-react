import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    favorite: null,
    favouritelength: 0,
    favouriteProductIds: []
};

export const favouriteReducer = createSlice({
    name: "favourite",
    initialState,
    reducers: {
        setFavourite: (state, action) => {
            state.status = "fulfill";
            state.favorite = action.payload.data;
        },
        setFavouriteLength: (state, action) => {
            state.favouritelength = action.payload.data;
        },
        setFavouriteProductIds: (state, action) => {
            state.favouriteProductIds = action.payload.data;
        }
    }
});


export const { setFavourite, setFavouriteLength, setFavouriteProductIds } = favouriteReducer.actions;
export default favouriteReducer.reducer;