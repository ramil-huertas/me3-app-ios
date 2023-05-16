import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import {
    calculateHeight,
    calculateWidth,
    colors,
    fonts,
    sizes,
} from '../constant/theme';

const RowButton = ({
    onPressFunction,
    imageSource,
    imageStyle,
    buttonTitle,
    itemStyle,
    fontColor,
}) => {
    return (
        <View style={{ paddingHorizontal: calculateWidth(10) }}>
            <TouchableOpacity
                style={[styles.btnDeposite, itemStyle]}
                onPress={onPressFunction}>
                <Image
                    source={imageSource}
                    style={imageStyle}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            <Text
                style={[
                    styles.txtDeposite,
                    { color: fontColor ? fontColor : styles.txtDeposite.color },
                ]}>
                {buttonTitle}
            </Text>
        </View>
    );
};

export default RowButton;
const styles = StyleSheet.create({
    btnDeposite: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 44,
        justifyContent: 'center',
        padding: calculateHeight(14),
        // width: Width / 4,
        // flexDirection: 'row',
        // height: 50,
    },
    txtDeposite: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        textAlign: 'center',
    },
});
