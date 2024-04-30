// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    user: null,
    fcm_token: null
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
            state.fcm_token = null;
        },
        deductUserBalance: (state, action) => {
            if (state.user) {
                state.user.balance -= action.payload.data;
            }
        },
        addUserBalance: (state, action) => {
            if (state.user) {
                state.user.balance += action.payload.data;
            }
        },
        setFcmToken: (state, action) => {
            state.fcm_token = action.payload.data;
        }
    }
});

export const { setCurrentUser, logoutAuth, deductUserBalance, addUserBalance, setFcmToken } = authReducer.actions;
export default authReducer.reducer;