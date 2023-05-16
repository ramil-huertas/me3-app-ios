import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import { BACKUPWARNING, OK, UNABLETOLOGOUT } from '@constants/ConstantStrings';

export default function BackupWarning({ setShowBackupWarning }) {
    return (
        <Modal
            onRequestClose={() => {
                setShowBackupWarning(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.txtHead}>{UNABLETOLOGOUT}</Text>
                    <Text style={styles.txtSubtitle}>{BACKUPWARNING}</Text>

                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowBackupWarning(false);
                            }}
                            style={styles.cancelView}>
                            <View style={styles.cancelView}>
                                <Text style={styles.txtOk}>{OK}</Text>
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
        backgroundColor: colors.purple_button_color,
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
    popupView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 20,
    },

    txtHead: {
        color: colors.mainColor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        margin: 24,
        marginBottom: 5,
    },

    txtOk: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
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
