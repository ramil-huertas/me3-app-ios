import { createStore } from 'redux';
import rootReducer from './Reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

import reactotronConfig from '../../src/utilities/reactotronConfig';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = createStore(persistedReducer);
export const store = createStore(persistedReducer, reactotronConfig.createEnhancer());
export const persistor = persistStore(store);

// export default store;
