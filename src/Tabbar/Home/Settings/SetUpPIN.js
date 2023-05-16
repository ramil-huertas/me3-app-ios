import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings, { SET_YOUR_PASSCODE } from '@constants/ConstantStrings';
import PasscodeUI from '@components/PasscodeUI';
import ConstStorage from '@constants/ConstStorage';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

export default function SetUpPIN({ navigation }) {
    const dispatch = useDispatch()
    const [updatedPasscode, setUpdatedPasscode] = React.useState('');
    const [isPasswordSet, setIsPasswordSet] = React.useState(false);

    function closeClickevent() {
        navigation.pop();
    }

    function success() {
        if (isPasswordSet) {
            // confirm password
            retrieveKeyValueData(ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED)
                .then(isSupported => {
                    if (isSupported != '') {
                        navigation.replace('EnableBioMetric');
                    } else {
                        showCopyToast(dispatch, ConstantStrings.PASSCODE_SET_SUCCESSFULLY);
                        setTimeout(() => {
                            navigation.pop();
                        }, 700);
                    }
                })
                .catch(error => {
                    logger('isSupported error', error);
                });
        } else {
            // set up password success
            setIsPasswordSet(true);
        }
    }

    return (
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            <PasscodeUI
                enableValidations={isPasswordSet ? false : true}
                changePassword={false}
                forSetUp={true}
                setPasscodeValue={setUpdatedPasscode}
                updatedPasscode={updatedPasscode}
                headerTitle={SET_YOUR_PASSCODE}
                passCodeTitle={
                    isPasswordSet
                        ? ConstantStrings.CONFIRM_6_DIGIT_PASSCODE
                        : ConstantStrings.CREATE_6_DIGIT_PASSCODE
                }
                onBackIconClick={() => {
                    closeClickevent();
                }}
                onSuccess={success}
                isPasswordSet={isPasswordSet}
            />
            <SafeAreaView style={styles.contentBtm} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.white,
        flex: 1,
    },
    contentBtm: { backgroundColor: colors.white, flex: 0 },
});
