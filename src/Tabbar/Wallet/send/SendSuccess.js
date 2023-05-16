import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Modal,
} from 'react-native';
import React, { useState } from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
    fonts,
    sizes,
} from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import { getFormattedURL } from '../../TabbarFuncation';
import { useSelector } from 'react-redux';
import CustomImage from '@components/CustomImage';
import { useFocusEffect } from '@react-navigation/native';

export default function SendSuccess({
    addAddress,
    wallet_Address,
    ShowPopupStatus,
    setShowPopupStatus,
    goBackAfterSuccess,
    isAddressSaved,
}) {
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);
    const [currentSavedAddress, setCurrentSavedAddress] = useState(null);
    const checkIfAddressIsPresent = () => {
        const data = AddressBookReducer.list;
        if (data == undefined || data == null || data.length == 0) {
            return false;
        } else {
            const tempData = data.find(item => {
                return item.wallet_address == wallet_Address;
            });
            // }
            return tempData == undefined
                ? false
                : isAddressSaved
                    ? false
                    : true;
        }
    };
    function getCurrentSelectedWallet() {
        const data = AddressBookReducer.list;
        if (data == undefined || data == null || data.length == 0) {
            return false;
        } else {
            const tempData = data.find(item => {
                return item.wallet_address == wallet_Address;
            });
            return tempData;
        }
    }

    useFocusEffect(() => {
        const currentSavedAddress = getCurrentSelectedWallet();
        if (currentSavedAddress != undefined) {
            setCurrentSavedAddress(currentSavedAddress);
        }
    });
    const getMarginBottom = () => {
        if (checkIfAddressIsPresent()) return calculateHeight(20);
        else null;
    };
    return (
        <Modal
            animationType="fade"
            visible={ShowPopupStatus}
            onRequestClose={() => {
                setShowPopupStatus(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupStyle}>
                    <View
                        style={styles.transactionOnWayContainerStyle(getMarginBottom())}>
                        <Image
                            source={require('@assets/up_icon.png')}
                            style={styles.upiconStyle}
                            resizeMode="contain"></Image>
                        <Text
                            style={{
                                fontSize: theme.sizes.f18,
                                fontFamily: theme.fonts.titillium_bold,
                                color: theme.colors.mainColor,
                                marginVertical: calculateHeight(15),
                            }}>
                            {ConstantStrings.YOUR_TRANSACTION_ON_WAY}
                        </Text>

                        <Text
                            style={styles.takeWhileToExecuteStyle}>
                            {
                                ConstantStrings.IT_MAY_TAKE_WHILE_TO_EXECUTE_TRANSACTION
                            }
                        </Text>
                    </View>

                    {!checkIfAddressIsPresent() && (
                        <View style={styles.addAddressView}>
                            <View style={styles.addAddressTitleView}>
                                <Image
                                    source={require('@assets/open_address_book.png')}
                                    style={styles.addAddressTitleImage}
                                    resizeMode={'contain'}
                                />
                                <Text style={styles.addAddressTitleText}>
                                    {isAddressSaved
                                        ? ConstantStrings.ADDRESS_SAVED_SUCCESSSFULLY
                                        : ConstantStrings.SAVE_ADDRESS_TO_YOUR_ADDRESS_BOOK}
                                </Text>
                            </View>
                            <View style={styles.addAddressValueView}>
                                {isAddressSaved ? (
                                    <View
                                        style={styles.savedAddessViewStyle}>
                                        <View>
                                            <CustomImage
                                                imageUrl={
                                                    currentSavedAddress &&
                                                    currentSavedAddress.chain_icon
                                                }
                                            />
                                        </View>
                                        <View
                                            style={{
                                                marginLeft: calculateWidth(8),
                                            }}>
                                            <Text style={styles.mainText}>
                                                {currentSavedAddress &&
                                                    currentSavedAddress.name}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode={'middle'}
                                                style={[
                                                    styles.mainText,
                                                    {
                                                        color: colors.gray_textcolor,
                                                        width: calculateWidth(
                                                            100,
                                                        ),
                                                        fontSize:
                                                            theme.sizes.f12,
                                                    },
                                                ]}>
                                                {currentSavedAddress &&
                                                    currentSavedAddress.wallet_address}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.addAddressValue}>
                                        {getFormattedURL(wallet_Address)}
                                    </Text>
                                )}

                                {isAddressSaved ? (
                                    <View
                                        style={[
                                            styles.addAddressButton,
                                            { backgroundColor: colors.success },
                                        ]}>
                                        <Image
                                            source={require('@assets/saved_icon.png')}
                                            style={[
                                                styles.addAddressButtonImage,
                                                {
                                                    height: calculateHeight(12),
                                                    width: calculateWidth(12),
                                                },
                                            ]}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={styles.addAddressButtonText}>
                                            {ConstantStrings.LABEL_SAVED}
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => {
                                            addAddress();
                                        }}
                                        style={styles.addAddressButton}>
                                        <Image
                                            source={require('@assets/Add.png')}
                                            style={styles.addAddressButtonImage}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={styles.addAddressButtonText}>
                                            {ConstantStrings.ADD}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.approve}
                        onPress={() => {
                            goBackAfterSuccess();
                        }}>
                        <Text style={styles.approveText}>
                            {ConstantStrings.CLOSE}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    addAddressButton: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: calculateWidth(8),
        paddingHorizontal: calculateWidth(16),
        paddingVertical: calculateHeight(10),
    },
    addAddressButtonImage: {
        height: calculateHeight(20),
        marginRight: 4,
        tintColor: colors.white,
        width: calculateHeight(20),
    },
    addAddressButtonText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    addAddressTitleImage: {
        height: calculateHeight(20),
        marginRight: calculateWidth(8),
        tintColor: colors.black,
        width: calculateHeight(20),
    },
    addAddressTitleText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: 18,
    },
    addAddressTitleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: calculateHeight(10),
    },
    addAddressValue: {
        color: colors.purple_button_color,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        paddingLeft: 5,
    },
    addAddressValueView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        flexDirection: 'row',
        paddingHorizontal: calculateWidth(8),
        paddingVertical: calculateHeight(10),
    },
    addAddressView: {
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 8,
        marginVertical: calculateHeight(24),
        paddingHorizontal: calculateWidth(16),
        paddingVertical: calculateHeight(12),
    },
    approve: {
        alignItems: 'center',
        backgroundColor: colors.ghost_white,
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    approveText: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
    },
    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'flex-end',
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14 + 1,
        lineHeight: theme.sizes.lh20,
        paddingVertical: theme.calculateHeight(0),
    },
    popupStyle: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: calculateWidth(24),
        paddingVertical: calculateHeight(30),

        // height: '50%'
    },
    savedAddessViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        marginTop: 5,
    },
    takeWhileToExecuteStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        fontWeight: theme.sizes.fw600,
        textAlign: 'center',
        width: theme.Width / 1.5,
    },
    transactionOnWayContainerStyle: marginBottom => ({
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom,
        paddingHorizontal: calculateWidth(20),
    }),
    upiconStyle: {
        height: 46,
        width: 46,
    },
});
