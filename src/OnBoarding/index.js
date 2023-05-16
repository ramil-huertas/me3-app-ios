/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useCallback, useState } from 'react';

import {
    StyleSheet,
    View,
    Dimensions,
    Animated,
    TouchableOpacity,
    Image,
    Text,
    StatusBar,
    Linking,
    BackHandler,
} from 'react-native';
import { theme } from '@constants';
import string from '@constants/ConstantStrings';
import config from '@constants/config';
import { ExpandingDot } from 'react-native-animated-pagination-dots';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const { width } = Dimensions.get('screen');
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import {
    GDrive,
    MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import storageConst from '@constants/ConstStorage';
import {
    apiRegisterUser,
    apiKeyExchange,
    api_set_fileId,
    apiGetAllChains,
} from '@api/AxiosInstance';
import { getRandomString, Encrypt } from '@constants/EncryptDecrypt';

import {
    getAllWallets,
    createTables,
    deleteAllChains,
    InsertChain,
} from '@database/sql';

import Progress from '@components/Progress';
import { apiGetSupportCurrency } from '@api/WalletAPIs';
const data = [
    {
        image: require('@assets/onboard_one.png'),
        title: string.SWIPE_PAGE_1_TITLE,
        description: string.SWIPE_PAGE_1_DESCRIPTION,
    },
    {
        image: require('@assets/onboard_second.png'),
        title: string.SWIPE_PAGE_2_TITLE,
        description: string.SWIPE_PAGE_2_DESCRIPTION,
    },
    {
        image: require('@assets/onboard_third.png'),
        title: string.SWIPE_PAGE_3_TITLE,
        description: string.SWIPE_PAGE_3_DESCRIPTION,
    },
];

import apiConst, { APIENVTYPE } from '@api/apiConst';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setWalletProcessType } from '@redux/Action/WalletStatusAction';
import { calculateHeight, calculateWidth } from '@constants/theme';
import { logger } from '@constants/Log';
import {
    checkNullOrEmpty,
    autoLogoutAfter1Week,
} from '@constants/commonFuncation';
import { showMessageToast, showErrorToast } from '@redux/Action/ToastAlert';
import { key2B64Str } from '@constants/EncDecChacha';
import { pki } from 'node-forge';
import { setCurrentCurrencyFromAction } from '@redux/Action/CurrencyAction';
import NoInternet from '@components/NoInternet';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';

export default function OnBoarding({ navigation }) {
    // Apple
    let user = null;
    const [credentialState, updateCredentialStateForUser] = useState(-1)
    async function fetchAndUpdateCredentialState(updateCredentialStateForUser) {
        if (user === null) {
          updateCredentialStateForUser('N/A');
        } else {
          const credentialState = await appleAuth.getCredentialStateForUser(user);
          if (credentialState === appleAuth.State.AUTHORIZED) {
            updateCredentialStateForUser('AUTHORIZED');
          } else {
            updateCredentialStateForUser(credentialState);
          }
        }
      }
      
      /**
       * Starts the Sign In flow.
       */
      async function onAppleButtonPress(updateCredentialStateForUser) {
        console.log('Beginning Apple Authentication');
      
        // start a login request
        try {
          const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          });
      
          console.log('appleAuthRequestResponse', appleAuthRequestResponse);
      
          const {
            user: newUser,
            email,
            nonce,
            identityToken,
            realUserStatus /* etc */,
          } = appleAuthRequestResponse;
      
          user = newUser;
      
          fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
            updateCredentialStateForUser(`Error: ${error.code}`),
          );
      
          if (identityToken) {
            // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
            console.log(nonce, identityToken);
          } else {
            // no token - failed sign-in?
          }
      
          if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
            console.log("I'm a real person!");
          }
      
          console.log(`Apple Authentication Completed, ${user}, ${email}`);
        } catch (error) {
          if (error.code === appleAuth.Error.CANCELED) {
            console.log('User canceled Apple Sign in.');
          } else {
            console.log(error);
          }
        }
      }

      useEffect(() => {
        if (!appleAuth.isSupported) return;
    
        fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
          updateCredentialStateForUser(`Error: ${error.code}`),
        );
      }, []);
    
      useEffect(() => {
        if (!appleAuth.isSupported) return;
    
        return appleAuth.onCredentialRevoked(async () => {
          console.log('Credential Revoked');
          fetchAndUpdateCredentialState(updateCredentialStateForUser).catch(error =>
            updateCredentialStateForUser(`Error: ${error.code}`),
          );
        });
      }, []);
    
    const dispatch = useDispatch();
    const hasInternet = useSelector(state => state.ConfigReducer.hasInternet);

    const gdrive = new GDrive();
    gdrive.fetchTimeout = 3000;

    const [passcodeMode, setPasscodeMode] = useState(false);
    useEffect(() => {
        autoLogoutAfter1Week(navigation, dispatch);
    }, []);
    useEffect(() => {
        if (passcodeMode) {
            return;
        }
        // this is for auto scrolling pages
        const interval = setInterval(() => {
            if (activeIndex == data.length - 1) {
                setActiveIndex(0);
                flatListRef.current.scrollToIndex({
                    index: 0,
                    animated: true,
                });
            } else {
                flatListRef.current.scrollToIndex({
                    index: activeIndex + 1,
                    animated: true,
                });
            }
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    }, activeIndex);

    async function checkPasscodeMode() {
        let passcodeModeFromLocal = await retrieveKeyValueData(
            storageConst.PASSCODE_MODE,
        );
        if (passcodeModeFromLocal != null && passcodeModeFromLocal == '1') {
            setPasscodeMode(true);
        } else {
            setPasscodeMode(false);
        }
    }
    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                BackHandler.exitApp();
            });
            return () => {
                BackHandler.addEventListener('hardwareBackPress', () => {
                    logger('back pressed return');
                }).remove();
            };
        }, []),
    );

    async function setCurrency() {
        let savedCurrency = await retrieveKeyValueData(
            storageConst.LEGAL_DETAIL,
        );
        if (checkNullOrEmpty(savedCurrency)) {
            apiGetSupportCurrency()
                .then(currencyList => {
                    if (currencyList && currencyList.length > 0) {
                        let result = currencyList.find(item => {
                            return item.fiat == 'IDR' && item;
                        });
                        if (result == undefined) result = currencyList[0];
                        setCurrentCurrencyFromAction(dispatch, result);
                        saveKeyValueData(
                            storageConst.LEGAL_DETAIL,
                            JSON.stringify(result),
                        );
                    } else {
                        let dataObj = {
                            createTime: '2022-05-27 03:54:52',
                            fiat: 'USD',
                            icon: '$',
                            id: 1,
                            name: 'United State Dollar',
                            sort: 1,
                            updateTime: '2022-05-27 03:54:52',
                            image: require('@assets/flag_us.png'),
                        };
                        setCurrentCurrencyFromAction(dispatch, dataObj);
                        saveKeyValueData(
                            storageConst.LEGAL_DETAIL,
                            JSON.stringify(dataObj),
                        );
                    }
                })
                .catch(error => {
                    logger('error supportcurrency', error);
                });
        } else {
            setCurrentCurrencyFromAction(dispatch, JSON.parse(savedCurrency));
        }
    }
    useEffect(() => {
        createTables();
        logger('useeffect cal');
        checkPasscodeMode();
        setCurrency();
        apiGetAllChains()
            .then(chainlist => {
                chainlist = chainlist.filter(item => {
                    return item.series != '';
                });

                chainlist = chainlist.map(item => {
                    item.series = item.series.toLowerCase();
                    return {
                        chain: item.name,
                        name: item.description,
                        symbol: item.symbol,
                        series: item.series,
                        chainId: item.chainId ? item.chainId : 0,
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
                    };
                });
                deleteAllChains()
                    .then(result => {
                        for (const item of chainlist) {
                            insertChainInTable(item);
                        }
                    })
                    .catch(error => logger(`delete database error ${error}`));
            })
            .catch(error => {
                logger('chain ', error);
            });
        GoogleSignin.configure({
            scopes: SCOPES,
            webClientId: config.GOOGLE_SIGN_IN_SERVER_KEY,
            offlineAccess: true,
        });

        GoogleSignin.isSignedIn().then(status => {
            logger('User signedin status ', status);
        });
    }, []);

    async function insertChainInTable(item) {
        return await InsertChain(item);
    }
    const [showIndicator, setShowIndicatorStatus] = React.useState(false);

    const scrollX = React.useRef(new Animated.Value(0)).current;
    const keyExtractor = React.useCallback((_, index) => index.toString(), []);
    const [activeIndex, setActiveIndex] = React.useState(0);
    let flatListRef = React.useRef(null);
    const onViewRef = React.useRef(({ viewableItems }: any) => {
        setActiveIndex(viewableItems[0].index);
    });
    const viewConfigRef = React.useRef({
        viewAreaCoveragePercentThreshold: 10,
    });
    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

    const renderItem = React.useCallback(({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Animated.Image
                    style={styles.animatedImageStyle}
                    source={item.image}
                />
                <Text style={styles.textHeaderStyle}>{item.title}</Text>
                <Text style={styles.textDetailStyle}>{item.description}</Text>
            </View>
        );
    }, []);

    async function uploadFile(file) {
        let accessToken = await retrieveKeyValueData(storageConst.ACCESS_TOKEN);
        gdrive.accessToken = accessToken;
        let fileName = 'ME3_KEY.json';
        if (apiConst.APIENV === APIENVTYPE.DEV) {
            fileName = 'ME3_KEY_DEV.json';
        } else if (apiConst.APIENV === APIENVTYPE.PREPROD) {
            fileName = 'ME3_KEY_PRE_PROD.json';
        } else {
            fileName = 'ME3_KEY.json';
        }
        return new Promise(function (resolve, reject) {
            gdrive.files
                .newMultipartUploader()
                .setData(file, MimeTypes.JSON)
                .setRequestBody({
                    name: fileName,
                })
                .execute()
                .then(fileData => {
                    saveKeyValueData(storageConst.FILE_ID, fileData.id);

                    api_set_fileId(fileData.id)
                        .then(fileId => {
                            logger('response :: ', fileId);
                            setShowIndicatorStatus(false);
                            const object = {
                                type: string.BACK_UP,
                                id: fileData.id,
                            };
                            setWalletProcessType(dispatch, object);
                            navigation.replace('WelcomeToMe3', {
                                type: 'backup',
                                id: fileData.id,
                            });
                        })
                        .catch(error => {
                            setShowIndicatorStatus(false);
                            logger('uplaod file error :: ', error);
                        });
                    // navigation.replace("Welcome")
                })
                .catch(error => {
                    logout();
                    setShowIndicatorStatus(false);
                    showMessageToast(
                        dispatch,
                        'File saved failed. Please try again',
                    );
                    logger('error', JSON.stringify(error));
                });
        });
    }

    function logout() {
        GoogleSignin.revokeAccess();
        GoogleSignin.signOut();
    }
    function googleSignIn() {
        GoogleSignin.signIn()
            .then(userInfo => {
                if (userInfo && userInfo.user.email != null) {
                    saveKeyValueData(
                        storageConst.CURRENT_USER_EMAIL,
                        userInfo.user.email,
                    );
                }
                /** const authCode = userInfo.serverAuthCode;
                 *   getGoogleAccessToken({ code:authCode }).then(data => {
                 *       saveKeyValueData(storageConst.ACCESS_TOKEN, data.accessToken)
                 *       setShowIndicatorStatus(true)
                 *       uploadFile(idtoken.accessToken)
                 *   }).catch(error => logger(error))
                 **/

                GoogleSignin.getTokens().then(idtoken => {
                    saveKeyValueData(
                        storageConst.ACCESS_TOKEN,
                        idtoken.accessToken,
                    );
                    setShowIndicatorStatus(true);
                    // uploadFile(idtoken.accessToken)
                    setTimeout(() => {
                        encryption(userInfo.user.email);
                    }, 100);
                });
            })
            .catch(e => {
                setShowIndicatorStatus(false);
                if (e.code == 12501)
                    navigation.navigate('GooglePermissionDenied', {
                        key: () => googleSignIn(),
                    });

                logger(e);
                logger('sign in ERROR IS: ' + JSON.stringify(e));
            });
    }

    const generateKeyPairOnLayout = () => {
        // let keyPair = pki.rsa.generateKeyPair({
        //   bits: 1024,
        //   e: 0x10001,

        // })
        // setRsaKeyPair(keyPair)
        setShowIndicatorStatus(false);
    };

    const encryption = async email => {
        logger('encryption start time ::', new Date().toString());
        let rsaKeyPair1 = pki.rsa.generateKeyPair({
            bits: 1024,
            e: 0x10001,
            workers: 2,
        });
        // }
        setShowIndicatorStatus(false);
        const privateKeyEncoded = key2B64Str(rsaKeyPair1.privateKey, true);
        const publicKeyEncoded = key2B64Str(rsaKeyPair1.publicKey, false);
        logger('encryption end time ::', new Date().toString());

        saveKeyValueData(storageConst.CLIENT_PUBLICKEY, publicKeyEncoded);
        saveKeyValueData(storageConst.CLIENT_PRIVATEKEY, privateKeyEncoded);

        apiKeyExchange(email, publicKeyEncoded)
            .then(exchangedData => {
                saveKeyValueData(storageConst.SERVER_PUBLICKEY, exchangedData);
                apiRegisterUser(email)
                    .then(registerData => {
                        const parsedDecryptedData = registerData;
                        let key = parsedDecryptedData.uid;
                        if (key != undefined) {
                            let token = parsedDecryptedData.token;
                            saveKeyValueData(storageConst.LIGHT_TOKEN, token);
                            saveKeyValueData(
                                storageConst.CLIENT_SALT,
                                parsedDecryptedData.salt,
                            );

                            let password = parsedDecryptedData.password;
                            let salt = parsedDecryptedData.salt;
                            let uid = parsedDecryptedData.uid;

                            Encrypt(
                                getRandomString(40) + new Date().getTime(),
                                password,
                            )
                                .then(dataEnc => {
                                    const fileObject = {
                                        uid: uid,
                                        password: password,
                                        salt: salt,
                                        key: dataEnc,
                                    };

                                    uploadFile(JSON.stringify(fileObject));
                                })
                                .catch(error => {
                                    logger('error', error);
                                });
                        } else {
                            let token1 = parsedDecryptedData.token;
                            if (token1 != undefined) {
                                saveKeyValueData(
                                    storageConst.LIGHT_TOKEN,
                                    token1,
                                );

                                api_set_fileId()
                                    .then(fileData => {
                                        getAllWallets()
                                            .then(walletData => {
                                                let length =
                                                    walletData.rows.length;
                                                setShowIndicatorStatus(false);
                                                if (length == 0) {
                                                    const object = {
                                                        type: string.RECOVER,
                                                        id: fileData.data
                                                            .fileId,
                                                    };
                                                    setWalletProcessType(
                                                        dispatch,
                                                        object,
                                                    );
                                                    navigation.replace(
                                                        'WelcomeToMe3',
                                                        {
                                                            type: 'recover',
                                                            id: fileData.data
                                                                .fileId,
                                                        },
                                                    );
                                                } else {
                                                    navigation.replace(
                                                        'MainContainer',
                                                    );
                                                }
                                            })
                                            .catch(error => {
                                                logger(
                                                    'database error ',
                                                    error,
                                                );
                                            });
                                        logger(data);
                                    })
                                    .catch(error => {
                                        logout();
                                        setShowIndicatorStatus(false);
                                        logger(error);
                                    });
                            } else {
                                logger('neither uid, salt or token found');
                            }
                        }
                    })
                    .catch(error => {
                        logout();
                        setShowIndicatorStatus(false);
                        logger(error);
                    });
            })
            .catch(error => {
                logout();
                setShowIndicatorStatus(false);
                logger(error);
            });
    };

    function googleSigninSilent() {
        setShowIndicatorStatus(true);
        GoogleSignin.signIn()
            .then(userInfo => {
                if (userInfo && userInfo.user.email != null) {
                    saveKeyValueData(
                        storageConst.CURRENT_USER_EMAIL,
                        userInfo.user.email,
                    );
                }

                GoogleSignin.getTokens().then(idtoken => {
                    saveKeyValueData(
                        storageConst.ACCESS_TOKEN,
                        idtoken.accessToken,
                    );
                    setShowIndicatorStatus(false);
                    getAllWallets()
                        .then(data => {
                            let length = data.rows.length;
                            logger('Method ', data.rows.length);

                            if (length == 0) {
                                api_set_fileId()
                                    .then(fileData => {
                                        setShowIndicatorStatus(false);
                                        const object = {
                                            type: string.RECOVER,
                                            id: fileData.data.fileId,
                                        };
                                        setWalletProcessType(dispatch, object);
                                        navigation.replace('WelcomeToMe3', {
                                            type: 'recover',
                                            id: fileData.data.fileId,
                                        });
                                    })
                                    .catch(error => {
                                        setShowIndicatorStatus(false);
                                        showErrorToast(dispatch, error.msg);
                                        logout();
                                    });
                            } else {
                                setShowIndicatorStatus(false);
                                navigation.replace('MainContainer');
                            }
                        })
                        .catch(error => {
                            logger('database error ', error);
                        });
                });
            })
            .catch(e => {
                setShowIndicatorStatus(false);
                logger('sign in ERROR IS: ' + JSON.stringify(e));
            });
    }

    return (
        <View
            style={styles.container}
            onLayout={() => {
                setShowIndicatorStatus(true);
                setTimeout(() => {
                    generateKeyPairOnLayout();
                }, 100);
            }}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.mainColor}
            />
            {showIndicator && <Progress></Progress>}

            <Image
                style={styles.logoStyle}
                source={require('@assets/me3logo.png')}></Image>

            {/* swipe view */}
            <View style={styles.animatedFlatlistContainerStyle}>
                <Animated.FlatList
                    ref={flatListRef}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    horizontal
                    decelerationRate={'normal'}
                    scrollEventThrottle={16}
                    onEndReachedThreshold={() => setActiveIndex(0)}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        {
                            useNativeDriver: false,
                        },
                    )}
                    onScrollToIndexFailed={event => {
                        logger('scroll to index failed :: ', event);
                    }}
                />

                <View style={{ height: calculateHeight(36) }}></View>
                <ExpandingDot
                    data={data}
                    expandingDotWidth={15}
                    scrollX={scrollX}
                    inActiveDotColor={'#ffffff'}
                    activeDotColor={'#ffffff'}
                    inActiveDotOpacity={0.2}
                    dotStyle={styles.dotStyles}
                    containerStyle={styles.constainerStyles}
                />
            </View>
            {/* bottom sign in button */}
            <View style={styles.bottomViewStyle}>
                <View style={styles.privacypolicyStyle}>
                    <Text style={styles.termsConditionStyle}>
                        {`${string.BY_CONTINUING} `}
                    </Text>
                    <Text
                        style={[
                            styles.textHyperlinkStyle,
                            styles.termsConditionStyle,
                        ]}
                        onPress={termsofuseClickEvent}>
                        {string.TERMS_OF_USE}
                    </Text>
                    <Text style={styles.termsConditionStyle}>
                        {` ${string.AND} `}
                    </Text>
                    <Text
                        style={[
                            styles.textHyperlinkStyle,
                            styles.termsConditionStyle,
                        ]}
                        onPress={privacyClickEvent}>
                        {string.PRIVACY_POLICY}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.bottomSigninButtonStyle}
                    onPress={async () => {
                        GoogleSignin.hasPlayServices()
                            .then(hasPlayService => {
                                if (hasPlayService) {
                                    GoogleSignin.isSignedIn().then(status => {
                                        logger('User signedin status ', status);
                                        if (!status) {
                                            googleSignIn();
                                        } else {
                                            googleSigninSilent();
                                        }
                                    });
                                } else {
                                    logger('no play service available');
                                }
                            })
                            .catch(e => {
                                logger('ERROR IS: ' + JSON.stringify(e));
                            });
                    }}>
                    <Image
                        style={{
                            height: calculateHeight(23),
                            width: calculateHeight(23),
                        }}
                        source={require('@assets/google_icon.png')}></Image>
                    <Text style={styles.bottomButtonStyle}>
                        {string.SIGN_IN_WITH_GOOGLE}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottomAppleSigninButtonStyle}
                    >
                    <AppleButton
                        style={styles.appleButton}
                        buttonStyle={AppleButton.Style.WHITE}
                        buttonType={AppleButton.Type.SIGN_IN}
                        onPress={() => onAppleButtonPress(updateCredentialStateForUser)}
                    />
                </TouchableOpacity>
            </View>
            {!hasInternet && <NoInternet />}
        </View>
    );

    function privacyClickEvent() {
        Linking.openURL('https://www.me3.io/privacy-policy');
        // checkBiometricAuthentication()
    }

    function termsofuseClickEvent() {
        Linking.openURL('https://www.me3.io/terms-of-use');
        // checkBiometricAuthentication()
    }
}

const styles = StyleSheet.create({
    animatedFlatlistContainerStyle: { flex: 1, marginTop: calculateHeight(17) },
    animatedImageStyle: {
        alignSelf: 'center',
        borderRadius: 20,
        height: calculateHeight(254),
        marginTop: 10,
        width: calculateWidth(327),
    },
    bottomButtonStyle: {
        color: theme.colors.black,
        // fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f17,
        marginLeft: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    bottomSigninButtonStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: calculateHeight(8),
        flexDirection: 'row',
        height: calculateHeight(50),
        justifyContent: 'center',
        marginTop: 9,
    },
    bottomViewStyle: {
        // height: theme.sizes.bottom_button_view_height,
        // justifyContent: 'center',
        // width: '88%',
        // alignSelf: 'center',

        marginHorizontal: calculateWidth(24),
    },
    constainerStyles: {
        alignSelf: 'flex-start',
        margin: calculateWidth(24),
    },
    container: {
        backgroundColor: theme.colors.mainColor,
        flex: 1,
        justifyContent: 'center',
    },
    dotStyles: {
        borderRadius: 5,
        color: theme.colors.white,
        height: calculateHeight(4),
        marginHorizontal: calculateWidth(3),
        width: calculateWidth(5),
    },

    itemContainer: {
        width,
    },

    logoStyle: {
        height: calculateHeight(25),
        marginLeft: calculateWidth(24),
        marginTop: calculateHeight(65),
        resizeMode: 'contain',
        width: calculateWidth(126),
    },
    privacypolicyStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    termsConditionStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: calculateHeight(13),
    },
    textDetailStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        marginLeft: 15,
        marginTop: 20,
        width: '80%',
    },
    textHeaderStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f24,
        marginLeft: 15,
        marginTop: 17,
        width: '80%',
    },
    textHyperlinkStyle: {
        textDecorationLine: 'underline',
    },

    bottomAppleSigninButtonStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: calculateHeight(8),
        flexDirection: 'row',
        height: calculateHeight(50),
        justifyContent: 'center',
        marginBottom: calculateHeight(40),
        marginTop: 9,
    },
    appleButton: {
        width: '100%',
        height: calculateHeight(46),
      }
});
