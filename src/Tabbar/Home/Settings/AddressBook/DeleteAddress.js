import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import {
    CONFIRM_DELETE,
    DELETE,
    DELETE_ADDRESS,
    Cancel,
} from '@constants/ConstantStrings';
import { deleteAddressInBook } from '@database/sql';
import { getAddressBook } from '@redux/Action/AddressBookAction';
import { useDispatch } from 'react-redux';
export default function DeleteAddress({
    showDeleteAddressPopUp,
    setShowDeleteAddressPopUp,
    ItemDetails,
    setAddressDeleted,
}) {
    const dispatch = useDispatch();
    const onDeleteAddress = () => {
        deleteAddressInBook(ItemDetails.id);
        getAddressBook(dispatch);
        setAddressDeleted(true);
    };
    return (
        <Modal
            visible={showDeleteAddressPopUp}
            onRequestClose={() => {
                setShowDeleteAddressPopUp(false);
            }}
            animationType={'fade'}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.txtHead}>{DELETE_ADDRESS}</Text>
                    <Text style={styles.txtSubtitle}>{CONFIRM_DELETE}</Text>

                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDeleteAddressPopUp(false);
                            }}
                            style={styles.cancelView}>
                            <View style={styles.cancelView}>
                                <Text style={styles.txtCancel}>{Cancel}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDeleteAddressPopUp(false);
                                onDeleteAddress();
                            }}
                            style={styles.disconnectView}>
                            <View style={styles.disconnectView}>
                                <Text style={styles.txtDisconnect}>
                                    {DELETE}
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
        fontSize: theme.sizes.f18,
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
