import { createSlice } from "@reduxjs/toolkit";

const LoadingReducer = createSlice({
    name: 'loading',
    initialState: false,
    reducers: {
        // 修改为状态取反逻辑
        changeLoading: (state) => {
            return !state  // 直接返回取反后的状态值
        }
    }
});

export const { changeLoading} = LoadingReducer.actions;
export default LoadingReducer.reducer;