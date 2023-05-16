import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ActivityIndicator,
    InteractionManager,
    Platform,
    SafeAreaView,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { theme } from '@constants';
import SwapSelectToken from './SwapSelectToken';
import ConstantStrings, {
    REVIEW_SWAP,
    SWAP,
    TO,
    CALCULATION,
} from '@constants/ConstantStrings';
import ChangeWallet from './ChangeWallet';
import CustomImage from '@components/CustomImage';
import { swap_get_encode } from '@api/SwapApis';
import Progress from '@components/Progress';
import { smallHandle } from '@chains/ethereum/contract';
import { useFocusEffect } from '@react-navigation/native';
import { countDecimalPoint, getPrecision } from '../TabbarFuncation';
import { logger } from '@constants/Log';
import {
    setPayChain,
    setReceiveChain,
    saveSwapAmount,
    setSwapWallet,
} from '@redux/Action/SwapAction';
import { useDispatch, useSelector } from 'react-redux';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import {
    approveAmount,
    checkApproveStatus,
    checkIfEnoughBalance,
    checkIfMainSymbol,
    convert,
    getEncode,
    getEncodeForGasPrice,
    getParams,
    getSymbolDetail,
} from './SwapFunctions';
import ScreenTopHeader from '@components/ScreenTopHeader';
import TopWalletSelection from '@components/TopWalletSelection';
import { calculateHeight, calculateWidth, colors } from '@constants/theme';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import InsufficientGas from '../InsuffiecientGas/InsufficientGas';
import { showMessageToast } from '@redux/Action/ToastAlert';
import CustomModal from '@components/CustomModal';
import SwapPreview from './SwapPreview';
import {
    getFirstWalletFromMainnetChainForSwap,
    checkNullOrEmpty,
    toFixed,
} from '@constants/commonFuncation';
import ConstStorage from '@constants/ConstStorage';
import {
    saveTokenListAndChain,
    tokenListUpdate,
} from '@redux/Action/TokenAction';
import GasEstimationErrorModal from '../Wallet/GasEstimationErrorModal';

export default function Swap({ navigation, route }) {
    const SwapReducer = useSelector(state => state.SwapReducer);
    const TokenReducer = useSelector(state => state.TokenReducer);
    const [showSwapError, setShowSwapError] = useState(false);
    const [showSwapToError, setShowSwapToError] = useState(false);
    const [showTokenList, setShowTokenList] = React.useState(false);
    const [showChangeWallet, setShowChangeWallet] = useState(false);
    const [selectedChainWallet, setSelectedChainWallet] = useState(
        SwapReducer.swapWallet,
    );
    const [swapAmount, setSwapAmount] = useState('');
    const [payId, setPayId] = useState(0);
    const [receiverId, setReceiverId] = useState(0);
    const [swapSymbolList, setSwapSymbolList] = useState(null);
    const [progressStatus, setProgressStatus] = useState(false);
    const [clickedType, setClickedType] = useState();
    const [filteredList, setFilteredList] = useState(null);
    const [swapToAmount, setSwapToAmount] = useState('');
    const [fee, setFee] = useState(0.0);
    const [isMainSymbol, setIsMainSymbol] = useState(false);
    const [isApproveEnough, setIsApproveEnough] = useState(false);
    const [paramsToSend, setParamsToSend] = useState({});
    const [encodeData, setEncodeData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [oneEqualToAmount, setOneEqualToAmount] = useState(0);
    const [swapFocused, setSwapFocused] = useState(false);
    const [swapToFocused, setSwapToFocused] = useState(false);
    const [swapChain, setSwapChain] = useState(false);
    const [insufficientGasPopUp, setInsufficientGasPopUp] = useState(false);
    const [confirmSwapPopUp, setConfirmSwapPopUp] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [currentMainTokenForGasFeeCheck, setCurrentMainTokenForGasFeeCheck] =
        useState(null);
    const [showRefreshRateIndicator, setShowRefreshRateIndicator] =
        useState(false);
    const [showGasEstimationModal, setShowGasEstimationModal] = useState(false);

    const dispatch = useDispatch();
    useFocusEffect(
        useCallback(() => {
            setTimeout(async () => {
                const walletData = await retrieveKeyValueData(
                    ConstStorage.SWAP_WALLET_CHAIN,
                );
                const parsedData = checkNullOrEmpty(walletData)
                    ? null
                    : JSON.parse(walletData);
                if (
                    SwapReducer.swapWallet == undefined ||
                    SwapReducer.swapWallet == null ||
                    JSON.stringify(SwapReducer.swapWallet) == '{}'
                ) {
                    if (
                        parsedData == undefined ||
                        parsedData == null ||
                        JSON.stringify(parsedData) == '{}'
                    ) {
                        if (
                            selectedChainWallet == undefined ||
                            selectedChainWallet == null ||
                            JSON.stringify(selectedChainWallet) == '{}'
                        ) {
                            getMainnetChains();
                        } else {
                            if (
                                selectedChainWallet &&
                                selectedChainWallet.chain
                            ) {
                                getSymbolList(selectedChainWallet.chain);
                            }
                        }
                    } else {
                        setSelectedChainWallet(parsedData);
                    }
                } else {
                    setSelectedChainWallet(SwapReducer.swapWallet);
                }
            }, 10);
        }, [SwapReducer.swapWallet.chain]),
    );
    useFocusEffect(
        useCallback(() => {
            if (swapAmount.length > 0 && !showSwapError) {
                calculateToFromValues(swapAmount, false, false);
            }
        }, [SwapReducer.swapAmount.length, SwapReducer.receiveSymbolDetail]),
    );

    async function getMainnetChains() {
        setProgressStatus(true);
        getFirstWalletFromMainnetChainForSwap()
            .then(walletdata => {
                setSelectedChainWallet(walletdata);
                setSwapWallet(dispatch, walletdata);
                setTimeout(() => {
                    saveKeyValueData(
                        ConstStorage.SWAP_WALLET_CHAIN,
                        JSON.stringify(walletdata),
                    );
                    setRefresh(!refresh);
                    setProgressStatus(false);
                }, 1000);
            })
            .catch(error => {
                logger('ERROR get mainChainList', error);
                setProgressStatus(false);
            });
    }
    useEffect(() => {
        calculatePrice();
    }, [
        SwapReducer.paySymbolDetails,
        SwapReducer.receiveSymbolDetail,
        selectedChainWallet,
    ]);

    useEffect(() => {
        checkForChainAndGetData();
    }, [selectedChainWallet]);
    useEffect(() => {
        let status = SwapReducer.paySymbolDetails.contractAddr
            ? SwapReducer.paySymbolDetails?.contractAddr?.toLowerCase() == ''
            : true;
        setIsMainSymbol(status);
    }, [SwapReducer.paySymbolDetails.symbol]);

    useFocusEffect(
        React.useCallback(() => {
            const interval = setInterval(() => {
                calculatePrice();
            }, 10000); // 10 second interval
            return () => {
                logger('interval canceled');
                clearInterval(interval);
            };
        }, []),
    );

    useEffect(() => {
        return navigation.addListener('focus', () => {
            retrieveKeyValueData('transSuccess').then(result => {
                if (result != null && result == 'true') {
                    logger('focus handler result true');
                    setSwapToAmount('');
                    setFee(0);
                    setIsApproveEnough(false);
                }
            });
        });
    }, [navigation]);

    const checkForChainAndGetData = async () => {
        if (selectedChainWallet && selectedChainWallet.chain) {
            setProgressStatus(true);
            await saveKeyValueData(
                ConstStorage.SWAP_WALLET_CHAIN,
                JSON.stringify(selectedChainWallet),
            );
            getSymbolList(selectedChainWallet.chain);
        }
    };
    const getSymbolList = async chain => {
        console.log("****************getsymbol list called ***************************************")
        TokenReducer.loading = true
        const data = TokenReducer.mergedList.filter(item => {
            return item.chainName?.toLowerCase() == chain?.toLowerCase();
        });
        console.log("****************getsymbol list called ***************************************", data?.length)

        if (data.length == 0) {
            await saveTokenListAndChain(
                dispatch,
                selectedChainWallet.chain,
                selectedChainWallet.address,
                TokenReducer.mergedList,
            );
            TokenReducer.loading = false
        } else {
            dispatch(tokenListUpdate(data));
        }
    };

    useEffect(() => {
        console.log("list changes **************************************************** useeffect")
        if (selectedChainWallet && selectedChainWallet.chain) {
            if (
                TokenReducer.swapTokenList != null &&
                TokenReducer.swapTokenList != undefined &&
                TokenReducer.swapTokenList != [] &&
                TokenReducer.swapTokenList.length != 0
            ) {
                console.log("******************************TokenReducer?.swapTokenList[0]", TokenReducer?.swapTokenList[0])
                if (TokenReducer?.swapTokenList[0]?.chainName?.toLowerCase() === selectedChainWallet.chain.toLowerCase()) {

                    let filteredArray = TokenReducer.swapTokenList;
                    let filteredWithBalance = filteredArray.filter(item => {
                        return item.balance > 0 || item.contractAddr?.length == 0
                    })
                    console.log("filteredWithBalance", filteredWithBalance)
                    setSwapSymbolList(filteredArray);
                    if (
                        SwapReducer &&
                        SwapReducer.paySymbolDetails &&
                        JSON.stringify(SwapReducer.paySymbolDetails) != '{}' &&
                        SwapReducer.paySymbolDetails.chainName?.toLowerCase() ==
                        selectedChainWallet.chain?.toLowerCase()
                    ) {
                        setPayId(SwapReducer.paySymbolDetails.id);
                        dispatch(setPayChain(SwapReducer.paySymbolDetails));
                    } else {
                        setPayId(filteredWithBalance[0].id);
                        dispatch(setPayChain(filteredWithBalance[0]));

                    }

                    if (
                        SwapReducer &&
                        SwapReducer.receiveSymbolDetail &&
                        JSON.stringify(SwapReducer.receiveSymbolDetail) != '{}' &&
                        SwapReducer?.receiveSymbolDetail?.chainName?.toLowerCase() ==
                        selectedChainWallet?.chain?.toLowerCase()
                    ) {
                        setReceiverId(SwapReducer.receiveSymbolDetail.id);
                        dispatch(setReceiveChain(SwapReducer.receiveSymbolDetail));
                    } else {
                        if (filteredArray.length > 2) {
                            setReceiverId(filteredArray[1].id);
                            dispatch(setReceiveChain(filteredArray[1]));
                        }
                    }
                }
            }
        }
    }, [TokenReducer.swapTokenList]);
    useEffect(() => {
        if (progressStatus) {
            setTimeout(() => {
                setProgressStatus(TokenReducer.loading);
            }, 1000);
        } else {
            setProgressStatus(TokenReducer.loading);
        }
    }, [TokenReducer.loading]);
    useEffect(() => {
        if (progressStatus) {
            setTimeout(() => {
                setProgressStatus(SwapReducer.loading);
            }, 1000);
        } else {
            setProgressStatus(SwapReducer.loading);
        }
    }, [SwapReducer.loading]);

    useEffect(() => {
        const interactionPromise = InteractionManager.runAfterInteractions(
            () => {
                if (
                    swapAmount > 0 &&
                    swapFocused &&
                    !swapToFocused &&
                    !showSwapError &&
                    !swapChain
                ) {
                    saveSwapAmount(dispatch, swapAmount);
                    calculateToFromValues(swapAmount, false, false);
                }
            },
        );
        return () => {
            interactionPromise.cancel();
        };
    }, [swapAmount.length]);
    useEffect(() => {
        const interactionPromise = InteractionManager.runAfterInteractions(
            () => {
                if (
                    swapToAmount > 0 &&
                    !swapFocused &&
                    swapToFocused &&
                    !showSwapToError &&
                    !swapChain
                ) {
                    logger('swapToAmount swapToAmount ', swapToAmount);
                    calculateToFromValues(swapToAmount, true, false);
                }
            },
        );
        return () => {
            interactionPromise.cancel();
        };
    }, [swapToAmount.length]);

    React.useEffect(() => {
        return navigation.addListener('tabPress', e => {
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.menu_swap, eventObject);
            logger('tab press', e);
            // setSwapAmount('');
            setSwapToAmount('');
            setFee(0);
            // setShowSwapError(false);
            setShowSwapToError(false);
        });
    }, [navigation]);

    async function changePay(paySymbolDetail) {
        setProgressStatus(true);
        setPayId(paySymbolDetail.id);
        setShowSwapError(false);
        setFee(0.0);
        setSwapToAmount('');
        setSwapAmount('');
        setIsApproveEnough(false);
        let status = paySymbolDetail.contractAddr
            ? paySymbolDetail.contractAddr?.toLowerCase() == ''
            : true;
        setIsMainSymbol(status);
        dispatch(setPayChain(paySymbolDetail));
        setTimeout(() => {
            setProgressStatus(false);
        }, 1000);
    }
    async function changeReceive(receiveDetail) {
        setProgressStatus(true);
        setReceiverId(receiveDetail.id);
        setFee(0.0);
        setSwapToAmount('');
        setIsApproveEnough(false);
        dispatch(setReceiveChain(receiveDetail));
        setProgressStatus(false);
        // setTimeout(() => {
        //     calculateToFromValues(swapAmount, false, false);
        // }, 200);
    }
    async function selectTokenList(type) {
        let newList = [];
        newList = swapSymbolList.filter(item => {
            if (type == 'pay') return item.id != receiverId;
            else return item.id != payId;
        });
        setFilteredList(newList);
        setClickedType(type);
        setShowTokenList(true);
    }
    function showWalletChange() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.swap_select_chain, eventObject);
        setShowChangeWallet(true);
    }
    async function swapChains() {
        setSwapChain(true);
        setIsApproveEnough(false);
        const temp = SwapReducer.paySymbolDetails;
        SwapReducer.paySymbolDetails = SwapReducer.receiveSymbolDetail;
        SwapReducer.receiveSymbolDetail = temp;
        setPayId(SwapReducer.paySymbolDetails.id);
        setReceiverId(SwapReducer.receiveSymbolDetail.id);

        dispatch(setPayChain(SwapReducer.paySymbolDetails));
        dispatch(setReceiveChain(SwapReducer.receiveSymbolDetail));
        setShowSwapError(false);
        setSwapToAmount('');
        setFee(0.0);

        calculateToFromValues(swapAmount, false, false);
    }
    async function calculatePrice() {
        setShowRefreshRateIndicator(true);
        try {
            const params = getParams(SwapReducer, 1, selectedChainWallet);
            let result = await swap_get_encode(params, dispatch);
            let isEncodeExist = 'encodedSwapData' in result;
            if (!isEncodeExist) {
                //  logger('Current currency pair does not support exchange');
                setProgressStatus(false);
                return false;
            } else {
                let smallhandleamount = smallHandle(
                    result.outputAmount,
                    getPrecision(SwapReducer.receiveSymbolDetail),
                );
                let vari = convert(smallhandleamount);
                setOneEqualToAmount(parseFloat(toFixed(vari, 5)));
                setShowRefreshRateIndicator(false);
                setProgressStatus(false);
                return true;
            }
        } catch (err) {
            logger(err);
            setShowRefreshRateIndicator(false);
            setProgressStatus(false);
            return false;
        }
    }

    const checkForEnoughBalance = amount => {
        const checkBalance = checkIfEnoughBalance(SwapReducer, amount);
        if (!checkBalance) {
            setShowSwapError(true);
            const error =
                ConstantStrings.YOU_DO_NOT_HAVE_ENOUGH_BALANCE +
                ' ' +
                SwapReducer.paySymbolDetails.symbol;
            setErrorMessage(error);
            return false;
        } else {
            return true;
        }
    };

    const getGasFee = async amount => {
        setProgressStatus(true);
        const gasFee = await getEncodeForGasPrice(
            SwapReducer,
            amount,
            selectedChainWallet,
            setParamsToSend,
            dispatch,
        );
        if (gasFee) {
            setFee(gasFee);
            setShowGasEstimationModal(false);
        } else {
            setFee(0);
            logger('There is an error from gas calculation');
            setShowGasEstimationModal(true);
        }
        setProgressStatus(false);
    };
    function calculateToFromValues(value, reverseCalculation, xPercentValue) {
        if (value > 0) {
            setProgressStatus(true);
            getEncode(
                SwapReducer,
                value,
                selectedChainWallet,
                setSwapAmount,
                setSwapToAmount,
                setEncodeData,
                setFee,
                setParamsToSend,
                reverseCalculation,
                dispatch,
            )
                .then(async encodeObject => {
                    const amountToBePassed = reverseCalculation
                        ? encodeObject.amount
                        : xPercentValue
                            ? value
                            : swapAmount;
                    if (encodeObject != {} && encodeObject.encode != {}) {
                        const checkIsMainSymbol =
                            checkIfMainSymbol(SwapReducer);
                        if (checkIsMainSymbol) {
                            //gas price calulation
                            if (checkForEnoughBalance(amountToBePassed)) {
                                getGasFee(amountToBePassed);
                            }
                            setProgressStatus(false);
                        } else {
                            //approve process
                            setProgressStatus(true);
                            const approvalStatus = await checkApproveStatus(
                                SwapReducer,
                                amountToBePassed,
                                selectedChainWallet,
                                setEncodeData,
                                dispatch,
                                setProgressStatus,
                            );
                            setIsApproveEnough(approvalStatus);
                            if (
                                checkForEnoughBalance(amountToBePassed) &&
                                approvalStatus
                            ) {
                                getGasFee(amountToBePassed);
                            } else {
                                setProgressStatus(false);
                            }
                        }
                    } else {
                        setProgressStatus(false);
                    }
                })
                .catch(error => {
                    setProgressStatus(false);
                    logger('get encode error', error);
                });
        }
    }
    async function approveClickEvent() {
        let balance_check =
            parseFloat(swapAmount) <=
            parseFloat(SwapReducer.paySymbolDetails.balance);
        if (!balance_check) {
            setShowSwapError(true);
            const error =
                ConstantStrings.YOU_DO_NOT_HAVE_ENOUGH_BALANCE +
                ' ' +
                SwapReducer.paySymbolDetails.symbol;
            setErrorMessage(error);
        } else {
            try {
                let result = await approveAmount(
                    SwapReducer,
                    encodeData,
                    selectedChainWallet,
                    dispatch,
                    setProgressStatus,
                );
                logger('approve eough result :: ', result);
                if (result) setIsApproveEnough(true);
                else setIsApproveEnough(false);

                calculationClickEvent();
            } catch (error) {
                logger('Approve error :: ', error);
            }
        }
    }
    async function calculationClickEvent() {
        if (swapAmount == '' || swapAmount == 0) {
            showMessageToast(dispatch, 'Please add swap amount');
            return false;
        } else {
            setProgressStatus(true);
            getGasFee(swapAmount);
            // const gasFee = await getEncodeForGasPrice(
            //     SwapReducer,
            //     swapAmount,
            //     selectedChainWallet,
            //     setParamsToSend,
            //     dispatch,
            // );
            // if (gasFee) {
            //     setFee(gasFee);
            //     setShowGasEstimationModal(false)
            // }
            // else {
            //     logger("There is an error from gas calculation")
            //     setShowGasEstimationModal(true)
            // }
            // // setFee(gasFee);
            // setProgressStatus(false);
        }
    }
    async function previewClickEvent() {
        // if(checkForInsufficientBalance()){
        //   return
        // }
        setProgressStatus(true);
        setTimeout(
            () => {
                setProgressStatus(false);
                const eventObject = {
                    timeOfClick: new Date().toLocaleString(),
                };
                firebaseAnalytics(firebaseEvents.swap_preview, eventObject);
                setConfirmSwapPopUp(true);
            },
            Platform.OS === 'ios' ? 3000 : 500,
        );
    }

    const topBackClick = () => {
        navigation.pop();
    };
    const setXPercentageOfMaximumChainBalance = value => {
        const PercentAmount =
            (SwapReducer.paySymbolDetails.balance * value) / 100;
        let formattedAmount = parseFloat(toFixed(PercentAmount, 5));
        logger(PercentAmount);
        setSwapAmount(`${formattedAmount}`);
        setFee(0);
        setSwapToAmount('');
        calculateToFromValues(formattedAmount, false, true);
    };
    const checkForInsufficientBalance = async () => {
        // check for insufficiet balance with mainnet token
        let currentMainSymbol = swapSymbolList.filter(item => {
            return item.contractAddr === '';
        });
        let symboldetail = await getSymbolDetail(
            currentMainSymbol[0].id,
            selectedChainWallet,
        );
        setCurrentMainTokenForGasFeeCheck(symboldetail);
        if (SwapReducer.paySymbolDetails.id === currentMainSymbol[0].id) {
            if (
                parseFloat(fee) + parseFloat(swapAmount) >
                parseFloat(symboldetail.balance)
            ) {
                setConfirmSwapPopUp(false);
                setTimeout(() => {
                    setInsufficientGasPopUp(true);
                }, 400);
                return true;
            } else {
                return false;
            }
        } else if (parseFloat(fee) > parseFloat(symboldetail.balance)) {
            setConfirmSwapPopUp(false);
            setTimeout(() => {
                setInsufficientGasPopUp(true);
            }, 400);
            return true;
        } else {
            return false;
        }
    };

    const onCancel = () => {
        setTimeout(() => {
            setConfirmSwapPopUp(true);
        }, 200);
    };
    const checkForIsTransactionSuccess = status => {
        if (status) {
            setSwapAmount('');
            setSwapToAmount('');
            setIsApproveEnough(false);
            setFee(0);
            saveSwapAmount(dispatch, '');
        }
    };

    return (
        <SafeAreaView style={styles.contain}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            <CustomModal
                closeModal={() => {
                    setShowGasEstimationModal(false);
                }}
                isModalVisible={showGasEstimationModal}>
                <GasEstimationErrorModal
                    setShowGasEstimationModal={setShowGasEstimationModal}
                />
            </CustomModal>
            {progressStatus && <Progress></Progress>}
            {insufficientGasPopUp && (
                <InsufficientGas
                    ShowPopupStatus={insufficientGasPopUp}
                    setShowPopupStatus={setInsufficientGasPopUp}
                    navigation={navigation}
                    chainName={currentMainTokenForGasFeeCheck?.symbol}
                    chainIcon={currentMainTokenForGasFeeCheck?.icon}
                    walletAddress={
                        selectedChainWallet && selectedChainWallet.address
                    }
                    chainDescription={
                        selectedChainWallet &&
                        selectedChainWallet.name &&
                        selectedChainWallet.name
                    }
                    onCancel={onCancel}
                />
            )}
            {showTokenList && (
                <SwapSelectToken
                    setShowTokenList={setShowTokenList}
                    clickedType={clickedType}
                    swapSymbolList={filteredList}
                    changePay={changePay}
                    changeReceive={changeReceive}
                    currentClickedWallet={
                        selectedChainWallet
                    }></SwapSelectToken>
            )}
            {/* <CustomModal
                isModalVisible={showChangeWallet}
                closeModal={setShowChangeWallet}> */}
            {showChangeWallet && (
                <ChangeWallet
                    showChangeWallet={showChangeWallet}
                    setShowChangeWallet={setShowChangeWallet}
                    setSelectedChainWallet={setSelectedChainWallet}
                    setSwapAmount={setSwapAmount}
                    setSwapToAmount={setSwapToAmount}
                    setFee={setFee}
                    isFromSend={false}></ChangeWallet>
            )}

            {/* </CustomModal> */}

            {/* top header view */}
            <View style={styles.parentView}>
                <ScreenTopHeader
                    title={SWAP}
                    center={true}
                    topBackClick={topBackClick}
                    showBack={
                        route && route.params && route.params.isShowBack
                    }></ScreenTopHeader>

                <ScrollView contentContainerStyle={styles.flexGrowStyle}>
                    {/* wallet selection view */}
                    <TopWalletSelection
                        imageIcon={
                            selectedChainWallet &&
                            selectedChainWallet.chain_icon &&
                            selectedChainWallet.chain_icon
                        }
                        walletname={
                            selectedChainWallet && selectedChainWallet.name
                        }
                        chainname={
                            selectedChainWallet &&
                            selectedChainWallet.name &&
                            selectedChainWallet.name
                        } // this is to display Chain name only in top section rather then showing WalletName - chainName
                        walletAddress={
                            selectedChainWallet && selectedChainWallet.address
                        }
                        clickEvent={showWalletChange}
                        isClickable={true}
                        withGrayBgColor={true}
                        showWalletName={false}></TopWalletSelection>
                    <CustomModal
                        isModalVisible={confirmSwapPopUp}
                        closeModal={setConfirmSwapPopUp}>
                        <SwapPreview
                            setConfirmSwapPopUp={setConfirmSwapPopUp}
                            SwapReducer={SwapReducer}
                            oneEqualToAmount={oneEqualToAmount}
                            checkForInsufficientBalance={
                                checkForInsufficientBalance
                            }
                            setInsufficientGasPopUp={setInsufficientGasPopUp}
                            encode={encodeData}
                            swapParam={paramsToSend}
                            detailData={{
                                fromAmount: swapAmount,
                                paySymbol: SwapReducer.paySymbolDetails,
                                receiveSymbol: SwapReducer.receiveSymbolDetail,
                                selectedChainWallet: selectedChainWallet,
                                fee: fee,
                                swapToAmount: swapToAmount,
                            }}
                            isTransactionSuccess={checkForIsTransactionSuccess}
                        />
                    </CustomModal>
                    {/* swap view */}
                    <View
                        style={[
                            styles.swapView,
                            styles.marginTopSwapViewStyle,
                        ]}>
                        <Text style={styles.swapTxt}>{SWAP}</Text>
                        <View style={styles.swapContent}>
                            <View style={styles.cryptoTxtSubView}>
                                <TextInput
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    value={swapAmount}
                                    onFocus={() => {
                                        setSwapToAmount('');
                                        setSwapFocused(true);
                                        setSwapToFocused(false);
                                    }}
                                    onChangeText={text => {
                                        setSwapChain(false);
                                        const handle =
                                            InteractionManager.createInteractionHandle();
                                        //  setNumberShowErrorStatus(false)
                                        setFee(0.0);
                                        setShowSwapError(false);
                                        setShowSwapToError(false);
                                        setSwapAmount(text);
                                        let amount = text;
                                        logger(
                                            'SwapReducer.paySymbolDetails:',
                                            SwapReducer.paySymbolDetails
                                                .balance,
                                        );
                                        const countResult =
                                            countDecimalPoint(text);
                                        let balance_check =
                                            parseFloat(amount) <=
                                            parseFloat(
                                                toFixed(
                                                    SwapReducer.paySymbolDetails
                                                        .balance,
                                                    5,
                                                ),
                                            );
                                        if (text != '' && !balance_check) {
                                            setShowSwapError(true);
                                            const error =
                                                ConstantStrings.YOU_DO_NOT_HAVE_ENOUGH_BALANCE +
                                                ' ' +
                                                SwapReducer.paySymbolDetails
                                                    .symbol;
                                            setErrorMessage(error);
                                        } else if (countResult > 1) {
                                            setShowSwapError(true);
                                            setErrorMessage(
                                                'Invalid amount format',
                                            );
                                        } else {
                                            setShowSwapError(false);
                                        }
                                        setTimeout(() => {
                                            InteractionManager.clearInteractionHandle(
                                                handle,
                                            );
                                        }, 2000);
                                    }}
                                    keyboardType={'numeric'}
                                    style={styles.searchTokenTextInput}
                                    placeholderTextColor={
                                        theme.colors.gray1_textcolor
                                    }
                                    placeholder={'0.00'}
                                    selectionColor={
                                        theme.colors.gray1_textcolor
                                    }
                                />
                                {/* <Text style={[styles.cryptoSubTitle, { marginTop: -3 }]}>{currentCurency && currentCurency.icon} {0}</Text> */}
                                <TouchableOpacity
                                    onPress={() => {
                                        selectTokenList('pay');
                                    }}>
                                    <View style={styles.cryptoSubView}>
                                        <View style={styles.viewLine}></View>
                                        <CustomImage
                                            imageUrl={
                                                SwapReducer.paySymbolDetails &&
                                                SwapReducer.paySymbolDetails
                                                    .icon
                                            }></CustomImage>
                                        <Text style={styles.txtCypto}>
                                            {SwapReducer.paySymbolDetails &&
                                                SwapReducer.paySymbolDetails
                                                    .symbol}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.swapSubView}>
                            <Text
                                style={styles.swapSubViewTxt}
                                onPress={() => {
                                    setXPercentageOfMaximumChainBalance(98);
                                }}>
                                {ConstantStrings.MAX}
                                <Text style={{ color: colors.purple_dark }}>
                                    {` ${toFixed(
                                        SwapReducer.paySymbolDetails.balance,
                                        5,
                                    )} `}
                                    {SwapReducer.paySymbolDetails.symbol}
                                </Text>
                            </Text>
                            <View style={styles.swapSubView}>
                                <TouchableOpacity
                                    onPress={() => {
                                        const eventObject = {
                                            timeOfClick:
                                                new Date().toLocaleString(),
                                        };
                                        firebaseAnalytics(
                                            firebaseEvents.swap_25,
                                            eventObject,
                                        );
                                        setXPercentageOfMaximumChainBalance(25);
                                    }}
                                    style={[
                                        styles.btnView,
                                        {
                                            backgroundColor:
                                                colors.purple_button_color1,
                                        },
                                    ]}>
                                    <Text style={styles.btnTxt}>25%</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const eventObject = {
                                            timeOfClick:
                                                new Date().toLocaleString(),
                                        };
                                        firebaseAnalytics(
                                            firebaseEvents.swap_50,
                                            eventObject,
                                        );
                                        setXPercentageOfMaximumChainBalance(50);
                                    }}
                                    style={[
                                        styles.btnView,
                                        styles.buttonExtraStyle,
                                    ]}>
                                    <Text style={styles.btnTxt}>50%</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const eventObject = {
                                            timeOfClick:
                                                new Date().toLocaleString(),
                                        };
                                        firebaseAnalytics(
                                            firebaseEvents.swap_max,
                                            eventObject,
                                        );
                                        setXPercentageOfMaximumChainBalance(
                                            100,
                                        );
                                    }}
                                    style={styles.btnView}>
                                    <Text style={styles.btnTxt}>
                                        {ConstantStrings.MAX}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showSwapError ? (
                            <Text style={styles.txtError}>{errorMessage}</Text>
                        ) : null}
                    </View>
                    {/* middle swap chain icon view */}
                    <TouchableOpacity
                        onPress={() => {
                            const eventObject = {
                                timeOfClick: new Date().toLocaleString(),
                            };
                            firebaseAnalytics(
                                firebaseEvents.swap_interchange,
                                eventObject,
                            );
                            swapChains();
                        }}
                        style={styles.swapIconView}>
                        <Image
                            source={require('@assets/SwapIcon.png')}
                            resizeMode="contain"
                            style={styles.swapIcon}></Image>
                    </TouchableOpacity>
                    {/* swap to view */}
                    <View style={styles.swapView}>
                        <Text style={styles.swapTxt}>{TO}</Text>
                        <View style={styles.swapContent}>
                            <View style={styles.cryptoTxtSubView}>
                                <TextInput
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    value={swapToAmount}
                                    onFocus={() => {
                                        setSwapAmount('');
                                        setSwapToFocused(true);
                                        setSwapFocused(false);
                                    }}
                                    onChangeText={text => {
                                        setSwapChain(false);
                                        const handle =
                                            InteractionManager.createInteractionHandle();
                                        setShowSwapToError(false);
                                        setShowSwapError(false);
                                        setFee(0.0);
                                        setSwapAmount('');
                                        setSwapToAmount(text);
                                        const countResult =
                                            countDecimalPoint(text);
                                        if (countResult > 1) {
                                            setShowSwapToError(true);
                                            setErrorMessage(
                                                'Invalid amount format',
                                            );
                                        } else {
                                            setShowSwapToError(false);
                                        }
                                        setTimeout(() => {
                                            InteractionManager.clearInteractionHandle(
                                                handle,
                                            );
                                        }, 2000);
                                    }}
                                    keyboardType={'numeric'}
                                    style={styles.searchTokenTextInput}
                                    placeholderTextColor={
                                        theme.colors.gray1_textcolor
                                    }
                                    placeholder={'0.00'}
                                    selectionColor={
                                        theme.colors.gray1_textcolor
                                    }
                                />
                                {/* <Text style={[styles.cryptoSubTitle, { marginTop: -3 }]}>{currentCurrency && currentCurrency.icon} {0}</Text> */}
                                <TouchableOpacity
                                    onPress={() => {
                                        selectTokenList('receive');
                                    }}>
                                    <View style={styles.cryptoSubView}>
                                        <View style={styles.viewLine}></View>
                                        <CustomImage
                                            imageUrl={
                                                SwapReducer.receiveSymbolDetail &&
                                                SwapReducer.receiveSymbolDetail
                                                    .icon
                                            }></CustomImage>
                                        <Text style={styles.txtCypto}>
                                            {SwapReducer.receiveSymbolDetail &&
                                                SwapReducer.receiveSymbolDetail
                                                    .symbol}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.refreshViewContainerStyle}>
                            {showRefreshRateIndicator ? (
                                <ActivityIndicator
                                    style={styles.indicatorStyle}
                                    color={
                                        theme.colors.purple_button_color
                                    }></ActivityIndicator>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => {
                                        calculatePrice();
                                    }}>
                                    <Image
                                        source={require('@assets/refresh_icon.png')}
                                        resizeMode="contain"
                                        style={styles.refreshIconStyle}></Image>
                                </TouchableOpacity>
                            )}
                            <Text
                                style={[
                                    styles.swapSubViewTxt,
                                    styles.marginLeftStyleSubview,
                                ]}>
                                <Text style={{ color: colors.purple_dark }}>
                                    {SwapReducer.paySymbolDetails &&
                                        SwapReducer.paySymbolDetails.symbol &&
                                        1 + ' '}
                                </Text>
                                {SwapReducer.paySymbolDetails.symbol + '≈ '}
                                <Text style={{ color: colors.purple_dark }}>
                                    {SwapReducer.receiveSymbolDetail &&
                                        SwapReducer.receiveSymbolDetail
                                            .symbol &&
                                        oneEqualToAmount + ' '}
                                </Text>
                                {SwapReducer.receiveSymbolDetail.symbol}
                            </Text>
                        </View>
                        <View style={styles.swapSubView}>
                            {/* <Text style={styles.swapSubViewTxt}>1 ETH ≈ 2,120 USDC</Text> */}
                            {showSwapToError ? (
                                <Text style={styles.txtError}>
                                    {errorMessage}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    {/* estimated gas fee view */}
                    {/* <View style={styles.estimatedFeesView}>

            <EstimatedFeeView
              gasFee={fee}
              symbol={
                selectedChainWallet && selectedChainWallet.chainDetail.symbol
              }
            />
          </View> */}
                    {/* bottom buttons view */}
                    {fee && fee != 0.0 ? (
                        <TouchableOpacity
                            onPress={() => {
                                const eventObject = {
                                    timeOfClick: new Date().toLocaleString(),
                                };
                                firebaseAnalytics(
                                    firebaseEvents.swap_preview,
                                    eventObject,
                                );
                                previewClickEvent();
                            }}>
                            <View style={styles.btnPreview}>
                                <Text style={styles.btnPreviewTxt}>
                                    {REVIEW_SWAP}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : !isMainSymbol && !isApproveEnough ? (
                        <TouchableOpacity
                            disabled={showSwapError}
                            onPress={() => {
                                swapAmount != 0 && approveClickEvent();
                            }}>
                            <View
                                style={[
                                    styles.btnPreview,
                                    {
                                        backgroundColor:
                                            swapAmount.length == 0 ||
                                                swapToAmount.length == 0 ||
                                                showSwapError
                                                ? colors.purple_light_button_color
                                                : colors.purple_button_color,
                                    },
                                ]}>
                                <Text style={styles.btnApproveTxt}>
                                    {ConstantStrings.APPROVE}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            disabled={showSwapError}
                            onPress={() => {
                                const eventObject = {
                                    timeOfClick: new Date().toLocaleString(),
                                };
                                firebaseAnalytics(
                                    firebaseEvents.swap_calculation,
                                    eventObject,
                                );
                                calculationClickEvent();
                            }}>
                            <View
                                style={[
                                    styles.btnPreview,
                                    {
                                        backgroundColor: showSwapError
                                            ? colors.purple_light_button_color
                                            : colors.purple_button_color,
                                    },
                                ]}>
                                <Text style={styles.btnPreviewTxt}>
                                    {CALCULATION}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    btnApproveTxt: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f14,
    },
    btnPreview: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        marginBottom: 16,
        marginTop: 16,
    },
    btnPreviewTxt: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f14,
    },
    btnTxt: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 12,
    },
    btnView: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 4,
        justifyContent: 'center',
        marginVertical: 10,
        paddingHorizontal: calculateWidth(6),
        paddingVertical: calculateHeight(4),
    },
    buttonExtraStyle: {
        backgroundColor: colors.purple_button_color2,
        marginHorizontal: 5,
    },
    contain: {
        backgroundColor: colors.white,
        flex: 1,
    },
    cryptoSubView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    cryptoTxtSubView: {
        alignItems: 'center',
        flexDirection: 'row',
        // justifyContent: 'center'
    },
    flexGrowStyle: {
        flexGrow: 1,
    },

    indicatorStyle: {
        height: 18,
        width: 18,
    },

    marginLeftStyleSubview: {
        marginLeft: 4,
    },

    marginTopSwapViewStyle: {
        marginTop: 20,
    },

    parentView: {
        marginHorizontal: 20,
    },

    refreshIconStyle: {
        height: 18,
        width: 18,
    },

    refreshViewContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 5,
        paddingLeft: 8,
    },

    searchTokenTextInput: {
        color: theme.colors.menuDotsTint,
        flex: 1,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        marginLeft: -3,
        paddingVertical: 4,
    },

    swapContent: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 8,
        flexDirection: 'row',
        height: 60,
        justifyContent: 'space-between',
        marginBottom: 0,
        marginLeft: 12,
        marginRight: 12,
        paddingLeft: 15,
    },

    swapIcon: {
        height: 24,
        width: 24,
    },

    swapIconView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        marginTop: 12,
    },

    swapSubView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 6,
    },

    swapSubViewTxt: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f14,
        marginBottom: 12,
        marginLeft: 16,
        marginTop: 12,
    },

    swapTxt: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f14,
        marginBottom: 8,
        marginLeft: 12,
        marginTop: 12,
    },

    swapView: {
        backgroundColor: colors.ghost_white,
        borderRadius: 8,
    },

    txtCypto: {
        color: colors.neutral60,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f12,
        marginLeft: 8,
        marginRight: 15,
    },
    txtError: {
        color: colors.error_color,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.fonts.f12,
        marginBottom: 16,
        marginLeft: 16,
        marginRight: 16,
    },
    viewLine: {
        backgroundColor: colors.gray1_textcolor,
        height: 38,
        marginRight: 12,
        width: 1,
    },
});
