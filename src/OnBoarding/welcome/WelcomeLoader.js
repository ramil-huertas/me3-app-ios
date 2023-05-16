import {
    View,
    StyleSheet,
    Image,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateHeight, colors, fonts, sizes } from '@constants/theme';
import string from '@constants/ConstantStrings';
import MessageComponent from './MessageComponent';
import { useDispatch, useSelector } from 'react-redux';
import { createSeed, recoverAddressETH } from '@chains/ethereum/wallet';
import { createLTCSeed, recoverAddressLitcoin } from '@chains/litcoin/wallet';
import { createBTCSeed, recoverAddressBTC } from '@chains/btc/wallet';
import { createDOTSeed, recoverAddressDOT } from '@chains/dot/wallet';
import { createFILSeed, recoverAddressFilcoin } from '@chains/filcoin/wallet';
import { createBCHSeed, recoverAddressBCH } from '@chains/bch/wallet';
import {
    retrieveKeyValueData,
    saveKeyValueData,
    removeValue,
} from '@constants/Storage';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import storageConst from '@constants/ConstStorage';
import {
    insertWallet,
    getAllChains,
    insertMapping,
    checkAddressExist,
} from '@database/sql';
import { Encrypt, Decrypt } from '@constants/EncryptDecrypt';
import { generateMnemonic, getSeedFromMnemonic } from '@chains/WalletUtils';
import {
    WalletCreateStatusFinish,
    WalletRetrieveStatusFinish,
} from '@redux/Action/WalletStatusAction';
import { getPreviousWallets } from '@api/AxiosInstance';
import { logger } from '@constants/Log';
import { checkNullOrEmpty } from '@constants/commonFuncation';
import { showMessageToast } from '@redux/Action/ToastAlert';

const WelcomeLoader = ({ navigation }) => {
    const [refresh, setRefresh] = useState(false);
    const [refresh1, setRefresh1] = useState(false);
    const [refresh2, setRefresh2] = useState(false);

    const [showSuggestionBox, setShowSuggestionBox] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [data, setData] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [rotateAnimation, setRotateAnimation] = useState(
        new Animated.Value(0),
    );
    const dispatch = useDispatch();
    let suggestionBoxOpacity = new Animated.Value(0);
    let suggestionTextOpacity = new Animated.Value(0);
    let keepKeysSafe = new Animated.Value(1);
    let secretKeysStored = new Animated.Value(0);
    let FlatlistPosition = new Animated.Value(0);
    const WalletStatus = useSelector(state => state.WalletStatusReducers);

    const checkWalletStatusMessage = () => {
        if (WalletStatus.retrieveStatus)
            if (WalletStatus.WalletProcessType == 'backup')
                return string.YOUR_WALLET_HAS_BEEN_GENERATED
            else return string.YOUR_WALLET_HAS_BEEN_RETRIEVED
        else
            if (WalletStatus.WalletProcessType == 'backup')
                return string.ALMOST_THERE_GENERATING_WALLET
            else return string.ALMOST_THERE_RETRIEVING_WALLET;
    }
    function onStart() {
        const obj = {
            id: 1,
            type: 0,
            message: WalletStatus.passcodeStatus
                ? string.PASSCODE_IS_SET
                : string.YOU_CAN_ENABLE_PASSCODE_LATER,
            imageSource: require('@assets/lock_black.png'),
            tintColor: WalletStatus.passcodeStatus
                ? colors.white
                : colors.mainColor,
            passcodeStatus: WalletStatus.passcodeStatus,
        };
        data.push(obj);
        setRefresh(!refresh);
        setTimeout(() => {
            const obj1 = {
                id: 2,
                type: 1,
                message: checkWalletStatusMessage(),
                imageSource: null,
                showIndicator:
                    WalletStatus.loading || !WalletStatus.retrieveStatus
                        ? true
                        : false,
            };
            data.push(obj1);
            setRefresh1(!refresh1);
        }, 500);
        setTimeout(() => {
            logger(
                'DATA ',
                WalletStatus.retrieveStatus + ' -- ' + WalletStatus.loading,
            );
            setShowSuggestionBox(true);
            const obj2 = {
                id: 3,
                type: 2,
                message: string.HANG_TIGHT,
                imageSource: null,
            };
            data.push(obj2);
            setRefresh2(!refresh2);
            // }
        }, 5000);
    }

    useEffect(() => {
        if (
            WalletStatus.WalletProcessType == string.RECOVER &&
            WalletStatus.retrieveStatus
        ) {
            navigation.replace('OnBoardComplete');
        } else if (
            WalletStatus.WalletProcessType == string.BACK_UP &&
            WalletStatus.createStatus
        ) {
            navigation.replace('OnBoardComplete');
        }
    }, [WalletStatus.createStatus, WalletStatus.retrieveStatus]);

    const handleAnimation = () => {
        Animated.loop(
            Animated.timing(rotateAnimation, {
                toValue: 1,
                useNativeDriver: true,
                duration: 5000,
                easing: Easing.linear(),
                delay: 500,
            }),
        ).start(() => {
            rotateAnimation.setValue(0);
        });
    };

    const interpolateRotating = rotateAnimation.interpolate({
        inputRange: [0, 0.2, 0.6, 1],
        outputRange: ['0deg', '22.19deg', '-32.68deg', '0deg'],
    });

    const animatedStyle = {
        transform: [
            {
                rotate: interpolateRotating,
            },
        ],
    };
    const renderItem = ({ item, index }) => {
        return <MessageComponent Data={data} item={item} index={index} />;
    };
    useEffect(() => {
        onStart();
        let type = WalletStatus.WalletProcessType;
        let fileID = WalletStatus.WalletProcessId;
        // setTimeout(() => {
        getFileFromDrive(fileID, type);
        // }, 1000);
    }, []);

    const gdrive = new GDrive();
    gdrive.fetchTimeout = 3000;

    async function recoverWallet() {
        logger('Recover method called');
        //  WalletRetrieveStatusStart(dispatch);  uncommenting this line create issue with animation(all bubble shows at bottom)
        let allchains = await getAllChains();
        let allchainList = [];
        for (let i = 0; i < allchains.rows.length; i++) {
            allchainList[i] = allchains.rows.item(i);
        }
        saveKeyValueData('allChains', JSON.stringify(allchainList));

        let result = await getPreviousWallets();
        if (result.length == 0) {
            showMessageToast(dispatch, 'No data to retrieve');
            WalletRetrieveStatusFinish(dispatch, false);
            return;
        }

        logger('Decrypt Start time ', new Date().toString());
        if (result && result.length) {
            for (const resultData of result) {
                let privateKey = await Decrypt(resultData.secret);
                await importMulti(
                    allchainList,
                    resultData.walletName,
                    [resultData.chainName],
                    privateKey,
                );
            }
        }
        logger('Decrypt end time ', new Date().toString());
        WalletRetrieveStatusFinish(dispatch, true);
    }

    async function importMulti(allChains, name, chain, privateKey = '') {
        try {
            for (const chainData of chain) {
                let item = chainData;
                let chainDetail = allChains.find(chainItem => {
                    return chainItem.chain.toLowerCase() == item.toLowerCase();
                });
                switch (chainDetail.series) {
                    case 'btc':
                        await importBTC(item, name, privateKey);
                        break;
                    case 'eth':
                        await importETH(item, name, privateKey);
                        break;
                    case 'ltc':
                        await importLTC(item, name, privateKey);
                        break;
                    case 'dot':
                        await importDOT(item, name, privateKey);
                        break;
                    case 'fil':
                        await importFIL(item, name, privateKey);
                        break;
                    case 'bch':
                        await importBCH(item, name, privateKey);
                        break;
                }
            }

            return privateKey;
        } catch (err) {
            logger(`Error for ${name} from importmulti :: ${err}`);
            return false;
        }
    }

    async function importETH(chain, name, privateKey) {
        let previousWallet = await retrieveKeyValueData(
            storageConst.PREVIOUS_RECOVER_WALLET,
        );
        let pwd = '';
        if (checkNullOrEmpty(previousWallet)) {
            recoverAddressETH(privateKey)
                .then(wallet => {
                    if (!wallet) return;

                    let tempSave = {
                        chain: chain,
                        name: name,
                        address: '',
                        password: pwd,
                        seed: '',
                        passwordTip: '',
                        privateKey: wallet.privateKey,
                        number: 0,
                        timestamp: '',
                        type: 'KEY',
                        mainId: 0,
                        is_backup: 1,
                    };
                    tempSave.address = wallet.address;
                    tempSave.timestamp = new Date().getTime();
                    checkAddressExist(wallet.address, chain).then(
                        resultdata => {
                            if (resultdata.rows.length > 0) {
                                logger(
                                    'Current wallet already exists => chain = ' +
                                    chain,
                                );
                            } else {
                                insertWallet(tempSave);
                                saveKeyValueData(
                                    storageConst.PREVIOUS_RECOVER_WALLET,
                                    JSON.stringify(tempSave),
                                );
                                logger(chain, 'ETH CLC imported Success');
                            }
                        },
                    );
                })
                .catch(error => {
                    logger('ETH error ', error);
                });
        } else {
            const walletData = JSON.parse(previousWallet);
            let tempSave = {
                chain: chain,
                name: name,
                address: '',
                password: pwd,
                seed: '',
                passwordTip: '',
                privateKey: walletData.privateKey,
                number: 0,
                timestamp: '',
                type: 'KEY',
                mainId: 0,
                is_backup: 1,
            };
            tempSave.address = walletData.address;
            tempSave.timestamp = new Date().getTime();
            checkAddressExist(walletData.address, chain).then(resultdata => {
                if (resultdata.rows.length > 0) {
                    logger('Current wallet already exists => chain = ' + chain);
                } else {
                    insertWallet(tempSave);
                    saveKeyValueData(
                        storageConst.PREVIOUS_RECOVER_WALLET,
                        JSON.stringify(tempSave),
                    );
                    logger(chain, ' imported Success');
                }
            });
        }
    }
    async function importBTC(chain, name, privateKey) {
        let pwd = '';
        recoverAddressBTC(privateKey, chain != 'BTC')
            .then(wallet => {
                if (!wallet) return;
                let tempSave = {
                    chain: chain,
                    name: name,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: '',
                    timestamp: '',
                    type: 'KET',
                    mainId: '',
                    is_backup: 1,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };
                tempSave.address = wallet.address;
                tempSave.privateKey = wallet.privateKey;
                tempSave.number = 0;
                tempSave.timestamp = new Date().getTime();
                tempSave.mainId = 0;
                checkAddressExist(wallet.address, chain).then(resultdata => {
                    if (resultdata.rows.length > 0) {
                        logger(
                            'Current wallet already exists => chain = ' + chain,
                        );
                    } else {
                        insertWallet(tempSave).then(result => {
                            mapping.type = wallet.type;
                            mapping.P2PKH = wallet.address_P2PKH;
                            mapping.P2WPKH = wallet.address_P2WPKH;
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                            logger(chain, ' imported Success');
                        });
                    }
                });
            })
            .catch(error => {
                logger('BTC error ', error);
            });
    }
    async function importLTC(chain, name, privateKey) {
        let pwd = '';
        recoverAddressLitcoin(privateKey, chain != 'LTC')
            .then(wallet => {
                if (!wallet) return;
                let tempSave = {
                    chain: chain,
                    name: name,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: '',
                    timestamp: '',
                    type: 'KET',
                    mainId: '',
                    is_backup: 1,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };
                tempSave.address = wallet.address;
                tempSave.privateKey = wallet.privateKey;
                tempSave.number = 0;
                tempSave.timestamp = new Date().getTime();
                tempSave.mainId = 0;
                checkAddressExist(wallet.address, chain).then(resultdata => {
                    if (resultdata.rows.length > 0) {
                        logger(
                            'Current wallet already exists => chain = ' + chain,
                        );
                    } else {
                        insertWallet(tempSave).then(result => {
                            mapping.type = wallet.type;
                            mapping.P2PKH = wallet.address_P2PKH;
                            mapping.P2WPKH = wallet.address_P2WPKH;
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                        });
                        logger('LTC imported Success');
                    }
                });
            })
            .catch(error => logger('LTC error', error));
    }
    async function importDOT(chain, name, privatekey) {
        let pwd = '';
        recoverAddressDOT(privatekey)
            .then(wallet => {
                if (!wallet) return;
                let tempSave = {
                    chain: chain,
                    name: name,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: wallet.privateKey,
                    number: 0,
                    timestamp: '',
                    type: 'KEY',
                    mainId: 0,
                    is_backup: 1,
                };
                tempSave.address = wallet.address;
                tempSave.timestamp = new Date().getTime();
                checkAddressExist(wallet.address, chain).then(resultdata => {
                    if (resultdata.rows.length > 0) {
                        logger(
                            'Current wallet already exists => chain = ' + chain,
                        );
                    } else {
                        insertWallet(tempSave);
                        logger('DOT imported Success');
                    }
                });
            })
            .catch(error => logger('dot error', error));
    }
    async function importFIL(chain, name, privatekey) {
        let pwd = '';
        recoverAddressFilcoin(
            privatekey,
            chain == 'FILCOIN' ? 'mainnet' : 'testnet',
        )
            .then(wallet => {
                if (!wallet) return;
                let tempSave = {
                    chain: chain,
                    name: name,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: wallet.privateKey,
                    number: 0,
                    timestamp: '',
                    type: 'KEY',
                    mainId: 0,
                    is_backup: 1,
                };
                tempSave.address = wallet.address;
                tempSave.timestamp = new Date().getTime();
                checkAddressExist(wallet.address, chain).then(resultdata => {
                    if (resultdata.rows.length > 0) {
                        logger(
                            'Current wallet already exists => chain = ' + chain,
                        );
                    } else {
                        insertWallet(tempSave);
                        logger('FIL imported Success');
                    }
                });
            })
            .catch(error => {
                logger('fil error', error);
            });
    }
    async function importBCH(chain, name, privateKey) {
        let pwd = '';
        logger('chain ', chain);
        recoverAddressBCH(privateKey, chain != 'BCH')
            .then(wallet => {
                if (!wallet) return;
                let tempSave = {
                    chain: chain,
                    name: name,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: '',
                    timestamp: '',
                    type: 'KET',
                    mainId: '',
                    is_backup: 1,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };
                tempSave.address = wallet.address;
                tempSave.privateKey = wallet.privateKey;
                tempSave.number = 0;
                tempSave.timestamp = new Date().getTime();
                tempSave.mainId = 0;
                checkAddressExist(wallet.address, chain).then(resultdata => {
                    if (resultdata.rows.length > 0) {
                        logger(
                            'Current wallet already exists => chain = ' + chain,
                        );
                    } else {
                        insertWallet(tempSave).then(result => {
                            mapping.type = wallet.type;
                            mapping.P2PKH = wallet.address_P2PKH;
                            mapping.P2WPKH = wallet.address_P2WPKH;
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                        });
                        logger('BCH imported Success');
                    }
                });
            })
            .catch(error => {
                logger('bch error ', error);
            });
    }

    async function createChains(chainlist, allchains) {
        logger('WALLET CREATION START TIM  , ', new Date().toString());
        const mnemonic = await generateMnemonic();
        const seed = await getSeedFromMnemonic(mnemonic);
        logger('createchain called');
        for (const item of chainlist) {
            let chainDetail = allchains.find(chainItem => {
                return chainItem.chain == item;
            });
            switch (chainDetail.series) {
                case 'btc':
                    await createBTC(mnemonic, chainDetail.chain, seed);
                    break;
                case 'eth':
                    await createETH(mnemonic, chainDetail.chain, seed);
                    break;
                case 'ltc':
                    await createLTC(mnemonic, chainDetail.chain, seed);
                    break;
                case 'dot':
                    await createDOT(mnemonic, chainDetail.chain, seed);
                    break;
                case 'fil':
                    await createFIL(mnemonic, chainDetail.chain, seed);
                    break;
                case 'bch':
                    await createBCH(mnemonic, chainDetail.chain, seed);
                    break;
            }
        }

        removeValue(storageConst.PREVIOUS_WALLET);
        logger('******WALLET CREATION END TIME  , ', new Date().toString());
        WalletCreateStatusFinish(dispatch, true);
    }
    async function createETH(mnemonic, chain, seed) {
        let pwd = '';
        ///  let password = await Encrypt(pwd)
        let previousWallet = await retrieveKeyValueData(
            storageConst.PREVIOUS_WALLET,
        );
        if (checkNullOrEmpty(previousWallet)) {
            await createSeed(1, 0, mnemonic, seed)
                .then(wallet => {
                    let tempSave = {
                        chain: chain,
                        name: `Wallet_${chain}`,
                        address: '',
                        password: pwd,
                        seed: '',
                        passwordTip: '',
                        privateKey: '',
                        number: 0,
                        timestamp: '',
                        type: 'KEY',
                        mainId: 0,
                        is_backup: 0,
                    };
                    tempSave.address = wallet.list[0].address;
                    Encrypt(wallet.seed).then(encSeed => {
                        tempSave.seed = encSeed;
                        Encrypt(wallet.list[0].privateKey).then(
                            encPrivateKey => {
                                tempSave.privateKey = encPrivateKey;
                                tempSave.timestamp = new Date().getTime();
                                insertWallet(tempSave);
                                saveKeyValueData(
                                    storageConst.PREVIOUS_WALLET,
                                    JSON.stringify(tempSave),
                                );
                                logger(chain, ' created Success');
                            },
                        );
                    });
                })
                .catch(error => {
                    logger('wallet error ', error);
                });
        } else {
            const walletData = JSON.parse(previousWallet);
            let tempSave = {
                chain: chain,
                name: `Wallet_${chain}`,
                address: '',
                password: pwd,
                seed: '',
                passwordTip: '',
                privateKey: '',
                number: 0,
                timestamp: '',
                type: 'KEY',
                mainId: 0,
                is_backup: 0,
            };
            tempSave.address = walletData.address;
            tempSave.seed = walletData.seed;
            tempSave.privateKey = walletData.privateKey;
            tempSave.timestamp = new Date().getTime();
            insertWallet(tempSave);
            saveKeyValueData(
                storageConst.PREVIOUS_WALLET,
                JSON.stringify(tempSave),
            );
            logger(chain, ' created Success');
        }
    }
    async function createBTC(mnemonic, chain, seed) {
        let pwd = '';

        createBTCSeed(1, 0, mnemonic, seed, chain == 'BTCTest')
            .then(wallet => {
                let tempSave = {
                    chain: chain,
                    name: `Wallet_${chain}`,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: 0,
                    timestamp: '',
                    type: 'KEY',
                    mainId: 0,
                    is_backup: 0,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };
                tempSave.address = wallet.list[0].address;

                mapping.type = wallet.list[0].type;
                mapping.P2PKH = wallet.list[0].address_P2PKH;
                mapping.P2WPKH = wallet.list[0].address_P2WPKH;

                Encrypt(wallet.seed).then(encSeed => {
                    tempSave.seed = encSeed;
                    Encrypt(wallet.list[0].privateKey).then(encPrivateKey => {
                        tempSave.privateKey = encPrivateKey;
                        tempSave.timestamp = new Date().getTime();
                        insertWallet(tempSave).then(result => {
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                            logger(chain, ' created Success');
                        });
                    });
                });
            })
            .catch(error => logger(error));
    }
    async function createLTC(mnemonic, chain, seed) {
        let pwd = '';
        createLTCSeed(1, 0, mnemonic, seed, chain != 'LTC')
            .then(wallet => {
                let tempSave = {
                    chain: chain,
                    name: `Wallet_${chain}`,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: 0,
                    timestamp: '',
                    type: 'KEY',
                    mainId: 0,
                    is_backup: 0,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };
                tempSave.address = wallet.list[0].address;

                mapping.type = wallet.list[0].type;
                mapping.P2PKH = wallet.list[0].address_P2PKH;
                mapping.P2WPKH = wallet.list[0].address_P2WPKH;

                Encrypt(wallet.seed).then(encSeed => {
                    tempSave.seed = encSeed;
                    Encrypt(wallet.list[0].privateKey).then(encPrivateKey => {
                        tempSave.privateKey = encPrivateKey;
                        tempSave.timestamp = new Date().getTime();
                        insertWallet(tempSave).then(result => {
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                            logger(chain, ' created Success');
                        });
                    });
                });
            })
            .catch(error => logger(error));
    }
    async function createDOT(mnemonic, chain, seed) {
        let pwd = '';
        logger(seed)
        createDOTSeed(mnemonic)
            .then(wallet => {
                let tempSave = {
                    chain: chain,
                    name: `Wallet_${chain}`,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: 0,
                    timestamp: '',
                    type: 'HD',
                    mainId: 0,
                    is_backup: 0,
                };
                tempSave.address = wallet.list[0].address;
                Encrypt(wallet.seed).then(encSeed => {
                    tempSave.seed = encSeed;
                    Encrypt(wallet.list[0].privateKey).then(encPrivateKey => {
                        tempSave.privateKey = encPrivateKey;
                        tempSave.timestamp = new Date().getTime();
                        insertWallet(tempSave);
                        logger(chain, ' created Success');
                    });
                });
            })
            .catch(error => logger(error));
    }
    async function createFIL(mnemonic, chain, seed) {
        logger('fil');
        let pwd = '';
        logger(seed)
        createFILSeed(
            1,
            0,
            mnemonic,
            chain == 'FILECOIN' ? 'mainnet' : 'testnet',
        )
            .then(wallet => {
                let tempSave = {
                    chain: chain,
                    name: `Wallet_${chain}`,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: 0,
                    timestamp: '',
                    type: 'HD',
                    mainId: 0,
                    is_backup: 0,
                };
                tempSave.address = wallet.list[0].address;
                Encrypt(wallet.seed).then(encSeed => {
                    tempSave.seed = encSeed;
                    Encrypt(wallet.list[0].privateKey).then(encPrivateKey => {
                        tempSave.privateKey = encPrivateKey;
                        tempSave.timestamp = new Date().getTime();
                        insertWallet(tempSave);
                        logger(chain, ' created Success');
                    });
                });
            })
            .catch(error => {
                logger(error);
            });
    }
    async function createBCH(mnemonic, chain, seed) {
        let pwd = '';
        createBCHSeed(1, 0, mnemonic, seed, chain == 'BCHTest')
            .then(wallet => {
                let tempSave = {
                    chain: chain,
                    name: `Wallet_${chain}`,
                    address: '',
                    password: pwd,
                    seed: '',
                    passwordTip: '',
                    privateKey: '',
                    number: 0,
                    timestamp: '',
                    type: 'HD',
                    mainId: 0,
                    is_backup: 0,
                };
                let mapping = {
                    wid: '',
                    type: '',
                    P2PKH: '',
                    P2WPKH: '',
                };

                tempSave.address = wallet.list[0].address;

                mapping.type = wallet.list[0].type;
                mapping.P2PKH = wallet.list[0].address_P2PKH;
                mapping.P2WPKH = wallet.list[0].address_P2WPKH;

                Encrypt(wallet.seed).then(encSeed => {
                    tempSave.seed = encSeed;
                    Encrypt(wallet.list[0].privateKey).then(encPrivateKey => {
                        tempSave.privateKey = encPrivateKey;
                        tempSave.timestamp = new Date().getTime();
                        insertWallet(tempSave).then(result => {
                            mapping.wid = result.insertId;
                            insertMapping(mapping);
                            logger(chain, ' created Success');
                        });
                    });
                });
            })
            .catch(error => {
                logger('error', error);
            });
    }
    function getFileFromDrive(fileId, type) {
        retrieveKeyValueData(storageConst.ACCESS_TOKEN).then(data => {
            gdrive.accessToken = data;
            return new Promise(function (resolve, reject) {
                gdrive.files
                    .getJson(fileId)
                    .then(file => {
                        getKey(JSON.stringify(file), type);
                        resolve(JSON.stringify(file));
                    })
                    .catch(error => {
                        logger('error from get file from drive loader', error);
                        reject(error);
                    });
            });
        });
    }
    async function getKey(data, type) {
        let responce = JSON.parse(data);
        let uid = responce.uid;
        let key = responce.key;
        let password = responce.password;
        let salt = responce.salt;
        saveKeyValueData(storageConst.USERID, uid);
        if (salt && password && key) {
            saveKeyValueData(storageConst.CLIENT_SALT, salt);
            let pwd = await Decrypt(key, password);
            saveKeyValueData(storageConst.EXTERNAL_DB_REF_ID, pwd);

            if (type == 'backup') {
                let allchains = await getAllChains();
                let allchainList = [];
                for (let i = 0; i < allchains.rows.length; i++) {
                    allchainList[i] = allchains.rows.item(i);
                }
                saveKeyValueData('allChains', JSON.stringify(allchainList));

                let chainlist = allchainList.map(item => {
                    return item.chain;
                });
                await createChains(chainlist, allchainList);
            } else {
                logger('recovering data');
                // setTimeout(() => {
                recoverWallet();
                // }, 1000);
            }
        } else {
            // open no keys screen
        }
    }
    const handleTextChangeAnimation = () => {
        setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(keepKeysSafe, {
                        toValue: 0,
                        useNativeDriver: true,
                        duration: 500,
                        delay: 3000,
                    }),
                    Animated.timing(secretKeysStored, {
                        toValue: 1,
                        useNativeDriver: true,
                        duration: 500,
                    }),
                    Animated.timing(secretKeysStored, {
                        toValue: 0,
                        useNativeDriver: true,
                        duration: 500,
                        delay: 8000,
                    }),
                    Animated.timing(keepKeysSafe, {
                        toValue: 1,
                        useNativeDriver: true,
                        duration: 500,
                    }),
                ]),
            ).start();
        }, 500);
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar
                animated={true}
                backgroundColor={colors.mainColor}
                barStyle={'light-content'}
            />
            <View style={styles.me3logoStyle}>
                <Image
                    source={require('@assets/me3logo.png')}
                    resizeMode={'contain'}
                    style={styles.me3logo}
                />

                <Animated.Image
                    onLayout={() => {
                        handleAnimation();
                    }}
                    source={require('@assets/loading_visual_1.png')}
                    // resizeMode={'stretch'}
                    style={[styles.cryptoLoader, animatedStyle, {}]}
                />
            </View>
            <View style={styles.flatlistContainerStyle}>
                <Animated.FlatList
                    style={{ transform: [{ translateY: FlatlistPosition }] }}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index}
                />
                {showSuggestionBox && (
                    <Animated.View
                        onLayout={() => {
                            Animated.parallel([
                                Animated.timing(FlatlistPosition, {
                                    toValue: -145,
                                    useNativeDriver: true,
                                    duration: 1000,
                                }),
                                Animated.timing(suggestionBoxOpacity, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                    duration: 1000,
                                    delay: 500,
                                }),
                            ]).start();
                        }}
                        style={[
                            styles.keep_keys_View,
                            {
                                opacity: suggestionBoxOpacity,
                            },
                        ]}>
                        {/* text gradient using masking */}

                        {/* <MaskedView
              style={{flex: 1, flexDirection: 'row', height: '100%'}}
              maskElement={
                <View
                  style={{
                    // Transparent background because mask is based off alpha channel.
                    flex: 1,
                    backgroundColor: 'transparent',
                    alignItems: 'center',
                    marginTop: 16,
                  }}>
                  <Text style={styles.keep_keys_text}>
                    {string.KEEP_KEYS_SAFE}
                  </Text>
                </View>
              }>
              <LinearGradient
                style={{flex:1,height:'100%'}}
                locations={[0, 1]}
                colors={colors.DeepFuchsia_PurplePizzazz}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
            </MaskedView> */}

                        {/* text gradient using text gradient plugin => it causes crash in production app */}

                        {/* <LinearTextGradient
              style={{marginTop: 16}}
              locations={[0, 1]}
              colors={colors.DeepFuchsia_PurplePizzazz}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text style={styles.keep_keys_text}>{string.KEEP_KEYS_SAFE}</Text>
            </LinearTextGradient> */}

                        <Image
                            resizeMode="contain"
                            source={require('@assets/keepKeysSafe.png')}
                            style={styles.keepKeysSafeImage}
                        />
                    </Animated.View>
                )}
            </View>
            {showSuggestionBox && (
                <Animated.View
                    onLayout={() => {
                        Animated.timing(suggestionTextOpacity, {
                            toValue: 1,
                            useNativeDriver: true,
                            duration: 1000,
                            delay: 600,
                        }).start();
                    }}
                    style={{ opacity: suggestionTextOpacity }}>
                    <Animated.Text
                        onLayout={() => {
                            handleTextChangeAnimation();
                        }}
                        style={[styles.subText, { opacity: keepKeysSafe }]}>
                        {string.SECRET_KEYS_STORED}
                    </Animated.Text>

                    <Animated.Text
                        style={[styles.subText, { opacity: secretKeysStored }]}>
                        {string.YOU_CAN_KEEP}
                    </Animated.Text>
                </Animated.View>
            )}
        </View>
    );
};

export default WelcomeLoader;

const styles = StyleSheet.create({
    cryptoLoader: {
        alignSelf: 'center',
        height: 220.04,
        marginTop: 46,
        width: 220.04,
    },
    flatlistContainerStyle: {
        marginBottom: 36,
        marginHorizontal: 24,
    },
    keepKeysSafeImage: {
        height: calculateHeight(20),
        marginTop: calculateHeight(16),
    },
    keep_keys_View: {
        alignItems: 'center',
        backgroundColor: colors.keep_keys_safe_opacity5,
        borderRadius: 12,
        bottom: 0,
        height: 126,
        marginTop: 17,
        position: 'absolute',
        width: '100%',
    },
    mainContainer: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
    me3logo: {
        height: 25,
        marginTop: 93 - StatusBar.currentHeight,
        width: 126,
    },

    me3logoStyle: {
        flex: 1,
        marginHorizontal: 24,
    },

    subText: {
        alignSelf: 'center',
        bottom: calculateHeight(70),
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginHorizontal: 55,
        position: 'absolute',
        textAlign: 'center',
    },

});
