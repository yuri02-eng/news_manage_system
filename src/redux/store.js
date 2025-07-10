import { configureStore } from "@reduxjs/toolkit";
import CollapsedReducer from "./reducers/CollapsedReducer";
import loadingReducer from "./reducers/LoadingSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { combineReducers } from "redux";

// 1. 创建持久化配置
const persistConfig = {
  key: "root",
  storage,
  // 选择要持久化的状态
  whitelist: ["collapsed"], // 只持久化折叠状态
  // blacklist: ["loading"] // 不持久化加载状态
};

// 2. 合并所有 reducer
const rootReducer = combineReducers({
  collapsed: CollapsedReducer,
  loading: loadingReducer
});

// 3. 创建持久化的 reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. 创建 store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 的特殊 action
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"]
      }
    })
});

// 5. 创建持久化存储
const persistor = persistStore(store);

export { store, persistor };