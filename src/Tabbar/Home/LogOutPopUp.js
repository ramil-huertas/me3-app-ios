import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import { Cancel, Logout, LOGOUT_WARNING } from '@constants/ConstantStrings';

export default function LogOutPopUp({ setShowLogOutPopUP, logoutCallback }) {
    return (
        <Modal
            onRequestClose={() => {
                setShowLogOutPopUP(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.txtHead}>{Logout}</Text>
                    <Text style={styles.txtSubtitle}>{LOGOUT_WARNING}</Text>

                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowLogOutPopUP(false);
                            }}
                            style={styles.cancelView}>
                            <View style={styles.cancelView}>
                                <Text style={styles.txtCancel}>{Cancel}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowLogOutPopUP(false);
                                logoutCallback();
                            }}
                            style={styles.disconnectView}>
                            <View style={styles.disconnectView}>
                                <Text style={styles.txtDisconnect}>
                                    {Logout}
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

    cancelView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 10,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        margin: 5,
    },

    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'space-around',
    },

    disconnectView: {
        alignItems: 'center',
        backgroundColor: colors.offRed,
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

    txtCancel: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
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
