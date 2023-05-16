import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import { theme } from '@constants';

export default function SettingsItemComponent({
    title,
    subtitle,
    icon,
    clickEvent,
}) {
    return (
        <View style={styles.flexOne}>
            <TouchableOpacity onPress={clickEvent}>
                <View style={styles.itemView}>
                    <Image
                        source={icon}
                        resizeMode="contain"
                        style={styles.itemIcon}></Image>
                    <View style={styles.itmeSubview}>
                        <View style={styles.itmeSubview2}>
                            <Text style={styles.itemTitle}>{title}</Text>
                            <Text style={styles.itmeSubtitle}>{subtitle}</Text>
                        </View>
                        <Image
                            source={require('@assets/forward.png')}
                            resizeMode="contain"
                            style={styles.forwardIcon}></Image>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
    forwardIcon: {
        height: 20,
        marginRight: 12,
        width: 20,
    },

    itemIcon: {
        height: 36,
        marginLeft: 12,
        width: 36,
    },
    itemTitle: {
        color: theme.colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
    itemView: {
        alignItems: 'center',
        backgroundColor: theme.colors.gray_background,
        borderRadius: 8,
        flex: 1,
        flexDirection: 'row',
        height: theme.calculateHeight(52),
        marginLeft: 24,
        marginRight: 24,
        marginTop: 10,
    },
    itmeSubtitle: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },
    itmeSubview: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    itmeSubview2: {
        alignItems: 'flex-start',
        flex: 0.9,
        flexDirection: 'column',
        marginLeft: 10,
    },
});
