import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';

export default function ScreenTopHeader({
    title,
    topBackClick,
    showBack,
    center,
    tint,
    textColor,
}) {
    const getTextColour = () => {
        if (textColor) {
            return textColor;
        } else {
            return theme.colors.mainColor;
        }
    };

    const touchableBackIcon = {
        marginRight: 10,
        tintColor: showBack ? tint : colors.transparent,
    };
    const headerTitleStyle = {
        textAlign: center ? 'center' : 'left',
        color: getTextColour(),
    };
    return (
        <View style={theme.customStyle.headerView}>
            <TouchableOpacity
                disabled={!showBack}
                onPress={() => {
                    topBackClick();
                }}>
                <Image
                    source={require('@assets/back.png')}
                    style={[theme.customStyle.closeIcon, touchableBackIcon]}
                />
            </TouchableOpacity>

            <Text style={[styles.title, headerTitleStyle]}>{title}</Text>

            <TouchableOpacity disabled={true}>
                <Image
                    source={require('@assets/back.png')}
                    style={[
                        theme.customStyle.closeIcon,
                        styles.invisibleBackImageStyle,
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    invisibleBackImageStyle: {
        marginLeft: 10,
        tintColor: colors.transparent,
    },
    title: {
        color: theme.colors.mainColor,
        flex: 1,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24 + 4,
    },
});
