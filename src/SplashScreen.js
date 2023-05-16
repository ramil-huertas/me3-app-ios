import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import React, { useCallback, useEffect } from 'react';
import { apiGetAllChains } from '@api/AxiosInstance';
import { apiGetSupportCurrency } from '@api/WalletAPIs';
import ConstStorage from '@constants/ConstStorage';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import {
    createTables,
    deleteAllChains,
    getAllWallets,
    InsertChain,
} from '@database/sql';
import config from '@constants/config';
import { logger } from '@constants/Log';
import { useDispatch } from 'react-redux';
import { checkNullOrEmpty } from '@constants/commonFuncation';
import { setBackUpStatus } from '@redux/Action/BackupAction';
import { setCurrentCurrencyFromAction } from '@redux/Action/CurrencyAction';
import { useNavigation } from '@react-navigation/native';

import { View, Image, StatusBar, StyleSheet } from 'react-native';
import { colors } from '@constants/theme';

const SplashScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const gdrive = new GDrive();
    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
    gdrive.fetchTimeout = 3000;

    const checkBackupStatus = useCallback(() => {
        retrieveKeyValueData(ConstStorage.BACKUPEDARGEE).then(data => {
            if (checkNullOrEmpty(data) && data != 'TRUE') {
                setBackUpStatus(dispatch, false);
            } else {
                setBackUpStatus(dispatch, true);
            }
        });
    }, []);

    const setCurrency = useCallback(async () => {
        let savedCurrency = await retrieveKeyValueData(
            ConstStorage.LEGAL_DETAIL,
        );

        if (savedCurrency) {
            setCurrentCurrencyFromAction(dispatch, JSON.parse(savedCurrency));
            return;
        }

        try {
            let dataObj;
            const currencyList = await apiGetSupportCurrency();
            if (currencyList?.length > 0) {
                dataObj =
                    currencyList.find(item => item.fiat == 'IDR') ??
                    currencyList[0];
            } else {
                dataObj = {
                    createTime: '2022-05-27 03:54:52',
                    fiat: 'USD',
                    icon: '$',
                    id: 1,
                    name: 'United State Dollar',
                    sort: 1,
                    updateTime: '2022-05-27 03:54:52',
                    image: require('@assets/flag_us.png'),
                };
            }

            setCurrentCurrencyFromAction(dispatch, dataObj);
            saveKeyValueData(
                ConstStorage.LEGAL_DETAIL,
                JSON.stringify(dataObj),
            );
        } catch (e) {
            logger('error supportcurrency', e);
        }
    }, []);

    const fetchAllChains = useCallback(async () => {
        let chainList;
        try {
            chainList = await apiGetAllChains();
            chainList = chainList
                .filter(item => item.series != '')
                .map(item => ({
                    chain: item.name,
                    name: item.description,
                    symbol: item.symbol,
                    series: item.series.toLowerCase(),
                    chainId: item.chainId ?? 0,
                    node: item.node,
                    coinType: item.hdCoinId,
                    sort: item.sort,
                    chain_icon: item.symbolIcon,
                    symbol_icon: item.symbolIcon,
                    tx_url: item.txUrl,
                    support_nft: item.supportNft,
                    support_dapp: item.supportDapp,
                    pin_status: 0,
                    is_delete: 0,
                }));
        } catch (e) {
            logger('chain ', e);
            return;
        }

        try {
            await deleteAllChains();
            for (const chain of chainList) {
                await InsertChain(chain);
            }
        } catch (e) {
            logger(`delete database error ${e}`);
        }
    }, []);

    const checkIfSignedIn = useCallback(async () => {
        try {
            // 1. Get db if contain any user data.
            const allStoredWallets = await getAllWallets().catch(e => {
                throw new Error('database error', e);
            });
            if (!allStoredWallets.rows.length) {
                throw new Error('Database does not contain any user');
            }

            // 2. Check isSignedIn
            GoogleSignin.configure({
                scopes: SCOPES,
                webClientId: config.GOOGLE_SIGN_IN_SERVER_KEY,
                offlineAccess: true,
            });
            const googleSigninStatus = await GoogleSignin.isSignedIn(); // According to doc this will never throw err
            if (!googleSigninStatus) {
                throw new Error('GoogleSignin not signed in');
            }

            // 3. SignInSilently
            const userInfo = await GoogleSignin.signInSilently().catch(e => {
                throw new Error('GoogleSignin.signInSilently() e', e);
            });
            if (userInfo?.user?.email) {
                saveKeyValueData(
                    ConstStorage.CURRENT_USER_EMAIL,
                    userInfo.user.email,
                );
            }

            // 4. Get accessToken
            const idtoken = await GoogleSignin.getTokens().catch(e => {
                throw new Error('GoogleSignin.getTokens() e', e);
            });
            saveKeyValueData(ConstStorage.ACCESS_TOKEN, idtoken.accessToken);

            navigation.replace('WalletDashboard');
        } catch (e) {
            console.log(e);
            navigation.replace('OnBoarding');
        }
    }, []);

    useEffect(() => {
        logger(new Date());

        checkBackupStatus();
        createTables();
        setCurrency();
        fetchAllChains();
        checkIfSignedIn();
    }, []);

    return (
        <>
            <View style={styles.parentView}>
                <StatusBar
                    animated={true}
                    backgroundColor={colors.mainColor}
                    barStyle={'light-content'}
                />
                <Image
                    style={styles.meThreeLogo}
                    resizeMode={'contain'}
                    source={require('@assets/me3logo.png')}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    meThreeLogo: {
        height: 41,
        width: 217.18,
    },
    parentView: {
        alignItems: 'center',
        backgroundColor: colors.mainColor,
        flex: 1,
        justifyContent: 'center',
    },
});

export default SplashScreen;
