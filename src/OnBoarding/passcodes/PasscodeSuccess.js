import {
    StatusBar,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '@constants';
import { calculateHeight, fonts, optionalConfigObject } from '@constants/theme';
import ConstantStrings from '@constants/ConstantStrings';
import ConstStorage from '@constants/ConstStorage';
import TouchID from 'react-native-touch-id';
import { saveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';
export default function PasscodeSuccess({ navigation }) {
    const dispatch = useDispatch();
    const [bioSupportedStatus, setBioSupportedStatus] = useState(false);

    useEffect(() => {
        checkBioMetricStatus();
    }, []);
    function checkBioMetricStatus() {
        TouchID.isSupported(optionalConfigObject)
            .then(biometryType => {
                logger('biometryType', biometryType);
                if (biometryType === 'FaceID') {
                    logger('FaceID is supported.');
                    setBioSupportedStatus(true);
                    saveKeyValueData(
                        ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                        'FaceID',
                    );
                } else {
                    logger('TouchID is supported.');
                    setBioSupportedStatus(true);
                    saveKeyValueData(
                        ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                        'TouchID',
                    );
                }
            })
            .catch(error => {
                setBioSupportedStatus(false);
                saveKeyValueData(
                    ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                    '',
                );
                logger('TouchID ERROR:>>', error);
            });
    }

    function authenticationCallback() {
        TouchID.authenticate(
            ConstantStrings.BIOMETRIC_AUTHENTICSTION,
            optionalConfigObject,
        )
            .then(() => {
                saveKeyValueData(ConstStorage.BIOMETRICS_MODE, '1');
                showCopyToast(
                    dispatch,
                    ConstantStrings.UNLOCK_WITH_BIOMETRICS_ENABLE,
                );

                setBioSupportedStatus(true);
                setTimeout(() => {
                    navigation.replace('WelcomeLoader');
                }, 600);
            })
            .catch(error => {
                logger('Authentication Failed', error);
            });
    }

    return (
        <SafeAreaView style={styles.containerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.purple_button_color1}
                barStyle={'light-content'}
            />
            <View style={styles.unlockWithBioViewStyle}>
                {bioSupportedStatus && (
                    <Text style={styles.unlockBioStyle}>
                        {ConstantStrings.ENABLE_UNLOCK_WITH_BIO}
                    </Text>
                )}

                {bioSupportedStatus && (
                    <TouchableOpacity
                        style={styles.enableBioViewStyle}
                        onPress={() => {
                            logger('Unlock with bio clicked');
                            authenticationCallback();
                        }}>
                        <Image
                            style={styles.bioThumIconStyle}
                            source={require('@assets/bio_thumb_purple.png')}></Image>
                        <Text style={styles.unlockWithBioButtonStyle}>
                            {ConstantStrings.UNLOCK_WITH_BIOMETRIC}
                        </Text>
                    </TouchableOpacity>
                )}

                {bioSupportedStatus ? (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.replace('WelcomeLoader');
                        }}>
                        <Text style={styles.skipButtonStyle}>
                            {ConstantStrings.SKIP_THIS_FOR_NOW}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.replace('WelcomeLoader');
                        }}
                        style={styles.continueTouchable}>
                        <Text style={styles.TextStyles}>
                            {ConstantStrings.CONTINUE}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.passwordSuccessSetContainerStyle}>
                <Image
                    style={{
                        height: calculateHeight(336),
                        width: calculateHeight(336),
                        marginTop: bioSupportedStatus
                            ? calculateHeight(50) + StatusBar.currentHeight
                            : calculateHeight(95) + StatusBar.currentHeight,
                    }}
                    source={require('assets/success_password.png')}
                    resizeMode={'contain'}
                />
                <Text style={styles.passwordSuccess}>
                    {ConstantStrings.PASSWORD_SUCCESSFULLY_SET}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    TextStyles: {
        color: theme.colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        textAlign: 'center',
    },
    bioThumIconStyle: {
        height: 20,
        width: 20,
    },
    containerStyle: {
        backgroundColor: theme.colors.purple_button_color1,
        flex: 1,
    },
    continueTouchable: {
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: calculateHeight(5),
        padding: calculateHeight(16),
    },
    enableBioViewStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: calculateHeight(5),
        padding: calculateHeight(16),
    },
    passwordSuccess: {
        backgroundColor: theme.colors.success,
        borderRadius: 16,
        color: theme.colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        marginTop: calculateHeight(22),
        overflow: 'hidden',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    passwordSuccessSetContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonStyle: {
        backgroundColor: theme.colors.purple_button_color,
        borderRadius: 10,
        color: theme.colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginHorizontal: 20,
        marginVertical: calculateHeight(5),
        padding: calculateHeight(16),
        textAlign: 'center',
    },
    unlockBioStyle: {
        color: theme.colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        marginBottom: 20,
        textAlign: 'center',
    },
    unlockWithBioButtonStyle: {
        color: theme.colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginLeft: 5,
        textAlign: 'center',
    },
    unlockWithBioViewStyle: {
        alignSelf: 'center',
        bottom: 0,
        marginBottom: 20,
        position: 'absolute',
        width: theme.Width,
    },
});
