import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { calculateHeight, colors, fonts, sizes } from '@constants/theme';
import { NO_ADDRESS_SAVED } from '@constants/ConstantStrings';

const EmptyAddress = () => {
    return (
        <View style={styles.mainContainer}>
            <Image
                source={require('@assets/noAddress.png')}
                style={styles.noAddress}
                resizeMode="contain"
            />
            <Text style={styles.noAddressText}>{NO_ADDRESS_SAVED}</Text>
        </View>
    );
};

export default EmptyAddress;
const styles = StyleSheet.create({
    mainContainer: { alignItems: 'center', marginTop: calculateHeight(48) },
    noAddress: {
        height: calculateHeight(180),
        width: calculateHeight(180),
    },
    noAddressText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginTop: calculateHeight(8),
    },
});
