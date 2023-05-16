import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import React, { useState } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import { getKeyboardType } from '@constants/commonFuncation';

const AddAddressInputField = ({
    title,
    value,
    setText,
    placeHolderText,
    validField,
    errorMessage,
    showPasteButton,
    showScanButton,
    setValidField,
    multiline,
    setShowScanner,
}) => {
    const fetchCopiedText = async () => {
        return Clipboard.getString();
    };

    const [textHeight, setTextHeight] = useState();
    const updateSize = heightOfView => {
        setTextHeight(heightOfView);
    };

    const textInputAndroid = {
        marginLeft: 8,
        fontFamily: fonts.titillium_bold,
        color: colors.mainColor,
        fontSize: sizes.f14,
        height: textHeight,
    };
    const textInputIOS = {
        marginLeft: 8,
        fontFamily: fonts.titillium_bold,
        color: colors.mainColor,
        fontSize: sizes.f14,
    };
    const getTextStyles = () => {
        if (Platform.OS === 'ios') {
            return textInputIOS;
        } else {
            if (multiline) {
                return textInputAndroid;
            } else {
                return {
                    marginLeft: 8,
                    fontFamily: fonts.titillium_bold,
                    color: colors.mainColor,
                    fontSize: sizes.f14,
                };
            }
        }
    };
    const getViewPaddingStyles = () => {
        if (Platform.OS === 'ios') {
            return { paddingVertical: sizes.mvp8 };
        } else {
            if (multiline) {
                return { paddingVertical: sizes.mv4 };
            } else {
                return { paddingVertical: null };
            }
        }
    };
    const getTextPaddingStyles = () => {
        if (Platform.OS === 'ios') {
            return sizes.mvp12;
        } else {
            if (multiline) {
                return sizes.mv8;
            } else {
                return sizes.mv8;
            }
        }
    };
    const getViewMarginStyle = () => {
        if (Platform.OS === 'ios') {
            return null;
        } else {
            return calculateHeight(10);
        }
    };
    return (
        <>
            <Text style={styles.title}>{title}</Text>
            <View style={[styles.input, getViewPaddingStyles()]}>
                <TextInput
                    style={[
                        getTextStyles(),
                        styles.textInput(getTextPaddingStyles()),
                    ]}
                    value={value}
                    onChangeText={text => {
                        setValidField(true);
                        setText(text);
                    }}
                    onContentSizeChange={e => {
                        updateSize(e.nativeEvent.contentSize.height);
                    }}
                    placeholder={placeHolderText}
                    keyboardType={getKeyboardType()}
                    placeholderTextColor={colors.gray1_textcolor}
                    selectionColor={colors.gray1_textcolor}
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete={'off'}
                    multiline={multiline}
                    returnKeyType={'default'}
                />
                {showPasteButton && (
                    <TouchableOpacity
                        onPress={() => {
                            fetchCopiedText().then(text => {
                                if (text && text.length > 0)
                                    setValidField(true);
                                setText(text);
                                setValidField(true);
                            });
                        }}
                        style={[
                            styles.button,
                            {
                                marginHorizontal: calculateWidth(4),
                                marginVertical: getViewMarginStyle(),
                            },
                        ]}>
                        <Image
                            source={require('@assets/pasteAddress.png')}
                            style={{
                                height: calculateHeight(20),
                                width: calculateHeight(20),
                            }}
                            resizeMode={'contain'}
                        />
                    </TouchableOpacity>
                )}
                {showScanButton && (
                    <TouchableOpacity
                        onPress={() => {
                            setShowScanner(true);
                        }}
                        style={styles.button}>
                        <Image
                            source={require('@assets/scan_icon.png')}
                            style={{
                                height: calculateHeight(20),
                                width: calculateHeight(20),
                            }}
                            resizeMode={'contain'}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {!validField && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </>
    );
};

export default AddAddressInputField;
const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 4,
        flex: 0.1,
        justifyContent: 'center',
        padding: calculateWidth(8),
    },
    errorText: {
        color: colors.error_dots,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh12,
        paddingVertical: 4,
    },
    input: {
        alignItems: 'center',
        borderColor: colors.gray_background_1,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: calculateWidth(12),
    },
    textInput: paddingVertical => ({
        paddingVertical,
        flex: 1,
    }),
    title: {
        alignSelf: 'flex-start',
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        marginBottom: calculateHeight(8),
        marginLeft: 8,
        marginTop: calculateHeight(12),
    },
});
