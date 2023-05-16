import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import {
    calculateHeight,
    calculateWidth,
    colors,
    fonts,
    sizes,
} from '@constants/theme';

const WarningMessage = ({ message, dualMessage, mainMessage, subMessage }) => {
    return (
        <View style={styles.mainContainer}>
            <Image
                source={require('@assets/info_purple_icon.png')}
                resizeMode={'contain'}
                style={styles.warningIcon}
            />
            {dualMessage ? (
                <View style={{ marginRight: calculateWidth(30) }}>
                    <Text style={styles.warningMain}>{mainMessage}</Text>
                    <Text style={styles.warningSub}>{subMessage}</Text>
                </View>
            ) : (
                <Text style={styles.warningMessage}>{message}</Text>
            )}
        </View>
    );
};

export default WarningMessage;

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 8,
        flexDirection: 'row',
        marginTop: calculateHeight(16),
        padding: calculateHeight(10),
    },
    warningIcon: {
        borderRadius: 22 / 2,
        height: 22,
        marginRight: 10,
        width: 22,
    },
    warningMain: {
        color: colors.purple_button_color,
        flexShrink: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.f14,
    },
    warningMessage: {
        color: colors.purple_button_color,
        flexShrink: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.f14,
    },
    warningSub: {
        color: colors.purple_button_color,
        flexShrink: 1,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
        lineHeight: sizes.f14,
        marginTop: calculateHeight(4),
    },
});
