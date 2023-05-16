import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import {
    Cancel,
    SWAP,
    EXCHANGE_RATES,
    REVIEW_SWAP,
    CHECK_YOUR_TOKENS_FOR_ANOTHER_SWAP,
    CLOSE,
    SWAP_COMPLETED,
} from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { swap_get_encode } from '@api/SwapApis';
import { longHandle, eth_SwapSend } from '@chains/ethereum/contract';
import { saveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { getPrecision } from '../TabbarFuncation';

import EstimatedFeeView from '@components/EstimatedFeeView';
import TopWalletSelection from '@components/TopWalletSelection';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { useDispatch } from 'react-redux';
import { showCopyToast, showMessageToast } from '@redux/Action/ToastAlert';
import {
    colors,
    fonts,
    sizes,
    calculateWidth,
    calculateHeight,
} from '@constants/theme';

export default function SwapPreview({
    setConfirmSwapPopUp,
    swapParam,
    detailData,
    SwapReducer,
    oneEqualToAmount,
    checkForInsufficientBalance,
    isTransactionSuccess
}) {
    const dispatch = useDispatch();
    const [isSwapSuccess, setIsSwapSuccess] = useState(false);
    const [isShowIndicator, setIsShowIndicator] = useState(false);

    async function swapToken() {
        try {
            let result = await getEncode();
            if (!result) {
                showMessageToast(dispatch, 'Transaction expected to fail');
                setIsShowIndicator(false);
                setIsSwapSuccess(false);
                return;
            } else {
                let paramsdata = {
                    from: swapParam.from,
                    to: swapParam.to,
                    data: swapParam.data,
                    value:
                        detailData.paySymbol.contractAddr == ''
                            ? longHandle(
                                swapParam.value,
                                getPrecision(detailData.paySymbol),
                            )
                            : 0,
                    gasPrice: swapParam.gasPrice,
                };
                logger('params data for ethswapsend', paramsdata);
                let resultswap = await eth_SwapSend(
                    paramsdata,
                    detailData.selectedChainWallet.node,
                    detailData.selectedChainWallet.privateKey,
                );
                if (resultswap) {
                    showCopyToast(dispatch, 'Transaction Successful');
                    setTimeout(() => {
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        firebaseAnalytics(
                            firebaseEvents.swap_complete,
                            eventObject,
                        );
                        saveKeyValueData('transSuccess', 'true');
                        setIsSwapSuccess(true);
                        setIsShowIndicator(false);
                    }, 2500);
                } else {
                    showMessageToast(dispatch, 'Transaction fail');
                    setIsSwapSuccess(false);
                    setIsShowIndicator(false);
                }
            }
        } catch (error) {
            logger('Swap error : ', error);
            setIsShowIndicator(false);
            setIsSwapSuccess(false);
        }
    }
    async function getEncode() {
        try {
            const paramsdata = {
                tokenIn: detailData.paySymbol.contractAddr
                    ? detailData.paySymbol.contractAddr
                    : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                tokenOut: detailData.receiveSymbol.contractAddr
                    ? detailData.receiveSymbol.contractAddr
                    : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                amountIn: longHandle(
                    detailData.fromAmount,
                    getPrecision(detailData.paySymbol),
                ),
                to: detailData.selectedChainWallet.address,
                chainId: detailData.selectedChainWallet.chainId,
            };
            logger('params kyber', paramsdata);
            let result = await swap_get_encode(paramsdata, dispatch);
            let isEncodeExist = 'encodedSwapData' in result;
            logger('RESULT ', isEncodeExist);
            if (!isEncodeExist) {
                // showMessageToast(
                //     dispatch,
                //     'Current currency pair does not support exchange',
                // );
            } else {
                return true;
            }
        } catch (err) {
            logger(err);
            return false;
        }
        return false;
    }
    const SwapChainToSwapToChain = () => {
        return (
            <View
                style={styles.swapchainsTochainContainerStyle}>
                <View style={styles.swapValueView}>
                    <View style={styles.cryptoTitleView}>
                        <Text style={styles.cryptoTitle} numberOfLines={2}>
                            {detailData.fromAmount}
                        </Text>
                    </View>
                    <View style={styles.cryptoSubView}>
                        <CustomImage
                            imageUrl={
                                detailData.paySymbol &&
                                detailData.paySymbol.icon
                            }
                        />
                        <Text style={styles.txtCypto}>
                            {detailData.paySymbol &&
                                detailData.paySymbol.symbol}
                        </Text>
                    </View>
                </View>
                <View style={styles.swapIconView}>
                    <Image
                        source={require('@assets/forwardGray.png')}
                        resizeMode="contain"
                        style={styles.swapIcon}></Image>
                </View>
                <View style={styles.swapValueView}>
                    <View style={styles.cryptoTitleView}>
                        <Text style={styles.cryptoTitle} numberOfLines={2}>
                            {detailData.swapToAmount}
                        </Text>
                    </View>
                    <View style={styles.cryptoSubView}>
                        <CustomImage
                            imageUrl={
                                detailData.receiveSymbol &&
                                detailData.receiveSymbol.icon
                            }
                        />
                        <Text style={styles.txtCypto}>
                            {detailData.receiveSymbol &&
                                detailData.receiveSymbol.symbol}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const SwapSuccessView = () => {
        return (
            <ScrollView>
                {/* {isShowProgress && <Progress></Progress>} */}
                <View style={styles.swapSuccessCheckImageView}>
                    <Image
                        source={require('@assets/saved_icon.png')}
                        style={styles.swapSuccessCheckImage}
                    />
                </View>
                <Text style={[styles.reviewSwapText, styles.swap_completed]}>
                    {SWAP_COMPLETED}
                </Text>
                <SwapChainToSwapToChain />
                <Text style={styles.checkYourTokensText}>
                    {CHECK_YOUR_TOKENS_FOR_ANOTHER_SWAP}
                </Text>
                <View style={styles.bottomView}>
                    <TouchableOpacity
                        onPress={swapSuccessCloseClick}
                        style={styles.btnDeselectedPreview}>
                        <Text style={styles.btnDeselectedPreviewTxt}>
                            {CLOSE}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    function chekIfFromSymbolExistAndShow1Label() {

        return SwapReducer.paySymbolDetails &&
            SwapReducer.paySymbolDetails.symbol &&
            1 + ' '
    }
    function getExchangeRateFromSymbol() {
        return SwapReducer.paySymbolDetails.symbol + '≈ '
    }

    function getExchageRateToAmount() {
        return SwapReducer.receiveSymbolDetail && SwapReducer.receiveSymbolDetail.symbol && oneEqualToAmount + ' '
    }

    function getExchangeRateToSymbol() {
        return SwapReducer.receiveSymbolDetail.symbol
    }
    const BeforeSwapView = () => {
        return (
            <ScrollView>
                {/* {isShowProgress && <Progress></Progress>} */}
                <Text style={styles.reviewSwapText}>{REVIEW_SWAP}</Text>
                <TopWalletSelection
                    imageIcon={detailData.selectedChainWallet?.chain_icon}
                    walletname={detailData.selectedChainWallet?.name}
                    chainname={detailData.selectedChainWallet?.name}
                    walletAddress={detailData.selectedChainWallet?.address}
                    showWalletName={false}
                    isClickable={false}
                    tailEnd={true}
                    ShowWalletAddress={true}
                    withGrayBgColor={true}></TopWalletSelection>
                <SwapChainToSwapToChain />
                <View
                    style={styles.exchangeRatesContainerStyle}>
                    <Text style={styles.exchangeRateText}>
                        {EXCHANGE_RATES}
                    </Text>
                    <Text style={styles.swapSubViewTxt}>
                        <Text style={{ color: colors.purple_dark }}>
                            {chekIfFromSymbolExistAndShow1Label()}
                        </Text>
                        {getExchangeRateFromSymbol()}
                        <Text style={{ color: colors.purple_dark }}>
                            {getExchageRateToAmount()}
                        </Text>
                        {getExchangeRateToSymbol()}
                    </Text>
                </View>
                <EstimatedFeeView
                    gasFee={detailData?.fee}
                    symbol={detailData?.selectedChainWallet?.symbol}
                    textStyle={{ fontSize: sizes.f14 }}
                    imageStyle={{
                        height: calculateHeight(14.17),
                        width: calculateHeight(14.17),
                    }}
                />

                <View style={styles.bottomView}>
                    <TouchableOpacity
                        onPress={rejectClickEvent}
                        style={styles.btnDeselectedPreview}>
                        {/* {isConfirmClick ? ( */}
                        <Text style={styles.btnDeselectedPreviewTxt}>
                            {Cancel}
                        </Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={previewClickEvent}
                        style={styles.btnSelectedPreview}>
                        {/* {!isConfirmClick ? (
                             <View style={styles.btnDeselectedPreview}>
                             <Text style={styles.btnDeselectedPreviewTxt}>{CONFIRM}</Text>
                            </View>
                            ) : ( */}
                        {isShowIndicator ? (
                            <ActivityIndicator
                                size={'small'}
                                color="white"
                                style={styles.indicatorStyle}
                            />
                        ) : (
                            <Image
                                source={require('@assets/SwapHorizontal.png')}
                                resizeMode="contain"
                                style={styles.swapHorizontalIcon}
                            />
                        )}
                        <Text style={styles.btnSelectedPreviewTxt}>{SWAP}</Text>
                        {/* )} */}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    if (!isSwapSuccess) {
        return <BeforeSwapView />;
    } else {
        return <SwapSuccessView />;
    }

    function rejectClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.swap_reject, eventObject);
        setConfirmSwapPopUp(false);
    }
    function swapSuccessCloseClick() {
        setConfirmSwapPopUp(false);
        isTransactionSuccess(true)
    }
    async function previewClickEvent() {
        setIsShowIndicator(true);

        if (await checkForInsufficientBalance()) {
            setIsShowIndicator(false);
            return;
        }
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.swap_confirm, eventObject);
        swapToken();
    }
}

const styles = StyleSheet.create({
    bottomView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    btnDeselectedPreview: {
        alignItems: 'center',
        backgroundColor: colors.ghost_white,
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        marginRight: calculateWidth(8),
        marginVertical: calculateHeight(16),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    btnDeselectedPreviewTxt: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: fonts.f14,
    },
    btnSelectedPreview: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: calculateWidth(8),
        marginVertical: calculateHeight(16),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    btnSelectedPreviewTxt: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: fonts.f14,
    },

    checkYourTokensText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f14,
        textAlign: 'center',
    },

    cryptoSubView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    cryptoTitle: {
        color: colors.black,
        fontFamily: fonts.titillium_bold,
        fontSize: fonts.f18,
        marginHorizontal: calculateWidth(20),
        marginVertical: calculateHeight(5),
    },

    cryptoTitleView: {
        alignItems: 'center',
        alignSelf: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    exchangeRateText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
    },

    exchangeRatesContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 4,
    },

    indicatorStyle: {
        marginRight: 10,
    },

    reviewSwapText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        marginBottom: calculateHeight(20),
        textAlign: 'center',
    },

    swapHorizontalIcon: {
        height: 20,
        marginHorizontal: 4,
        width: 20,
    },
    swapIcon: {
        height: 17,
        width: 24,
    },

    swapIconView: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: calculateHeight(12),
    },

    swapSubViewTxt: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: fonts.f14,
        marginLeft: 4
        // marginTop: 12,
        // marginLeft: 16,
        // marginBottom: 12,
    },

    swapSuccessCheckImage: {
        height: calculateHeight(25),
        tintColor: colors.white,
        width: calculateHeight(25),
    },

    swapSuccessCheckImageView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.success,
        borderRadius: 100,
        height: calculateHeight(56),
        justifyContent: 'center',
        width: calculateHeight(56),
    },

    swapValueView: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 12,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingVertical: calculateHeight(12),
    },
    swap_completed: {
        color: colors.mainColor,
        fontSize: sizes.f20,
        marginBottom: null,
        marginTop: calculateHeight(12),
    },
    swapchainsTochainContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: calculateHeight(20),
    },
    txtCypto: {
        color: colors.neutral60,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginLeft: 8,
        marginRight: 15,
    },
});
