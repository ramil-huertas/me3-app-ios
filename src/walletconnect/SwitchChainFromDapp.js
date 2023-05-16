import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, fonts } from '@constants/theme';
import { theme } from '@constants';
import { getNameFromChainId, getWalletForChain } from '@database/sql';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import Wallet from '../walletconnect/ExportWalletNativeModule';
import { Decrypt } from '@constants/EncryptDecrypt';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

export default function SwitchChainFromDapp({
    closeSheet,
    switchFromDappData,
}) {
    const dispatch = useDispatch();
    const [remotePeerData, setRemotePeerData] = useState(null);
    const [walletData, setWalletData] = useState(null);
    const [currentWalletData, setCurrentWalletData] = useState(null);

    const [toChainData, setToChainData] = useState(null);
    const [fromChainName, setFromChainName] = useState(null);

    useEffect(() => {
        console.log('switchFromDappData =>>>>>>>>>', switchFromDappData);
        if (switchFromDappData) {
            let data = JSON.parse(switchFromDappData.data);
            let addressData = JSON.parse(data.address);
            let chainId = switchFromDappData.chainId;
            setRemotePeerData(data.remotePeerMeta);
            setCurrentWalletData(addressData);

            getNameFromChainId(chainId)
                .then(result => {
                    let chainData = result.rows.item(0);
                    setToChainData(chainData);
                    getWalletForChain(chainData.chain)
                        .then(walletData1 => {
                            let wallet = walletData1.rows.item(0);
                            wallet.chainId = chainData.chainId;
                            wallet.icon = chainData.chain_icon;
                            Decrypt(wallet.privateKey).then(keyDecrypted => {
                                wallet.secret = keyDecrypted;
                                setWalletData(wallet);
                            });
                        })
                        .catch(error => {
                            logger('getwalelt error ', error);
                        });
                })
                .catch(error => logger('database error ', error));

            getNameFromChainId(addressData.chainId)
                .then(result => {
                    let chainname = result.rows.item(0).name;
                    setFromChainName(chainname);
                })
                .catch(error => logger('database error ', error));
        }
    }, []);

    const switchChainClick = () => {
        logger('clicked data', switchFromDappData);

        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.dapp_switch, eventObject);

        let dataparsed = JSON.parse(switchFromDappData.data);
        let chainId = switchFromDappData.chainId;
        let requestId = switchFromDappData.requestId;
        let data = {
            address: walletData,
            remotePeerId: dataparsed.remotePeerId,
            remotePeerMeta: dataparsed.remotePeerMeta,
            session: dataparsed.session,
            sessionId: dataparsed.sessionId,
            chainId: chainId,
            requestId: requestId,
            peerId: dataparsed.peerId,
        };

        getNameFromChainId(chainId)
            .then(result => {
                let rows = result.rows;
                if (rows.length > 0) {
                    logger('data to send', data);
                    Wallet.switchChain(JSON.stringify(data));
                    closeSheet();
                } else {
                    showMessageToast(dispatch, 'This chain is not supported');
                }
            })
            .catch(error => {
                logger('database error ', error);
                showMessageToast(dispatch, error);
            });
    };
    return (
        <View
            style={
                {
                    //  flex: 1,
                    //  marginHorizontal: 24,
                    // marginTop: 10,
                    //  marginBottom: 24,
                }
            }>
            <Text style={styles.Title}>{ConstantStrings.SWITCH_NETWORK}</Text>

            <View style={styles.WalletBox}>
                <Image
                    style={styles.walletImage}
                    source={{
                        uri: remotePeerData && remotePeerData.icons[0],
                    }}
                />

                <View style={styles.flexOneStyle}>
                    <Text numberOfLines={1} style={styles.walletText}>
                        {remotePeerData && remotePeerData.name}
                    </Text>
                    <Text style={styles.walletSubText}>
                        {remotePeerData && remotePeerData.url}
                    </Text>
                </View>
            </View>

            <View style={styles.chainNameContainerStyle}>
                <View style={[styles.detailsView, {}]}>
                    <CustomImage
                        imageUrl={currentWalletData && currentWalletData.icon}
                        isImageHeight20={true}
                    />
                    <Text numberOfLines={1} style={styles.txtCyptoHead}>
                        {fromChainName && fromChainName}
                    </Text>
                </View>
                <View style={styles.forwardImageContainerStyle}>
                    <Image
                        source={require('@assets/forward.png')}
                        resizeMode="contain"
                        style={styles.forwardImageStyle}
                    />
                </View>
                <View style={[styles.detailsView, {}]}>
                    <CustomImage
                        imageUrl={walletData && walletData.icon}
                        isImageHeight20={true}
                    />
                    <Text numberOfLines={1} style={styles.txtCyptoHead}>
                        {toChainData && toChainData.name}
                    </Text>
                </View>
            </View>
            <Text style={styles.info}>
                {remotePeerData && remotePeerData.name} is requesting to switch
                to {toChainData && toChainData.name.trim()} chain. Allow this
                site to switch the network?
            </Text>
            <View style={styles.bottomView}>
                <TouchableOpacity
                    onPress={() => {
                        closeSheet();
                    }}
                    style={styles.cancelView}>
                    <View style={styles.cancelView}>
                        <Text style={styles.txtCancel}>
                            {ConstantStrings.Cancel}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={switchChainClick}
                    style={styles.disconnectView}>
                    <View style={styles.disconnectView}>
                        <Text style={styles.txtDisconnect}>
                            {ConstantStrings.SWITCH}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    Title: {
        color: theme.colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f20,
        lineHeight: theme.sizes.lh24,
        marginTop: 24,
    },
    WalletBox: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },

    bottomView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
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
    chainNameContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
    },

    detailsView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 14,
        padding: 10,
        paddingRight: 18,
    },

    disconnectView: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flex: 1,
        height: 50,
        justifyContent: 'center',
        margin: 5,
    },

    flexOneStyle: {
        flex: 1,
    },

    forwardImageContainerStyle: {
        alignItems: 'center',
        height: 24,
        justifyContent: 'center',
        margin: 8,
        width: 24,
    },

    forwardImageStyle: {
        height: 20,
        width: 20,
    },
    info: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
        // marginVertical: 16,
    },

    txtCancel: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    txtCyptoHead: {
        color: colors.mainColor,
        fontFamily: theme.fonts.titillium_bold,
        // marginTop: 15,
        fontSize: theme.sizes.f14,
        marginLeft: 5,
    },

    txtDisconnect: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    walletImage: {
        borderRadius: 8,
        height: 38,
        marginRight: 12,
        width: 38,
    },
    walletSubText: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        lineHeight: theme.sizes.lh14,
    },
    walletText: {
        color: theme.colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        lineHeight: theme.sizes.lh20,
    },
});
