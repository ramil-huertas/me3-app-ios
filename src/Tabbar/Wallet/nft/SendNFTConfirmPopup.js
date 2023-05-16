import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import React, { useState } from 'react';
import { colors, calculateHeight, calculateWidth } from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import { saveKeyValueData } from '@constants/Storage';
import EstimatedFeeView from '@components/EstimatedFeeView';
import { getSeriesOfChain } from '@database/sql';
import { logger } from '@constants/Log';
import FastImage from 'react-native-fast-image';
import { sendETHNFT } from '../send/SendFunctions';
import { useDispatch } from 'react-redux';
import { showMessageToast } from '@redux/Action/ToastAlert';
import TopWalletSelection from '@components/TopWalletSelection';
import CustomImage from '@components/CustomImage';

export default function SendNFTConfirmPopup({
    gasFee,
    gasPrice,
    nftImage,
    nftDetail,
    clickedWallet,
    toWallet,
    symbol,
    setTransactionStatus,
    addressToUse,
    symbolBalance,
    setInsufficientGasPopUp,
    setIsShowConfirmPopup,
}) {
    const [progressShowStatus, setProgressShowStatus] = useState(false);
    const dispatch = useDispatch();
    const onSendClick = () => {
        if (parseFloat(gasFee) > parseFloat(symbolBalance)) {
            logger('insufficient balance');
            setInsufficientGasPopUp(true);
            setProgressShowStatus(false);
            setIsShowConfirmPopup(false);
        } else {
            setProgressShowStatus(true);
            doTransactions();
        }
    };

    const doTransactions = async () => {
        setProgressShowStatus(true);
        var dbRecord = await getSeriesOfChain(clickedWallet.chain);
        let series = dbRecord.rows.item(0).series;
        let hash;
        try {
            if (series === 'eth')
                hash = await sendETHNFT(
                    clickedWallet,
                    nftDetail,
                    gasPrice,
                    toWallet,
                    dispatch,
                );
        } catch (err) {
            setProgressShowStatus(false);
            logger(err);
        }
        logger('hash', hash);
        if (hash && hash.length > 0) {
            setProgressShowStatus(false);
            saveKeyValueData('transSuccess', 'true');
            setTransactionStatus(true);
        } else {
            showMessageToast(dispatch, 'Transaction failed');
            setTransactionStatus(false);
            setProgressShowStatus(false);
        }
    };

    return (
        <View>
            <View
                style={styles.reviewSendStyle}>
                <Text style={styles.confirmSendStyle}>
                    {ConstantStrings.REVIEW_SEND}
                </Text>
            </View>
            <View style={styles.margintTop8Style}>
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
                    walletAddress={clickedWallet && clickedWallet.address}
                    clickEvent={null}
                    showWalletName={false}
                    isClickable={false}
                    ShowWalletAddress={true}
                    withGrayBgColor={true}></TopWalletSelection>
                <View
                    style={styles.containerStyle}>
                    <View
                        style={styles.nftImageContainerStyle}>
                        {nftImage.length == 0 ? (
                            <Image
                                style={styles.imagenftStyle}
                            />
                        ) : (
                            <FastImage
                                source={{ uri: nftImage }}
                                style={styles.nftFastImageStyle}
                            />
                        )}
                        <Text style={styles.title}>{nftDetail.name}</Text>
                    </View>
                </View>
                <View
                    style={styles.downArrowImageContainerStyle}>
                    <Image
                        source={require('@assets/arrow_down_large.png')}
                        style={styles.downArrowImageStyle}
                        resizeMode="contain"
                    />
                </View>

                {typeof addressToUse == 'string' ? (
                    <View
                        style={styles.toWalletContainerStyle}>
                        <View style={styles.marginLeft8Style}>
                            <Text
                                style={{
                                    fontSize: theme.sizes.f14,
                                    color: theme.colors.purple_button_color,
                                    fontFamily: theme.fonts.titillium_bold,
                                }}>
                                {toWallet}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View
                        style={styles.chainDetailContainerStyle}>
                        <View>
                            <CustomImage
                                imageUrl={
                                    addressToUse && addressToUse.chain_icon
                                }
                            />
                        </View>
                        <View
                            style={styles.addressContainerStyle}>
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
                                {addressToUse && addressToUse.wallet_address}
                            </Text>
                        </View>
                    </View>
                )}

                <EstimatedFeeView
                    gasFee={gasFee}
                    symbol={symbol}
                    giveMarginTop20={true}
                />

                {progressShowStatus ? (
                    <ActivityIndicator
                        style={styles.marginttop15Style}
                        size={'large'}
                        color={
                            theme.colors.purple_button_color
                        }></ActivityIndicator>
                ) : (
                    <View
                        style={styles.bottomButtonContainerStyle}>
                        <TouchableOpacity
                            style={styles.cancel}
                            onPress={() => {
                                setTransactionStatus(false);
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
                            <Text style={styles.approveText}>
                                {ConstantStrings.SEND}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    addressContainerStyle: {
        flex: 1,
        marginLeft: calculateWidth(8),
    },
    approve: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flex: 1,
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
    chainDetailContainerStyle: {
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
    containerStyle: {
        backgroundColor:
            theme.colors.purpple_background_color50,
        borderRadius: 10,
        marginTop: calculateHeight(3),
    },
    downArrowImageContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 10,
    },
    downArrowImageStyle: {
        height: 12,
        width: 12,
    },
    imagenftStyle: {
        backgroundColor: colors.gray_background,
        borderRadius: 8,
        height: 50,
        margin: 8,
        width: 50,
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
    margintTop8Style: {
        marginTop: 8,
    },
    marginttop15Style: {
        marginTop: 15,
    },
    nftFastImageStyle: {
        borderRadius: 8,
        height: 50,
        margin: 8,
        width: 50,
    },
    nftImageContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    reviewSendStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        paddingLeft: 20,
        paddingRight: 20,
    },
    title: {
        color: theme.colors.menuDotsTint,
        flex: 1,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24 + 4,
        marginLeft: 10,
    },
    toWalletContainerStyle: {
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
