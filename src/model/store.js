import { configureStore } from "@reduxjs/toolkit";
import reducers from './reducer/index';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: persistedReducer,
    // reducer:reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false, // Disable ImmutableStateInvariantMiddleware
        serializableCheck: false, // Disable SerializableStateInvariantMiddleware
    })
});

const Persiststore = persistStore(store);
export { Persiststore };

export default store;