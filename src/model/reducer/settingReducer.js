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
});
export const { setSetting, setPaymentSetting } = settingReducer.actions;
export default settingReducer.reducer;