import {
    Text,
    StyleSheet,
    Image,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import React from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import { SharedElement } from 'react-navigation-shared-element';
const MessageComponent = ({ Data, item, index, navigation }) => {
    let showMessageOpacity1 = new Animated.Value(0);
    let showMessageOpacity2 = new Animated.Value(0);
    let showMessageOpacity3 = new Animated.Value(0);
    let showMessageOpacity4 = new Animated.Value(0);

    function startAnimation1() {
        Animated.timing(showMessageOpacity1, {
            toValue: 1,
            useNativeDriver: true,
            duration: 1000,
        }).start();
    }
    function startAnimation2() {
        Animated.timing(showMessageOpacity2, {
            toValue: 1,
            useNativeDriver: true,
            duration: 1000,
        }).start();
    }
    function startAnimation3() {
        Animated.timing(showMessageOpacity3, {
            toValue: 1,
            useNativeDriver: true,

            duration: 1000,
        }).start();
    }
    function startAnimation4() {
        Animated.timing(showMessageOpacity4, {
            toValue: 1,
            useNativeDriver: true,
            duration: 1000,
        }).start();
    }

    const getTintColor = (item, index) => {
        if (item.tintColor == null || item.tintColor == undefined)
            return null
        else if (Data.length - 1 == index)
            return colors.purple_button_color
        else return item.tintColor
    }
    const getBackColor = (item, index) => {
        if (item.passcodeStatus)
            if (Data.length - 1 == index)
                return colors.purpple_background_color50
            else return colors.purple_button_color
        else
            return colors.white
    }
    if (item.type == 0) {
        return (
            <Animated.View
                onLayout={() => {
                    startAnimation1();
                }}
                style={[
                    styles.listCellView,
                    {
                        opacity: showMessageOpacity1,
                        backgroundColor: getBackColor(item, index)
                    },
                ]}>
                {item.imageSource == null ? null : (
                    <Image
                        source={item.imageSource}
                        resizeMode={'contain'}
                        style={[
                            styles.listImage,
                            styles.marginRight8Style,
                            {
                                tintColor: getTintColor(item, index)
                            },
                        ]}
                    />
                )}
                <Text
                    style={[
                        styles.listCellText,
                        {
                            color: item.passcodeStatus
                                ? Data.length - 1 != index
                                    ? colors.purpple_background_color50
                                    : colors.purple_button_color
                                : colors.mainColor,
                        },
                    ]}>
                    {item.message}
                </Text>
            </Animated.View>
        );
    } else if (item.type == 1) {
        return (
            <Animated.View
                onLayout={() => {
                    startAnimation3();
                }}
                style={[
                    styles.listCellView,
                    {
                        opacity: showMessageOpacity3,
                        // transform: [{translateY: showMessageMove}],
                        backgroundColor:
                            Data.length - 1 == index
                                ? colors.purpple_background_color50
                                : colors.purple_button_color,
                    },
                ]}>
                <Text
                    style={[
                        styles.listCellText,
                        styles.marginRight8Style,
                        {
                            color:
                                Data.length - 1 != index
                                    ? colors.purpple_background_color50
                                    : colors.purple_button_color,

                        },
                    ]}>
                    {item.message}
                </Text>
                {item.imageSource == null ? null : (
                    <Image
                        source={item.imageSource}
                        resizeMode={'contain'}
                        style={styles.listImage}
                    />
                )}
                {item.showIndicator ? (
                    <ActivityIndicator
                        color={
                            Data.length - 1 == index
                                ? colors.purple_button_color
                                : colors.purpple_background_color50
                        }
                        size={'small'}
                    />
                ) : null}
            </Animated.View>
        );
    } else if (item.type == 2) {
        return (
            <Animated.View
                onLayout={() => {
                    startAnimation2();
                }}
                style={[
                    styles.listCellView,
                    {
                        opacity: showMessageOpacity2,
                        backgroundColor:
                            Data.length - 1 == index
                                ? colors.purpple_background_color50
                                : colors.purple_button_color,
                    },
                ]}>
                <Text
                    style={[
                        styles.listCellText,
                        {
                            color:
                                Data.length - 1 != index
                                    ? colors.purpple_background_color50
                                    : colors.purple_button_color,
                        },
                    ]}>
                    {item.message}
                </Text>
            </Animated.View>
        );
    } else {
        return (
            <Animated.View
                onLayout={() => {
                    startAnimation4();
                }}
                style={{ opacity: showMessageOpacity4 }}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('OnBoardPasscode');
                    }}
                    activeOpacity={0.7}
                    style={styles.blackIconViewStyle}>
                    <SharedElement id="Animated.View.Image.LockImage">
                        <Animated.Image
                            source={require('@assets/lock_black.png')}
                            resizeMode={'contain'}
                            style={styles.iconStyle}
                        />
                    </SharedElement>
                </TouchableOpacity>
            </Animated.View>
        );
    }
};

export default MessageComponent;
const styles = StyleSheet.create({
    blackIconViewStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 50,
        height: 50,
        justifyContent: 'center',
        marginTop: 8,
        width: 50,
    },
    iconStyle: { height: 24, width: 24 },
    listCellText: {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    listCellView: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 0,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    listImage: {
        height: 20,
        width: 20,
    },
    marginRight8Style: {
        marginRight: 8,
    },
});
