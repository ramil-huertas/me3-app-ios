import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    TouchableHighlight,
} from 'react-native';
import React, { useState } from 'react';
import {
    colors,
    Width,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import { theme } from '@constants';
import {
    getBottomLeftRadius,
    getBottomRightRadius,
    getTopLeftRadius,
    getTopRightRadius,
    validatePasscode,
} from '../../Tabbar/Home/Settings/PasswordFunctions';
import ConstantStrings from '@constants/ConstantStrings';
import { saveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';
import { SharedElement } from 'react-navigation-shared-element';
import { useDispatch } from 'react-redux';
import { setPasscodeStatusType } from '@redux/Action/WalletStatusAction';

const OnBoardPasscode = ({ navigation }) => {
    const dispatch = useDispatch();

    const [pageCount, setPageCount] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);
    const [showPasscodeError, setShowPasscodeError] = React.useState(false);

    const [showPasscodeSuccess, setShowPasscodeSuccess] = React.useState(false);
    const [onPressInImg, setOnPressInImg] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(
        `${ConstantStrings.PLEASE_TRY_AGAIN}`,
    );

    const [isForConfirm, setIsForConfirm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState(null); // this is when set password for first time... and it's use at a time of confirm password
    const [data, SetData] = useState([
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

    const checkBackColor = (item) => {
        if (item.isFill) {
            if (showPasscodeError)
                return colors.error_background
            else if (showPasscodeSuccess)
                return colors.success_background
            else return colors.purpple_background_color50
        }
        else return null;
    }
    const checkBackColorSecondView = (item) => {
        if (item.isFill) {
            if (showPasscodeError)
                return colors.error_dots
            else if (showPasscodeSuccess)
                return colors.success
            else return colors.purple_button_color
        }
        else return colors.gray_passcode_color;
    }
    const renderItem = ({ item, index }) => {
        return (
            <View
                key={item.id}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    backgroundColor: checkBackColor(item),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTopLeftRadius: getTopLeftRadius(index),
                    borderTopRightRadius: getTopRightRadius(pageCount, index),
                    borderBottomLeftRadius: getBottomLeftRadius(index),
                    borderBottomRightRadius: getBottomRightRadius(
                        pageCount,
                        index,
                    ),
                    marginTop: calculateHeight(5),
                }}>
                <View
                    key={item.id}
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                        height: calculateHeight(10),
                        width: calculateHeight(10),
                        margin: 10,
                        backgroundColor: checkBackColorSecondView(item),
                        borderRadius: 8,
                    }}></View>
            </View>
        );
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
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={closeClickevent}>
                    <View>
                        <Image
                            source={require('@assets/backIcon.png')}
                            style={styles.backIcon}
                            resizeMode="contain"></Image>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headText}>
                    {' '}
                    {ConstantStrings.SETUP_PASSSCODE}
                </Text>
            </View>
            <View style={styles.lockIcon}>
                <SharedElement
                    id="Animated.View.Image.LockImage"
                    style={styles.imageSharedElementStyle}>
                    <Image
                        source={require('@assets/lock_black.png')}
                        resizeMode="contain"
                        style={styles.itmeIcon}></Image>
                </SharedElement>
                <Text
                    numberOfLines={2}
                    style={styles.headText2}>
                    {isForConfirm
                        ? ConstantStrings.CONFIRM_6_DIGIT_PASSCODE
                        : ConstantStrings.CREATE_6_DIGIT_PASSCODE}
                </Text>
                {showPasscodeError ? (
                    <Text style={styles.errorTxt}>{errorMessage}</Text>
                ) : (
                    <Text style={styles.infoTxt}>
                        {ConstantStrings.YOUR_PASSWORD_IS_REQUIRED}
                    </Text>
                )}

                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.image}
                    horizontal={true}
                />
            </View>
            <View style={styles.keyboardView}>
                <View
                    style={[
                        styles.keyboardSubview,
                        { marginTop: calculateHeight(20) },
                    ]}>
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
                        style={[styles.btnKeyboard, styles.opacity0Style]}>
                        <Image
                            source={require('@assets/close.png')}
                            style={styles.closeIconStyle}
                            resizeMode="contain"></Image>
                    </TouchableOpacity>

                    <TouchableHighlight
                        activeOpacity={1}
                        underlayColor={colors.keyboard_button_highlight_color}
                        style={[
                            styles.btnKeyboard,
                            styles.marginHorizStyle,
                        ]}
                        onPress={() => {
                            setPasscode(0);
                        }}>
                        <View>
                            <Text style={styles.keyboardTxt}>0</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={() => {
                            setOnPressInImg(true);
                        }}
                        onPressOut={() => {
                            setOnPressInImg(false);
                        }}
                        onPress={removePasscode}
                        style={styles.btnKeyboardBack}>
                        <Image
                            source={require('@assets/backIcon.png')}
                            style={styles.backIconStyle}
                            resizeMode="contain"></Image>
                    </TouchableOpacity>
                </View>
            </View>
            {!isForConfirm && (
                <TouchableOpacity
                    style={styles.skipViewStyle}
                    onPress={() => {
                        setPasscodeStatusType(dispatch, false);
                        navigation.replace('WelcomeLoader');
                    }}>
                    <View>
                        <Text style={styles.txtSkipForNowStyle}>
                            {ConstantStrings.SKIP_THIS_FOR_NOW}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );

    function removeAllPasscode() {
        data.map(item => {
            item.value = '';
            item.isFill = false;
        });
        setRefresh(!refresh);
        setShowPasscodeSuccess(false);
        setPageCount(0);
    }

    function removePasscode() {
        if (pageCount == 0) return;
        let tempPageCount = pageCount;
        data.map(item => {
            if (item.id == tempPageCount) {
                item.value = '';
                item.isFill = false;
            }
        });
        tempPageCount = tempPageCount - 1;
        setPageCount(tempPageCount);
        setRefresh(!refresh);
    }

    function setPasscode(value) {
        setShowPasscodeError(false);
        let updatedValue = '';
        let tempPageCount = pageCount;
        if (tempPageCount < 6) {
            tempPageCount = tempPageCount + 1;
            setPageCount(tempPageCount);
            data.map(item => {
                if (item.id == tempPageCount) {
                    item.value = value;
                    item.isFill = true;
                }
                updatedValue = updatedValue + item.value;
            });

            if (!isForConfirm) {
                if (!validatePasscode(updatedValue, setErrorMessage)) {
                    setShowPasscodeError(true);
                    setShowPasscodeSuccess(false);
                    setTimeout(() => {
                        removeAllPasscode();
                    }, 500);
                    return;
                }
            }

            setRefresh(!refresh);
            if (tempPageCount == 6) {
                setTimeout(() => {
                    if (!isForConfirm) {
                        removeAllPasscode();
                        setCurrentPassword(updatedValue);
                        setIsForConfirm(true);
                    } else {
                        if (currentPassword == updatedValue) {
                            saveKeyValueData(
                                ConstStorage.CURRENT_USER_PASSCODE,
                                updatedValue,
                            );
                            saveKeyValueData(ConstStorage.PASSCODE_MODE, '1');

                            setPasscodeStatusType(dispatch, true);
                            navigation.replace('PasscodeSuccess');
                        } else {
                            setErrorMessage(
                                ConstantStrings.PASSWORD_DOESNT_MATCH,
                            );
                            setShowPasscodeError(true);
                            setTimeout(() => {
                                removeAllPasscode();
                            }, 500);
                        }
                    }
                }, 600);
                //}
            }
        }
    }

    function closeClickevent() {
        navigation.pop();
    }
};

OnBoardPasscode.sharedElements = () => {
    return ['Animated.View.Image.LockImage'];
};
export default OnBoardPasscode;
const styles = StyleSheet.create({
    backIcon: {
        height: calculateHeight(15),
        marginRight: 12,
        width: calculateHeight(15),
    },
    backIconStyle: {
        height: calculateHeight(20),
        marginRight: 0,
        width: calculateHeight(20),
    },
    btnKeyboard: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 5,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingVertical: calculateHeight(10),
        width: calculateWidth(100)
    },

    btnKeyboardBack: {
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingVertical: calculateHeight(10),
        width: calculateWidth(100)
    },

    closeIconStyle: {
        height: calculateHeight(15),
        marginRight: 0,
        width: calculateHeight(15),
    },

    content: {
        backgroundColor: colors.white,
        flex: 1,
    },

    errorTxt: {
        color: colors.offRed,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        marginBottom: calculateHeight(23),
        marginHorizontal: 50,
        textAlign: 'center',
    },

    headText: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f18,
    },

    headText2: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        height: calculateHeight(58),
        marginBottom: calculateHeight(24),
        marginHorizontal: calculateWidth(50),
        marginTop: calculateHeight(26.67),
        textAlign: 'center',
        // color: colors.menuDotsTint,
        // fontFamily: theme.fonts.titillium_bold,
        // fontSize: theme.sizes.f20,
        // marginBottom: 10,
        // marginHorizontal: calculateWidth(60),
        // marginTop: '5%',
        // paddingVertical: 5,
        // textAlign: 'center',
        // textAlignVertical: 'center',
    },

    header: {
        alignItems: 'center',
        flexDirection: 'row',
        height: calculateHeight(54),
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 20,
    },

    imageSharedElementStyle:
    {
        alignItems: 'center',
        justifyContent: 'center'
    },

    infoTxt: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        marginBottom: calculateHeight(23),
        marginHorizontal: calculateWidth(100),
        textAlign: 'center',
    },

    itmeIcon: {
        // marginTop: '5%',
        height: calculateHeight(36),
        width: calculateHeight(36),
    },

    keyboardSubview: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: calculateHeight(10),
    },

    keyboardTxt: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f24,
    },

    keyboardView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: calculateHeight(13),
        width: Width,
    },

    lockIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: calculateHeight(10),
    },
    marginHorizStyle: {
        marginHorizontal: 8,
    },
    opacity0Style: {
        opacity: 0,
    },
    skipViewStyle: {
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 10,
        marginHorizontal: calculateWidth(30),
        marginVertical: calculateHeight(20),
        padding: 16,
    },
    txtSkipForNowStyle: {
        color: colors.purple_button_color1,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        textAlign: 'center',
    },
});
