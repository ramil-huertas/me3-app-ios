import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    colors,
    calculateWidth,
    calculateHeight,
    NativeBaseModalStyle,
} from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import { saveKeyValueData } from '@constants/Storage';
import CustomImage from '@components/CustomImage';
import EstimatedFeeView from '@components/EstimatedFeeView';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { sendBch, sendBtc, sendEth, sendLtc } from './SendFunctions';
import { useDispatch, useSelector } from 'react-redux';
import TopWalletSelection from '@components/TopWalletSelection';
import { Modal } from 'native-base';

export default function SendConfirmPopup({
    amount,
    gasFee,
    clickedWallet,
    mainCurrency,
    toWalletAddress,
    selectedTokenToSend,
    symbol,
    setTransactionStatus,
    addressToUse,
    setInsufficientGasPopUp,
    setIsShowConfirmPopup,
    setShowGasEstimationModal,
    isShowConfirmPopup,
}) {
    const TokenReducer = useSelector(state => state.TokenReducer);

    const [isProgressShowStatus, setIsProgressShowStatus] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {}, []);

    const onSendClick = () => {
        const mainCurrency = TokenReducer.mainCurrency.filter(item => {
            return (
                item.chainName.toLowerCase() ==
                clickedWallet.chain.toLowerCase()
            );
        });
        const finalMainCurrency = mainCurrency[0];
        if (finalMainCurrency.id === selectedTokenToSend.id) {
            let totalToPay = parseFloat(gasFee) + parseFloat(amount);
            if (totalToPay > parseFloat(mainCurrency[0].balance)) {
                logger('insufficient balance');
                setInsufficientGasPopUp(true);
                setIsProgressShowStatus(false);
                // setIsShowConfirmPopup(false);
            } else {
                setIsProgressShowStatus(true);
                doTransactions();
            }
        } else if (parseFloat(gasFee) > parseFloat(finalMainCurrency.balance)) {
            setInsufficientGasPopUp(true);
            setIsProgressShowStatus(false);
            // setIsShowConfirmPopup(false);
        } else {
            setIsProgressShowStatus(true);
            doTransactions();
        }
        // let totalToPay = parseFloat(gasFee) + parseFloat(amount)
        // console.log("main currency :: ", mainCurrency[0].balance)
        // if (totalToPay > parseFloat(mainCurrency[0].balance)) {
        //     logger('insufficient balance');
        //     setInsufficientGasPopUp(true);
        //     setIsProgressShowStatus(false);
        //     setIsShowConfirmPopup(false);
        // } else {
        //     setIsProgressShowStatus(true);
        //     doTransactions();
        // }
    };

    async function doTransactions() {
        let seriesName = clickedWallet.chainDetail.series;
        let hash = '';
        try {
            switch (seriesName) {
                case 'eth':
                    hash = await sendEth(
                        clickedWallet,
                        selectedTokenToSend,
                        amount,
                        toWalletAddress,
                        setIsProgressShowStatus,
                        dispatch,
                    ).catch(() => {
                        setShowGasEstimationModal(true);
                        setTransactionStatus(false);
                    });
                    break;
                case 'btc':
                    hash = await sendBtc(
                        clickedWallet,
                        mainCurrency,
                        amount,
                        toWalletAddress,
                        setIsProgressShowStatus,
                    ).catch(() => {
                        setTransactionStatus(false);
                        setShowGasEstimationModal(true);
                    });
                    break;
                case 'fil':
                    // hash = await sendFil()
                    break;
                case 'dot':
                    // this.hash = await this.sendDot()
                    break;
                case 'ltc':
                    hash = await sendLtc(
                        clickedWallet,
                        mainCurrency,
                        amount,
                        toWalletAddress,
                        setIsProgressShowStatus,
                    ).catch(() => {
                        setTransactionStatus(false);
                        setShowGasEstimationModal(true);
                    });
                    break;
                case 'bch':
                    hash = await sendBch(
                        clickedWallet,
                        mainCurrency,
                        amount,
                        toWalletAddress,
                        setIsProgressShowStatus,
                    ).catch(() => {
                        setTransactionStatus(false);
                        setShowGasEstimationModal(true);
                    });
                    break;
            }
        } catch (err) {
            logger('***', err);
            setShowGasEstimationModal(true);
            setIsProgressShowStatus(false);
            setTransactionStatus(false);
        }
        if (hash) {
            logger(hash);
            setIsProgressShowStatus(false);
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.send_complete, eventObject);
            setTimeout(() => {
                saveKeyValueData('transSuccess', 'true');
                setTransactionStatus(true);
            }, 1000);
        }
    }
    return (
        <Modal
            isOpen={isShowConfirmPopup}
            // isOpen={true}
            onClose={() => {
                setIsShowConfirmPopup(false);
            }}
            size={'full'}
            background={colors.popupBgcolor}
            backdropVisible={false}
            animationPreset="fade">
            <Modal.Content
                style={NativeBaseModalStyle.setBottomModal}
                pt={'2'}
                pb={'7'}
                p={'2'}>
                <Modal.Body _scrollview={{ bounces: false }}>
                    <View style={styles.reviewSendViewStyle}>
                        <Text style={styles.confirmSendStyle}>
                            {ConstantStrings.REVIEW_SEND}
                        </Text>
                    </View>
                    <View style={styles.marginTop8Style}>
                        <TopWalletSelection
                            imageIcon={
                                clickedWallet &&
                                clickedWallet.chainDetail &&
                                clickedWallet.chainDetail.chain_icon
                            }
                            walletname={clickedWallet && clickedWallet.name}
                            chainname={
                                clickedWallet &&
                                clickedWallet.chainDetail &&
                                clickedWallet.chainDetail.name
                            } // this is to display Chain name only (from api) in top section rather then showing WalletName - chainName
                            walletAddress={
                                clickedWallet && clickedWallet.address
                            }
                            clickEvent={null}
                            showWalletName={false}
                            isClickable={false}
                            ShowWalletAddress={true}
                            withGrayBgColor={true}></TopWalletSelection>

                        <View style={[styles.detailsView, {}]}>
                            <Text numberOfLines={1} style={styles.txtCyptoHead}>
                                {amount}
                            </Text>
                            <CustomImage
                                imageUrl={selectedTokenToSend?.icon}
                                isImageHeight20={false}
                                isImageHeight25={true}
                            />
                            <Text
                                numberOfLines={1}
                                style={styles.txtCyptoSymbol}>
                                {selectedTokenToSend?.symbol}
                            </Text>
                        </View>
                        <View style={styles.downArrowContainerStyle}>
                            <Image
                                source={require('@assets/arrow_down_large.png')}
                                style={styles.downArrowImageStyle}
                                resizeMode="contain"
                            />
                        </View>
                        {typeof addressToUse == 'string' ? (
                            <View style={styles.walletAddressContainerStyle}>
                                <View style={styles.marginLeft8Style}>
                                    <Text
                                        style={{
                                            fontSize: theme.sizes.f14,
                                            color: theme.colors
                                                .purple_button_color,
                                            fontFamily:
                                                theme.fonts.titillium_bold,
                                        }}>
                                        {toWalletAddress}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.chainIconContainerStyle}>
                                <View>
                                    <CustomImage
                                        imageUrl={
                                            addressToUse &&
                                            addressToUse.chain_icon
                                        }
                                    />
                                </View>
                                <View style={styles.addressViewContainerStyle}>
                                    <Text style={styles.mainText}>
                                        {addressToUse && addressToUse.name}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode={'middle'}
                                        style={[
                                            styles.mainText,
                                            {
                                                color: colors.gray_textcolor,
                                                width: calculateWidth(100),
                                                fontSize: theme.sizes.f12,
                                            },
                                        ]}>
                                        {addressToUse &&
                                            addressToUse.wallet_address}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.estimatedcontainerstyle}>
                            <EstimatedFeeView
                                gasFee={gasFee}
                                symbol={symbol}
                                giveMarginTop20={true}
                            />
                        </View>

                        {isProgressShowStatus ? (
                            <ActivityIndicator
                                style={styles.indicatorStyle}
                                size={'large'}
                                color={
                                    theme.colors.purple_button_color
                                }></ActivityIndicator>
                        ) : (
                            <View style={styles.bottomButtonContainerStyle}>
                                <TouchableOpacity
                                    style={styles.cancel}
                                    onPress={() => {
                                        setIsShowConfirmPopup(false);
                                        // setTransactionStatus(false);
                                    }}>
                                    <Text style={styles.cancelText}>
                                        {ConstantStrings.Cancel}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.approve}
                                    onPress={() => {
                                        onSendClick();
                                    }}>
                                    <Image
                                        source={require('@assets/send.png')}
                                        style={styles.sendButtonStyle}></Image>
                                    <Text style={styles.approveText}>
                                        {ConstantStrings.SEND}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
}

const styles = StyleSheet.create({
    addressViewContainerStyle: {
        flex: 1,
        marginLeft: calculateWidth(8),
    },
    approve: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 6,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    approveText: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
    },
    bottomButtonContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 15,
    },
    cancel: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        marginRight: 6,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    cancelText: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
    },
    chainIconContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.neutral10_1,
        borderRadius: 8,
        flexDirection: 'row',
        marginTop: 5,
        paddingLeft: calculateWidth(16),
        paddingRight: calculateWidth(8),
        paddingVertical: calculateHeight(10),
    },
    confirmSendStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24,
    },
    detailsView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.purpple_background_color50,
        borderRadius: 30,
        flexDirection: 'row',
        // justifyContent: 'center',
        marginVertical: 8,
        paddingRight: 24,
        padding: 12,
    },
    downArrowContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    downArrowImageStyle: {
        height: 12,
        width: 12,
    },
    estimatedcontainerstyle: {
        marginTop: 8,
    },
    indicatorStyle: {
        marginTop: 15,
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14 + 1,
        lineHeight: theme.sizes.lh20,
        paddingVertical: theme.calculateHeight(0),
    },

    marginLeft8Style: {
        marginLeft: 8,
    },
    marginTop8Style: {
        marginTop: 8,
    },
    reviewSendViewStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    sendButtonStyle: {
        height: 18,
        marginHorizontal: 5,
        width: 18,
    },

    txtCyptoHead: {
        color: theme.colors.mainColor,
        flex: 1,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f28 + 2,
        marginLeft: 12,
        marginRight: 10,
    },
    txtCyptoSymbol: {
        color: theme.colors.mainColor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f22,
        marginLeft: 5,
    },
    walletAddressContainerStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        marginTop: 5,
        paddingLeft: calculateWidth(8),
        paddingRight: calculateWidth(8),
        paddingVertical: calculateHeight(15),
    },
});
