/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import {
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { theme } from '@constants';
import { colors, optionalConfigObject } from '@constants/theme';
import {
    APP_LOCK,
    BIOMETRIC_AUTHENTICSTION,
    CHANGE_PASSCODE,
    LOCK_METHOD,
    PASSCODE,
    REQUIRE_PASSCODE,
    SECURITY,
    UNLOCK_WITH_BIOMETRIC,
    NOT_SUPPORTED_BIOMETRICS,
} from '@constants/ConstantStrings';
import { saveKeyValueData, retrieveKeyValueData } from '@constants/Storage';
import ConstStorage, {
    UNLOCK_WITH_BIOMETRICS_DISABLE,
    UNLOCK_WITH_BIOMETRICS_ENABLE,
} from '@constants/ConstStorage';
import { useFocusEffect } from '@react-navigation/native';
import TouchID from 'react-native-touch-id';
import PasscodeDisablePopUP from './PasscodeDisablePopUP';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { useDispatch } from 'react-redux';
import { showCopyToast, showWarnToast } from '@redux/Action/ToastAlert';
import CSwitch from '@components/CSwitch';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecuritySetting({ navigation }) {
    const dispatch = useDispatch();
    const [appLock, setAppLock] = useState(false);
    const [passCode, setPassCode] = useState(false);
    const [biometrics, setBiometrics] = useState(false);
    const [biometricType, setBiometricType] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [bioOpacity, setBioOpacity] = useState(false);
    const [passcodeDisablePopUP, setPasscodeDisablePopUP] = useState(false);
    const [bioSwitchToggled, setbioSwitchToggled] = useState(false);


    // useEffect(() => {
    //     checkBioMetricsMode()
    // },[])
    useFocusEffect(useCallback(
      () => {
        if(!bioSwitchToggled){
            checkBioMetricsMode()
        }
      },
      [biometrics,bioSwitchToggled],
    )
    );

    const checkBioMetricsMode=async()=>{
        let biometricsMode = await retrieveKeyValueData(
            ConstStorage.BIOMETRICS_MODE,
        );
        if (biometricsMode != null && biometricsMode == '1') {
            setBiometrics(true);
        } else {
            setBiometrics(false);
        }
    }

    useFocusEffect(() => {
        setBiometricOpacity()
        checkSettingStatus();
    });

    const setBiometricOpacity = async () => {
        const check = await checkBioMetricStatus();
        if (check) {
            setBioOpacity(true);
        } else {
            setBioOpacity(false);
        }
    };

    async function checkSettingStatus() {

        let passcode = await retrieveKeyValueData(
            ConstStorage.CURRENT_USER_PASSCODE,
        );
        if (passcode != null && passcode != '') {
            setAppLock(true);
        } else {
            setPassCode(false);
            setAppLock(false);
            setBiometrics(false);
        }

        let passcodeMode = await retrieveKeyValueData(
            ConstStorage.PASSCODE_MODE,
        );
        if (passcodeMode != null && passcodeMode == '1') {
            setPassCode(true);
        } else {
            setPassCode(false);
        }
    }

    return (
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />

            {passcodeDisablePopUP && (
                <PasscodeDisablePopUP
                    setPasscodeDisablePopUP={setPasscodeDisablePopUP}
                    disableCallBack={disableCallBack}
                    cancelCallBack={cancelCallBack}
                    bottom={-75}
                />
            )}
            <View style={styles.header}>
                <ScreenTopHeader
                    title={SECURITY}
                    topBackClick={closeClickevent}
                    showBack={true}></ScreenTopHeader>
            </View>
            <View style={[styles.itemView, { marginHorizontal: 20 }]}>
                <Image
                    source={require('@assets/lock_black.png')}
                    resizeMode="contain"
                    style={styles.itmeIcon}></Image>
                <View style={styles.itmeSubview}>
                    <View style={styles.itmeSubview2}>
                        <Text style={styles.itemTitle}>{APP_LOCK}</Text>
                        <Text style={styles.itmeSubtitle}>
                            {REQUIRE_PASSCODE}
                        </Text>
                    </View>
                    <CSwitch
                        value={appLock}
                        onValueChange={() => {
                            let temp = !appLock;
                            const eventObject = {
                                timeOfClick: new Date().toLocaleString(),
                                Status: temp ? 'enabled' : 'disabled',
                            };
                            firebaseAnalytics(
                                firebaseEvents.settings_security_app_lock,
                                eventObject,
                            );
                            setAppLock(temp);
                            if (temp) {
                                navigation.navigate('SetUpPIN');
                            } else {
                                navigation.navigate('Disablelock');
                            }
                            setRefresh(!refresh);
                        }}
                        condition={appLock}
                    />
                </View>
            </View>
            <Text style={styles.txtLock}>{LOCK_METHOD}</Text>
            <View
                style={{
                    marginTop: 10,
                    marginHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: colors.gray_background,
                }}>
                {!appLock && (
                    <View style={[styles.transprentView, { zIndex: 1000 }]} />
                )}
                <View style={styles.itemView}>
                    <Image
                        source={require('@assets/lock_black.png')}
                        resizeMode="contain"
                        style={styles.itmeIcon}></Image>
                    <Text
                        style={[styles.itemTitle, { marginLeft: 8, flex: 1 }]}>
                        {PASSCODE}
                    </Text>
                    <CSwitch
                        disabled={!appLock}
                        value={passCode}
                        onValueChange={() => {
                            setPassCode(!passCode);
                            let temp = !passCode;
                            if (temp) {
                                saveKeyValueData(
                                    ConstStorage.PASSCODE_MODE,
                                    '1',
                                );
                                setRefresh(!refresh);
                            } else {
                                saveKeyValueData(
                                    ConstStorage.PASSCODE_MODE,
                                    '0',
                                );
                                setRefresh(!refresh);
                                setPasscodeDisablePopUP(true);
                            }
                        }}
                        condition={passCode}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (appLock) {
                            navigation.navigate('ChangePassword');
                        }
                    }}
                    style={[styles.itemView, { borderRadius: 0 }]}>
                    <Image
                        source={require('@assets/ChnagePasscode.png')}
                        resizeMode="contain"
                        style={styles.itmeIcon}></Image>
                    <Text
                        style={[styles.itemTitle, { marginLeft: 8, flex: 1 }]}>
                        {CHANGE_PASSCODE}
                    </Text>

                    <Image
                        source={require('@assets/forward.png')}
                        resizeMode="contain"
                        style={styles.forwardIcon}></Image>
                </TouchableOpacity>

                {!bioOpacity ? (
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                            if (!bioOpacity) {
                                showWarnToast(
                                    dispatch,
                                    NOT_SUPPORTED_BIOMETRICS,
                                );
                            }
                        }}
                        style={[
                            styles.itemView,
                            {
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            },
                        ]}>
                        <View
                            style={[styles.DisableBioView, { zIndex: 1000 }]}
                        />
                        <Image
                            source={require('@assets/Biometrics.png')}
                            resizeMode="contain"
                            style={styles.itmeIcon}></Image>
                        <Text
                            style={[
                                styles.itemTitle,
                                { marginLeft: 8, flex: 1 },
                            ]}>
                            {UNLOCK_WITH_BIOMETRIC}
                        </Text>
                        <CSwitch
                            value={biometrics}
                            onValueChange={() => {
                                let temp = !biometrics;
                                AuthenticateBiometric(temp);
                            }}
                            condition={biometrics}
                        />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.itemView,
                            {
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            },
                        ]}>
                        <Image
                            source={require('@assets/Biometrics.png')}
                            resizeMode="contain"
                            style={styles.itmeIcon}></Image>
                        <Text
                            style={[
                                styles.itemTitle,
                                { marginLeft: 8, flex: 1 },
                            ]}>
                            {UNLOCK_WITH_BIOMETRIC}
                        </Text>
                        <CSwitch
                            value={biometrics}
                            onValueChange={() => {
                                setbioSwitchToggled(true)
                                let temp = !biometrics;
                                AuthenticateBiometric(temp);
                            }}
                            condition={biometrics}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );

    function closeClickevent() {
        navigation.pop();
    }

    function disableCallBack() {
        navigation.navigate('Disablelock');
        saveKeyValueData(ConstStorage.PASSCODE_MODE, '1');
        setRefresh(!refresh);
    }

    function cancelCallBack() {
        saveKeyValueData(ConstStorage.PASSCODE_MODE, '1');
        setRefresh(!refresh);
    }

    async function checkBioMetricStatus() {
        return TouchID.isSupported(optionalConfigObject)
            .then(biometryType => {
                logger('biometryType', biometryType);
                if (Platform.OS === 'ios') {
                    if (biometryType === 'FaceID') {
                        logger('FaceID is supported.');
                        setBiometricType('FaceID');
                        saveKeyValueData(
                            ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                            'FaceID',
                        );
                        return true;
                    } else if (biometryType === 'TouchID') {
                        logger('TouchID is supported.');
                        setBiometricType('TouchID');
                        saveKeyValueData(
                            ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                            'TouchID',
                        );
                        return true;
                    } else {
                        logger('biometrics are not supported.');
                        setBiometricType('');
                        saveKeyValueData(
                            ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                            '',
                        );
                        return false;
                    }
                } else {
                    if (biometryType) {
                        logger('TouchID is supported. --Android');
                        setBiometricType('TouchID');
                        saveKeyValueData(
                            ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                            'TouchID',
                        );
                        return true;
                    } else {
                        setBiometricType('');
                        saveKeyValueData(
                            ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                            '',
                        );
                        return false;
                    }
                }
            })
            .catch(error => {
                setBiometricType('');
                saveKeyValueData(
                    ConstStorage.BIOMETRICS_DEVICE_HAS_SUPPORTED,
                    '',
                );
                logger('TouchID ERROR:>>', error);
                return false;
            });
    }

    function AuthenticateBiometric(status) {
        if (biometricType != '') {
                setBiometrics(status);
                setRefresh(!refresh);
            TouchID.authenticate(BIOMETRIC_AUTHENTICSTION, optionalConfigObject)
                .then(() => {
                    saveKeyValueData(
                        ConstStorage.BIOMETRICS_MODE,
                        status ? '1' : '0',
                    );
                    if (status) {
                        showCopyToast(dispatch, UNLOCK_WITH_BIOMETRICS_ENABLE);
                        setbioSwitchToggled(false)
                    } else {
                        showCopyToast(dispatch, UNLOCK_WITH_BIOMETRICS_DISABLE);
                        setbioSwitchToggled(false)
                    }
                })
                .catch(error => {
                    logger('Authentication Failed', error);
                    setbioSwitchToggled(false)
                    if(biometrics){
                        setBiometrics(true);
                        setRefresh(!refresh);
                    }else{
                        setBiometrics(false);
                        setRefresh(!refresh);
                    }
                });
        } else {
            showWarnToast(dispatch, NOT_SUPPORTED_BIOMETRICS);
            setBiometrics(false);
            setRefresh(!refresh);
        }
    }
}

const styles = StyleSheet.create({
    DisableBioView: {
        backgroundColor: colors.white_opacity,
        borderRadius: 8,
        height: '100%',
        opacity: 1,
        position: 'absolute',
        width: '100%',
    },

    content: {
        backgroundColor: colors.white,
        flex: 1,
    },
    forwardIcon: {
        height: 20,
        marginRight: 12,
        width: 20,
    },
    header: {
        marginHorizontal: 20,
    },

    itemTitle: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
    itemView: {
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        height: 60,
    },

    itmeIcon: {
        height: 20,
        marginLeft: 8,
        width: 20,
    },

    itmeSubtitle: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },

    itmeSubview: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    itmeSubview2: {
        alignItems: 'flex-start',
        flex: 0.9,
        flexDirection: 'column',
        marginLeft: 10,
    },

    transprentView: {
        backgroundColor: colors.white_opacity,
        borderRadius: 8,
        height: '100%',
        position: 'absolute',
        width: '100%',
    },

    txtLock: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginLeft: 20,

        marginTop: 24,
    },
});
