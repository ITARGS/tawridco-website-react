// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    user: null,
};

export const authReducer = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.status = "fulfill";
            state.user = action.payload.data;
        },
        logoutAuth: (state, action) => {
            state.status = "loading";
            state.user = null;
        }
    }
    //     switch(type) {
    //         case ActionTypes.SET_CURRENT_USER:
    //     return {
    //         status: "fulfill",
    //         user: payload,
    //     };
    //     case ActionTypes.LOGOUT_AUTH:
    //     return {
    //         status: "loading",
    //         user: null,
    //     };

    //     default:
    //             return state;
    // }
});

export const { setCurrentUser, logoutAuth } = authReducer.actions;
export default authReducer.reducer;