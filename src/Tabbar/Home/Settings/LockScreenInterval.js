import { StyleSheet, SafeAreaView, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import PasscodeUI from '@components/PasscodeUI';
import { ENTER_YOUR_6_PASSCODE } from '@constants/ConstantStrings';

export default function LockScreenInterval({ onSuccess }) {
    return (
        <View style={styles.absoluteFull}>
            {/* for screen flickering issue removed safeareaview */}
            {/* <SafeAreaView style={styles.container}> */}
            <PasscodeUI
                enableValidations={false}
                changePassword={false}
                forSetUp={false}
                forGrantingAccess={true}
                disablePassword={false}
                passCodeTitle={ENTER_YOUR_6_PASSCODE}
                onSuccess={onSuccess}
            />
            {/* </SafeAreaView> */}
            {/* <SafeAreaView style={styles.safeAreaBtm} /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteFull: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 } // for screen flickering issue
    // container: {
    //     backgroundColor: colors.mainColor,
    //     flex: 1,
    // },
    // safeAreaBtm: {
    //     backgroundColor: colors.purpple_background_color50,
    // },
});
