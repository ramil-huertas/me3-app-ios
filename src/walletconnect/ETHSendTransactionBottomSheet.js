import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import CustomImage from '@components/CustomImage';
import Wallet from './ExportWalletNativeModule';
import { getChainDetail } from '@database/sql';
import Web3 from 'web3';
import ConstantStrings from '@constants/ConstantStrings';
import { smallHandle } from '@chains/ethereum/contract';
import { logger } from '@constants/Log';
import EstimatedFeeView from '@components/EstimatedFeeView';
import { useDispatch } from 'react-redux';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { checkNullOrEmpty } from '@constants/commonFuncation';
const ETHSendTransactionBottomSheet = ({
    signData,
    metaData,
    previousWallet,
    closeSendTransaction,
}) => {
    const dispatch = useDispatch();
    const [amountToDisplay, setAmountToDisplay] = useState(0.0);
    const [feeToDisplay, setFeeToDisplay] = useState(0.0);
    const [currentDappData, setCurrentDappData] = useState(null);
    const [chainDetail, setChainDetail] = useState(null);
    const [gasPrice, setGasPrice] = useState(null);
    const [isIndicatorStatus, setIsIndicatorStatus] = useState(false);
    console.log('metaData =>>>>>>>> ', metaData);
    const parsedMetaData = !checkNullOrEmpty(metaData)
        ? JSON.parse(metaData)
        : null;
    const dappName = parsedMetaData ? parsedMetaData.name : '';
    const dappImageUrl = parsedMetaData
        ? parsedMetaData.icons && parsedMetaData.icons[0]
        : '';
    const dappUrl = parsedMetaData ? parsedMetaData.url : '';

    function ethWeb3(node) {
        return new Web3(new Web3.providers.HttpProvider(node));
    }
    useEffect(() => {
        getdata();
    }, []);

    async function getdata() {
        let dappData = JSON.parse(previousWallet.allData);
        setCurrentDappData(dappData);
        try {
            let gasdata = parseInt(signData.gas * 1.5).toString();
            logger('gas data ', smallHandle(gasdata, 10));

            const chainDetail1 = await getChainDetail(
                JSON.parse(dappData.address).chain,
            );
            setChainDetail(chainDetail1.rows.item(0));

            let ethObj = ethWeb3(chainDetail1.rows.item(0).node).eth;
            let ethUtils = ethWeb3(chainDetail1.rows.item(0).node).utils;

            let weiAmount = ethUtils.hexToNumberString(signData.value);
            let amount = smallHandle(weiAmount, 18);
            setAmountToDisplay(amount);

            const gasPrice = await ethObj.getGasPrice();
            setGasPrice(gasPrice);
            const fee = smallHandle(gasPrice * gasdata, 18);
            logger('fee', fee);
            setFeeToDisplay(fee);
        } catch (error) {
            logger('******', error);
        }
    }

    async function generateTransactionHash(rawTransaction) {
        let ethObj = ethWeb3(chainDetail.node).eth;
        return new Promise((resolve, reject) => {
            ethObj
                .sendSignedTransaction(rawTransaction)
                .on('transactionHash', transactionHash => {
                    logger('hash##', transactionHash);
                    resolve(transactionHash);
                })
                .on('error', error => {
                    logger('Hash error', error);
                    reject(error.toString());
                });
        });
    }

    const confirmTransaction = async () => {
        if (isIndicatorStatus) {
            return;
        }
        logger('else');
        setIsIndicatorStatus(true);

        let ethObj = ethWeb3(chainDetail.node).eth;
        let ethUtils = ethWeb3(chainDetail.node).utils;

        // hex gas price
        let hexGasPrice = ethUtils.numberToHex(gasPrice);
        logger('hexGasPrice', hexGasPrice);

        try {
            let nonce = await ethObj.getTransactionCount(signData.from);
            let hexNonce = ethUtils.numberToHex(nonce);
            logger('hex nonce ', nonce);
            signData.nonce = hexNonce;
            signData.gasPrice = hexGasPrice;
            // signData.gasLimit = 100000;
            let signed = await ethObj.accounts.signTransaction(
                signData,
                JSON.parse(currentDappData.address).secret,
            );
            let hash = await generateTransactionHash(signed.rawTransaction);
            logger('result', hash);
            let requestId = previousWallet.requestId;
            let data = {
                address: JSON.parse(currentDappData.address),
                remotePeerId: currentDappData.remotePeerId,
                remotePeerMeta: currentDappData.remotePeerMeta,
                session: currentDappData.session,
                sessionId: currentDappData.sessionId,
                // chainId: chainId,
                requestId: requestId,
                peerId: currentDappData.peerId,
                rawTransaction: hash,
            };

            logger('data to send', data);
            Wallet.approveSendRequest(JSON.stringify(data));
            setTimeout(() => {
                setIsIndicatorStatus(false);
                closeSendTransaction();
            }, 200);
        } catch (error) {
            showMessageToast(dispatch, `Please try again => ${error}`);
            setIsIndicatorStatus(false);
            rejectTransaction();
            logger('EROORR ', error);
        }
    };
    const rejectTransaction = async () => {
        try {
            let requestId = previousWallet.requestId;
            let data = {
                address: JSON.parse(currentDappData.address),
                remotePeerId: currentDappData.remotePeerId,
                remotePeerMeta: currentDappData.remotePeerMeta,
                session: currentDappData.session,
                // chainId: chainId,
                requestId: requestId,
                peerId: currentDappData.peerId,
            };
            await Wallet.rejectSendRequest(JSON.stringify(data));
            closeSendTransaction();
        } catch (error) {
            logger('Reject session error', error);
            closeSendTransaction();
        }
    };
    return (
        <View>
            <Text style={styles.Title}>
                {ConstantStrings.TRANSACTION_REQUEST}
            </Text>
            {parsedMetaData && (
                <View style={styles.WalletBox}>
                    <Image
                        style={styles.walletImage}
                        source={{
                            uri: dappImageUrl,
                        }}
                    />
                    <View style={styles.metadataUrlStyle}>
                        <Text numberOfLines={1} style={styles.walletText}>
                            {dappName}
                        </Text>
                        <Text style={styles.walletSubText}>{dappUrl}</Text>
                    </View>
                    <Image
                        source={{
                            uri:
                                currentDappData &&
                                JSON.parse(currentDappData.address).icon,
                        }}
                        resizeMode="contain"
                        style={styles.dappImageStyle}></Image>
                </View>
            )}
            <View style={styles.symbolContainerStyle}>
                <View style={[styles.detailsView, {}]}>
                    <CustomImage
                        imageUrl={
                            currentDappData &&
                            JSON.parse(currentDappData.address).icon
                        }
                        isImageHeight20={false}
                    />
                    <Text numberOfLines={1} style={styles.txtCyptoHead}>
                        {amountToDisplay && amountToDisplay}{' '}
                        {chainDetail && chainDetail.symbol}
                    </Text>
                </View>
            </View>

            <EstimatedFeeView
                gasFee={feeToDisplay && parseFloat(feeToDisplay).toFixed(6)}
                symbol={chainDetail && chainDetail.symbol}
            />

            <View style={styles.bottomTotalContainerStyle}>
                <Text style={styles.estimatedFeeStyle}>
                    {ConstantStrings.TOTAL}
                </Text>

                <View style={styles.oneFlexStyle}></View>
                <Text style={styles.estimatedFeeStyle}>
                    {amountToDisplay &&
                        feeToDisplay &&
                        (
                            parseFloat(feeToDisplay) +
                            parseFloat(amountToDisplay)
                        ).toFixed(6)}{' '}
                    {chainDetail && chainDetail.symbol}
                </Text>
            </View>
            <View style={styles.bottomRejectAcceptViewStyle}>
                <TouchableOpacity
                    style={styles.cancel}
                    onPress={rejectTransaction}>
                    <Text style={styles.cancelText}>
                        {ConstantStrings.REJECT}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.approve}
                    onPress={confirmTransaction}>
                    {isIndicatorStatus && (
                        <ActivityIndicator
                            size={'small'}
                            color="white"
                            style={
                                styles.activityIndicatorStyle
                            }></ActivityIndicator>
                    )}
                    <Text style={styles.approveText}>
                        {ConstantStrings.CONFIRM}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default ETHSendTransactionBottomSheet;
const styles = StyleSheet.create({
    Title: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
        lineHeight: sizes.lh24,
    },
    WalletBox: {
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 4,
        marginVertical: 20,
    },
    activityIndicatorStyle: {
        marginRight: 10,
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
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    bottomRejectAcceptViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    bottomTotalContainerStyle: {
        alignContent: 'center',
        flexDirection: 'row',
        marginHorizontal: 4,
        marginTop: 8,
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
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    dappImageStyle: {
        height: 30,
        marginLeft: 20,
        width: 30,
    },
    detailsView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    estimatedFeeStyle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f10,
        lineHeight: sizes.lh12,
    },
    metadataUrlStyle: {
        flex: 1,
    },
    oneFlexStyle: {
        flex: 1,
    },
    symbolContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    txtCyptoHead: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: 28,
        lineHeight: 38,
        marginLeft: 5,
    },
    walletImage: {
        borderRadius: 8,
        height: 38,
        marginRight: 12,
        width: 38,
    },
    walletSubText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    walletText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
    },
});
