/* eslint-disable react/hook-use-state */
/* eslint-disable react-native/no-color-literals */
import {
    View,
    Text,
    FlatList,
    StatusBar,
    ScrollView,
    LogBox,
    SafeAreaView,
    StyleSheet,
    NativeEventEmitter,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import CustomHeader from '../Header/CustomHeader';
import { colors, fonts } from '@constants/theme';
import {
    ConnecttodApp,
    CurrentlyConnected,
    KEEPYOURKEYSSAFE,
    Makesureyoureconnectedinternet,
    Makeyourfirstdeposit,
    Manage,
    TotalBalance,
    Viewall,
    YOURWALLERISSUCCESSFULLYBACKEDUP,
    Yourwalletisbeingbacked_up,
} from '@constants/ConstantStrings';
import ConntedWalletView from './ConntedWalletView';
import WalletFooter from './WalletFooter';
import DisconnectWallet from './DisconnectWallet';
import DisconnectAllWallet from './DisconnectAllWallet';
import DisconnctFooter from './DisconnctFooter';
import BackConfirmationPopup from './BackConfirmationPopup';
import { theme } from '@constants';
import {
    apiAddSymbolAddress,
    apiAddWalletToServer,
    api_set_fileId,
} from '@api/AxiosInstance';

import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import {
    getAllNotBackedUpWallets,
    getSymbolForChain,
    updateBackupStatus,
    getAllWallets,
} from '@database/sql';
import WalletConnectBottomSheet from '../../walletconnect/WalletConnectBottomSheet';

import { useFocusEffect } from '@react-navigation/native';
import Wallet from '../../walletconnect/ExportWalletNativeModule';
import EthSignInBottomSheet from '../../walletconnect/EthSignInBottomSheet';
import { checkBalanceIsHidden } from '../TabbarFuncation';
import SwitchChainFromDapp from '../../walletconnect/SwitchChainFromDapp';
import ETHSendTransactionBottomSheet from '../../walletconnect/ETHSendTransactionBottomSheet';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { useDispatch, useSelector } from 'react-redux';
import RowButtonsGroup from '@components/RowButtonsGroup';
import {
    checkNullOrEmpty,
    autoLogoutAfter1Week,
} from '@constants/commonFuncation';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import { setUploadStatus } from '@redux/Action/BackupAction';
import CustomModal from '@components/CustomModal';

LogBox.ignoreLogs([
    'new NativeEventEmitter',
    '.058%" is not a valid number or percentage string.',
]);
import { concat } from '@stablelib/bytes';
import { getTotalAssets } from '@redux/Action/HomeAction';
import { ChaCha20Poly1305, NONCE_LENGTH } from '@stablelib/chacha20poly1305';
import * as stable64 from '@stablelib/base64';
import * as stableUtf8 from '@stablelib/utf8';
import { md, util } from 'node-forge';
import {
    b64Str2Key,
    forge2Node,
    getRandomBytes,
} from '@constants/EncDecChacha';
import { saveTokenListAndChainForAll } from '@redux/Action/TokenAction';

const Home = ({ navigation }) => {
    const dispatch = useDispatch();
    const BackUpReducer = useSelector(state => state.BackUpReducer);
    const HomeReducer = useSelector(state => state.HomeReducer);
    const TokenReducer = useSelector(state => state.TokenReducer);
    const [showManage, setShowManage] = useState(false);
    const [showDisconnectWalletPopup, setShowDisconnectWalletPopup] =
        useState(false);
    const [clickedDappItem, setClickedDappItem] = useState(false);

    const [showDisconnectAllWalletPopup, setShowDisconnectAllWalletPopup] =
        useState(false);
    const [showbackConfirmationPopup, setbackConfirmationPopup] =
        useState(false);
    const [isEyeOn, setEyeOnOffStatus] = useState(true);

    const [EthSignin, setEthSignin] = useState(false);
    const [ConnectDappDialog, setConnectDappDialogStatus] = useState(false);
    const [Data, setData] = useState([]);
    const [dappMetaData, setDappMetaData] = useState([]);
    const [dappSeelctedWallet, setDappSelectedWalelt] = useState([]);
    const [switchFromDappData, setSwitchFromDappData] = useState(null);

    const [signData, setDappSignData] = useState(null);
    const [ethSendData, setEthSendData] = useState(null);
    const [walletToUseSend, setWalletToUseInSend] = useState(null);
    const [isShowSwitchDialog, setIsShowSwitchDialog] = useState(false);
    const [isShowSendTransaction, setIsShowSendTransaction] = useState(false);
    const eventEmitter = new NativeEventEmitter(Wallet);
    React.useEffect(() => {
        return navigation.addListener('tabPress', e => {
            logger('tab press', e);
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.menu_home, eventObject);
        });
    }, [navigation]);

   
    const renderItem = ({ item, index }) => {
        if (!showManage && index >= 3) {
            return;
        } else {
            return (
                <ConntedWalletView
                    Item={item}
                    showDetailsCallback={
                        showDetailsCallback
                    }></ConntedWalletView>
            );
        }
    };

    const connectToAppCallBack = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_connect_dapp, eventObject);
        setShowManage(false);
        navigation.navigate('QrScanner', {
            eventName: firebaseEvents.home_qr_scanner_import,
        });
    };
    const ScanQrCallBack = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_qr_scanner, eventObject);
        setShowManage(false);
        navigation.navigate('QrScanner', {
            eventName: firebaseEvents.home_qr_scanner_import,
        });
    };
    const showDetailsCallback = clickedItem => {
        setClickedDappItem(clickedItem);
        setShowDisconnectWalletPopup(true);
    };

    const diconnectAllCallback = () => {
        setShowDisconnectAllWalletPopup(true);
    };

    const DisconnectAllWalletClosePopup = () => {
        setShowManage(false);
    };

    const gdrive = new GDrive();
    gdrive.fetchTimeout = 3000;
    // this useeffect is called when there's no userId saved in local at a time of signin or signup

    useEffect(() => {
        retrieveKeyValueData(storageConst.USERID)
            .then(userId => {
                if (checkNullOrEmpty(userId)) {
                    retrieveKeyValueData(storageConst.ACCESS_TOKEN).then(
                        data => {
                            gdrive.accessToken = data;
                            api_set_fileId()
                                .then(fileData => {
                                    let fileId = fileData.data.fileId;
                                    if (fileId == "icloud") {
                                        saveKeyValueData(
                                            storageConst.USERID,
                                            fileData.uId,
                                        );
                                    } else {
                                        gdrive.files
                                        .getJson(fileId)
                                        .then(file => {
                                            saveKeyValueData(
                                                storageConst.USERID,
                                                file.uid,
                                            );
                                        })
                                        .catch(error => {
                                            logger(
                                                'error from get file from drive loader',
                                                error,
                                            );
                                        });
                                    }
                                    
                                })
                                .catch(error => {
                                    logger(error);
                                });
                        },
                    );
                }
            })
            .catch(error => {
                logger(error);
            });
    }, []);

    /**
     * this method is called when Dapp disconnected from Walletconnect  NativeModule
     */
    const disConnectListner = event => {
        if (event.connectedDapps != null) {
            logger('Disconnect ', JSON.parse(event.connectedDapps));
            saveKeyValueData('connectedWallets', event.connectedDapps);
            setData(JSON.parse(event.connectedDapps));
            setConnectDappDialogStatus(false);
            logger('status', showDisconnectAllWalletPopup);
            try {
                if (
                    event.connectedDapps &&
                    JSON.parse(event.connectedDapps).length == 0
                ) {
                    setShowDisconnectAllWalletPopup(false);
                    DisconnectAllWalletClosePopup();
                }
            } catch (error) {
                logger('ERROR :: ', error);
            }
        }
    };

    /**
     * this method is called when get Rquest from dapp for connection and User approve that connection
     *
     */
    const approveConnectListner = event => {
        logger('approveConnectListner ', event);
        setConnectDappDialogStatus(false);
        saveKeyValueData('connectedWallets', event.approved);
        setData(JSON.parse(event.approved));
    };

    /**
     * this method is called when Request for connection is received from any Dapp
     *
     */
    const createConnectListner = event => {
        logger('createConnectListner ', event.request); // “someValue”
        setDappMetaData(event.request);
        logger('start', new Date().toString());
        setTimeout(() => {
            setConnectDappDialogStatus(true);
        }, 100);
    };

    /**
     * this method is called when SignMessage event called from Dapp after succesfull conection with App->Dapp
     *
     */
    const ethSignListner = event => {
        logger('ethSignListner ', event); // “someValue”
        setDappSignData(event);
        setDappMetaData(event.peerdata);
        setEthSignin(true);
    };

    /**
     * this method is called when user sign message which requested from Dapp
     *
     */
    const ethSignSuccessListener = event => {
        logger('ethSignSuccessListener ', event); // “someValue”
        setTimeout(() => {
            setEthSignin(false);
        }, 1000);
    };
    /**
     * this method is called when user cancel sign message which requested from Dapp
     *
     */
    const ethSignRejectedListener = event => {
        logger('ethSignRejectedListener ', event); // “someValue”

        saveKeyValueData('connectedWallets', event.connectedDapps);
        setData(JSON.parse(event.connectedDapps));
        setTimeout(() => {
            setEthSignin(false);
        }, 1000);
    };
    /**
     * this method is called when chain is switched from Dapp
     *
     */
    const chainChange = event => {
        // logger('ChainChangeFromDapp 20020', event); // “someValue”
        // here show bottomsheet for information
        setSwitchFromDappData(event);
        setTimeout(() => {
            setIsShowSwitchDialog(true);
        }, 200);
    };
    /**
     * this method is called when user approve request for Switch chain
     *
     */
    const chainChangeSuccess = event => {
        logger('ChainChangeSuccess 100 ', event); // “someValue”
        saveKeyValueData('connectedWallets', event.connectedDapps);
        setData(null); // here set this data null because list not getting refreshed so used this
        setData(JSON.parse(event.connectedDapps));
        setIsShowSwitchDialog(false);
    };
    /**
     * this method is called when user switch chain from app
     *
     */
    const updateChainSuccess = event => {
        logger('updateChainSuccess 2000', event); // “someValue”
        logger('parsed data', JSON.parse(event.connectedDapps));
        saveKeyValueData('connectedWallets', event.connectedDapps);
        setData(null); // here set this data null because list not getting refreshed so used this
        setData(JSON.parse(event.connectedDapps));
    };

    const signETHTransaction = event => {
        logger('signETHTransaction', event); // “someValue”
    };
    /**
     * this method is called when from Dapp user want to swap or any trasnaction then it ask for user confirmation
     *
     */
    const sendETHTransaction = event => {
        logger('sendETHTransaction', 'iscalled');
        let data = JSON.parse(event.data);
        setDappMetaData(event.remotepeerdata);
        setEthSendData(data);

        setWalletToUseInSend(event);
        setTimeout(() => {
            setIsShowSendTransaction(true);
        }, 300);
    };
    useFocusEffect(
        React.useCallback(() => {
            console.log('event remove called');
            eventEmitter.removeAllListeners('Disconnect');
            eventEmitter.removeAllListeners('ApproveSession');
            eventEmitter.removeAllListeners('CreateSession');
            eventEmitter.removeAllListeners('ETHSign');
            eventEmitter.removeAllListeners('ETHSignSuccess');
            eventEmitter.removeAllListeners('ETHSignRejected');
            eventEmitter.removeAllListeners('ChainChangeFromDapp');
            eventEmitter.removeAllListeners('ChainChangeSuccess');
            eventEmitter.removeAllListeners('UpdateChainSuccess');
            eventEmitter.removeAllListeners('SignETHTransaction');
            eventEmitter.removeAllListeners('SendETHTransaction');

            console.log('EVENT SET method is called');
            eventEmitter.addListener('Disconnect', disConnectListner);
            eventEmitter.addListener('ApproveSession', approveConnectListner);
            eventEmitter.addListener('CreateSession', createConnectListner);
            eventEmitter.addListener('ETHSign', ethSignListner);
            eventEmitter.addListener('ETHSignSuccess', ethSignSuccessListener);
            eventEmitter.addListener(
                'ETHSignRejected',
                ethSignRejectedListener,
            );
            eventEmitter.addListener('ChainChangeFromDapp', chainChange);
            eventEmitter.addListener('ChainChangeSuccess', chainChangeSuccess);
            eventEmitter.addListener('UpdateChainSuccess', updateChainSuccess);
            eventEmitter.addListener('SignETHTransaction', signETHTransaction);
            eventEmitter.addListener('SendETHTransaction', sendETHTransaction);
            return () => {
                // console.log("event remove called",)
                // eventEmitter.removeAllListeners('Disconnect');
                // eventEmitter.removeAllListeners('ApproveSession');
                // eventEmitter.removeAllListeners('CreateSession');
                // eventEmitter.removeAllListeners('ETHSign');
                // eventEmitter.removeAllListeners('ETHSignSuccess');
                // eventEmitter.removeAllListeners('ETHSignRejected');
                // eventEmitter.removeAllListeners('ChainChangeFromDapp');
                // eventEmitter.removeAllListeners('ChainChangeSuccess');
                // eventEmitter.removeAllListeners('UpdateChainSuccess');
                // eventEmitter.removeAllListeners('SignETHTransaction');
                // eventEmitter.removeAllListeners('SendETHTransaction');
            };
        }, []),
    );

    useEffect(() => {
        getConnectedWalletList();

        if (checkNullOrEmpty(HomeReducer.totalAssets)) {
            onRefresh();
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            // onRefresh();
            checkBalanceIsHidden().then(result => {
                setEyeOnOffStatus(result);
            });
        }, []),
    );

    useEffect(() => {
        autoLogoutAfter1Week(navigation, dispatch);
    }, []);

    async function getConnectedWalletList() {
        const historyData = await retrieveKeyValueData('connectedWallets');
        const parsedData = historyData;
        //  logger('parsedData', parsedData);
        const isDataNull =
            parsedData == null || parsedData == undefined ? [] : parsedData;
        if (isDataNull == []) {
            setData([]);
        } else {
            setData(JSON.parse(isDataNull));
        }
    }

    function setSeelctedWallet(wallet) {
        setDappSelectedWalelt(wallet);
    }
    function onRefresh() {
        logger('refresh called');
        getTotalAssets(dispatch);
    }

    async function uploadWalletOnServer() {
        const result = await getAllNotBackedUpWallets();
        let rows = result.rows;
        logger('Rows ', rows.length);
        if (rows.length == 0) {
            setUploadStatus(dispatch, true);
        }

        if (rows.length > 0) {
            for (let i = 0; i < rows.length; i++) {
                let item = rows.item(i);
                const params = {
                    chainName: item.chain,
                    walletAddress: item.address,
                    secret: item.privateKey,
                    walletName: item.name,
                };
                logger('params :: ', params);
                try {
                    const serverKey = await retrieveKeyValueData(
                        storageConst.SERVER_PUBLICKEY,
                    );
                    const finaServerPubKey = b64Str2Key(serverKey, false);
                    const byteStr = getRandomBytes(32);
                    const chachaKey = forge2Node(byteStr);
                    const nonce = forge2Node(getRandomBytes(NONCE_LENGTH));
                    const cipher = new ChaCha20Poly1305(chachaKey);
                    const dataBytes = cipher.seal(
                        nonce,
                        stableUtf8.encode(JSON.stringify(params)),
                    );
                    const data = stable64.encode(concat(nonce, dataBytes));

                    const bytes = finaServerPubKey.encrypt(
                        byteStr,
                        'RSA-OAEP',
                        {
                            md: md.sha1.create(),
                            mgf1: {
                                md: md.sha1.create(),
                            },
                        },
                    );
                    const secret = util.encode64(bytes);
                    logger('Secret :: ', secret);
                    let sendData = {
                        secret,
                        data,
                    };
                    const walletsave = await apiAddWalletToServer(sendData);
                    logger('Wallet saved result ', walletsave);
                    const data1 = await getSymbolForChain(item.chain);
                    let symbol = data1.rows.item(0).symbol;
                    const noteplay = {
                        udid: 'Iphone',
                        wallet_no:
                            Math.floor(Math.random() * 1000).toString() +
                            new Date().getTime() +
                            Math.floor(Math.random() * 1000).toString(),
                        wallet_type: '4',
                        address_list: [
                            {
                                address: item.address,
                                symbol: symbol,
                                symbol_type: item.chain,
                                coin_type: 1,
                            },
                        ],
                    };
                    const addnote = await apiAddSymbolAddress(noteplay);
                    logger('Addnotes response : ', addnote);
                    updateBackupStatus(item.id);
                } catch (error) {
                    logger('error :: ', error);
                }
            }
            setUploadStatus(dispatch, true);
        }
    }

    async function selectedChainForChange(data) {
        Wallet.updateSession(JSON.stringify(data));
    }
    function closeSheet() {
        setIsShowSwitchDialog(false);
    }
    function closeDialog() {
        setEthSignin(false);
        setConnectDappDialogStatus(false);
    }

    const closeSendTransaction = () => {
        setIsShowSendTransaction(false);
    };
    const depositFunction = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_deposit, eventObject);
        navigation.navigate('WalletQrcode', { isFromHome: true });
    };
    const swapFunction = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_swap, eventObject);
        navigation.navigate('Swap', {
            isShowBack: false,
        });
    };
    const sendFunction = () => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_send, eventObject);
        navigation.navigate('Send', { isFromHome: true });
    };
    const buyFunction = () => {
        navigation.navigate('AlchemyPay');
    };

    const itemSeparatorComponent = () => {
        return <View style={styles.lineView} />;
    };
    const listHeaderComponent = () => {
        if (Data && Data.length == 0) {
            return;
        }
        return (
            <View style={{ marginBottom: theme.calculateHeight(0) }}>
                {!showManage && Data && Data.length > 2 && (
                    <TouchableOpacity
                        onPress={() => {
                            setShowManage(true);
                        }}>
                        <View style={styles.titleView}>
                            <Text style={styles.txtTitle}>{Viewall}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {showManage ? (
                    <DisconnctFooter
                        diconnectAllCallback={diconnectAllCallback}
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.connectToDapp}
                        onPress={connectToAppCallBack}>
                        <Image
                            source={require('@assets/scan.png')}
                            style={styles.scanIconStyle}
                            resizeMode="contain"></Image>
                        <Text style={styles.txtDeposite}>{ConnecttodApp}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const EmptyComponent = () => {
        return <WalletFooter connectToAppCallBack={connectToAppCallBack} />;
    };
    return (
        <>
            <SafeAreaView style={styles.safeAreaStyle} />
            <SafeAreaView
                style={styles.safeareaSecondStyle}
                onLayout={() => {
                    logger('onlayout change');
                    if (Platform.OS == 'ios') {
                        Wallet.initIOS();
                    } else {
                        Wallet.init();
                    }
                    uploadWalletOnServer();
                }}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.black}
                    barStyle={'light-content'}
                />

                {EthSignin && (
                    <CustomModal
                        isModalVisible={EthSignin}
                        closeModal={closeDialog}>
                        <EthSignInBottomSheet
                            signData={signData}
                            closeDialog={closeDialog}
                            metaData={dappMetaData}
                            previousWallet={dappSeelctedWallet}
                        />
                    </CustomModal>
                )}
                {ConnectDappDialog && (
                    <CustomModal
                        isModalVisible={ConnectDappDialog}
                        closeModal={closeDialog}>
                        <WalletConnectBottomSheet
                            ConnectDappDialog={ConnectDappDialog}
                            closeDialog={closeDialog}
                            metaData={dappMetaData}
                            selectWallet={setSeelctedWallet}
                        />
                    </CustomModal>
                )}

                {isShowSwitchDialog && (
                    <CustomModal
                        isModalVisible={isShowSwitchDialog}
                        closeModal={closeSheet}>
                        <SwitchChainFromDapp
                            closeSheet={closeSheet}
                            switchFromDappData={switchFromDappData}
                        />
                    </CustomModal>
                )}

                {isShowSendTransaction && (
                    <CustomModal
                        isModalVisible={isShowSendTransaction}
                        closeModal={closeSendTransaction}>
                        <ETHSendTransactionBottomSheet
                            signData={ethSendData}
                            metaData={dappMetaData}
                            closeSendTransaction={closeSendTransaction}
                            previousWallet={walletToUseSend}
                        />
                    </CustomModal>
                )}

                {showDisconnectWalletPopup && (
                    <DisconnectWallet
                        setShowDisconnectWalletPopup={
                            setShowDisconnectWalletPopup
                        }
                        setData={setData}
                        clickedData={clickedDappItem}
                        selectedChainForChange={selectedChainForChange}
                    />
                )}
                {showDisconnectAllWalletPopup && (
                    <DisconnectAllWallet
                        setShowDisconnectAllWalletPopup={
                            setShowDisconnectAllWalletPopup
                        }
                        DisconnectAllWalletClosePopup={
                            DisconnectAllWalletClosePopup
                        }
                    />
                )}
                {showbackConfirmationPopup && (
                    <BackConfirmationPopup
                        setbackConfirmationPopup={setbackConfirmationPopup}
                    />
                )}

                <CustomHeader
                    navigation={navigation}
                    connectToAppCallBack={ScanQrCallBack}
                />
                <ScrollView
                    style={{ backgroundColor: colors.mainColor }}
                    contentContainerStyle={
                        styles.scrollviewContentContainerStyle
                    }
                    bounces={false}
                    showsVerticalScrollIndicator={false}>
                    <View>
                        {!showManage && (
                            <View style={styles.header}>
                                <View style={styles.totalTitleView}>
                                    <Text style={styles.txtTotalTitle}>
                                        {TotalBalance}{' '}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEyeOnOffStatus(!isEyeOn);
                                            saveKeyValueData(
                                                storageConst.EYE_ON_OFF_STATUS,
                                                isEyeOn ? '1' : '0',
                                            );
                                            if (isEyeOn) {
                                                const eventObject = {
                                                    timeOfClick:
                                                        new Date().toLocaleString(),
                                                };
                                                firebaseAnalytics(
                                                    firebaseEvents.home_hide_balance,
                                                    eventObject,
                                                );
                                            }
                                        }}
                                        style={
                                            styles.eyeOnOffTouchableViewStyle
                                        }>
                                        <Image
                                            source={
                                                isEyeOn
                                                    ? require('@assets/eye_on.png')
                                                    : require('@assets/eye_off.png')
                                            }
                                            style={styles.arrowEye}
                                            resizeMode="contain"></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.balanceView}>
                                    <TouchableOpacity
                                        onPress={navigateToWallet}>
                                        {HomeReducer.loading ? (
                                            <ActivityIndicator
                                                size={'small'}
                                                color={colors.white}
                                            />
                                        ) : (
                                            <Text style={styles.txtTotal}>
                                                {isEyeOn
                                                    ? HomeReducer.totalAssets
                                                    : '*****'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onRefresh();
                                        }}
                                        style={
                                            styles.refreshIconTouchableContonerStyle
                                        }>
                                        <Image
                                            source={require('@assets/refreshList.png')}
                                            style={styles.arrowRight}
                                            resizeMode="contain"></Image>
                                    </TouchableOpacity>
                                </View>
                                {HomeReducer.totalAssets?.length > 0 &&
                                    HomeReducer.totalAssetsToCompare == 0 && (
                                        <Text style={styles.txtTotalTitle}>
                                            {Makeyourfirstdeposit}
                                        </Text>
                                    )}

                                <RowButtonsGroup
                                    depositFunction={depositFunction}
                                    swapFunction={swapFunction}
                                    sendFunction={sendFunction}
                                    buyFunction={buyFunction}
                                    styleOfItem={styles.buttonsMarginHorizStyle}
                                    isFromInChain = {false}
                                />
                            </View>
                        )}
                    </View>
                    {/* <View style={{flex:1,backgroundColor:'red'}} > */}
                    <View style={styles.contentView}>
                        {!BackUpReducer.isUploaded && (
                            <TouchableOpacity
                                style={styles.backupView}
                                onPress={navigateToBackupWallet}>
                                <Image
                                    source={require('@assets/shield.png')}
                                    resizeMode="contain"
                                    style={styles.cloudIcon}
                                />
                                <View
                                    style={[
                                        styles.backupTextView,
                                        styles.walletBackupTextExtraStyle,
                                    ]}>
                                    <Text style={styles.txtBackup}>
                                        {Yourwalletisbeingbacked_up}
                                    </Text>
                                    <Text style={styles.txtSubBackup}>
                                        {Makesureyoureconnectedinternet}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {BackUpReducer.isUploaded &&
                            !BackUpReducer.isUserConfirmedBackupStatus &&
                            !showManage && (
                                <TouchableOpacity
                                    style={styles.successView}
                                    onPress={navigateToBackupWallet}>
                                    <Image
                                        source={require('@assets/Successful.png')}
                                        resizeMode="contain"
                                        style={styles.cloudIcon}></Image>
                                    <View style={styles.backupTextView}>
                                        <Text style={styles.txtBackup}>
                                            {YOURWALLERISSUCCESSFULLYBACKEDUP}
                                        </Text>
                                        <View style={styles.totalTitleView}>
                                            <Text style={styles.txtSubBackup}>
                                                {KEEPYOURKEYSSAFE}
                                            </Text>
                                            <Image
                                                source={require('@assets/forwardGray.png')}
                                                style={styles.backupIcon}
                                                resizeMode="contain"></Image>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}

                        <View style={styles.currentConnectedView}>
                            <View style={styles.showManageContainerStyle}>
                                {showManage && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowManage(false);
                                        }}>
                                        <Image
                                            source={require('@assets/back.png')}
                                            style={styles.backIconStyle}
                                            resizeMode="contain"></Image>
                                    </TouchableOpacity>
                                )}

                                <Text style={styles.txtConnected}>
                                    {CurrentlyConnected}
                                </Text>
                            </View>

                            {!showManage && (
                                <TouchableOpacity onPress={onManageClickEvent}>
                                    <View style={styles.manageView}>
                                        <Text style={styles.txtManage}>
                                            {Manage}
                                        </Text>
                                        <Image
                                            source={require('@assets/arrowRight.png')}
                                            style={styles.arrowManage}
                                            resizeMode="contain"></Image>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View
                        //   style={styles.flatList}
                        >
                            <FlatList
                                data={Data}
                                inverted={false}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index}
                                contentContainerStyle={
                                    styles.flatlistPaddingBottomStyle
                                }
                                style={styles.flatList(
                                    BackUpReducer.isUserConfirmedBackupStatus,
                                )}
                                ItemSeparatorComponent={itemSeparatorComponent}
                                ListFooterComponent={listHeaderComponent}
                                ListEmptyComponent={EmptyComponent}
                                bounces={false}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );

    function navigateToWallet() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_balance, eventObject);
        navigation.navigate('Wallet');
    }
    function navigateToBackupWallet() {
        navigation.navigate('BackUpStatus');
    }
    function onManageClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_manage, eventObject);
        setShowManage(true);
    }
};

const styles = StyleSheet.create({
    arrowEye: {
        height: 15,
        tintColor: colors.gray1_textcolor,
        width: 15,
    },
    arrowManage: {
        height: 10,
        marginLeft: 5,
        tintColor: colors.gray_textcolor,
        width: 10,
    },
    arrowRight: {
        height: theme.calculateHeight(18),
        tintColor: colors.white,
        width: theme.calculateHeight(18),
    },
    backIconStyle: {
        height: 20,
        marginRight: 10,
        width: 20,
    },
    backupIcon: {
        height: 10,
        marginLeft: 5,
        width: 10,
    },
    backupTextView: {
        flex: 1,
    },
    backupView: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 16,
        flexDirection: 'row',
        height: 69,
        margin: 20,
        marginBottom: 0,
    },
    balanceView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 10,
    },
    buttonsMarginHorizStyle: {
        marginHorizontal: 5,
    },
    cloudIcon: {
        height: 50,
        marginHorizontal: 10,
        width: 50,
    },
    connectToDapp: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 12,
        elevation: 8,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        marginBottom: 16,
        marginHorizontal: 20,
        marginTop: 10,
        shadowColor: colors.purple_button_color,
    },
    contentView: {
        backgroundColor: colors.gray_background,
        borderTopLeftRadius: 19,
        borderTopRightRadius: 17,
        flex: 1,
    },
    currentConnectedView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20,
    },
    eyeOnOffTouchableViewStyle: {
        alignItems: 'center',
        height: 20,
        justifyContent: 'center',
        width: 30,
    },
    flatList: status => ({
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: status
            ? theme.calculateHeight(50)
            : theme.calculateHeight(130),
        marginHorizontal: 20,
        marginTop: 20,
        paddingBottom: 10,
    }),
    flatlistPaddingBottomStyle: {
        paddingBottom: 5,
    },
    header: {
        backgroundColor: colors.darkblue,
        borderRadius: 16,
        margin: 20,
        padding: 20,
    },

    lineView: {
        backgroundColor: colors.lightBlack,
        height: 1,
        marginHorizontal: 20,
    },

    manageView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },

    refreshIconTouchableContonerStyle: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50_opacity10,
        borderRadius: 100,
        justifyContent: 'center',
        padding: theme.calculateHeight(10),
    },

    safeAreaStyle: {
        backgroundColor: colors.mainColor,
        flex: 0,
    },
    safeareaSecondStyle: {
        flex: 1,
        flexDirection: 'column',
    },

    scanIconStyle: {
        height: 20,
        width: 20,
    },

    scrollviewContentContainerStyle: {
        flexDirection: 'column',
        flex: 1,
    },

    showManageContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },

    successView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        flexDirection: 'row',
        height: 69,
        margin: 20,
        marginBottom: 0,
        paddingLeft: 5,
    },

    titleView: {
        alignItems: 'center',
    },

    totalTitleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },

    txtBackup: {
        color: colors.purple_dark,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    txtConnected: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
    },

    txtDeposite: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        marginLeft: 5,
    },

    txtManage: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    txtSubBackup: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },

    txtTitle: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        marginTop: 10,
    },

    txtTotal: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f24,
        lineHeight: theme.sizes.lh33,
    },

    txtTotalTitle: {
        color: colors.gray1_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
    },
    walletBackupTextExtraStyle: {
        marginLeft: -5,
    },
});

export default Home;
