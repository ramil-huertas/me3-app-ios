import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { theme } from '@constants';
import CustomImage from './CustomImage';
import {
    calculateHeight,
    calculateWidth,
    flexDirectionRow,
} from '@constants/theme';
export default function TopWalletSelection({
    imageIcon,
    walletname,
    chainname,
    walletAddress,
    clickEvent,
    isClickable,
    showWalletName,
    buttonStyle,
    tailEnd,
    ShowWalletAddress,
    withGrayBgColor,
}) {
    const getChainTextLineHeight = {
        lineHeight: !ShowWalletAddress ? null : theme.sizes.lh20,
    };
    const getBackgroundColour = {
        backgroundColor: withGrayBgColor
            ? theme.colors.ghost_white
            : theme.colors.white,
    };
    return (
        <View>
            <TouchableOpacity
                activeOpacity={!isClickable ? 1 : null}
                disabled={!isClickable}
                onPress={() => clickEvent()}>
                <View style={[styles.touchableParentView, getBackgroundColour]}>
                    <View style={flexDirectionRow}>
                        <View>
                            <CustomImage imageUrl={imageIcon} />
                        </View>
                        <View style={styles.chainNameParentView}>
                            {showWalletName ? (
                                <Text
                                    style={[
                                        styles.mainText,
                                        getChainTextLineHeight,
                                    ]}>
                                    {walletname} - {chainname}{' '}
                                </Text>
                            ) : (
                                <Text
                                    style={[
                                        styles.mainText,
                                        getChainTextLineHeight,
                                    ]}>
                                    {chainname}{' '}
                                </Text>
                            )}

                            {!ShowWalletAddress ? null : (
                                <Text
                                    style={[
                                        styles.subText,
                                        styles.walletAddressExtraStyle,
                                    ]}
                                    numberOfLines={1}
                                    ellipsizeMode={'tail'}>
                                    {walletAddress}
                                </Text>
                            )}
                        </View>
                        {isClickable && (
                            <View>
                                <Image
                                    source={require('@assets/dropdown.png')}
                                    style={styles.dropDownImageStyle}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    chainNameParentView: {
        flex: 1,
        marginLeft: 10,
    },
    dropDownImageStyle: {
        height: 15,
        marginRight: 10,
        width: 12,
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
    },
    subText: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        lineHeight: theme.sizes.lh14,
        marginTop: 4,
    },
    touchableParentView: {
        borderColor: theme.colors.white,
        borderRadius: 30,
        borderWidth: 1,
        marginVertical: calculateHeight(8),
        paddingHorizontal: calculateWidth(12),
        paddingVertical: calculateHeight(10),
    },
    walletAddressExtraStyle: {
        width: '30%',
    },
});
