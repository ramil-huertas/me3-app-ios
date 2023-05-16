/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from './constant/ReduxConfig/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';

export default function AppWrapper() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    );
}
