import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
    NativeBaseModalStyle,
} from '@constants/theme';
import {
    Cancel,
    SAVE_ADDRESS,
    ADDRESS_NAME,
    ADDRESS_NAME_PLACEHOLDER,
    WALLET_ADDRESS,
    ENTER_PUBLIC_ADDRESS,
    ADD_NEW_ADDRESS,
    EDIT_ADDRESS,
    ADD_COMMONLY_USED_ADDRESS,
    ADDRESS_NAME_EXISTS_ERROR,
    ADDRESS_ALREADY_SAVED_ERROR,
    INCORRECT_ADDRESS_ERROR,
    INCORRECT_ADDRESS_FOR_SELECTED_CHAIN,
} from '@constants/ConstantStrings';
import AddAddressInputField from './AddAddressInputField';
import ChangeWallet from '../../../Swap/ChangeWallet';
import TopWalletSelection from '@components/TopWalletSelection';
import { logger } from '@constants/Log';
import { getWalletForChainWithCDetail } from '@database/sql';
import moment from 'moment/moment';
import { useSelector } from 'react-redux';
import { validateAddress, validateAddressWithChain } from './AddressFunction';
import { getFormattedURL } from '../../../TabbarFuncation';
import QrScannerModal from '@components/QrScannerModal';
import { getDefaultWalletChainNameForSelection } from '@constants/commonFuncation';
import { Modal } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddEditAddress = ({
    showPopupStatus,
    setShowPopupStatus,
    editAddress,
    itemDetails,
    onSuccess,
    addAddressWithDetails,
    onCancel,
}) => {
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);

    const [name, setName] = useState('');
    const [validName, setValidName] = useState(true);
    const [walletAddress, setWalletAddress] = useState('');
    const [validWalletAddress, setValidWalletAddress] = useState(true);
    const [showChangeWallet, setShowChangeWallet] = useState(false);
    const [currentClickedWallet, setCurrentClickedWallet] = React.useState({});
    const [chainName, setChainName] = React.useState('');
    const [chainSeries, setChainSeries] = React.useState('');
    const [refresh, setRefresh] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [load, setLoad] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        const chainNameFromParent =
            editAddress || addAddressWithDetails ? itemDetails.chain : null;
        if (chainNameFromParent == null) {
            getDefaultWalletChainNameForSelection()
                .then(firstWallet => {
                    getWalletFromSpecificChain(firstWallet);
                })
                .catch(error => {
                    logger('*error ', error);
                });
        } else {
            getWalletFromSpecificChain(chainNameFromParent);
        }

        if (editAddress || addAddressWithDetails) {
            setName(itemDetails.name);
            setWalletAddress(itemDetails.wallet_address);
            setLoad(!load);
        }
    }, []);

    function getWalletFromSpecificChain(chain) {
        getWalletForChainWithCDetail(chain)
            .then(result => {
                if (result.rows.length > 0) {
                    const walletData = result.rows.item(0);
                    setCurrentClickedWallet(walletData);
                    setChainName(walletData.chain);
                    setChainSeries(walletData.series);
                }
            })
            .catch(error => {
                logger('&*&*&*&**', error);
            });
    }
    function selectedChain(selectedChain1) {
        setCurrentClickedWallet(selectedChain1);
        setChainName(selectedChain1.chain);
        setChainSeries(selectedChain1.chainDetail.series);
        setRefresh(!refresh);
        setValidWalletAddress(true);
    }
    const checkIsNameAndAddressPresent = list => {
        if (name == list.name) {
            setValidName(false);
            setValidWalletAddress(true);
            setErrorMessage(ADDRESS_NAME_EXISTS_ERROR);
            return true;
        } else if (
            chainName == list.chain &&
            walletAddress == list.wallet_address
        ) {
            setValidWalletAddress(false);
            setValidName(true);
            setErrorMessage(ADDRESS_ALREADY_SAVED_ERROR);
            return true;
        }
    };
    const checkIsNameAndAddressPresentWhenEditing = list => {
        if (name == list.name) {
            setValidName(false);
            setValidWalletAddress(true);
            setErrorMessage(ADDRESS_NAME_EXISTS_ERROR);
            return true;
        } else if (
            chainName == list.chain &&
            walletAddress == list.wallet_address
        ) {
            setValidWalletAddress(false);
            setValidName(true);
            setErrorMessage(ADDRESS_ALREADY_SAVED_ERROR);
            return true;
        }
    };

    const ValidateFields = async () => {
        if (editAddress) {
            const tempList = AddressBookReducer.list.filter(item => {
                return item.id != itemDetails.id;
            });
            const check = tempList.find(
                checkIsNameAndAddressPresentWhenEditing,
            );
            const AddressValidate = validateAddress(itemDetails.wallet_address);
            if (check) {
                return false;
            } else if (!AddressValidate) {
                setValidWalletAddress(false);
                setValidName(true);
                setErrorMessage(INCORRECT_ADDRESS_ERROR);
                return false;
            } else {
                const addressValidationStatus = validateAddressWithChain(
                    walletAddress,
                    chainSeries,
                );
                if (addressValidationStatus) {
                    const object = {
                        name: name,
                        wallet_address: getFormattedURL(walletAddress),
                        created_at: itemDetails.created_at,
                        updated_at: moment().format('DD/MM/YYYY'),
                        chain: chainName,
                    };
                    onSuccess(object);
                    setShowPopupStatus(false);
                } else {
                    setValidWalletAddress(false);
                    setValidName(true);
                    setErrorMessage(INCORRECT_ADDRESS_FOR_SELECTED_CHAIN);
                }
            }
        } else if (addAddressWithDetails) {
            const check =
                AddressBookReducer.list == undefined ||
                AddressBookReducer.list == null ||
                AddressBookReducer.list == []
                    ? false
                    : AddressBookReducer.list.find(
                          checkIsNameAndAddressPresent,
                      );
            const AddressValidate = validateAddress(walletAddress);
            if (check) {
                return false;
            } else if (!AddressValidate) {
                setValidWalletAddress(false);
                setValidName(true);
                setErrorMessage(INCORRECT_ADDRESS_ERROR);
                return false;
            } else {
                const addressValidationStatus = validateAddressWithChain(
                    walletAddress,
                    chainSeries,
                );
                if (addressValidationStatus) {
                    const object = {
                        name,
                        wallet_address: getFormattedURL(walletAddress),
                        created_at: moment().format('DD/MM/YYYY'),
                        updated_at: moment().format('DD/MM/YYYY'),
                        chain: chainName,
                    };
                    onSuccess(object);
                    setShowPopupStatus(false);
                } else {
                    setValidWalletAddress(false);
                    setValidName(true);
                    setErrorMessage(INCORRECT_ADDRESS_FOR_SELECTED_CHAIN);
                }
            }
        } else {
            const check =
                AddressBookReducer.list == undefined ||
                AddressBookReducer.list == null ||
                AddressBookReducer.list == []
                    ? false
                    : AddressBookReducer.list.find(
                          checkIsNameAndAddressPresent,
                      );
            const AddressValidate = validateAddress(walletAddress);
            if (check) {
                return false;
            } else if (!AddressValidate) {
                setValidWalletAddress(false);
                setValidName(true);
                setErrorMessage(INCORRECT_ADDRESS_ERROR);
                return false;
            } else {
                const addressValidationStatus = validateAddressWithChain(
                    walletAddress,
                    chainSeries,
                );
                if (addressValidationStatus) {
                    const object = {
                        name,
                        wallet_address: getFormattedURL(walletAddress),
                        created_at: moment().format('DD/MM/YYYY'),
                        updated_at: moment().format('DD/MM/YYYY'),
                        chain: chainName,
                    };
                    onSuccess(object);
                    setShowPopupStatus(false);
                } else {
                    setValidWalletAddress(false);
                    setValidName(true);
                    setErrorMessage(INCORRECT_ADDRESS_FOR_SELECTED_CHAIN);
                }
            }
        }
    };

    function dummyFunction(testData) {
        logger('test data :: ', testData);
    }
    return (
        <Modal
            size={'full'}
            isOpen={showPopupStatus}
            onClose={() => {
                setShowPopupStatus(false);
            }}
            animationPreset="fade"
            backgroundColor={colors.popupBgcolor}>
            <KeyboardAwareScrollView
                style={styles.keyboardAwareStyles}
                contentContainerStyle={styles.keyboardAwareContentStyles}
                nestedScrollEnabled={true}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}>
                <Modal.Content
                    style={NativeBaseModalStyle.setBottomModal}
                    p={'2'}
                    pb={'6'}>
                    <Modal.Body _scrollview={{ bounces: false }}>
                        <View>
                            {showScanner && (
                                <QrScannerModal
                                    setText={setWalletAddress}
                                    setShowScanner={setShowScanner}
                                    ShowScanner={showScanner}
                                />
                            )}
                            {showChangeWallet && (
                                <ChangeWallet
                                    setShowChangeWallet={setShowChangeWallet}
                                    setSelectedChainWallet={selectedChain}
                                    AllChain={true}
                                    setFee={dummyFunction}
                                    setSwapAmount={dummyFunction}
                                    setSwapToAmount={dummyFunction}
                                    isFromSend={true}
                                    showChangeWallet={showChangeWallet}
                                />
                            )}
                            <Text style={styles.title}>
                                {!editAddress ? ADD_NEW_ADDRESS : EDIT_ADDRESS}
                            </Text>
                            <TopWalletSelection
                                imageIcon={
                                    currentClickedWallet &&
                                    currentClickedWallet.chain_icon &&
                                    currentClickedWallet.chain_icon
                                }
                                walletname={
                                    currentClickedWallet &&
                                    currentClickedWallet.name
                                }
                                chainname={chainName && chainName.trim()}
                                // walletAddress={currentClickedWallet && currentClickedWallet.address}
                                ShowWalletAddress={false}
                                clickEvent={() => {
                                    setShowChangeWallet(true);
                                }}
                                withGrayBgColor={true}
                                showWalletName={false}
                                isClickable={true}
                                tailEnd={true}
                            />
                            <Text style={styles.commonlyUsedText}>
                                {ADD_COMMONLY_USED_ADDRESS}
                            </Text>
                            <AddAddressInputField
                                title={ADDRESS_NAME}
                                validField={validName}
                                errorMessage={errorMessage}
                                value={name}
                                placeHolderText={ADDRESS_NAME_PLACEHOLDER}
                                setText={setName}
                                setValidField={setValidName}
                                multiline={false}
                                setShowScanner={setShowScanner}
                            />
                            <AddAddressInputField
                                title={WALLET_ADDRESS}
                                validField={validWalletAddress}
                                errorMessage={errorMessage}
                                value={getFormattedURL(walletAddress)}
                                placeHolderText={ENTER_PUBLIC_ADDRESS}
                                setText={setWalletAddress}
                                showPasteButton={true}
                                showScanButton={true}
                                setValidField={setValidWalletAddress}
                                multiline={true}
                                setShowScanner={setShowScanner}
                            />
                            <View style={styles.btnContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        onCancel();
                                    }}
                                    style={styles.Button}>
                                    <Text style={styles.buttonText}>
                                        {Cancel}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        ValidateFields();
                                    }}
                                    disabled={
                                        name.length == 0 ||
                                        walletAddress.length == 0
                                    }
                                    style={[
                                        styles.Button,
                                        {
                                            backgroundColor: !(
                                                name.length == 0 ||
                                                walletAddress.length == 0
                                            )
                                                ? colors.purple_button_color
                                                : colors.purple_light_button_color,
                                        },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            { color: colors.white },
                                        ]}>
                                        {SAVE_ADDRESS}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal.Body>
                </Modal.Content>
            </KeyboardAwareScrollView>
        </Modal>
    );
};

export default AddEditAddress;
const styles = StyleSheet.create({
    Button: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    btnContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: calculateHeight(20),
    },
    buttonText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    commonlyUsedText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
        marginLeft: calculateWidth(10),
        marginTop: calculateHeight(12),
    },
    keyboardAwareContentStyles: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    keyboardAwareStyles: {
        width: '100%',
    },
    title: {
        alignSelf: 'center',
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        marginBottom: calculateHeight(24),
    },
});
