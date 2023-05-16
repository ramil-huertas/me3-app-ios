import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { ConnecttodApp, Therenothinghereyet } from '@constants/ConstantStrings';
import { colors } from '@constants/theme';
import { theme } from '@constants';

export default function WalletFooter({ connectToAppCallBack }) {
    return (
        <View style={styles.contain}>
            {/* <View style={styles.titleView}> */}
            <View style={styles.noDataView}>
                <Text style={styles.txtTitle2}> {Therenothinghereyet}</Text>
                <Image
                    source={require('@assets/qr-code.png')}
                    style={styles.noDataIcon}
                    resizeMode="contain"></Image>
            </View>
            {/* </View> */}

            <TouchableOpacity
                onPress={connnectToappClick}
                style={styles.btnDeposite}>
                <Image
                    source={require('@assets/scan.png')}
                    resizeMode="contain"
                    style={styles.scanIcon}></Image>
                <Text style={styles.txtDeposite}>{ConnecttodApp}</Text>
            </TouchableOpacity>
        </View>
    );

    function connnectToappClick() {
        connectToAppCallBack();
    }
}

const styles = StyleSheet.create({
    btnDeposite: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 12,
        elevation: 8,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        marginBottom: 10,
        marginHorizontal: 20,
        shadowColor: colors.purple_button_color,
    },

    contain: {
        backgroundColor: colors.white,
        borderRadius: 12,
    },

    noDataIcon: {
        height: 80,
        marginLeft: 24,
        width: 80,
    },
    noDataView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 10,
    },

    scanIcon: {
        height: 20,
        width: 20,
    },

    txtDeposite: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        paddingLeft: 5,
    },

    txtTitle2: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },
});
