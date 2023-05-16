import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import TokenSelectModel from './TokenSelectModel';
import {
    getSeriesOfChain,
    getChainDetail,
    getSymbolForChain,
    getWalletForChain,
    insertAddressIntoBook,
    getFirstWalletWhoseSeriesIsETH,
} from '@database/sql';

import Progress from '@components/Progress';
import { retrieveKeyValueData } from '@constants/Storage';
import {
    calculateHeight,
    colors,
    sizes,
    calculateWidth,
} from '@constants/theme';
import ChangeWallet from '../../Swap/ChangeWallet';
import {
    getChainForWallet,
    getFormattedURL,
    getWalletName,
} from '../../TabbarFuncation';
import { logger } from '@constants/Log';
import { resetStateQR } from '@redux/Action/QRScanActions';
import { useDispatch, useSelector } from 'react-redux';
import ScreenTopHeader from '@components/ScreenTopHeader';
import TopWalletSelection from '@components/TopWalletSelection';
import WarningMessage from '@components/WarningMessage';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import AmountEnterView from '@components/AmountEnterView';
import SendConfirmPopup from './SendConfirmPopup';
import SendSuccess from './SendSuccess';
import InsufficientGas from '../../InsuffiecientGas/InsufficientGas';
import {
    getBchGas,
    getBtcGas,
    getEthGas,
    getFilGas,
    getLtcGas,
} from './SendFunctions';
import { getAddressBook } from '@redux/Action/AddressBookAction';
import storageConst from '@constants/ConstStorage';
import AddEditAddress from '../../Home/Settings/AddressBook/AddEditAddress';
import moment from 'moment';
import { showErrorToast } from '@redux/Action/ToastAlert';
import AddressEnterView from '@components/AddressEnterView';
import CustomModal from '@components/CustomModal';
import { saveTokenListAndChain } from '@redux/Action/TokenAction';
import {
    checkNullOrEmpty,
    getDefaultWalletChainNameForSelection,
} from '@constants/commonFuncation';
import GasEstimationErrorModal from '../GasEstimationErrorModal';

const Send = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);
    const TokenReducer = useSelector(state => state.TokenReducer);

    const [address, setAddress] = React.useState(null); // used as main address.. do any functionality based on this address
    const [showTokenList, setShowTokenList] = React.useState(false);
    const [sendAmount, setSendAmount] = useState(0.0);
    const [tokenData, setTokenData] = useState(TokenReducer.list);
    const [selectedTokenToSend, setSelectedTokenToSend] = useState(
        TokenReducer.mainCurrency[0],
    );
    const [mainCurrency, setMainCurrency] = useState(
        TokenReducer.mainCurrency[0],
    );
    const [isNumberShowErrorStatus, setIsNumberShowErrorStatus] =
        useState(false);
    const [isPreviewClick, setIsPreviewClick] = useState(false);
    const [showAddAddressPopUp, setShowAddAddressPopUp] = useState(false);
    const [numberShowErrorMessage, setNumberShowErrorMessage] = useState(
        'Expected Valid Amount',
    );
    const [gasFee, setGasFee] = useState(0.0);
    const [symbol, setSymbol] = useState();
    const [progressStatus, setProgressStatus] = useState(false);
    const [currentClickedWallet, setCurrentClickedWallet] = useState(null);
    const [chainName, setChainName] = useState(null);
    const [isRefresh, setIsRefresh] = useState(false);
    const [showChangeWallet, setShowChangeWallet] = useState(false);
    const [isShowConfirmPopup, setIsShowConfirmPopup] = useState(false);
    const [insufficientGasPopUp, setInsufficientGasPopUp] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [sendSuccessPopUp, setSendSuccessPopUp] = useState(false);
    const [itemDetails, setItemDetails] = useState(null);
    const [addressToPaste, setAddressToPaste] = useState(null); // is used to display UI only
    const [addressError, setAddressError] = useState(false);
    const [selectedAddressFromAddressBook, setSelectedAddressFromAddressBook] =
        useState(null);
    const [addressToPass, setAddressToPass] = useState(null);
    const [isAddressSaved, setIsAddressSaved] = useState(false);
    const [showGasEstimationModal, setShowGasEstimationModal] = useState(false);
    function goBackAfterSuccess() {
        setSendSuccessPopUp(false);
        navigation.pop();
    }

    function showSelectedWallet(chainname) {
        setChainName(chainname);
        getWalletForChain(chainname)
            .then(walletResult => {
                if (walletResult.rows.length > 0) {
                    setSelectedAddressFromAddressBook(null);
                    getChainDetail(walletResult.rows.item(0).chain).then(
                        chainDetail => {
                            let chDetail = chainDetail.rows.item(0);
                            let wallet1 = walletResult.rows.length
                                ? walletResult.rows.item(0)
                                : null;
                            wallet1.chainDetail = chDetail;
                            setCurrentClickedWallet(wallet1);
                            getSymbolForChain(chainname).then(symbol1 => {
                                setSymbol(symbol1.rows.item(0).symbol);
                            });
                            getCoinList(
                                walletResult.rows.item(0).address,
                                walletResult.rows.item(0).chain,
                            );
                        },
                    );
                }
            })
            .catch(error => {
                logger('Error ', error);
            });
    }
    function setAddressSelectionFromAB(addressFromAB) {
        if (addressFromAB != null) {
            logger('addreeechain', addressFromAB.chain);
            setSelectedAddressFromAddressBook(addressFromAB);
        }
    }
    useEffect(() => {
        getAddressBook(dispatch);

        if (
            route.params &&
            route.params.walletAddress != undefined &&
            route.params.walletAddress != null &&
            route.params.walletAddress != ''
        ) {
            //   setShowWarning(true);
        }

        if (route.params.isFromHome) {
            let walletAddress = route.params.walletAddress;

            setAddressToPaste(walletAddress);
            setAddress(walletAddress);
            getDefaultWalletChainNameForSelection()
                .then(firstWalletChain => {
                    let chainname;
                    if (walletAddress != null && walletAddress.length > 0)
                        chainname = getChainForWallet(walletAddress);
                    else {
                        chainname = firstWalletChain;
                    }
                    setChainName(chainname);
                    showSelectedWallet(chainname);
                    setProgressStatus(false);
                })
                .catch(error => {
                    logger('****error ', error);
                });
        } else {
            getSymbolForChain(route.params.clickedWallet.chain).then(
                symbol1 => {
                    setSymbol(symbol1.rows.item(0).symbol);
                },
            );

            getChainDetail(route.params.clickedWallet.chain)
                .then(chainDetail => {
                    let chDetail = chainDetail.rows.item(0);
                    let wallet1 =
                        route.params.clickedWallet != {}
                            ? route.params.clickedWallet
                            : null;
                    wallet1.chainDetail = chDetail;
                    setCurrentClickedWallet(wallet1);
                    setCurrentClickedWallet(route.params.clickedWallet);
                    setChainName(route.params.clickedWallet.chain);
                    getCoinList(
                        route.params.clickedWallet.address,
                        route.params.clickedWallet.chain,
                    );
                })
                .catch(error => {
                    setProgressStatus(false);
                    logger('getChainDetail error', error);
                });
        }
    }, []);
    async function getCoinList(address, chainname) {
        const checkPresenceOfMainCurrency =
            TokenReducer.mainCurrency &&
            TokenReducer.mainCurrency.filter(item => {
                return item.chainName.toLowerCase() == chainname.toLowerCase();
            }).length;
        try {
            if (route.params.selectedTokenToSend == null) {
                if (checkPresenceOfMainCurrency != 0) {
                    setProgressStatus(false);
                    return;
                } else {
                    const result = await saveTokenListAndChain(
                        dispatch,
                        chainname,
                        address,
                        TokenReducer.mergedList,
                    );
                    if (result != []) {
                        setMainCurrency(result.mainCurrecy);
                        setTokenData(result.data);
                        setSelectedTokenToSend(result.mainCurrency);
                        setTimeout(() => {
                            setProgressStatus(false);
                        }, 600);
                    } else {
                        setTimeout(() => {
                            setProgressStatus(false);
                        }, 300);
                    }
                }
            } else {
                setSelectedTokenToSend(route.params.selectedTokenToSend);
            }
        } catch (error) {
            logger('Tokenreducer Error ::  ', error);
        }
    }
    const onPreviewSendClick = () => {
        setIsPreviewClick(true);
        const amount = /^\d+(\.\d*)?$/;
        setIsNumberShowErrorStatus(false);
        if (
            sendAmount == null ||
            sendAmount == 0 ||
            sendAmount == 0.0 ||
            !amount.test(sendAmount)
        ) {
            setIsNumberShowErrorStatus(true);
            setNumberShowErrorMessage(ConstantStrings.Expected_VALID_AMOUNT);
            return;
        }

        let balance_check =
            parseFloat(sendAmount) <= parseFloat(selectedTokenToSend.balance);
        if (!balance_check) {
            setIsNumberShowErrorStatus(true);
            setNumberShowErrorMessage(
                `${ConstantStrings.YOU_DO_NOT_HAVE_ENOUGH} ${selectedTokenToSend.symbol}`,
            );
            return;
        }

        const walletAddress = /^.+$/;
        if (
            address == null ||
            address == undefined ||
            address.length == 0 ||
            !walletAddress.test(getFormattedURL(address))
        ) {
            logger('invalidadress', 'invlid address');
            setAddressError(true);
            return;
        }

        if (!isNumberShowErrorStatus) {
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.send_preview, eventObject);
            calculation();
        }
    };

    async function calculation() {
        try {
            setProgressStatus(true);
            let series = await getSeriesOfChain(currentClickedWallet.chain);
            let gasFee1 = await computedGaslimit(series.rows.item(0).series);
            logger('************* gasfee', gasFee1);

            if (gasFee1 != null && gasFee1 != undefined && gasFee1 > 0) {
                setIsShowConfirmPopup(true);
                setProgressStatus(false);
            } else {
                // const message =
                //     'We’re unable to retrieve gas fees at the moment, please try again';
                // showMessageToast(dispatch, message);
                setShowGasEstimationModal(true);
            }
            setProgressStatus(false);
        } catch (error) {
            setProgressStatus(false);
            logger('calculation error ', error);
            setShowGasEstimationModal(true);
        }
    }
    async function computedGaslimit(series) {
        let gasFeeLimit;
        switch (series) {
            case 'eth':
                gasFeeLimit = await getEthGas(
                    currentClickedWallet,
                    selectedTokenToSend,
                    sendAmount,
                    getFormattedURL(address),
                    dispatch,
                );
                break;
            case 'btc':
                gasFeeLimit = await getBtcGas(
                    currentClickedWallet,
                    mainCurrency,
                    sendAmount,
                    getFormattedURL(address),
                );
                break;
            case 'fil':
                gasFeeLimit = await getFilGas(
                    currentClickedWallet,
                    sendAmount,
                    getFormattedURL(address),
                );
                break;
            // case 'dot':
            //     this.fee = await this.getDotGas()
            //     break;
            case 'ltc':
                gasFeeLimit = await getLtcGas(
                    currentClickedWallet,
                    mainCurrency,
                    sendAmount,
                    getFormattedURL(address),
                );
                break;
            case 'bch':
                gasFeeLimit = await getBchGas(
                    currentClickedWallet,
                    mainCurrency,
                    sendAmount,
                    getFormattedURL(address),
                );
                break;
        }
        setGasFee(gasFeeLimit);
        return gasFeeLimit;
    }

    function showWalletChange() {
        setShowChangeWallet(true);
    }

    function selectedChain(selectedChain1) {
        setSymbol(selectedChain1.chainDetail.symbol);
        setCurrentClickedWallet(selectedChain1);
        setChainName(selectedChain1.chain);
        getCoinList(selectedChain1.address, selectedChain1.chain);
        setIsRefresh(!isRefresh);
        setNumberShowErrorMessage(false);
        setIsNumberShowErrorStatus(false);
    }

    useEffect(() => {
        if (!checkNullOrEmpty(chainName)) {
            const tempData =
                TokenReducer.mainCurrency &&
                TokenReducer.mainCurrency.filter(item => {
                    return (
                        item.chainName.toLowerCase() == chainName.toLowerCase()
                    );
                });
            if (checkNullOrEmpty(route.params.selectedTokenToSend))
                setSelectedTokenToSend(tempData[0]);
            else setSelectedTokenToSend(route.params.selectedTokenToSend);

            const tempList =
                TokenReducer.mergedList &&
                TokenReducer.mergedList.filter(item => {
                    return (
                        item.chainName.toLowerCase() == chainName.toLowerCase()
                    );
                });
            setTokenData(tempList);
            setIsRefresh(!isRefresh);
        }
    }, [chainName]);

    /**
     * This useeffect is getting called when any new address Selected, Pasted or scanned in address Field
     * based on address select wallet of that chain without user interaction
     */
    useEffect(() => {
        setAddressError(false);
        if (address != null && address != undefined) {
            if (selectedAddressFromAddressBook) {
                setAddressToPass(selectedAddressFromAddressBook);
                showSelectedWallet(selectedAddressFromAddressBook.chain);
                setChainName(selectedAddressFromAddressBook.chain);
            } else {
                setAddressToPass(address);
                const getChainNameFromAddress = getChainForWallet(address);
                if (getChainNameFromAddress.toLowerCase() === 'eth') {
                    getFirstWalletWhoseSeriesIsETH()
                        .then(firstWalletWhoseSeriesIsETH => {
                            const chainOfFirstWalletWhoseSeriesIsETH =
                                firstWalletWhoseSeriesIsETH.rows.item(0).chain;
                            showSelectedWallet(
                                chainOfFirstWalletWhoseSeriesIsETH,
                            );
                            setChainName(chainOfFirstWalletWhoseSeriesIsETH);
                        })
                        .catch(error => {
                            logger(
                                'firstWalletWhoseSeriesIsETH error :: ',
                                error,
                            );
                            showErrorToast(dispatch, 'Invalid Address');
                        });
                } else {
                    showSelectedWallet(getChainNameFromAddress);
                    setChainName(getChainNameFromAddress);
                }
            }
        }
    }, [address]);
    const topBackClick = () => {
        resetStateQR(dispatch);
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
            chain: chainName,
        };
        setItemDetails(details);
        setTimeout(() => {
            setShowAddAddressPopUp(true);
        }, 100);
    };

    const onSuccess = async object => {
        setIsRefresh(true);
        await retrieveKeyValueData(storageConst.USERID)
            .then(async userId => {
                object.uid = userId;
                if (
                    AddressBookReducer &&
                    AddressBookReducer.list &&
                    AddressBookReducer.list.length >= 50
                ) {
                    showErrorToast(dispatch, 'Address adding limit reached');
                    setIsAddressSaved(false);
                    setSendSuccessPopUp(true);
                    setIsRefresh(false);
                } else {
                    await insertAddressIntoBook(object).then(async () => {
                        await getAddressBook(dispatch);
                    });
                    setIsRefresh(false);
                    setIsAddressSaved(true);
                    setSendSuccessPopUp(true);
                }
                //   navigation.pop();
            })
            .catch(error => {
                logger('add new address from send screen error :: ', error);
                //  navigation.pop();
                setIsRefresh(false);
            });
    };

    useEffect(() => {
        if (progressStatus) {
            setTimeout(() => {
                setProgressStatus(TokenReducer.loading);
            }, 1000);
        } else {
            setProgressStatus(TokenReducer.loading);
        }
    }, [TokenReducer.loading]);

    function onCancel() {
        setTimeout(() => {
            setIsShowConfirmPopup(true);
        }, 200);
    }

    return (
        <>
            <SafeAreaView style={styles.containerStyle}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.white}
                    barStyle={'dark-content'}
                />
                {showGasEstimationModal && (
                    <CustomModal
                        closeModal={() => {
                            setShowGasEstimationModal(false);
                        }}
                        isModalVisible={showGasEstimationModal}>
                        <GasEstimationErrorModal
                            setShowGasEstimationModal={
                                setShowGasEstimationModal
                            }
                        />
                    </CustomModal>
                )}
                {showAddAddressPopUp && itemDetails && (
                    <AddEditAddress
                        showPopupStatus={showAddAddressPopUp}
                        setShowPopupStatus={setShowAddAddressPopUp}
                        editAddress={false}
                        addAddressWithDetails={true}
                        itemDetails={itemDetails}
                        onSuccess={onSuccess}
                        onCancel={() => {
                            setShowAddAddressPopUp(false);
                            setSendSuccessPopUp(true);
                            // navigation.pop();
                        }}
                    />
                )}
                <SendConfirmPopup
                    amount={sendAmount}
                    gasFee={gasFee}
                    clickedWallet={currentClickedWallet}
                    mainCurrency={mainCurrency}
                    toWalletAddress={getFormattedURL(address)}
                    selectedTokenToSend={selectedTokenToSend}
                    symbol={symbol}
                    setTransactionStatus={setTransactionSuccessFail}
                    addressToUse={addressToPass}
                    setIsShowConfirmPopup={setIsShowConfirmPopup}
                    isShowConfirmPopup={isShowConfirmPopup}
                    setInsufficientGasPopUp={setInsufficientGasPopUp}
                    setShowGasEstimationModal={setShowGasEstimationModal}
                />

                {sendSuccessPopUp && (
                    <SendSuccess
                        ShowPopupStatus={sendSuccessPopUp}
                        setShowPopupStatus={setSendSuccessPopUp}
                        addAddress={addAddress}
                        wallet_Address={address}
                        goBackAfterSuccess={goBackAfterSuccess}
                        isAddressSaved={isAddressSaved}
                    />
                )}

                {showTokenList && (
                    <TokenSelectModel
                        setSelectedTokenToSend={setSelectedTokenToSend}
                        setShowTokenList={setShowTokenList}
                        tokenList={tokenData}></TokenSelectModel>
                )}
                {progressStatus && <Progress></Progress>}

                {showChangeWallet && (
                    <ChangeWallet
                        showChangeWallet={showChangeWallet}
                        setShowChangeWallet={setShowChangeWallet}
                        setSelectedChainWallet={selectedChain}
                        AllChain={true}
                        setFee={setGasFee}
                        setSwapAmount={setSendAmount}
                        setSwapToAmount={setAddressToPaste}
                        isFromSend={true}
                    />
                )}

                {insufficientGasPopUp && (
                    <InsufficientGas
                        ShowPopupStatus={insufficientGasPopUp}
                        setShowPopupStatus={setInsufficientGasPopUp}
                        navigation={navigation}
                        chainName={currentClickedWallet?.chainDetail?.symbol}
                        chainIcon={currentClickedWallet?.chainDetail?.icon}
                        walletAddress={
                            currentClickedWallet && currentClickedWallet.address
                        }
                        chainDescription={
                            currentClickedWallet &&
                            currentClickedWallet.chainDetail &&
                            currentClickedWallet.chainDetail.name
                        }
                        onCancel={onCancel}
                    />
                )}

                {/* {ShowAddressModal && <AddressBookModal onPress={onClickingItem} ShowAddressModal={ShowAddressModal} setShowAddressModal={setShowAddressModal} />} */}

                <View style={styles.parentView}>
                    {/* top header view  */}
                    <ScreenTopHeader
                        title={ConstantStrings.SEND}
                        topBackClick={topBackClick}
                        showBack={true}
                        center={true}
                    />
                    {showWarning && address && (
                        <WarningMessage message={getWalletName(address)} />
                    )}
                    <AddressEnterView
                        currentClickedWallet={currentClickedWallet}
                        navigation={navigation}
                        setShowWarning={setShowWarning}
                        Address={address}
                        setAddress={setAddress}
                        showSelectedWallet={showSelectedWallet}
                        addressToPaste={addressToPaste}
                        setAddressToPaste={setAddressToPaste}
                        setGasFee={setGasFee}
                        isForNft={false}
                        setAddressSelectionFromAB={setAddressSelectionFromAB}
                        addressErrorFlagOnPreviewClick={addressError}
                    />
                </View>

                <View style={styles.assetContainerStyle}>
                    <View
                        style={[
                            styles.parentView,
                            styles.paddingVerticalStyle,
                        ]}>
                        <Text style={styles.mainText}>
                            {ConstantStrings.ASSET}
                        </Text>
                        {/* Wallet selection view */}
                        <TopWalletSelection
                            imageIcon={
                                currentClickedWallet &&
                                currentClickedWallet.chainDetail &&
                                currentClickedWallet.chainDetail.chain_icon
                            }
                            walletname={
                                currentClickedWallet &&
                                currentClickedWallet.name
                            }
                            chainname={
                                currentClickedWallet &&
                                currentClickedWallet.chainDetail &&
                                currentClickedWallet.chainDetail.name
                            } // this is to display Chain name only (from api) in top section rather then showing WalletName - chainName
                            walletAddress={
                                currentClickedWallet &&
                                currentClickedWallet.address
                            }
                            clickEvent={showWalletChange}
                            showWalletName={false}
                            isClickable={true}
                            ShowWalletAddress={true}
                            withGrayBgColor={false}
                        />
                        <AmountEnterView
                            sendAmount={sendAmount}
                            selectedTokenToSend={selectedTokenToSend}
                            setSendAmount={setSendAmount}
                            setShowTokenList={setShowTokenList}
                            previewClicked={isPreviewClick}
                            isShowNumberError={isNumberShowErrorStatus}
                            setNumberShowErrorStatus={
                                setIsNumberShowErrorStatus
                            }
                            numberErrorMessage={numberShowErrorMessage}
                            setNumberShowErrorMessage={
                                setNumberShowErrorMessage
                            }
                        />
                        {/* Bottom Buttons view */}

                        <TouchableOpacity
                            disabled={
                                isNumberShowErrorStatus ||
                                !address ||
                                !sendAmount
                            }
                            style={[
                                styles.bottomTouchableStyle,
                                {
                                    backgroundColor:
                                        isNumberShowErrorStatus ||
                                        !address ||
                                        !sendAmount
                                            ? colors.purple_light_button_color
                                            : colors.purple_button_color,
                                },
                            ]}
                            onPress={onPreviewSendClick}>
                            <Text style={styles.bottomButtonStyle}>
                                {ConstantStrings.REVIEW_SEND}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
            <SafeAreaView style={{ backgroundColor: colors.gray_background }} />
        </>
    );
};

export default Send;
const styles = StyleSheet.create({
    assetContainerStyle: {
        backgroundColor: colors.gray_background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 1,
        zIndex: -1,
    },
    bottomButtonStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        textAlign: 'center',
    },
    bottomTouchableStyle: {
        alignItems: 'center',
        borderRadius: sizes.button_border_radius,
        justifyContent: 'center',
        marginTop: calculateHeight(26),
        paddingBottom: calculateHeight(18),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },

    containerStyle: {
        backgroundColor: theme.colors.white,
        flex: 1,
        flexDirection: 'column',
    },
    mainText: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        marginBottom: 10,
    },
    paddingVerticalStyle: {
        paddingVertical: 15,
    },
    parentView: {
        marginHorizontal: calculateWidth(24),
    },
});
