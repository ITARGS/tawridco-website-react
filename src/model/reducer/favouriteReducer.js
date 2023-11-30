// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    favorite: null,
};

export const favouriteReducer = createSlice({
    name: "favourite",
    initialState,
    reducers: {
        setFavourite: (state, action) => {
            state.status = "fulfill";
            state.favorite = action.payload.data;
        }
    }
    // switch (type) {
    //     case ActionTypes.SET_FAVORITE:
    //         return{
    //             ...state,
    //             status:"fulfill",
    //             favorite:payload,
    //         }

    //     default:
    //         return state;
    // }
});


export const { setFavourite } = favouriteReducer.actions;
export default favouriteReducer.reducer;