import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import CustomImage from '@components/CustomImage';
import ConstantStrings from '@constants/ConstantStrings';
import Wallet from './ExportWalletNativeModule';
import { getChainDetail } from '@database/sql';
import WalletSelectModel from '../Tabbar/QRCode/WalletSelectModel';
import { Decrypt } from '@constants/EncryptDecrypt';
import Web3 from 'web3';
let ethers = require('ethers');
import { logger } from '@constants/Log';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletAddressWithChainList } from '@redux/Action/WalletWithChainsAction';
import { checkNullOrEmpty } from '@constants/commonFuncation';

const EthSignInBottomSheet = ({
    signData,
    metaData,
    previousWallet,
    closeDialog,
}) => {
    const walletListReducer = useSelector(
        state => state.WalletWithChainsReducer,
    );
    const dispatch = useDispatch();
    const [showWalletList, setShowWalletList] = useState(false);
    const [dataList, setDataList] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [chainDetail, setChainDetail] = useState(null);

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
        getWalletList();
    }, []);
    async function getWalletList() {
        let walletList = walletListReducer.walletList;
        if (
            walletList == null ||
            walletList == undefined ||
            walletList.length == 0
        ) {
            walletList = await getWalletAddressWithChainList(dispatch);
        }

        const chainDetail1 = await getChainDetail(previousWallet.chain);
        setChainDetail(chainDetail1.rows.item(0));
        setSelectedWallet(previousWallet);
        setDataList(walletList);
    }

    function SelectChainWallet(item) {
        setSelectedWallet(item);
    }

    const signMessage = async () => {
        let key = await Decrypt(selectedWallet.privateKey);
        const ethObj = ethWeb3(chainDetail.node).eth;
        let type = signData.type;

        if (
            type === 'PERSONAL_MESSAGE' ||
            type === 'MESSAGE' ||
            type == 'personal_sign'
        ) {
            let walletObj = new ethers.Wallet(key);
            let result = null;
            if (Platform.OS == 'ios') {
                try {
                    result = await walletObj.signMessage(
                        ethers.utils.isHexString(
                            JSON.parse(signData.ethsign)[0],
                        )
                            ? ethers.utils.arrayify(
                                  JSON.parse(signData.ethsign)[0],
                              )
                            : JSON.parse(signData.ethsign)[0],
                    );
                } catch (error) {
                    logger(
                        'eth sign in bottom sheet error when sign message :: ',
                        error,
                    );
                }
            } else {
                result = await walletObj.signMessage(
                    ethers.utils.isHexString(
                        JSON.parse(signData.ethsign).raw[0],
                    )
                        ? ethers.utils.arrayify(
                              JSON.parse(signData.ethsign).raw[0],
                          )
                        : JSON.parse(signData.ethsign).raw[0],
                );
            }

            logger(`result PERSONAL_MESSAGE:${JSON.stringify(result)}`);
            await Wallet.signRequest(
                JSON.stringify(signData.ethsignId),
                result,
            );
        } else {
            let account = ethObj.accounts.privateKeyToAccount(key);
            let { signature } = account.sign(signData.ethsign, account.address);
            logger(`result:${JSON.stringify(signature)}`);
            await Wallet.signRequest(
                JSON.stringify(signData.ethsignId),
                signature,
            );
        }

        closeDialog();
    };
    const rejectRequest = async () => {
        try {
            await Wallet.rejectRequest(JSON.stringify(signData.ethsignId));
        } catch (error) {
            logger('Reject session error', error);
        }
        closeDialog();
    };
    return (
        <View style={{}}>
            {showWalletList && (
                <WalletSelectModel
                    setShowWalletList={setShowWalletList}
                    setSelectedWalletToDeposite={SelectChainWallet}
                    WalletList={dataList}
                    isFromDapp={true}></WalletSelectModel>
            )}
            <Text style={styles.Title}>{ConstantStrings.SIGNTHISMESSAGE}</Text>

            {parsedMetaData && (
                <View style={styles.WalletBox}>
                    <Image
                        style={styles.walletImage}
                        source={{
                            uri: dappImageUrl,
                        }}
                    />
                    <View style={styles.flexOneStyle}>
                        <Text numberOfLines={1} style={styles.walletText}>
                            {dappName}
                        </Text>
                        <Text style={styles.walletSubText}>{dappUrl}</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity>
                <View style={styles.detailsView}>
                    <CustomImage
                        imageUrl={selectedWallet && selectedWallet.icon}
                        style={styles.walletIconStyle}
                    />
                    <View style={styles.cyptoSubView}>
                        <View style={styles.backupTextView}>
                            <Text style={styles.txtCyptoHead}>
                                {selectedWallet && selectedWallet.chain}
                            </Text>
                            <Text
                                style={styles.txtCyptoSubHead}
                                numberOfLines={1}
                                ellipsizeMode="middle">
                                {selectedWallet && selectedWallet.address}
                            </Text>
                        </View>
                        {/* <Image
              source={require('@assets/arrowBottomBlack.png')}
              resizeMode="contain"
              style={styles.iconArrow}></Image> */}
                    </View>
                </View>
            </TouchableOpacity>

            <Text style={styles.info}>
                {ConstantStrings.MESSAGEFROMEXPLORE_PLAY3}
                {dappName}
            </Text>
            <View style={styles.welcomeMessageView}>
                <ScrollView style={styles.scrollMarginStyle}>
                    <Text style={styles.HiPlay3R}>{signData.message}</Text>
                    {/* <Text style={styles.pleaseSignin}>{PLEASESIGN}</Text>
          <Text style={styles.signInThisMessage}>{SIGNINGTHISMESSAGE}</Text> */}
                </ScrollView>
            </View>
            <View style={styles.bottomButtonContainerStyle}>
                <TouchableOpacity style={styles.cancel} onPress={rejectRequest}>
                    <Text style={styles.cancelText}>
                        {ConstantStrings.Cancel}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.approve} onPress={signMessage}>
                    <Text style={styles.approveText}>
                        {ConstantStrings.SIGN_APPROVE}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default EthSignInBottomSheet;
const styles = StyleSheet.create({
    HiPlay3R: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    Title: {
        fontColor: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
        lineHeight: sizes.lh24,
    },
    WalletBox: {
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 4,
        marginVertical: 16,
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
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    backupTextView: {
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 10,
    },
    bottomButtonContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
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
    cyptoSubView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    detailsView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,

        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    flexOneStyle: {
        flex: 1,
    },

    info: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginTop: 16,
    },

    scrollMarginStyle: {
        margin: 12,
    },

    txtCyptoHead: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    txtCyptoSubHead: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },

    walletIconStyle: {
        height: 34,
        width: 34,
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
    welcomeMessageView: {
        backgroundColor: colors.gray_background,
        borderColor: colors.gray_background_1,
        borderRadius: 12,
        borderWidth: 1,
        height: 76,
        marginBottom: 16,
        marginVertical: 4,
    },
});
