import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';

export default function AddWalletView({ Item, addWalletCallBack }) {
    return (
        <View style={styles.contain}>
            <TouchableOpacity onPress={connnectToappClick}>
                <View style={styles.btnDeposite}>
                    <Image
                        source={require('@assets/Add.png')}
                        style={styles.scanIcon}
                        resizeMode="contain"></Image>
                    <Text style={styles.txtDeposite}>Add wallet</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    function connnectToappClick() {
        addWalletCallBack();
    }
}

const styles = StyleSheet.create({
    btnDeposite: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        marginTop: 30,
        width: 120,
    },

    contain: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    scanIcon: {
        height: 20,
        width: 20,
    },

    txtDeposite: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        paddingLeft: 5,
    },
});
