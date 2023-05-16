import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import { ConnecttodApp, PLAY3WANTSTOCONNECT } from '@constants/ConstantStrings';
import Wallet from './ExportWalletNativeModule';

import WalletSelectModel from '../Tabbar/QRCode/WalletSelectModel';
import { Decrypt } from '@constants/EncryptDecrypt';
import { logger } from '@constants/Log';
import TopWalletSelection from '@components/TopWalletSelection';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletAddressWithChainList } from '@redux/Action/WalletWithChainsAction';

const WalletConnectBottomSheet = ({ metaData, selectWallet, closeDialog }) => {
    const walletListReducer = useSelector(
        state => state.WalletWithChainsReducer,
    );

    const [showWalletList, setShowWalletList] = useState(false);
    const [dataList, setDataList] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [disable, setDisable] = useState(false);
    const dispatch = useDispatch();
    const parsedMetaData = metaData ? JSON.parse(metaData) : null;
    const dappName = parsedMetaData ? parsedMetaData.name : '';
    const dappImageUrl = parsedMetaData
        ? parsedMetaData.icons && parsedMetaData.icons[0]
        : '';
    const dappUrl = parsedMetaData ? parsedMetaData.url : '';

    function showWalletChange() {
        setShowWalletList(true);
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
        let key = await Decrypt(walletList[0].privateKey);
        walletList[0].secret = key;
        setSelectedWallet(walletList[0]);
        setDataList(walletList);
    }

    async function SelectChainWallet(item) {
        let key = await Decrypt(item.privateKey);
        item.secret = key;
        setSelectedWallet(item);
    }

    return (
        <View style={{}}>
            {showWalletList && (
                <WalletSelectModel
                    setShowWalletList={setShowWalletList}
                    setSelectedWalletToDeposite={SelectChainWallet}
                    WalletList={dataList}
                    isFromDapp={true}></WalletSelectModel>
            )}
            <Text style={styles.Title}>{ConnecttodApp}</Text>

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

            <TopWalletSelection
                imageIcon={selectedWallet && selectedWallet.icon}
                chainname={
                    selectedWallet &&
                    selectedWallet.chainDetail &&
                    selectedWallet.chainDetail.name
                }
                walletAddress={selectedWallet && selectedWallet.address}
                isClickable={true}
                clickEvent={showWalletChange}
                withGrayBgColor={true}
                showWalletName={false}></TopWalletSelection>

            <Text style={styles.info}>
                {dappName} {PLAY3WANTSTOCONNECT}
            </Text>
            <View style={styles.bottombuttonContainerStyle}>
                <TouchableOpacity
                    style={styles.cancel}
                    onPress={async () => {
                        try {
                            selectWallet(null);
                            await Wallet.rejectSession();
                        } catch (error) {
                            logger('Reject session error', error);
                        }
                        closeDialog();
                    }}>
                    <Text style={styles.cancelText}>{'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.approve}
                    disabled={disable}
                    onPress={async () => {
                        setDisable(true);
                        try {
                            selectWallet(selectedWallet);
                            await Wallet.approveSession(
                                JSON.stringify(selectedWallet),
                            );
                        } catch (error) {
                            logger('approve session error', error);
                        }
                        closeDialog();
                    }}>
                    <Text style={styles.approveText}>{'Connect'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WalletConnectBottomSheet;

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
    bottombuttonContainerStyle: {
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

    flexOneStyle: {
        flex: 1,
    },
    info: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginVertical: 16,
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
