import {
    StatusBar,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '@constants';
import { calculateHeight, fonts, optionalConfigObject } from '@constants/theme';
import ConstantStrings, {
    BIOMETRIC_AUTHENTICSTION,
} from '@constants/ConstantStrings';
import ConstStorage, {
    UNLOCK_WITH_BIOMETRICS_ENABLE,
} from '@constants/ConstStorage';
import TouchID from 'react-native-touch-id';
import { saveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { WHITE } from '../../../../constant/color';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

export default function EnableBioMetric({ navigation }) {
    const dispatch = useDispatch()
    const [isBioSupported, setIsBioSupported] = useState(false);

    useEffect(() => {
        checkBioMetricStatus();
    }, []);
    function checkBioMetricStatus() {
        TouchID.isSupported(optionalConfigObject)
            .then(biometryType => {
                logger('biometryType', biometryType);
                if (biometryType === 'FaceID') {
                    logger('FaceID is supported.');
                    setIsBioSupported(true);
                    saveKeyValueData(
                        ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                        'FaceID',
                    );
                } else {
                    logger('TouchID is supported.');
                    setIsBioSupported(true);
                    saveKeyValueData(
                        ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                        'TouchID',
                    );
                }
            })
            .catch(error => {
                setIsBioSupported(false);
                saveKeyValueData(
                    ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                    '',
                );
                logger('TouchID ERROR:>>', error);
            });
    }

    function skipCallback() {
        setTimeout(() => {
            navigation.pop(2);
        }, 300);
    }

    function authenticationCallback() {
        try {
            TouchID.authenticate(BIOMETRIC_AUTHENTICSTION, optionalConfigObject)
                .then(() => {
                    saveKeyValueData(ConstStorage.BIOMETRICS_MODE, '1');
                    setIsBioSupported(true);
                    showCopyToast(dispatch, UNLOCK_WITH_BIOMETRICS_ENABLE);
                    setTimeout(() => {
                        navigation.pop();
                    }, 600);
                })
                .catch(error => {
                    logger('Authentication Failed', error);
                });
        } catch (error) {
            logger('Authentication Failed catch method', error);
        }
    }

    return (
        <View style={styles.containerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.purple_button_color1}
                barStyle={'light-content'}
            />
            <View style={styles.mainContainer}>
                <Text style={styles.unlockBioStyle}>
                    {ConstantStrings.ENABLE_UNLOCK_WITH_BIO}
                </Text>

                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => {
                        logger('Unlock with bio clicked');
                        authenticationCallback();
                    }}>
                    <Image
                        style={styles.bioIcon}
                        source={require('@assets/bio_thumb_purple.png')}></Image>
                    <Text style={styles.unlockWithBioButtonStyle}>
                        {ConstantStrings.UNLOCK_WITH_BIOMETRIC}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        skipCallback();
                    }}>
                    <Text style={styles.skipButtonStyle}>
                        {ConstantStrings.SKIP_THIS_FOR_NOW}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <Image
                    style={{
                        height: calculateHeight(336),
                        width: calculateHeight(336),
                        marginTop: isBioSupported
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
        </View>
    );
}

const styles = StyleSheet.create({
    bioIcon: { height: 20, width: 20 },
    containerStyle: {
        backgroundColor: theme.colors.purple_button_color1,
        flex: 1,
    },
    mainContainer: {
        alignSelf: 'center',
        bottom: 0,
        marginBottom: 20,
        position: 'absolute',
        width: theme.Width,
    },
    passwordContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    passwordSuccess: {
        backgroundColor: theme.colors.success,
        borderRadius: 16,
        color: WHITE,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        marginTop: calculateHeight(22),
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,
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
    touchable: {
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: calculateHeight(5),
        padding: calculateHeight(16),
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
});
