import {
    Image,
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import ConstantStrings from '@constants/ConstantStrings';

export default function SwitchNetworkConfirmationPopup({
    setShowSwitchChainConfirmation,
    selectedItem,
    switchChain,
}) {
    return (
        <>
            <Modal
                onRequestClose={() => {
                    setShowSwitchChainConfirmation(false);
                }}
                transparent={true}>
                <View style={styles.contain}>
                    <View style={styles.popupView}>
                        <View style={styles.titleView}>
                            <Text style={styles.title}>
                                {ConstantStrings.SWITCH_NETWORK}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowSwitchChainConfirmation(false);
                                }}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={styles.closeIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text>
                            Are you sure you want to switch to{' '}
                            {selectedItem && selectedItem.chain} chain?
                        </Text>
                        <View
                            style={styles.switchChainContainerStyle}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowSwitchChainConfirmation(false);
                                }}
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.gray_background },
                                ]}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.gray_textcolor },
                                    ]}>
                                    {ConstantStrings.Cancel}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setShowSwitchChainConfirmation(false);
                                    switchChain();
                                }}
                                style={[
                                    styles.button,
                                    styles.purpleButtonStyle
                                ]}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.white },
                                    ]}>
                                    {ConstantStrings.SWITCH}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    buttonTitles: {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    closeIcon: {
        height: 24,
        width: 24,
    },
    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'space-around',
        margin: 0,
    },
    popupView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 20,
        padding: 20,
    },
    purpleButtonStyle: {
        backgroundColor: colors.purple_button_color,
        marginLeft: 12,
    },

    switchChainContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 16,
    },

    title: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
    },

    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});
