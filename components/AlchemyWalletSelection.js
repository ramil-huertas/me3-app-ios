import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { theme } from '@constants';
import CustomImage from './CustomImage';
import {
    calculateHeight,
    calculateWidth,
    flexDirectionRow,
} from '@constants/theme';
export default function AlchemyWalletSelection({
    imageIcon,
    chainname,
    walletAddress,
    clickEvent,
    ShowWalletAddress,
}) {
    const getChainTextLineHeight = {
        lineHeight: !ShowWalletAddress ? null : theme.sizes.lh20,
    };
    const getBackgroundColour = {
        backgroundColor: theme.colors.ghost_white
    };
    return (
        <View>
            <TouchableOpacity
            style={[styles.touchableParentView, getBackgroundColour]}
                onPress={() => clickEvent()}>
                    <View style={flexDirectionRow}>
                        <View>
                            <CustomImage imageUrl={imageIcon} />
                        </View>
                        <View style={styles.chainNameParentView}>
                                <Text
                                    style={[
                                        styles.mainText,
                                        getChainTextLineHeight,
                                    ]}>
                                    {chainname}{' '}
                                </Text>
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

                            <View>
                                <Image
                                    source={require('@assets/dropdown.png')}
                                    style={styles.dropDownImageStyle}
                                    resizeMode="contain"
                                />
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
        marginVertical: calculateHeight(10),
        paddingHorizontal: calculateWidth(12),
        paddingVertical: calculateHeight(5),
    },
    walletAddressExtraStyle: {
        width: '60%',
    },
});
