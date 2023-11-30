// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    setting: null,
    payment_setting: null
};

export const settingReducer = createSlice({
    name: "setting",
    initialState,
    reducers: {
        setSetting: (state, action) => {
            state.status = "fulfilled";
            state.setting = action.payload.data;
        },
        setPaymentSetting: (state, action) => {
            state.status = "fulfill";
            state.payment_setting = action.payload.data;
        },
    }
    //     switch(type) {
    //         case ActionTypes.SET_SETTING:
    //     return {
    //         ...state,
    //         status: "fulfill",
    //         setting: payload,
    //     };

    //     case ActionTypes.SET_PAYMENT_SETTING:
    //     return {
    //         ...state,
    //         status: "fulfill",
    //         payment_setting: payload,
    //     };

    //     default:
    //             return state;
    // }
});

export const { setSetting, setPaymentSetting } = settingReducer.actions;
export default settingReducer.reducer;