import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import { colors, sizes, fonts } from '@constants/theme';
import {
    Deposit,
    HISTORY,
    NFTS,
    send,
    Swap,
    TOKENS,
    WALLET_ADDRESS_COPY,
} from '@constants/ConstantStrings';
import TrippleButton from '@components/TrippleButton';
import Tokens from './Tokens';
import Nfts from './nft/Nfts';
import History from './history/History';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomImage from '@components/CustomImage';
import { retrieveKeyValueData, removeValue } from '@constants/Storage';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { showCopyToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';
import { getWalletForChainWithCDetail } from '@database/sql';
import { getFlex } from '@constants/commonFuncation';
import RowButtonsGroup from '../../../components/RowButtonsGroup';

const CryptoDetails = ({ navigation, route }) => {
    const [selectedTab, setSelectedTab] = useState(TOKENS);
    const [clickedWallet, setClickedWallet] = useState(null);
    const [chainName, setChainName] = useState('');
    const [address, setAddress] = useState('');
    const [chainIcon, setChainIcon] = useState('');
    const dispatch = useDispatch();


    useEffect(() => {
        getWalletForChainWithCDetail(route.params.selectedChain)
            .then(result => {
                if (result != undefined && result.rows.length > 0) {
                    const walletData = result.rows.item(0);
                    setChainName(walletData.chain);
                    setAddress(walletData.address);
                    setClickedWallet(walletData);
                    setChainIcon(walletData.chain_icon);
                }
            })
            .catch(error => {
                logger('ERROR :: ', error);
            });
    }, []);

    useEffect(() => {
        return navigation.addListener('focus', () => {
            retrieveKeyValueData('transSuccess').then(result => {
                if (result != null && result == 'true') {
                    // navigate to history tab
                    logger('result true');
                    setSelectedTab(HISTORY);
                    removeValue('transSuccess');
                }
            });
        });
    }, [navigation]);

    const onClickDeposite = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        let eventName =
            firebaseEvents.wallet +
            chainName.toLowerCase() +
            firebaseEvents.DYNAMIC_CHAIN_WALLET_DEPOSIT;
        firebaseAnalytics(eventName, eventObject);
        navigation.navigate('WalletQrcode', {
            address: address,
            chainName: chainName,
            chainIcon: chainIcon,
            chainDescription: clickedWallet.name,
        });
    };

    const onClickSend = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        let eventName =
            firebaseEvents.wallet +
            chainName.toLowerCase() +
            firebaseEvents.DYNAMIC_CHAIN_WALLET_SEND;
        firebaseAnalytics(eventName, eventObject);
        navigation.navigate('Send', { clickedWallet: clickedWallet });
    };
    const onClickBuySell = () => {
        navigation.navigate('AlchemyPay');
    };

    const copyToClipboard = addresspste => {
        Clipboard.setString(addresspste);
    };

    return (
        <SafeAreaView style={styles.mainContainerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />

            <View style={styles.parentView}>
                <View style={styles.itemView}>
                    <View style={styles.flexRow}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.goBack();
                            }}>
                            <Image
                                source={require('@assets/back.png')}
                                style={[
                                    theme.customStyle.closeIcon,
                                    styles.marginRightStyle,
                                ]}
                            />
                        </TouchableOpacity>
                        <CustomImage
                            isImageHeight20={true}
                            imageUrl={
                                clickedWallet && clickedWallet.chain_icon
                            }></CustomImage>
                        <Text style={styles.itemText}>
                            {clickedWallet && clickedWallet.name}
                        </Text>
                        <View style={styles.itemCopyIdView}>
                            <Text
                                style={styles.itemID}
                                numberOfLines={1}
                                ellipsizeMode={'middle'}>
                                {clickedWallet && clickedWallet.address}
                            </Text>
                            <TouchableOpacity onPress={copyAddress}>
                                <Image
                                    style={styles.itemCopyIDIcon}
                                    source={require('@assets/copy.png')}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.flexRow,
                            styles.containerSecondStyle,
                        ]}>
                        <RowButtonsGroup
                            depositFunction={onClickDeposite}
                            sendFunction={onClickSend}
                            fontColor={colors.purple_button_color}
                            buyFunction={onClickBuySell}
                            isFromInChain = {true}
                        />
                    </View>
                </View>
            </View>
            <TrippleButton
                viewStyle={styles.dualTabView}
                tabOneTitle={TOKENS}
                tabTwoTitle={NFTS}
                tabThreeTitle={HISTORY}
                tabOnePress={() => {
                    const eventObject = {
                        timeOfClick: new Date().toLocaleString(),
                    };
                    let eventName =
                        firebaseEvents.wallet +
                        chainName.toLowerCase() +
                        firebaseEvents.DYNAMIC_CHAIN_WALLET_TOKENS;
                    firebaseAnalytics(eventName, eventObject);
                    setSelectedTab(TOKENS);
                }}
                tabTwoPress={() => {
                    const eventObject = {
                        timeOfClick: new Date().toLocaleString(),
                    };
                    let eventName =
                        firebaseEvents.wallet +
                        chainName.toLowerCase() +
                        firebaseEvents.DYNAMIC_CHAIN_WALLET_NFTS;
                    firebaseAnalytics(eventName, eventObject);
                    setSelectedTab(NFTS);
                }}
                tabThreePress={() => {
                    const eventObject = {
                        timeOfClick: new Date().toLocaleString(),
                    };
                    let eventName =
                        firebaseEvents.wallet +
                        chainName.toLowerCase() +
                        firebaseEvents.DYNAMIC_CHAIN_WALLET_HISTORY;
                    firebaseAnalytics(eventName, eventObject);
                    setSelectedTab(HISTORY);
                }}
                SelectedTabTwoStyle={styles.marginHorizStyle}
                condition={selectedTab === TOKENS}
                condition1={selectedTab === NFTS}
                condition2={selectedTab === HISTORY}
            />
            {selectedTab === TOKENS ? (
                clickedWallet && (
                    <Tokens
                        navigation={navigation}
                        clickedWallet={clickedWallet}
                        chainName={chainName}
                        address={address}
                    />
                )
            ) : selectedTab === NFTS ? (
                <Nfts navigation={navigation} clickedWallet={clickedWallet} />
            ) : (
                <History
                    chainName={chainName}
                    address={address}
                    navigation={navigation}
                />
            )}
        </SafeAreaView>
    );

    function copyAddress() {
        if (clickedWallet != null && clickedWallet.address != null) {
            logger('clickedWallet.address', clickedWallet.address);
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.home_connect_dapp, eventObject);
            copyToClipboard(clickedWallet.address);
            showCopyToast(dispatch, WALLET_ADDRESS_COPY);
        }
    }
};

export default CryptoDetails;
const styles = StyleSheet.create({
    containerSecondStyle: {
        justifyContent: 'center',
        marginTop: 24,
    },
    dualTabView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 20,
    },
    flexRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    itemCopyIDIcon: {
        height: 15,
        marginLeft: 8,
        width: 15,
    },
    itemCopyIdView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 4,
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 5,
        width: '30%',
    },
    itemID: {
        color: theme.colors.neutral60,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f10,
        width: '80%',
    },
    itemText: {
        color: theme.colors.mainColor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
        marginLeft: 8,
    },
    itemView: {
        backgroundColor: colors.white,
        borderRadius: 8,
        marginTop: 24,
        padding: 20,
    },
    mainContainerStyle: {
        flex: getFlex(),
        marginHorizontal: 20,
    },
    marginHorizStyle: {
        marginHorizontal: 8,
    },
    marginRightStyle: {
        marginRight: 10,
    },

});
