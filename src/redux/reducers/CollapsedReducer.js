import { createSlice } from "@reduxjs/toolkit";

const CollapsedReducer = createSlice({
    name: 'collapsed',
    initialState: false,
    reducers: {
        // 修改为状态取反逻辑
        changeCollapsed: (state) => {
            return !state  // 直接返回取反后的状态值
        }
    }
});

export const { changeCollapsed } = CollapsedReducer.actions;
export default CollapsedReducer.reducer;