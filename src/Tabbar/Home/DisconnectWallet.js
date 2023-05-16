import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, fonts } from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings, {
    Disconnect,
    ConnecttodApp,
} from '@constants/ConstantStrings';
import { disconnectWallet } from '../../walletconnect/WalletConnectNativeModule';
import WalletSelectModel from '../QRCode/WalletSelectModel';
import { Decrypt } from '@constants/EncryptDecrypt';
import { logger } from '@constants/Log';
import TopWalletSelection from '@components/TopWalletSelection';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletAddressWithChainList } from '@redux/Action/WalletWithChainsAction';
export default function DisconnectWallet({
    setShowDisconnectWalletPopup,
    clickedData,
    selectedChainForChange,
}) {
    const [showWalletSelect, setShowWalletSelect] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [walletData, setWalletData] = useState(null);
    const dispatch = useDispatch();
    const walletListWithChainReducer = useSelector(
        state => state.WalletWithChainsReducer,
    );
    useEffect(() => {
        getWalletList();
    }, []);
    async function SelectChainWallet(item) {
        const key = await Decrypt(item.privateKey);
        item.secret = key;
        setSelectedWallet(item);
        clickedData.address = item;
        selectedChainForChange(clickedData);
    }
    async function getWalletList() {
        let walletList = walletListWithChainReducer.walletList;
        if (
            walletList == null ||
            walletList == undefined ||
            walletList.length == 0
        ) {
            walletList = await getWalletAddressWithChainList(dispatch);
        }
        let data = walletList.find(item => {
            return item.chainId == JSON.parse(clickedData.address).chainId;
        });
        setSelectedWallet(data);
        // var allWallets = await getAllWallets();
        // let walletList = [];
        // for (let i = 0; i < allWallets.rows.length; i++) {
        //   var chainDetail = await getChainDetail(allWallets.rows.item(i).chain);
        //   var chDetail = chainDetail.rows.item(0);
        //   allWallets.rows.item(i).icon = chDetail.chain_icon;
        //   allWallets.rows.item(i).chainId = chDetail.chainId;
        //   allWallets.rows.item(i).chainDetail = chDetail;

        //   if (clickedData != null) {
        //     if (chDetail.chainId == JSON.parse(clickedData.address).chainId) {
        //       allWallets.rows.item(i).chainDetail = chDetail;
        //       setSelectedWallet(allWallets.rows.item(i))
        //     }
        //   }
        //   walletList.push(allWallets.rows.item(i));
        // }
        setWalletData(walletList);
    }

    const clickEvent = () => {
        setShowWalletSelect(true);
    };

    logger('clicked data ', clickedData);
    return (
        <Modal
            onRequestClose={() => {
                setShowDisconnectWalletPopup(false);
            }}
            transparent={true}>
            {showWalletSelect && (
                <WalletSelectModel
                    setShowWalletList={setShowWalletSelect}
                    setSelectedWalletToDeposite={SelectChainWallet}
                    WalletList={walletData}
                    isFromDapp={true}
                    isFromSwitchNetwork={true}></WalletSelectModel>
            )}

            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <Text style={styles.Title}>{ConnecttodApp}</Text>
                    <View style={styles.cryptoView}>
                        <Image
                            source={{
                                uri:
                                    clickedData &&
                                    clickedData.remotePeerMeta &&
                                    clickedData.remotePeerMeta.icons[0],
                            }}
                            resizeMode="contain"
                            style={styles.iconFrame}></Image>
                        <View style={styles.cyptoSubView}>
                            <View style={styles.backupTextView}>
                                <Text style={styles.txtCyptoHead}>
                                    {clickedData &&
                                        clickedData.remotePeerMeta &&
                                        clickedData.remotePeerMeta.name}
                                </Text>
                                <Text style={styles.txtCyptoSubHead}>
                                    {selectedWallet && selectedWallet.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={styles.txtCyptoToken}>
                                    {selectedWallet && selectedWallet.chain} -{' '}
                                    {selectedWallet && selectedWallet.address}
                                </Text>
                            </View>
                            <Image
                                source={{
                                    uri: selectedWallet && selectedWallet.icon,
                                }}
                                resizeMode="contain"
                                style={styles.iconFrame}></Image>
                        </View>
                    </View>

                    <Text style={styles.switchNetwork}>
                        {ConstantStrings.SWITCH_NETWORK_LABEL}
                    </Text>
                    <View style={styles.topWalletSelectionContainer}>
                        <TopWalletSelection
                            imageIcon={selectedWallet && selectedWallet.icon}
                            chainname={
                                selectedWallet &&
                                selectedWallet.chainDetail &&
                                selectedWallet.chainDetail.name
                            }
                            walletAddress={
                                selectedWallet && selectedWallet.address
                            }
                            isClickable={true}
                            clickEvent={clickEvent}
                            withGrayBgColor={true}
                            showWalletName={false}></TopWalletSelection>
                    </View>

                    {/* <Text style={styles.switchNetwork}>Switch network to Polygon?</Text> */}
                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowDisconnectWalletPopup(false);
                            }}
                            style={styles.cancelView}>
                            <View style={styles.cancelView}>
                                <Text style={styles.txtCancel}>
                                    {ConstantStrings.Cancel}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                const eventObject = {
                                    timeOfClick: new Date().toLocaleString(),
                                };
                                firebaseAnalytics(
                                    firebaseEvents.dapp_disconnect,
                                    eventObject,
                                );
                                disconnectWallet(clickedData);
                                setShowDisconnectWalletPopup(false);
                            }}
                            style={styles.disconnectView}>
                            <View style={styles.disconnectView}>
                                <Text style={styles.txtDisconnect}>
                                    {Disconnect}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    Title: {
        color: theme.colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        lineHeight: theme.sizes.lh24,
        marginLeft: 24,
        marginTop: 24,
    },

    backupTextView: {
        alignItems: 'flex-start',
        flex: 0.9,
        flexDirection: 'column',
        marginLeft: 10,
    },

    bottomView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        marginLeft: 24,
        marginRight: 24,
    },

    cancelView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 10,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        margin: 5,
    },

    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'flex-end',
    },

    cryptoView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        flexDirection: 'row',
        height: 69,
        margin: 24,
        marginTop: 10,
    },

    cyptoSubView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    disconnectView: {
        alignItems: 'center',
        backgroundColor: colors.offRed,
        borderRadius: 10,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        margin: 5,
    },
    iconFrame: {
        height: 38,
        width: 38,
    },

    popupView: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    switchNetwork: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
        marginLeft: 24,
        marginTop: 0,
    },
    topWalletSelectionContainer: { marginHorizontal: 20, marginVertical: 10 },
    txtCancel: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    txtCyptoHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginTop: 15,
    },

    txtCyptoSubHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        marginTop: 2,
    },
    txtCyptoToken: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        marginTop: 2,
        width: '60%',
    },
    txtDisconnect: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
});
