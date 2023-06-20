/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, LogBox, View } from 'react-native';
import { theme } from './constant';
import 'react-native-crypto';
import PolyfillCrypto from 'react-native-webview-crypto';
import NetInfo from '@react-native-community/netinfo';
import LockScreenInterval from './src/Tabbar/Home/Settings/LockScreenInterval';
import { NavigationContainer } from '@react-navigation/native';
import ToastAlert from '@components/ToastAlert';
import { useLockScreenInterval } from 'src/utilities/hooks';
import { NativeBaseProvider } from 'native-base';
// import { navigationRef } from './src/utilities/RootNavigator';
import MainStackNavigator from 'src/navigation/MainStackNavigator';
import VersionCheck from 'react-native-version-check';
import { APIENV, APIENVTYPE } from '@api/apiConst';
import UpdateVersion from '@components/UpdateVersion';
import { setInternet } from '@redux/Action/ConfigAction';
import { useDispatch } from 'react-redux';
import { navigationRef } from '@utilities/RootNavigator';

LogBox.ignoreAllLogs();
export default function App() {
    const [isShowLockInterval, setIsShowLockInterval] = useLockScreenInterval();
    const [needVersionUpdate, setNeedVersionUpdate] = useState(false);
    const dispatch = useDispatch();

    const checkIfForceUpgrade = useCallback(() => {
        // Only check for PROD & release build
        if (APIENV === APIENVTYPE.PROD && !__DEV__) {
            VersionCheck.needUpdate({
                packageName: 'app.me3.wallet',
                forceUpdate: true,
            }).then(res => {
                if (res.isNeeded) {
                    setNeedVersionUpdate(true);
                }
            });
        }
    }, []);

    useEffect(() => {
        NetInfo.addEventListener(state => {
            if (state.isConnected) {
                dispatch(setInternet(true));
            } else {
                dispatch(setInternet(false));
            }
        });
        checkIfForceUpgrade();
    }, []);

    function lockScreenIntervalOnSuccess() {
        setIsShowLockInterval(false);
    }

    return (
        <NativeBaseProvider>
            <NavigationContainer independent={true} ref={navigationRef}>
                <View style={styles.container}>
                    <PolyfillCrypto />
                    <ToastAlert />
                    <MainStackNavigator />
                    {isShowLockInterval && (
                        <LockScreenInterval
                            onSuccess={lockScreenIntervalOnSuccess}
                        />
                    )}
                    {needVersionUpdate && <UpdateVersion />}
                </View>
            </NavigationContainer>
        </NativeBaseProvider>
    );
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        flex: 1,
        justifyContent: 'center',
    },
});
