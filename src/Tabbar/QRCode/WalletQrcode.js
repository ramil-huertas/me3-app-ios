import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import { theme } from '@constants';
import Clipboard from '@react-native-clipboard/clipboard';
import WalletSelectModel from './WalletSelectModel';
import Wxqrcode from './wxqrcode';
import ScreenTopHeader from '@components/ScreenTopHeader';
import ConstantStrings from '@constants/ConstantStrings';
import TopWalletSelection from '@components/TopWalletSelection';
import WarningMessage from '@components/WarningMessage';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { getAddressWarning } from '../TabbarFuncation';
import { useDispatch, useSelector } from 'react-redux';
import { setQrcodeObject } from '@redux/Action/DepositQrActions';
import { getWalletAddressWithChainList } from '@redux/Action/WalletWithChainsAction';

export default function WalletQrcode({ navigation, route }) {
    const qrcodeReducer = useSelector(state => state.DepositQRReducer);
    const walletListReducer = useSelector(
        state => state.WalletWithChainsReducer,
    );
    const [address, setAddress] = useState('');
    const [chainIcon, setChainIcon] = useState('');
    const [qrcodeImage, setQrcodeImage] = useState('');
    const [showWalletList, setShowWalletList] = React.useState(false);
    const [data, setData] = useState([]);
    const [chainDescription, setChainDescription] = useState('');

    const dispatch = useDispatch();
    const copyToClipboard = addressCopied => {
        Clipboard.setString(addressCopied);
    };

    useEffect(() => {
        if (walletListReducer.walletList.length > 0)
            updateUI(walletListReducer.walletList);
    }, [walletListReducer.walletList]);

    useEffect(() => {
        setTimeout(() => {
            if (address != null && address != undefined && address.length > 0)
                CheckForQRCodeinRedux(address);
        }, 500);
    }, [chainDescription]);

    function CheckForQRCodeinRedux(walletaddress) {
        const qrList = qrcodeReducer.qrCodeList;
        if (qrList != null && qrList != undefined && qrList.length > 0) {
            let result = qrList.find(item => {
                return item.address == walletaddress;
            });
            if (result != null && result != undefined) {
                setQrcodeImage(result.qrcode);
            } else {
                let base64Icon = generateQRCode(walletaddress);
                let objQR = {
                    address: walletaddress,
                    qrcode: base64Icon,
                };
                setQrcodeObject(dispatch, objQR);
                setQrcodeImage(base64Icon);
            }
        } else {
            const base64Icon = generateQRCode(walletaddress);
            let objQR = {
                address: walletaddress,
                qrcode: base64Icon,
            };
            setQrcodeObject(dispatch, objQR);
            setQrcodeImage(base64Icon);
        }
    }

    async function getWalletList() {
        let walletList = walletListReducer.walletList;
        if (
            walletList == null ||
            walletList == undefined ||
            walletList.length == 0
        ) {
            walletList = await getWalletAddressWithChainList(dispatch);
            updateUI(walletList);
        } else {
            updateUI(walletList);
        }
    }

    function updateUI(walletList) {
        if (route.params && route.params.isFromHome) {
            setAddress(walletList[0].address);
            setChainDescription(walletList[0].chainDetail.name);
            setChainIcon(walletList[0].icon);
        } else {
            if (route.params.address != null) {
                setAddress(route.params.address);
            }
            if (route.params.chainIcon != null) {
                setChainIcon(route.params.chainIcon);
            }

            if (
                route.params.chainDescription != null ||
                route.params.chainDescription != undefined
            )
                setChainDescription(route.params.chainDescription);
        }
        setData(walletList);
    }
    useEffect(() => {
        getWalletList();
    }, []);

    const topBackClick = () => {
        navigation.pop();
    };
    return (
        <SafeAreaView style={styles.contain}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />

            {showWalletList && (
                <WalletSelectModel
                    setShowWalletList={setShowWalletList}
                    setSelectedWalletToDeposite={setSelectedWalletToDeposite}
                    WalletList={data}
                    isFromDapp={false}></WalletSelectModel>
            )}

            <View style={{ marginHorizontal: calculateWidth(20) }}>
                <ScreenTopHeader
                    title={ConstantStrings.RECEIVE_TOKEN_AND_NFT}
                    topBackClick={topBackClick}
                    showBack={true}></ScreenTopHeader>

                <>
                    <TopWalletSelection
                        imageIcon={chainIcon}
                        chainname={chainDescription}
                        walletAddress={address}
                        isClickable={true}
                        withGrayBgColor={true}
                        clickEvent={selectWalletTodeposite}
                        showWalletName={false}></TopWalletSelection>
                </>

                {getAddressWarning(address).main != '' &&
                    getAddressWarning(address).sub != '' && (
                        <WarningMessage
                            dualMessage={true}
                            mainMessage={getAddressWarning(address).main}
                            subMessage={getAddressWarning(address).sub}
                        />
                    )}

                <View style={styles.QrcodeView}>
                    {qrcodeImage && qrcodeImage.length > 0 ? (
                        <Image
                            style={styles.qrCodeImg}
                            source={{ uri: `${qrcodeImage}` }}
                        />
                    ) : (
                        <ActivityIndicator
                            color={colors.purple_dark}
                            style={styles.activityInd}></ActivityIndicator>
                    )}
                </View>
                <View style={styles.AddressView}>
                    <View>
                        <Text style={styles.txtWalletAddress}>
                            {ConstantStrings.WALLET_ADDRESS}
                        </Text>
                        <Text
                            style={styles.txtAddress}
                            ellipsizeMode="middle"
                            numberOfLines={1}>
                            {address}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={copyAddress}>
                        <View style={styles.btnDeposite}>
                            <Image
                                source={require('@assets/copy.png')}
                                style={styles.copyIcon}
                                resizeMode="contain"></Image>
                            <Text style={styles.txtCopy}>{ConstantStrings.COPY}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );

    function selectWalletTodeposite() {
        setShowWalletList(true);
    }

    function generateQRCode(address) {
        let qrcodeBase64 = Wxqrcode.createQrCodeImg(address);
        return `${qrcodeBase64}`;
    }
    function setSelectedWalletToDeposite(item) {
        setAddress(item.address);
        setChainIcon(item.icon);
        setChainDescription(item.chainDetail.name);
        setQrcodeImage('');
    }

    function copyAddress() {
        if (address != null) {
            copyToClipboard(address);
            showCopyToast(dispatch, ConstantStrings.WALLET_ADDRESS_COPY);
        }
    }
}

const styles = StyleSheet.create({
    AddressView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    QrcodeView: {
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 45,
    },
    activityInd: {
        height: 30,
        width: 30,
    },
    btnDeposite: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 12,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        marginLeft: calculateWidth(20),
        marginVertical: calculateHeight(20),
        width: 89,
    },
    contain: {
        backgroundColor: colors.white,
        flex: 1,
    },

    copyIcon: {
        height: 15,
        tintColor: colors.white,
        width: 15,
    },

    qrCodeImg: { height: 240, width: 240 },
    txtAddress: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        width: 100,
    },

    txtCopy: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginLeft: 10,
    },
    txtWalletAddress: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
});
