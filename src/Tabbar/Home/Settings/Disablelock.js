import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import {
    DISABLE_APP_LOCK,
    ENTER_YOUR_6_PASSCODE,
} from '@constants/ConstantStrings';

import PasscodeUI from '@components/PasscodeUI';

export default function Disablelock({ navigation }) {
    return (
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
                forGrantingAccess={false}
                disablePassword={true}
                headerTitle={DISABLE_APP_LOCK}
                passCodeTitle={ENTER_YOUR_6_PASSCODE}
                onBackIconClick={() => {
                    closeClickevent();
                }}
                onSuccess={() => {
                    setTimeout(() => {
                        navigation.pop();
                    }, 700);
                }}
            />
        </SafeAreaView>
    );

    function closeClickevent() {
        navigation.pop();
    }
}
const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.white,
        flex: 1,
    },
});
