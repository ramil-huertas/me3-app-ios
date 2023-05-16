import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import {
    Cancel,
    Disconnect,
    Disconnectall,
    DisconnectfromalldAppsConfirmation,
} from '@constants/ConstantStrings';
import Wallet from '../../walletconnect/ExportWalletNativeModule';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';

export default function DisconnectAllWallet({
    setShowDisconnectAllWalletPopup,
    DisconnectAllWalletClosePopup,
}) {
    return (
        <Modal
            onRequestClose={() => {
                setShowDisconnectAllWalletPopup(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.txtHead}>{Disconnectall}</Text>
                    <Text style={styles.txtSubtitle}>
                        {DisconnectfromalldAppsConfirmation}
                    </Text>

                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            style={styles.cancelView}
                            onPress={() => {
                                setShowDisconnectAllWalletPopup(false);
                                //DisconnectAllWalletClosePopup()
                            }}>
                            <View style={styles.cancelView}>
                                <Text style={styles.txtCancel}>{Cancel}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.disconnectView}
                            onPress={async () => {
                                const eventObject = {
                                    timeOfClick: new Date().toLocaleString(),
                                };
                                firebaseAnalytics(
                                    firebaseEvents.dapp_disconnect_all,
                                    eventObject,
                                );

                                try {
                                    await Wallet.disconnectAllSessions();
                                    // setShowDisconnectAllWalletPopup(false)
                                    // DisconnectAllWalletClosePopup()
                                } catch (error) {
                                    logger(
                                        'disconnectall session error',
                                        error,
                                    );
                                }
                            }}>
                            <View style={styles.disconnectView}>
                                <Text style={styles.txtDisconnect}>
                                    {Disconnect}
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
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        margin: 24,
        marginBottom: 5,
    },

    txtSubtitle: {
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f16,
        marginBottom: 24,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 10,
    },
});
