import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import thunk from "redux-thunk";
import rootReducer from "../_reducers";

const initialState = {};
const middleware = [thunk];

const persistConfig = {
    key: "root",
    storage: storage,
    stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, initialState,  applyMiddleware(...middleware));
let persistor = persistStore(store);

if (module.hot) {
    module.hot.accept("../_reducers", () => {
        const nextRootReducer = require("../_reducers").default;
        store.replaceReducer(nextRootReducer);
    });
}

export {store, persistor};