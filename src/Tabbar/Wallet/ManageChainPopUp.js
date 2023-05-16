import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import { logger } from '@constants/Log';
import ConstantStrings from '@constants/ConstantStrings';
export default function ManageChainPopUp({ setshowManageChainPopUp }) {
    return (
        <Modal
            onRequestClose={() => {
                logger('Click');
                setshowManageChainPopUp(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.txtHead}>
                        {ConstantStrings.MANAGE_CHAIN}
                    </Text>
                    <Text style={styles.txtSubtitle}>
                        {ConstantStrings.PLEASE_SELECT_ANY_ONE_CHAIN}
                    </Text>
                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            onPress={() => {
                                setshowManageChainPopUp(false);
                            }}
                            style={styles.disconnectView}>
                            <View style={styles.disconnectView}>
                                <Text style={styles.txtDisconnect}>
                                    {ConstantStrings.OK}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    bottomView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        marginLeft: 24,
        marginRight: 24,
    },

    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'space-around',
    },

    disconnectView: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        margin: 5,
    },

    popupView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 20,
    },

    txtDisconnect: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    txtHead: {
        color: colors.mainColor,

        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        margin: 24,
        marginBottom: 5,
    },

    txtSubtitle: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f16,
        marginBottom: 24,
        marginLeft: 24,
        marginRight: 24,
    },
});
