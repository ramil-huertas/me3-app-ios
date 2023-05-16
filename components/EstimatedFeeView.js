import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import EstimatedFeePopup from '@components/EstimatedFeePopup';

export default function EstimatedFeeView({
    gasFee,
    symbol,
    giveMarginTop20,
    textStyle,
    imageStyle,
}) {
    const [isShowEstimatedPopup, setEstimatedFeePopupShowStatus] =
        useState(false);
    const estimatedGasInfoClick = () => {
        setEstimatedFeePopupShowStatus(true);
    };
    const getMarginTop = giveMarginTop20 ? 20 : null;
    return (
        <View>
            {isShowEstimatedPopup && (
                <EstimatedFeePopup
                    setEstimatedFeePopupShowStatus={
                        setEstimatedFeePopupShowStatus
                    }
                />
            )}
            <View style={[styles.parentView, getMarginTop]}>
                <Text style={[styles.estimatedFeeStyle, textStyle]}>
                    {ConstantStrings.ESTIMATED_FEES}
                </Text>
                <TouchableOpacity
                    onPress={() => estimatedGasInfoClick()}
                    style={styles.touchableView}>
                    <Image
                        source={require('@assets/Question.png')}
                        style={[styles.imageView, imageStyle]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <View style={styles.flexOne}></View>
                <Text
                    style={[
                        styles.estimatedFeeStyle,
                        {
                            fontSize: theme.sizes.f14,
                            color: theme.colors.purple_button_color,
                            fontFamily: theme.fonts.titillium_bold,
                        },
                    ]}>
                    {gasFee} {symbol}
                </Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    estimatedFeeStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },
    flexOne: {
        flex: 1,
    },
    imageView: {
        height: 10,
        marginLeft: 8,
        width: 10,
    },
    parentView: {
        alignContent: 'center',
        flexDirection: 'row',
        marginHorizontal: 4,
    },

    touchableView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
