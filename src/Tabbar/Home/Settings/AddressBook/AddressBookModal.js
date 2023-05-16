import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import AddressBookComponent from './AddressBookComponent';
import {
    calculateHeight,
    calculateWidth,
    colors,
    fonts,
    NativeBaseModalStyle,
    sizes,
} from '@constants/theme';
import ConstantStrings from '@constants/ConstantStrings';
import { Modal } from 'native-base';

const AddressBookModal = ({
    setShowAddressModal,
    ShowAddressModal,
    onPress,
}) => {
    return (
        <Modal
            isOpen={ShowAddressModal}
            onClose={() => {
                setShowAddressModal(false);
            }}
            size={'full'}
            background={colors.popupBgcolor}
            animationPreset={'fade'}>
            <Modal.Content
                style={NativeBaseModalStyle.setBottomModal}
                p={'0'}
                pt={'2'}>
                <Modal.Body>
                    <View style={styles.addressbookImageContainerStyle}>
                        <Image
                            source={require('@assets/open_address_book.png')}
                            style={{
                                height: calculateHeight(20),
                                width: calculateHeight(20),
                                tintColor: colors.black,
                                marginRight: calculateWidth(8),
                            }}
                            resizeMode={'contain'}
                        />
                        <Text style={styles.title}>
                            {ConstantStrings.ADDRESS_BOOK}
                        </Text>
                    </View>
                    <View
                        style={{
                            height: calculateHeight(420),
                        }}>
                        <AddressBookComponent onPress={onPress} />
                    </View>
                    <TouchableOpacity
                        style={styles.bottomTouchableStyle}
                        onPress={() => {
                            setShowAddressModal(false);
                        }}>
                        <Text style={styles.bottomButtonStyle}>
                            {ConstantStrings.Cancel}
                        </Text>
                    </TouchableOpacity>
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};

export default AddressBookModal;
const styles = StyleSheet.create({
    addressbookImageContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: calculateHeight(22),
    },
    bottomButtonStyle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        textAlign: 'center',
    },
    bottomTouchableStyle: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: sizes.button_border_radius,
        justifyContent: 'center',
        margin: calculateWidth(20),
        paddingBottom: calculateHeight(18),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    title: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        textAlign: 'center',
    },
});
