import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    colors,
    Width,
    sizes,
    fonts,
    calculateHeight,
    calculateWidth,
    optionalConfigObject,
} from '@constants/theme';
import {
    getBottomLeftRadius,
    getBottomRightRadius,
    getTopLeftRadius,
    getTopRightRadius,
    validatePasscode,
} from '../src/Tabbar/Home/Settings/PasswordFunctions';
import ConstStorage from '@constants/ConstStorage';
import {
    APP_LOCK_DISABLE,
    BIOMETRIC_AUTHENTICSTION,
    FAILED_TOO_ATTEMPTS,
    PASSWORD_DOESNT_MATCH,
    PASSWORD_INCORRECT,
    PASSWORD_SHOULD_BE_DIFFRENT,
    TRY_AGAIN_IN,
    UNLOCK_WITH_BIOMETRIC,
    YOUR_PASSWORD_IS_REQUIRED,
    YOUR_PASSWORD_IS_REQUIRED_TO_DISABLE,
    PLEASE_TRY_AGAIN,
} from '@constants/ConstantStrings';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import ScreenTopHeader from '@components/ScreenTopHeader';
import LinearGradient from 'react-native-linear-gradient';
import { logger } from '@constants/Log';
import TouchID from 'react-native-touch-id';
import _ from 'lodash';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

/*
 * headerTitle => title beside the back icon => string value
 * passCodeTitle => title below the lock icon => string value
 * changePassword => for changing password => boolean value
 * isPasswordSet => for confirming password => boolean value
 * ForGrantingAccess => for grant access/permission/transaction etc app password => boolean value
 * ForSetUp => for setting up password => boolean value
 * enableValidations => to check validations => boolean value
 * setPasscodeValue => to save the entered value => string value from state
 * updatedPasscode => to compare the entered value and previouly entered value => string value from state
 * onBackIconClick => event when back icon is clicked => function
 * onSuccess => function called on success => function
 * oldPasswordConfirmed => for confirming the password before chaging it => bool value
 * DisablePassword =>
 *
 * For disbaling password =>  set changePassword, ForGrantingAccess, ForSetUp = false
 *
 */

const PasscodeUI = ({
    headerTitle,
    passCodeTitle,
    forSetUp,
    isPasswordSet,
    changePassword,
    forGrantingAccess,
    onBackIconClick,
    enableValidations,
    setPasscodeValue,
    updatedPasscode,
    oldPasswordConfirmed,
    disablePassword,
    onSuccess,
}) => {
    const dispatch = useDispatch()
    const [pageCount, setPageCount] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);

    const [showPasscodeError, setShowPasscodeError] = React.useState(false);
    const [currentPasscode, setCurrentPasscode] = React.useState('');
    const [showPasscodeSuccess, setShowPasscodeSuccess] = React.useState(false);
    const [loader, setLoader] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(
        `${PLEASE_TRY_AGAIN}`,
    );
    const [isDisableContent, setIsDisableContent] = React.useState(false);
    const [showBiometrics, setShowBiometrics] = React.useState(false);
    const [incorrentAttempCount, setIncorrentAttempCount] = React.useState(0);
    const Ref = React.useRef(null);
    const [inputtedPasscode, setInputtedPasscode] = useState([
        {
            id: 1,
            isFill: false,
            value: '',
        },
        {
            id: 2,
            isFill: false,
            value: '',
        },
        {
            id: 3,
            isFill: false,
            value: '',
        },
        {
            id: 4,
            isFill: false,
            value: '',
        },
        {
            id: 5,
            isFill: false,
            value: '',
        },
        {
            id: 6,
            isFill: false,
            value: '',
        },
    ]);

    useEffect(() => {
        getPasswordSetByUser();
        if (forGrantingAccess) {
            saveKeyValueData(ConstStorage.LOCK_LAUNCH_SCREEN_PRESENT, '1');
            checkTimerStatus();
            if(showBiometrics){
                AuthenticateBiometric()
            }
        }
    }, []);

    useEffect(()=>{
        if(forGrantingAccess && showBiometrics){
            AuthenticateBiometric()
        }
    },[showBiometrics])

    const checkTimerStatus = async () => {
        let timerType = await retrieveKeyValueData(ConstStorage.TIMER_TYPE);
        if (timerType != null && timerType != '') {
            if (timerType == '1') {
                setIncorrentAttempCount(5);
            } else if (timerType == '5') {
                setIncorrentAttempCount(6);
            } else if (timerType == '15') {
                setIncorrentAttempCount(7);
            } else {
                setIncorrentAttempCount(8);
            }

            let totalSecond = parseInt(timerType) * 60;
            let startTimeString = await retrieveKeyValueData(
                ConstStorage.TIMER_TIME,
            );
            let startTime = new Date(startTimeString);
            let currentTime = new Date();

            let seconds = (currentTime.getTime() - startTime.getTime()) / 1000;
            let secondDiff = totalSecond - seconds;

            if (secondDiff > 0) {
                clearTimer(getDeadTimeForSecond(secondDiff));
                setShowPasscodeError(true);
                setIsDisableContent(true);
            } else {
                saveKeyValueData(ConstStorage.TIMER_TYPE, '');
                setShowPasscodeError(false);
                setIsDisableContent(false);
            }
        } else {
            logger('time type storage is null');
        }
    };
    const getPasswordSetByUser = async () => {
        if (!forSetUp) {
            removeAllPasscode();
            let passcode = await retrieveKeyValueData(
                ConstStorage.CURRENT_USER_PASSCODE,
            );
            if (passcode != null && passcode != '') {
                setCurrentPasscode(passcode);
            }
        }
        let biometricMode = await retrieveKeyValueData(
            ConstStorage.BIOMETRICS_MODE,
        );
        if (biometricMode != null && biometricMode == '1') {
            setShowBiometrics(true);
        } else {
            setShowBiometrics(false);
        }
    };

    const getBackgroundColour = item => {
        if (item.isFill) {
            if (showPasscodeError) {
                return colors.error_background;
            } else {
                if (showPasscodeSuccess) {
                    return colors.success_background;
                } else {
                    return colors.grantAccessNormal;
                }
            }
        } else {
            return null;
        }
    };
    const getItemDotsColour = item => {
        if (item.isFill) {
            if (showPasscodeError) {
                return colors.error_dots;
            } else {
                if (showPasscodeSuccess) {
                    return colors.success;
                } else {
                    return colors.purple_button_color;
                }
            }
        } else {
            return colors.gray_passcode_color;
        }
    };

    const renderItem = ({ item, index }) => {
        const renderItemParentView = {
            alignItems: 'center',
            backgroundColor: getBackgroundColour(item),
            borderBottomLeftRadius: getBottomLeftRadius(index),
            borderBottomRightRadius: getBottomRightRadius(pageCount, index),
            borderTopLeftRadius: getTopLeftRadius(index),
            borderTopRightRadius: getTopRightRadius(pageCount, index),
            justifyContent: 'center',
        };

        const renderItemView = {
            backgroundColor: getItemDotsColour(item),
            borderRadius: 8,
            height: calculateHeight(10),
            margin: 10,
            width: calculateHeight(10),
        };
        return (
            <View style={renderItemParentView}>
                <View style={renderItemView} />
            </View>
        );
    };

    const removeAllPasscode = () => {
        setInputtedPasscode(
            inputtedPasscode.map(item => {
                item.value = '';
                item.isFill = false;
                return item;
            }),
        );

        setRefresh(!refresh);
        setPageCount(0);
    };
    const removePasscode = () => {
        if (pageCount == 0) return;
        let tempPageCount = pageCount;

        inputtedPasscode.map(item => {
            if (item.id == tempPageCount) {
                item.value = '';
                item.isFill = false;
                return item;
            }
        }),
            (tempPageCount = tempPageCount - 1);
        setPageCount(tempPageCount);
        setRefresh(!refresh);
    };
    const setPasscode = value => {
        setShowPasscodeSuccess(false);
        setShowPasscodeError(false);
        let updatedValue = '';
        let tempPageCount = pageCount;
        if (tempPageCount < 6) {
            tempPageCount = tempPageCount + 1;
            setPageCount(tempPageCount);

            let temp = _.cloneDeep(inputtedPasscode);

            temp = temp.map(item => {
                if (item.id == tempPageCount) {
                    item.value = value;
                    item.isFill = true;
                }
                updatedValue = updatedValue + item.value;
                return item;
            });
            setInputtedPasscode(temp);
            setRefresh(!refresh);

            if (
                enableValidations &&
                !validatePasscode(updatedValue, setErrorMessage)
            ) {
                setShowPasscodeSuccess(false);
                setShowPasscodeError(true);
                setTimeout(() => {
                    removeAllPasscode();
                }, 500);
                return;
            }

            if (tempPageCount == 6) {
                if (forSetUp) {
                    // for setting up password
                    if (isPasswordSet) {
                        logger('checking for confirm password');
                        checkForConfirmPassword(updatedValue);
                    } else {
                        logger('checking for set up password');
                        checkForSetUpPassword(updatedValue);
                    }
                } else if (changePassword) {
                    // for changing password
                    logger('checking for change password');
                    checkForChangePassword(updatedValue);
                } else if (forGrantingAccess) {
                    // for unlocking app
                    logger('grant access');
                    checkForGrantAccess(updatedValue);
                } else {
                    logger('disable password');
                    // for disabling password
                    DisablePasswordFunction(updatedValue);
                }
            }
        }
    };
    const checkForConfirmPassword = updatedValue => {
        if (updatedPasscode == updatedValue) {
            saveKeyValueData(ConstStorage.CURRENT_USER_PASSCODE, updatedValue);
            saveKeyValueData(ConstStorage.PASSCODE_MODE, '1');
            onSuccess();
        } else {
            setErrorMessage(PASSWORD_DOESNT_MATCH);
            setShowPasscodeError(true);
            setTimeout(() => {
                removeAllPasscode();
            }, 500);
        }
    };
    const checkForSetUpPassword = updatedValue => {
        setTimeout(() => {
            setPasscodeValue(updatedValue);
            removeAllPasscode();
            onSuccess();
        }, 700);
    };
    const checkForChangePassword = updatedValue => {
        if (!oldPasswordConfirmed) {
            setLoader(true);
            if (currentPasscode == updatedValue) {
                // setOldPasswordConfirmed(true)
                setTimeout(() => {
                    setLoader(false);
                    setShowPasscodeSuccess(true);
                    onSuccess();
                    removeAllPasscode();
                }, 500);
            } else {
                setLoader(false);
                setShowPasscodeSuccess(false);
                setShowPasscodeError(true);
                setErrorMessage(PASSWORD_INCORRECT);
                setTimeout(() => {
                    removeAllPasscode();
                }, 700);
            }
        } else {
            if (isPasswordSet) {
                checkForConfirmPassword(updatedValue);
            } else {
                if (currentPasscode == updatedValue) {
                    setErrorMessage(PASSWORD_SHOULD_BE_DIFFRENT);
                    setShowPasscodeSuccess(false);
                    setShowPasscodeError(true);
                    setTimeout(() => {
                        removeAllPasscode();
                    }, 500);
                    return;
                }
                checkForSetUpPassword(updatedValue);
            }
        }
    };
    const DisablePasswordFunction = updatedValue => {
        if (currentPasscode == updatedValue) {
            setShowPasscodeSuccess(true);
            saveKeyValueData(ConstStorage.CURRENT_USER_PASSCODE, '');
            saveKeyValueData(ConstStorage.PASSCODE_MODE, '0');
            saveKeyValueData(ConstStorage.BIOMETRICS_MODE, '0');
            showCopyToast(dispatch, APP_LOCK_DISABLE);
            onSuccess();
        } else {
            setErrorMessage(PASSWORD_INCORRECT);
            setShowPasscodeSuccess(false);
            setShowPasscodeError(true);
            setTimeout(() => {
                removeAllPasscode();
            }, 500);
        }
    };
    const getTimeRemaining = e => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total,
            hours,
            minutes,
            seconds,
        };
    };
    const startTimer = e => {
        let { total, minutes, seconds } = getTimeRemaining(e);
        if (total >= 0) {
            setErrorMessage(
                TRY_AGAIN_IN +
                ' ' +
                (minutes > 9 ? minutes : '0' + minutes) +
                ':' +
                (seconds > 9 ? seconds : '0' + seconds),
            );
        } else {
            saveKeyValueData(ConstStorage.TIMER_TYPE, '');
            setErrorMessage('');
            setIsDisableContent(false);
            setShowPasscodeError(false);
        }
    };
    const clearTimer = e => {
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000);
        Ref.current = id;
    };
    const getDeadTime = minutes => {
        let deadline = new Date();
        deadline.setMinutes(deadline.getMinutes() + minutes);
        return deadline;
    };
    const getDeadTimeForSecond = second => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + second);
        return deadline;
    };
    const AuthenticateBiometric = () => {
        TouchID.authenticate(BIOMETRIC_AUTHENTICSTION, optionalConfigObject)
            .then(() => {
                setLoader(true);
                setTimeout(() => {
                    setShowPasscodeSuccess(true);
                    setLoader(false);
                }, 500);
                setTimeout(() => {
                    onSuccess();
                }, 800);
            })
            .catch(error => {
                setLoader(false);
                logger('Authentication Failed', error);
            });
    };
    const checkPasswordStatus = () => {
        let count = incorrentAttempCount;
        if (incorrentAttempCount < 4) {
            setErrorMessage(PASSWORD_INCORRECT);
            setShowPasscodeError(true);
            setTimeout(() => {
                removeAllPasscode();
            }, 300);
            count = count + 1;
            setIncorrentAttempCount(count);
        } else {
            removeAllPasscode();
            count = count + 1;
            setIncorrentAttempCount(count);

            let starttime = new Date().toString();
            saveKeyValueData(ConstStorage.TIMER_TIME, starttime);

            if (count == 5) {
                clearTimer(getDeadTime(1));
                saveKeyValueData(ConstStorage.TIMER_TYPE, '1');
            } else if (count == 6) {
                clearTimer(getDeadTime(5));
                saveKeyValueData(ConstStorage.TIMER_TYPE, '5');
            } else if (count == 7) {
                clearTimer(getDeadTime(15));
                saveKeyValueData(ConstStorage.TIMER_TYPE, '15');
            } else {
                clearTimer(getDeadTime(60));
                saveKeyValueData(ConstStorage.TIMER_TYPE, '60');
            }

            setShowPasscodeError(true);
            setIsDisableContent(true);
        }
    };

    const checkForGrantAccess = updatedValue => {
        setLoader(true);
        if (currentPasscode == updatedValue) {
            setTimeout(() => {
                setLoader(false);
                setShowPasscodeSuccess(true);
            }, 500);
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } else {
            setTimeout(() => {
                setLoader(false);
                setShowPasscodeSuccess(false);
                checkPasswordStatus();
            }, 500);
        }
    };

    const getActivityColour = () => {
        return forGrantingAccess ? colors.purple_button_color1 : '#442B73';
    };
    const getLockTintColour = () => {
        if (forGrantingAccess) {
            if (showPasscodeError) {
                if (isDisableContent) {
                    return colors.white;
                } else {
                    return colors.error_dots;
                }
            } else {
                return colors.purple_button_color1;
            }
        } else {
            return colors.black;
        }
    };
    const getErrorTextColour = () => {
        if (forGrantingAccess) {
            return colors.gray_textcolor;
        } else {
            if (
                oldPasswordConfirmed ||
                forSetUp ||
                changePassword ||
                disablePassword
            ) {
                return colors.error_dots;
            } else {
                return colors.white;
            }
        }
    };
    const getTextColour = () => {
        return forGrantingAccess ? colors.white : colors.menuDotsTint;
    };
    const getSubText = () => {
        return disablePassword
            ? YOUR_PASSWORD_IS_REQUIRED_TO_DISABLE
            : YOUR_PASSWORD_IS_REQUIRED;
    };
    const getTitleText = () => {
        return isDisableContent ? FAILED_TOO_ATTEMPTS : passCodeTitle;
    };
    const getGradientColour = () => {
        return forGrantingAccess
            ? colors.white_magnolia_light
            : colors.whiteGradient;
    };

    const getMarginTop = {
        marginTop: forGrantingAccess ? calculateHeight(48) : null,
    };
    const flexColourText = {
        color: getTextColour(),
        flex: 1,
    };

    function renderKeyboard(dataArray) {
        return dataArray.map(number => {
            return <TouchableHighlight
                key={number}
                underlayColor={colors.keyboard_button_highlight_color}
                activeOpacity={1}
                onPress={() => {
                    setPasscode(number);
                }}
                style={styles.btnKeyboard}>
                <Text style={styles.keyboardTxt}>
                    {number}
                </Text>
            </TouchableHighlight>
        })
    }
    return (
        <View
            style={
                forGrantingAccess
                    ? styles.forGrantingAccessContent
                    : styles.content
            }>
            <StatusBar
                animated={true}
                backgroundColor={
                    forGrantingAccess ? colors.mainColor : colors.white
                }
                barStyle={forGrantingAccess ? 'light-content' : 'dark-content'}
            />
            <View style={styles.header}>
                <ScreenTopHeader
                    title={headerTitle}
                    topBackClick={onBackIconClick}
                    showBack={forGrantingAccess ? false : true}
                />
            </View>
            {/* <View style={{flex: 1.1}}> */}
            <View style={styles.lockIcon}>
                {forGrantingAccess ? (
                    loader ? (
                        <ActivityIndicator
                            style={styles.itmeIcon}
                            color={getActivityColour()}
                            size={'large'}
                        />
                    ) : showPasscodeSuccess ? (
                        <Image
                            source={require('@assets/unLock.png')}
                            resizeMode="contain"
                            style={styles.itmeIcon}
                        />
                    ) : (
                        <Image
                            source={require('@assets/lock_black.png')}
                            resizeMode="contain"
                            style={[
                                styles.itmeIcon,
                                { tintColor: getLockTintColour() },
                            ]}
                        />
                    )
                ) : (
                    <Image
                        source={require('@assets/lock_black.png')}
                        resizeMode="contain"
                        style={styles.itmeIcon}
                    />
                )}
                <Text style={[styles.headText2, flexColourText]}>
                    {getTitleText()}
                </Text>
                {showPasscodeError ? (
                    <Text
                        style={[
                            styles.errorTxt,
                            { color: getErrorTextColour() },
                        ]}>
                        {errorMessage}
                    </Text>
                ) : (
                    <Text style={styles.errorTxt}>{getSubText()}</Text>
                )}
                <FlatList
                    data={inputtedPasscode}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    horizontal={true}
                    style={styles.absoluteBottomZero}
                />
            </View>
            {/* </View> */}
            <LinearGradient
                colors={getGradientColour()}
                locations={[0.35, 1]}
                style={[styles.keyboardView, getMarginTop]}>
                <View
                    style={[styles.keyboardSubview, styles.marginTopThreeFive]}>
                    {
                        renderKeyboard([1, 2, 3])
                    }
                </View>
                <View style={styles.keyboardSubview}>
                    {
                        renderKeyboard([4, 5, 6])
                    }
                </View>
                <View style={styles.keyboardSubview}>
                    {
                        renderKeyboard([7, 8, 9])
                    }
                </View>
                <View style={styles.keyboardSubview}>
                    <TouchableOpacity
                        disabled={true}
                        onPress={removeAllPasscode}
                        style={[styles.btnKeyboard, styles.closeImageOpacity]}>
                        <Image
                            source={require('@assets/close.png')}
                            style={styles.closeImageStyle}
                            resizeMode="contain"></Image>
                    </TouchableOpacity>

                    <TouchableHighlight
                        underlayColor={colors.keyboard_button_highlight_color}
                        activeOpacity={1}
                        style={styles.btnKeyboard}
                        onPress={() => {
                            setPasscode(0);
                        }}>
                        <View>
                            <Text style={styles.keyboardTxt}>0</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={removePasscode}
                        style={styles.btnKeyboardBack}>
                        <Image
                            source={require('@assets/backIcon.png')}
                            style={styles.backIconStyle}
                            resizeMode="contain"></Image>
                    </TouchableOpacity>
                </View>
                {forGrantingAccess && showBiometrics ? (
                    <TouchableOpacity
                        onPress={AuthenticateBiometric}
                        style={styles.showBiometricsTouchable}>
                        <Image
                            source={require('@assets/Biometrics.png')}
                            resizeMode="contain"
                            style={styles.fingerprint}></Image>
                        <Text style={styles.unlockTxt}>
                            {UNLOCK_WITH_BIOMETRIC}
                        </Text>
                    </TouchableOpacity>
                ) : null}
                {forGrantingAccess && isDisableContent ? (
                    <View style={styles.transprentView}></View>
                ) : null}
                {/* </View> */}
            </LinearGradient>
        </View>
    );
};

export default PasscodeUI;
const styles = StyleSheet.create({
    absoluteBottomZero: {
        bottom: 0,
        position: 'absolute',
    },
    backIconStyle: {
        height: 20,
        marginRight: 0,
        width: 20,
    },
    btnKeyboard: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 5,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingVertical: 8,
        width: 100
    },
    btnKeyboardBack: {
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingVertical: 17,
        width: 100,
    },

    closeImageOpacity: {
        opacity: 0,
    },
    closeImageStyle: {
        height: 30,
        marginRight: 0,
        width: 30,
    },
    content: {
        backgroundColor: colors.white,
        flex: 1,
    },
    errorTxt: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        marginBottom: calculateHeight(43),
        marginHorizontal: calculateWidth(75),
        textAlign: 'center',
    },
    fingerprint: {
        height: 15,
        marginRight: 8,
        tintColor: colors.purple_color80,
        width: 15,
    },
    forGrantingAccessContent: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
    headText2: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
        marginBottom: calculateHeight(24),
        marginHorizontal: calculateWidth(50),
        marginTop: calculateHeight(26.67),
        textAlign: 'center',
    },
    header: {
        marginHorizontal: calculateWidth(20),
    },
    itmeIcon: {
        height: 36,
        marginTop: '10%',
        width: 36,
    },

    keyboardSubview: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 12,
    },

    keyboardTxt: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f28,
    },

    keyboardView: {
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'column',
        flex: 4.5,
        justifyContent: 'flex-start',
        width: Width,
    },

    lockIcon: {
        alignItems: 'center',
        flexDirection: 'column',
        flex: 3,
        justifyContent: 'center',
    },
    marginTopThreeFive: {
        marginTop: 35,
    },
    showBiometricsTouchable: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 80,
        flexDirection: 'row',
        marginBottom: 39,
        marginTop: 30,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    transprentView: {
        backgroundColor: colors.white_opacity,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '100%',
        position: 'absolute',
        width: '100%',
    },

    unlockTxt: {
        color: colors.purple_color80,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
});
