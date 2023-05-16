import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { DisconnectfromalldApps } from '@constants/ConstantStrings';
import { colors } from '@constants/theme';
import { theme } from '@constants';

export default function DisconnctFooter({ Item, diconnectAllCallback }) {
    return (
        <View style={styles.contain}>
            <TouchableOpacity onPress={disconnnectToappClick}>
                <View style={styles.btnDeposite}>
                    <Text style={styles.txtDeposite}>
                        {DisconnectfromalldApps}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    function disconnnectToappClick() {
        diconnectAllCallback();
    }
}

const styles = StyleSheet.create({
    btnDeposite: {
        alignItems: 'center',
        backgroundColor: colors.offRed,
        borderRadius: 12,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        margin: 20,
    },

    contain: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginVertical: 16,
    },

    txtDeposite: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        paddingLeft: 5,
    },
});
