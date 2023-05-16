import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import moment from 'moment/moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retrieveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';

export function useLockScreenInterval() {
    const isFirstLaunch = useRef(true);
    const appState = useRef(AppState.currentState);
    const [isShowLockInterval, setIsShowLockInterval] = useState(false);
    const savedTime = 'savedTime';

    async function isPasscodeSet() {
        let passcodeModeFromLocal = await retrieveKeyValueData(
            ConstStorage.PASSCODE_MODE,
        );

        return passcodeModeFromLocal === '1';
    }

    async function checkIfShowPasscode() {
        let passcodeModeFromLocal = await retrieveKeyValueData(
            ConstStorage.PASSCODE_MODE,
        );
        if (passcodeModeFromLocal === '1' && isFirstLaunch.current) {
            setIsShowLockInterval(true);
            isFirstLaunch.current = false;
        }
    }

    useEffect(() => {
        checkIfShowPasscode();
        const subscription = AppState.addEventListener(
            'change',
            async nextAppState => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active'
                ) {
                    if (!(await isPasscodeSet())) return;

                    let backgroundTime = await AsyncStorage.getItem(savedTime);
                    backgroundTime = JSON.parse(backgroundTime);
                    let foregroundTime = moment();
                    const duration = moment.duration(
                        foregroundTime.diff(backgroundTime),
                    );

                    const minutes = duration.asMinutes();
                    if (minutes > 1) setIsShowLockInterval(true);

                    /** Uncomment to test 5 sec */
                    // const seconds = duration.asSeconds();
                    // if (seconds > 5) setIsShowLockInterval(true);
                } else {
                    const backgroundTime = moment();
                    AsyncStorage.setItem(
                        savedTime,
                        JSON.stringify(backgroundTime),
                    );
                }

                appState.current = nextAppState;
            },
        );

        return () => {
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [isShowLockInterval, setIsShowLockInterval];
}
