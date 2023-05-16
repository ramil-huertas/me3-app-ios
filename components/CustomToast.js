import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { sizes, colors } from '@constants/theme';
import { theme } from '@constants';

export default function CustomToast({
    setShowToastNotification,
    Message,
    type,
}) {
    useEffect(() => {
        setTimeout(() => {
            setShowToastNotification(false);
        }, 3000);
    }, []);

    return (
        <View style={styles.contain}>
            <View style={styles.popupView}>
                <Image
                    source={
                        type == 'error'
                            ? require('@assets/error_icon.png')
                            : require('@assets/CopySuccess.png')
                    }
                    style={styles.icon}
                    resizeMode="stretch"></Image>
                <Text style={styles.txtTitle}>
                    {Message != null ? Message : 'error'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contain: {
        alignSelf: 'center',
        bottom: 40,
        padding: 10,
        position: 'absolute',
        zIndex: 1000,
    },

    icon: {
        height: 15,
        marginRight: 5,
        padding: 5,
        width: 15,
    },

    popupView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        // marginBottom: 95,
        padding: 12,
        // shadowOffset:{height:0,width:0},
        shadowColor: colors.shadow2,
        shadowOpacity: 0.12,
    },

    txtTitle: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: sizes.f12,
        marginLeft: 8,
    },
});
