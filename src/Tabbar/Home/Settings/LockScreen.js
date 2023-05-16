import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import { saveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';
import PasscodeUI from '../../../../components/PasscodeUI';
import { ENTER_YOUR_6_PASSCODE } from '@constants/ConstantStrings';
import { autoLogoutAfter1Week } from '@constants/commonFuncation';
import { useDispatch } from 'react-redux';
export default function LockScreen({ navigation }) {
    const dispatch = useDispatch();
    const onSuccess = () => {
        navigation.replace('MainContainer');
        saveKeyValueData(ConstStorage.LOCK_LAUNCH_SCREEN_PRESENT, '0');
    };
    useEffect(() => {
        autoLogoutAfter1Week(navigation, dispatch);
    }, []);

    return (
        <>
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />

            <PasscodeUI
                enableValidations={false}
                changePassword={false}
                forSetUp={false}
                forGrantingAccess={true}
                disablePassword={false}
                passCodeTitle={ENTER_YOUR_6_PASSCODE}
                onSuccess={onSuccess}
            />
        </SafeAreaView>
        <SafeAreaView style={{ backgroundColor: colors.purpple_background_color50, flex:0 }} />
        </>
    );
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
});
