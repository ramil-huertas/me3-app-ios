import {
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import { colors, optionalConfigObject } from '@constants/theme';
import {
    BIOMETRIC_AUTHENTICSTION,
    ENABLE_LOGIN_WITH_BIOMETRIC,
    PASSCODE_SET_SUCCESSFULLY,
    SKIP_THIS_FOR_NOW,
} from '@constants/ConstantStrings';
import { theme } from '@constants';
import TouchID from 'react-native-touch-id';
import ConstStorage, {
    UNLOCK_WITH_BIOMETRICS_ENABLE,
} from '@constants/ConstStorage';
import { saveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { showCopyToast, showWarnToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';
export default function PInSetupSucessPopup({
    setShowPinSetupSuccessPopup,
    skipCallback,
    authenticationCallback,
}) {
    const dispatch = useDispatch();

    return (
        <Modal
            onRequestClose={() => {
                setShowPinSetupSuccessPopup(false);
            }}
            transparent={true}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            <View style={styles.contain}>
                <View style={styles.topContainer}>
                    <View style={styles.popupView}>
                        <Image
                            source={require('@assets/lock_black.png')}
                            resizeMode="contain"
                            style={styles.lockIcon}></Image>
                        <Text style={styles.txtTitle}>
                            {PASSCODE_SET_SUCCESSFULLY}
                        </Text>
                        <Text style={styles.txtSubTitle}>
                            {ENABLE_LOGIN_WITH_BIOMETRIC}
                        </Text>
                        <TouchableOpacity onPress={authenticationClick}>
                            <Image
                                source={require('@assets/BiometricsGray.png')}
                                style={styles.biometricIcon}
                                resizeMode="contain"></Image>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.marginBtm80}>
                    <Text style={styles.txtSkip} onPress={skipFornowClick}>
                        {SKIP_THIS_FOR_NOW}
                    </Text>
                </View>
            </View>
        </Modal>
    );

    function skipFornowClick() {
        setShowPinSetupSuccessPopup(false);
        skipCallback();
    }

    function authenticationClick() {
        TouchID.authenticate(BIOMETRIC_AUTHENTICSTION, optionalConfigObject)
            .then(() => {
                saveKeyValueData(ConstStorage.BIOMETRICS_MODE, '1');
                showCopyToast(dispatch, 'Biometric successfully enabled');
                setTimeout(() => {
                    authenticationCallback();
                }, 600);
            })
            .catch(error => {
                logger('Authentication Failed', error);
            });
    }
}

const styles = StyleSheet.create({
    biometricIcon: {
        height: 72,
        width: 72,
    },
    contain: {
        alignItems: 'center',
        backgroundColor: colors.white,
        flex: 1,
        justifyContent: 'center',
    },
    lockIcon: {
        height: 32,
        marginBottom: 18,
        width: 32,
    },
    marginBtm80: { marginBottom: 80 },

    popupView: {
        alignItems: 'center',
        backgroundColor: colors.white,
    },

    topContainer: { flex: 1, justifyContent: 'center' },

    txtSkip: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f16,
        textDecorationLine: 'underline',
    },

    txtSubTitle: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f18,
        marginBottom: 34,
    },

    txtTitle: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f24,

        marginBottom: 16,
    },
});
