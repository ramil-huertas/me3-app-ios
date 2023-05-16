import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import PasscodeUI from '../../../../components/PasscodeUI';
import ConstantStrings from '@constants/ConstantStrings';
import ConstStorage from '../../../../constant/ConstStorage';
import { saveKeyValueData } from '@constants/Storage';
import { PASSCODE_Change_SUCCESSFULLY } from '../../../../constant/ConstantStrings';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

export default function ChangePassword({ navigation }) {
    const dispatch = useDispatch()
    const [updatedPasscode, setUpdatedPasscode] = React.useState('');
    const [isPasswordSet, setIsPasswordSet] = React.useState(false);
    const [oldPasswordConfirmed, setOldPasswordConfirmed] =
        React.useState(false);

    function closeClickevent() {
        navigation.pop();
    }

    function success() {
        if (oldPasswordConfirmed) {
            if (isPasswordSet) {
                // confirm password
                showCopyToast(dispatch, PASSCODE_Change_SUCCESSFULLY);
                setTimeout(() => {
                    navigation.pop();
                }, 700);
            } else {
                // set up password success
                setIsPasswordSet(true);
            }
        } else {
            setOldPasswordConfirmed(true);
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
                enableValidations={
                    oldPasswordConfirmed
                        ? isPasswordSet
                            ? false
                            : true
                        : false
                }
                changePassword={true}
                setPasscodeValue={setUpdatedPasscode}
                updatedPasscode={updatedPasscode}
                setOldPasswordConfirmed={setOldPasswordConfirmed}
                oldPasswordConfirmed={oldPasswordConfirmed}
                headerTitle={ConstantStrings.CHANGE_PASSCODE}
                passCodeTitle={
                    oldPasswordConfirmed
                        ? isPasswordSet
                            ? ConstantStrings.CONFIRM_NEW_6_DIGIT_PASSCODE
                            : ConstantStrings.CREATE_NEW_6_DIGIT_PASSCODE
                        : ConstantStrings.ENTER_YOUR_6_PASSCODE
                }
                onBackIconClick={() => {
                    closeClickevent();
                }}
                onSuccess={success}
                isPasswordSet={isPasswordSet}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.white,
        flex: 1,
    },
});
