import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    Image,
    TouchableOpacity,
    Keyboard,
    SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import ConstantStrings from '@constants/ConstantStrings';
import { apiGetNFTDetail } from '@api/NFTsApi';
import {
    getSeriesOfChain,
    getChainDetail,
    getSymbolForChain,
    getAllAddressBooks,
    insertAddressIntoBook,
} from '@database/sql';
import Progress from '@components/Progress';
import {
    calculateHeight,
    colors,
    calculateWidth,
    fonts,
    sizes,
} from '@constants/theme';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { logger } from '@constants/Log';
import { resetStateQR } from '@redux/Action/QRScanActions';
import ScreenTopHeader from '@components/ScreenTopHeader';
import SendSuccess from '../send/SendSuccess';
import SendNFTConfirmPopup from './SendNFTConfirmPopup';
import { apiGetCoinList } from '@api/CoinApis';
import InsufficientGas from '../../InsuffiecientGas/InsufficientGas';

import { getEthGasNFT } from '../send/SendFunctions';
import AddEditAddress from '../../Home/Settings/AddressBook/AddEditAddress';
import AddressBookModal from '../../Home/Settings/AddressBook/AddressBookModal';
import { showErrorToast } from '@redux/Action/ToastAlert';
import AddressEnterView from '@components/AddressEnterView';
import CustomModal from '@components/CustomModal';
import moment from 'moment';
import { retrieveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';
import { getFormattedURL } from 'src/Tabbar/TabbarFuncation';
const SendNFT = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const QRScanReducer = useSelector(state => state.QRScanReducer);
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);
    const [addressToPaste, setAddressToPaste] = React.useState('');
    const [address, setAddress] = React.useState(null);
    const [isAddressErrorStatus, setIsAddressErrorStatus] = useState(false);
    const [gasFee, setGasFee] = useState(0.0);
    const [symbol, setSymbol] = useState();
    const [symbolIcon, setSymbolIcon] = useState();
    const [symbolAddress, setSymbolAddress] = useState();
    const [symbolBalance, setSymbolBalance] = useState();
    const [nftDetail, setNftDetail] = useState(null);
    const [gasPrice, setGasPrice] = useState(0);
    const [progressShowStatus, setProgressShowStatus] = useState(false);
    const [isShowConfirmPopup, setIsShowConfirmPopup] = useState(false);
    const [insufficientGasPopUp, setInsufficientGasPopUp] = useState(false);
    const [itemDetails, setItemDetails] = useState(null);
    const [showAddAddressPopUp, setShowAddAddressPopUp] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [sendSuccessPopUp, setSendSuccessPopUp] = useState(false);
    const [currentClickedWallet, setCurrentClickedWallet] = useState(null);
    const [addressError, setAddressError] = useState(false);
    const [selectedAddressFromAddressBook, setSelectedAddressFromAddressBook] =
        useState(null);

    const [addressToPass, setAddressToPass] = useState(null);
    function goBackAfterSuccess() {
        setSendSuccessPopUp(false);
        navigation.pop();
    }

    useEffect(() => {
        getAllAddressBooks(dispatch);
        let params = {
            chainName: route.params.clickedWallet.chain,
            address: route.params.clickedWallet.address,
            pageNo: 1,
            pageSize: '10000000000',
        };
        resetStateQR(dispatch);
        getSymbolForChain(route.params.clickedWallet.chain).then(symbol1 => {
            setSymbol(symbol1.rows.item(0).symbol);
            apiGetCoinList(params)
                .then(data => {
                    const filteredData = data.data.filter(item => {
                        return item.symbol == symbol1.rows.item(0).symbol;
                    });
                    setSymbolBalance(filteredData[0].balance);
                })
                .catch(error => {
                    logger(error);
                });
        });
        getChainDetail(route.params.clickedWallet.chain).then(chainDetails => {
            const wallet = route.params.clickedWallet;
            wallet.chainDetail = chainDetails.rows.item(0);
            setCurrentClickedWallet(wallet);
            setSymbolAddress(route.params.clickedWallet.address);
            setSymbolIcon(chainDetails.rows.item(0).chain_icon);
        });
        getNFTDetail();
    }, []);

    useEffect(() => {
        setAddress(QRScanReducer.receiverAddress);
        setAddressToPaste(QRScanReducer.receiverAddress);
    }, [QRScanReducer.receiverAddress.length]);

    useEffect(() => {
        setAddressError(false);
        if (selectedAddressFromAddressBook) {
            setAddressToPass(selectedAddressFromAddressBook);
            setSelectedAddressFromAddressBook(false);
        } else if (address) {
            setAddressToPass(address);
            setSelectedAddressFromAddressBook(false);
        } else {
            setAddressToPass(null);
            setSelectedAddressFromAddressBook(false);
        }
    }, [address]);
    function getNFTDetail() {
        setProgressShowStatus(true);
        const params = {
            tokenId: route.params.selectedNft.tokenId,
            tokenAddress: route.params.selectedNft.tokenAddress,
            chainName: route.params.selectedNft.chain,
        };
        apiGetNFTDetail(params)
            .then(result => {
                setNftDetail(result);
                setProgressShowStatus(false);
            })
            .catch(error => {
                logger('NFT detail error => ', error);
            });
    }

    const onPreviewSendClick = async () => {
        Keyboard.dismiss();
        try {
            let fromAmount = 1;
            let balance_check =
                parseInt(fromAmount) <= parseInt(nftDetail.amount);
            let unZeor_check = parseInt(fromAmount) > 0;
            let int_check = /^\d+$/.test(fromAmount);
            let address_check = /^.+$/.test(address);
            if (address == null || !address_check) {
                setAddressError(true);
                logger('invalid address/Address is null');
                setIsAddressErrorStatus(true);
                return;
            }
            if (
                !balance_check ||
                !int_check ||
                !address_check ||
                !unZeor_check
            ) {
                logger('invalid balance_check/int_check/');
                return;
            } else {
                setProgressShowStatus(true);

                let mGasFee = await computedGaslimit();
                console.log('mgasfee ', mGasFee);
                if (mGasFee?.fee > 0) {
                    // if (parseFloat(mGasFee.fee) > parseFloat(symbolBalance)) {
                    //   logger('insufficient balance');
                    //   setInsufficientGasPopUp(true);
                    //   setProgressShowStatus(false);
                    //   return;
                    // }

                    setTimeout(() => {
                        setProgressShowStatus(false);
                        setIsShowConfirmPopup(true);
                    }, 1000);
                } else {
                    setProgressShowStatus(false);
                }
            }
        } catch (error) {
            logger('error from preview click in send nft :: ', error);
        }
    };

    async function computedGaslimit() {
        let fee = 0;
        let dbRecord = await getSeriesOfChain(route.params.clickedWallet.chain);
        let series = dbRecord.rows.item(0).series;
        if (series === 'eth') {
            fee = await getEthGasNFT(
                route.params.clickedWallet,
                nftDetail,
                getFormattedURL(address),
                setGasPrice,
                setProgressShowStatus,
                dispatch,
            );
        }
        console.log('FEe', fee);
        setGasFee(fee?.fee);
        logger('GAS FEE ', fee);
        return fee;
    }

    const topBackClick = () => {
        navigation.pop();
    };

    const setTransactionSuccessFail = status => {
        setIsShowConfirmPopup(false);
        setTimeout(() => {
            if (status) {
                setSendSuccessPopUp(true);
            } else {
                setIsShowConfirmPopup(false);
            }
        }, 500);
    };

    const addAddress = () => {
        setSendSuccessPopUp(false);
        const details = {
            name: '',
            wallet_address: address,
            created_at: moment().format('DD/MM/YYYY'),
            updated_at: moment().format('DD/MM/YYYY'),
            chain: route.params.clickedWallet.chain,
        };
        setItemDetails(details);
        setTimeout(() => {
            setShowAddAddressPopUp(true);
        }, 100);
    };

    const onSuccess = async object => {
        await retrieveKeyValueData(ConstStorage.USERID)
            .then(async userId => {
                object.uid = userId;
                if (
                    AddressBookReducer &&
                    AddressBookReducer.list &&
                    AddressBookReducer.list.length >= 50
                ) {
                    showErrorToast(dispatch, 'Address adding limit reached');
                } else {
                    await insertAddressIntoBook(object).then(() => { });
                }
                navigation.pop();
            })
            .catch(error => {
                logger('add new address from send screen error :: ', error);
                navigation.pop();
            });
    };

    function setAddressSelectionFromAB(addressFromAB) {
        if (addressFromAB) setSelectedAddressFromAddressBook(addressFromAB);
    }

    function onCancel() {
        setTimeout(() => {
            setIsShowConfirmPopup(true);
        }, 200);
    }

    function onClickingItem() { }
    return (
        <SafeAreaView style={styles.containerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={colors.white}
                barStyle={'dark-content'}
            />
            {isShowConfirmPopup && (
                <CustomModal
                    isModalVisible={isShowConfirmPopup}
                    closeModal={setTransactionSuccessFail}>
                    <SendNFTConfirmPopup
                        gasFee={gasFee}
                        gasPrice={gasPrice}
                        nftImage={route.params.nftImage}
                        nftDetail={nftDetail}
                        clickedWallet={route.params.clickedWallet}
                        toWallet={address}
                        symbol={symbol}
                        setTransactionStatus={setTransactionSuccessFail}
                        addressToUse={addressToPass}
                        symbolBalance={symbolBalance}
                        setIsShowConfirmPopup={setIsShowConfirmPopup}
                        setInsufficientGasPopUp={setInsufficientGasPopUp}
                    />
                </CustomModal>
            )}

            {progressShowStatus && <Progress></Progress>}
            {insufficientGasPopUp && (
                <InsufficientGas
                    ShowPopupStatus={insufficientGasPopUp}
                    setShowPopupStatus={setInsufficientGasPopUp}
                    navigation={navigation}
                    chainName={symbol}
                    chainIcon={symbolIcon}
                    walletAddress={symbolAddress}
                    chaindescription={
                        currentClickedWallet &&
                        currentClickedWallet.chainDetail &&
                        currentClickedWallet.chainDetail.name
                    }
                    onCancel={onCancel}
                />
            )}

            {showAddAddressPopUp && (
                <AddEditAddress
                    showPopupStatus={showAddAddressPopUp}
                    setShowPopupStatus={setShowAddAddressPopUp}
                    editAddress={false}
                    addAddressWithDetails={true}
                    itemDetails={itemDetails}
                    onSuccess={onSuccess}
                    onCancel={() => {
                        setShowAddAddressPopUp(false);
                        navigation.pop();
                    }}
                />
            )}
            {sendSuccessPopUp && (
                <SendSuccess
                    ShowPopupStatus={sendSuccessPopUp}
                    setShowPopupStatus={setSendSuccessPopUp}
                    addAddress={addAddress}
                    wallet_Address={address}
                    goBackAfterSuccess={goBackAfterSuccess}
                />
            )}
            {showAddressModal && (
                <AddressBookModal
                    ShowAddressModal={showAddressModal}
                    setShowAddressModal={setShowAddressModal}
                    onPress={onClickingItem}
                />
            )}
            <View style={styles.parentView}>
                <View style={styles.marginHorizontalStyle}>
                    <ScreenTopHeader
                        title={ConstantStrings.SEND_NFT}
                        topBackClick={topBackClick}
                        showBack={true}
                        center={true}
                    />

                    <AddressEnterView
                        navigation={navigation}
                        setShowWarning={data => {
                            logger(data);
                        }}
                        Address={address}
                        setAddress={setAddress}
                        addressToPaste={addressToPaste}
                        setAddressToPaste={setAddressToPaste}
                        setGasFee={setGasFee}
                        isForNft={true}
                        currentClickedWallet={currentClickedWallet}
                        setAddressSelectionFromAB={setAddressSelectionFromAB}
                        addressErrorFlagOnPreviewClick={addressError}
                    />
                </View>
                <View style={styles.SendNFTView}>
                    <View style={styles.assetContainerStyle}>
                        <Text style={styles.mainText}>
                            {ConstantStrings.ASSET}
                        </Text>

                        <View style={styles.nftImageContainerStyle}>
                            {route.params.nftImage.length == 0 ? (
                                <Image style={styles.nftImageStyle} />
                            ) : (
                                <FastImage
                                    source={{ uri: route.params.nftImage }}
                                    style={styles.nftFastImageStyle}
                                />
                            )}
                            <Text style={styles.title}>
                                {route.params.selectedNft.name}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        disabled={!address}
                        style={[
                            styles.bottomTouchableStyle,
                            {
                                backgroundColor: !address
                                    ? colors.purple_light_button_color
                                    : colors.purple_button_color,
                            },
                        ]}
                        onPress={onPreviewSendClick}>
                        {
                            <Text style={styles.bottomButtonStyle}>
                                {ConstantStrings.REVIEW_SEND}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SendNFT;
const styles = StyleSheet.create({
    SendNFTView: {
        backgroundColor: colors.gray_background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 1,
        zIndex: -1,
    },
    assetContainerStyle: {
        borderRadius: 10,
        marginHorizontal: calculateWidth(20),
        marginTop: calculateHeight(20),
    },
    bottomButtonStyle: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.button_text_size,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    bottomTouchableStyle: {
        backgroundColor: colors.purple_button_color,
        borderRadius: sizes.button_border_radius,
        marginHorizontal: calculateWidth(20),
        marginTop: calculateHeight(26),
        paddingHorizontal: calculateHeight(18),
        paddingVertical: calculateHeight(16),
    },
    containerStyle: {
        backgroundColor: colors.white,
        flex: 1,
    },
    mainText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
    marginHorizontalStyle: {
        marginHorizontal: 20,
    },
    nftFastImageStyle: {
        borderRadius: 8,
        height: 50,
        margin: 8,
        width: 50,
    },
    nftImageContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        flexDirection: 'row',
        marginTop: 10,
    },
    nftImageStyle: {
        borderRadius: 8,
        height: 50,
        margin: 8,
        width: 50,
    },
    parentView: {
        flex: 1,
        flexDirection: 'column',
    },

    title: {
        color: colors.mainColor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
        marginLeft: 10,
    },
});
