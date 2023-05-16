import {
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ConstantStrings from '@constants/ConstantStrings';
import {
    getChainForWallet,
    getFormattedURL,
    getWalletName,
} from '../src/Tabbar/TabbarFuncation';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSelector } from 'react-redux';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
    Height,
    flexDirectionRow,
} from '@constants/theme';
import { getKeyboardType } from '@constants/commonFuncation';
import AddressBookModal from '../src/Tabbar/Home/Settings/AddressBook/AddressBookModal';
import CustomImage from '@components/CustomImage';
import { validateAddressWithChain } from '../src/Tabbar/Home/Settings/AddressBook/AddressFunction';
import { logger } from '@constants/Log';

export default function AddressEnterView({
    navigation,
    setShowWarning,
    setAddress,
    Address,
    addressToPaste,
    setAddressToPaste,
    showSelectedWallet,
    setGasFee,
    isForNft,
    currentClickedWallet,
    setAddressSelectionFromAB,
    addressErrorFlagOnPreviewClick,
}) {
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);
    const QRScanReducer = useSelector(state => state.QRScanReducer);
    const [SuggestedAddress, setSuggestedAddress] = useState([]);
    const [TextHeight, setTextHeight] = useState();
    const [ShowAddressModal, setShowAddressModal] = useState(false);
    const [WalletAddressObject, setWalletAddressObject] = useState(null);
    const [isShowError, setErrorShowStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (addressErrorFlagOnPreviewClick) {
            setErrorShowStatus(true);
            setErrorMessage('Please enter address to send');
        }
    });

    useEffect(() => {
        setAddress(QRScanReducer.receiverAddress);
        setAddressToPaste(QRScanReducer.receiverAddress);
        let chainName = '';
        if (
            QRScanReducer.receiverAddress != null &&
            QRScanReducer.receiverAddress.length > 0
        )
            if (!isForNft) {
                chainName = getChainForWallet(QRScanReducer.receiverAddress);
                if (chainName.length > 0) {
                    if (
                        currentClickedWallet &&
                        currentClickedWallet.chain != chainName
                    ) {
                        showSelectedWallet(chainName);
                    }
                }
            }
    }, [QRScanReducer.receiverAddress.length]);

    /**
     *  this use effect is called when wallet getting changed from Asset..either manually or default
     *  based on that if selected chain and Address are different then show message
     */
    useEffect(() => {
        if (isWalletAndAddressEmpty()) {
            setErrorShowStatus(false);
        } else {
            if (currentClickedWallet != null) {
                const chainSeries = currentClickedWallet.chainDetail.series;
                if (Address != null || Address != undefined) {
                    const addressValidationStatus = validateAddressWithChain(
                        Address,
                        chainSeries,
                    );
                    setErrorShowStatus(false);
                    setTimeout(() => {
                        setErrorShowStatus(!addressValidationStatus);
                        if (isForNft) {
                            setErrorMessage(
                                ConstantStrings.INCORRECT_ADDRESS_FOR_SELECTED_CHAIN,
                            );
                        } else setErrorMessage(getWalletName(Address));
                    }, 500);
                }
            }
        }
    }, [currentClickedWallet]);

    useEffect(() => {
        if (isForNft && currentClickedWallet && Address) {
            const chainSeries = currentClickedWallet.chainDetail.series;
            const addressValidationStatus = validateAddressWithChain(
                Address,
                chainSeries,
            );

            setErrorShowStatus(false);
            setTimeout(() => {
                setErrorShowStatus(!addressValidationStatus);
                setErrorMessage(
                    isForNft
                        ? ConstantStrings.INCORRECT_ADDRESS_FOR_SELECTED_CHAIN
                        : getWalletName(Address),
                );
            }, 500);
        }
    }, [currentClickedWallet, Address, isForNft]);
    /**
     *  this use effect is called when address is getti cleared from field and
     *  this is used to clear error status
     */

    useEffect(() => {
        if (Address == null || Address == undefined || Address.length == 0)
            setErrorShowStatus(false);
    }, [Address]);

    const fetchCopiedText = async () => {
        const copiedString = await Clipboard.getString();
        if (copiedString.length == 0) {
            return null;
        }
        return copiedString;
    };
    const updateSize = heightOfView => {
        setTextHeight(heightOfView);
    };
    const showSuggestedAddresses = text => {
        try {
            if (
                AddressBookReducer &&
                AddressBookReducer.list &&
                AddressBookReducer.list.length > 0
            ) {
                const filteredList = AddressBookReducer.list.filter(item => {
                    return (
                        item.name.toLowerCase().includes(text.toLowerCase()) ||
                        item.wallet_address
                            .toLowerCase()
                            .includes(text.toLowerCase())
                    );
                });
                setSuggestedAddress(filteredList);
            } else {
                setSuggestedAddress([]);
            }
        } catch (error) {
            logger('showsuggested address :: ', error);
        }
    };

    const textInputAndroid = {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        color: colors.menuDotsTint,
        height: TextHeight,
        paddingVertical: 10,
        marginRight: 15,
    };
    const textInputIOS = {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        color: colors.menuDotsTint,
        paddingVertical: 10,
        marginRight: 15,
    };
    const getTextStyles = () => {
        if (Platform.OS === 'ios') {
            return textInputIOS;
        } else {
            return textInputAndroid;
        }
    };

    const onClickingItem = item => {
        setErrorShowStatus(false);
        setWalletAddressObject(item);
        setAddressSelectionFromAB(item);
        setAddress(item.wallet_address);
        setShowAddressModal(false);
    };

    const isWalletAndAddressEmpty = () => {
        return (
            (WalletAddressObject == null ||
                WalletAddressObject == undefined ||
                WalletAddressObject == {}) &&
            (Address == null || Address == '')
        );
    };

    const isAddressEmpty = () => {
        return addressToPaste == null || addressToPaste == '';
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.renderItemParentTouchableOpacity}
                onPress={() => {
                    setErrorShowStatus(false);
                    setWalletAddressObject(item);
                    setAddressSelectionFromAB(item);
                    setSuggestedAddress([]);
                    setAddress(item && item.wallet_address);
                }}>
                <View>
                    <CustomImage imageUrl={item && item.chain_icon} />
                </View>
                <View style={{ marginLeft: calculateWidth(8) }}>
                    <Text
                        style={{
                            fontFamily: fonts.titillium_bold,
                            fontSize: sizes.f16,
                            color: colors.mainColor,
                        }}>
                        {item && item.name}
                    </Text>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode={'middle'}
                        style={{
                            fontFamily: fonts.titillium_bold,
                            fontSize: sizes.f12,
                            color: colors.gray_textcolor,
                            width: calculateWidth(100),
                        }}>
                        {item && item.wallet_address}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <View style={{ paddingBottom: calculateHeight(24) }}>
            <Text style={[styles.mainText, { color: colors.gray_textcolor }]}>
                {ConstantStrings.SEND_TO}
            </Text>
            {SuggestedAddress.length > 0 && (
                <View style={styles.SuggestedAddressBackground}>
                    <FlatList
                        data={SuggestedAddress}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            )}
            <View style={flexDirectionRow}>
                <View style={styles.flexRowView}>
                    {ShowAddressModal && (
                        <AddressBookModal
                            onPress={onClickingItem}
                            ShowAddressModal={ShowAddressModal}
                            setShowAddressModal={setShowAddressModal}
                        />
                    )}

                    {isWalletAndAddressEmpty() ? (
                        // this view displays the enter address view
                        <View style={flexDirectionRow}>
                            <View style={styles.enterAddressView}>
                                <TextInput
                                    placeholder={
                                        ConstantStrings.ENTER_PUBLIC_ADDRESS
                                    }
                                    onChangeText={text => {
                                        if (text.length > 2) {
                                            showSuggestedAddresses(text);
                                        } else {
                                            setSuggestedAddress([]);
                                        }
                                    }}
                                    autoCapitalize={'none'}
                                    onContentSizeChange={e => {
                                        updateSize(
                                            e.nativeEvent.contentSize.height,
                                        );
                                    }}
                                    multiline={true}
                                    placeholderTextColor={
                                        colors.gray1_textcolor
                                    }
                                    keyboardType={getKeyboardType()}
                                    spellCheck={false}
                                    autoCorrect={false}
                                    style={getTextStyles()}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    fetchCopiedText().then(text => {
                                        setShowWarning(false);
                                        setErrorShowStatus(false);
                                        setAddressToPaste(text);
                                        setAddress(text);
                                    });
                                }}
                                style={styles.button}>
                                <Image
                                    source={require('@assets/pasteAddress.png')}
                                    style={{
                                        height: calculateHeight(20),
                                        width: calculateHeight(20),
                                    }}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    // open address book modal
                                    setShowAddressModal(true);
                                }}
                                style={[
                                    styles.button,
                                    { marginHorizontal: calculateWidth(4) },
                                ]}>
                                <Image
                                    source={require('@assets/open_address_book.png')}
                                    style={{
                                        height: calculateHeight(20),
                                        width: calculateHeight(20),
                                    }}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('QrScanner', {
                                        isFromAddressScan: true,
                                    });
                                }}
                                style={[
                                    styles.button,
                                    { marginRight: calculateWidth(8) },
                                ]}>
                                <Image
                                    source={require('@assets/scan_icon.png')}
                                    style={{
                                        height: calculateHeight(20),
                                        width: calculateHeight(20),
                                    }}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : !isAddressEmpty() ? (
                        // this view displays the address from qr code or pasting it
                        <View style={styles.addressView}>
                            <Text
                                style={[
                                    styles.mainText,
                                    styles.addressViewText,
                                ]}>
                                {getFormattedURL(addressToPaste)}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowWarning(false);
                                    setAddressToPaste(null);
                                    setAddress(null);
                                    setGasFee(0);
                                }}
                                style={styles.addressViewTouchable}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={{
                                        height: calculateHeight(20),
                                        width: calculateHeight(20),
                                    }}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.walletAddressObjectView}>
                            <View>
                                <CustomImage
                                    imageUrl={
                                        WalletAddressObject &&
                                        WalletAddressObject.chain_icon
                                    }
                                />
                            </View>
                            <View
                                style={
                                    styles.walletAddressObjectParentViewOfText
                                }>
                                <Text style={styles.mainText}>
                                    {WalletAddressObject &&
                                        WalletAddressObject.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode={'middle'}
                                    style={[
                                        styles.mainText,
                                        styles.walletAddressObjectExtraAddressTextStyle,
                                    ]}>
                                    {WalletAddressObject &&
                                        WalletAddressObject.wallet_address}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setErrorShowStatus(false);
                                    setWalletAddressObject(null);
                                    setAddressSelectionFromAB(null);
                                    setAddress(null);
                                    setGasFee(0);
                                }}
                                style={styles.walletAddressObjectCloseImage}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={{
                                        height: calculateHeight(20),
                                        width: calculateHeight(20),
                                    }}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
            {isShowError && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    SuggestedAddressBackground: {
        backgroundColor: colors.white,
        borderRadius: 8,
        elevation: 10,
        flexDirection: 'row',
        height: calculateHeight(Height / 3),
        position: 'absolute',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0.3,
        top: calculateHeight(122),
        width: '100%',
        zIndex: 1000,
    },
    addressView: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: calculateWidth(16),
        paddingRight: calculateWidth(8),
        paddingVertical: calculateHeight(10),
    },
    addressViewText: {
        color: colors.purple_button_color,
        flex: 1,
    },
    addressViewTouchable: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: calculateHeight(8),
        marginHorizontal: calculateWidth(12),
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 4,
        flex: 0.1,
        justifyContent: 'center',
        marginVertical: calculateHeight(10),
        padding: calculateWidth(8),
    },
    enterAddressView: { flex: 1, marginLeft: 10 },
    errorText: {
        color: colors.error_dots,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginHorizontal: calculateWidth(8),
        marginVertical: calculateHeight(10),
    },
    flexRowView: {
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        marginTop: 10,
    },
    mainText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
    renderItemParentTouchableOpacity: {
        alignItems: 'center',
        borderRadius: 8,
        flex: 1,
        flexDirection: 'row',
        marginVertical: calculateHeight(2),
        padding: calculateHeight(12),
    },
    walletAddressObjectCloseImage: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: calculateHeight(8),
        marginHorizontal: calculateWidth(12),
    },
    walletAddressObjectExtraAddressTextStyle: {
        color: colors.gray_textcolor,
        width: '50%',
    },
    walletAddressObjectParentViewOfText: {
        flex: 1,
        marginLeft: calculateWidth(8),
    },
    walletAddressObjectView: {
        alignItems: 'center',
        backgroundColor: colors.neutral10_1,
        borderRadius: 8,
        flexDirection: 'row',
        paddingLeft: calculateWidth(16),
        paddingRight: calculateWidth(8),
        paddingVertical: calculateHeight(10),
    },
});
