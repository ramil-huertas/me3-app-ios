import {
    Text,
    StyleSheet,
    View,
    ScrollView,
    Image,
    StatusBar,
    Linking,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
    clearStorage,
    saveKeyValueData,
    retrieveKeyValueData,
} from '@constants/Storage';
import ConstantStrings, {
    BACKUP_WALLET,
    CopyRights,
    CURRENTLY_LOGGED,
    Followuson,
    KEY_RECOVERY,
    Logout,
    MANAGE_SECURITY,
    PrivacyPolicy,
    Security,
    SETTINGS,
    ADDRESS_BOOK,
    MANAGE_ADDRESS,
    TermsConditions,
} from '@constants/ConstantStrings';
import { clearDatabase } from '@database/sql.js';
import { colors, Width, fonts, calculateHeight } from '@constants/theme';
import { theme } from '@constants';
import BackupWarning from '../BackupWarning';
import LogOutPopUp from '../LogOutPopUp';
import { getAllNotBackedUpWallets } from '@database/sql';
import ConstStorage from '@constants/ConstStorage';
import { useDispatch, useSelector } from 'react-redux';
import { logger } from '@constants/Log';
import SelectCurrency from './currency/SelectCurrency';
import VersionCheck from 'react-native-version-check';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import SettingsItemComponent from '@components/SettingsItemComponent';
import { setCurrentCurrencyFromAction } from '@redux/Action/CurrencyAction';
import CSwitch from '@components/CSwitch';
import { resetStateDepositQR } from '@redux/Action/DepositQrActions';
import { resetWalletState } from '@redux/Action/WalletStatusAction';
import { resetStateWalletChains } from '@redux/Action/WalletWithChainsAction';
import { resetStateTokens } from '@redux/Action/TokenAction';
import { resetAssestsState } from '@redux/Action/HomeAction';
import { resetStateAddressbook } from '@redux/Action/AddressBookAction';
import { resetStateFAQ } from '@redux/Action/FaqAction';
import { resetStateQR } from '@redux/Action/QRScanActions';
import { resetStateSwapAllData } from '@redux/Action/SwapAction';
import { resetBackupStatus } from '@redux/Action/BackupAction';
import { resetNFTListFromAction } from '@redux/Action/NFTAction';
import Wallet from '../../../walletconnect/ExportWalletNativeModule';

export default function Setting({ navigation }) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);

    const [showLogOutPopUP, setShowLogOutPopUP] = useState(false);
    const [showBackupWarning, setShowBackupWarning] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showCurrencyPopup, setShowCurrencyPopup] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [testnetStatus, setTestnetStatus] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        retrieveKeyValueData(ConstStorage.CURRENT_USER_EMAIL)
            .then(email => {
                setUserEmail(email);
            })
            .catch(error => {
                logger(error);
            });
        retrieveKeyValueData(ConstStorage.LEGAL_DETAIL)
            .then(currency => {
                setCurrentCurrency(JSON.parse(currency));
            })
            .catch(error => {
                logger('error legaldetail', error);
            });
        retrieveKeyValueData(ConstStorage.SHOW_HIDE_TESTNET)
            .then(status => {
                if (status != null && status === 'true') setTestnetStatus(true);
                else {
                    setTestnetStatus(false);
                }
            })
            .catch(error => {
                logger('error legaldetail', error);
            });
    }, []);

    useEffect(() => {
        logger('data');
        setCurrentCurrency(CurrencyReducer.currentCurrency);
    }, [CurrencyReducer.currentCurrency.length]);

    function setSelectedCurrency(currency) {
        setCurrentCurrency(currency);
        saveKeyValueData(ConstStorage.LEGAL_DETAIL, JSON.stringify(currency));
        setCurrentCurrencyFromAction(dispatch, currency);
    }
    const topBackClick = () => {
        navigation.goBack();
    };
    return (
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            {showCurrencyPopup && (
                <SelectCurrency
                    setShowCurrencyPopupStatus={setShowCurrencyPopup}
                    setSelectedCurrency={setSelectedCurrency}
                    currentCurrency={currentCurrency}
                />
            )}
            {showLogOutPopUP && (
                <LogOutPopUp
                    setShowLogOutPopUP={setShowLogOutPopUP}
                    logoutCallback={logoutCallback}
                />
            )}
            {showBackupWarning && (
                <BackupWarning setShowBackupWarning={setShowBackupWarning} />
            )}
            <View style={styles.marginHorizontal20}>
                <ScreenTopHeader
                    title={SETTINGS}
                    topBackClick={topBackClick}
                    showBack={true}></ScreenTopHeader>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <Text style={styles.currentlyLogin}>{CURRENTLY_LOGGED}</Text>
                <View style={styles.loginView}>
                    <Image
                        source={require('@assets/Google.png')}
                        resizeMode="contain"
                        style={styles.googleIcon}></Image>
                    <Text style={styles.txtEmail}>{userEmail}</Text>
                </View>

                <SettingsItemComponent
                    clickEvent={navigateToBackupWallet}
                    title={BACKUP_WALLET}
                    icon={require('@assets/BackupWallet.png')}
                    subtitle={KEY_RECOVERY}></SettingsItemComponent>

                <SettingsItemComponent
                    clickEvent={navigateToSecurity}
                    title={Security}
                    icon={require('@assets/Security.png')}
                    subtitle={MANAGE_SECURITY}></SettingsItemComponent>

                <SettingsItemComponent
                    clickEvent={navigateToAddressBook}
                    title={ADDRESS_BOOK}
                    icon={require('@assets/addressBook.png')}
                    subtitle={MANAGE_ADDRESS}></SettingsItemComponent>

                <SettingsItemComponent
                    clickEvent={navigateToFAQ}
                    title={ConstantStrings.FAQ}
                    icon={require('@assets/faq_icon.png')}
                    subtitle={ConstantStrings.FAQ_FULL}></SettingsItemComponent>

                <TouchableOpacity
                    onPress={() => {
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        firebaseAnalytics(
                            firebaseEvents.settings_currency,
                            eventObject,
                        );
                        setShowCurrencyPopup(true);
                    }}>
                    <View style={styles.itemView}>
                        <Image
                            source={require('@assets/currenct_icon_dkGray.png')}
                            resizeMode="contain"
                            style={styles.itmeIcon}></Image>
                        <View style={styles.itmeSubview}>
                            <View style={styles.itmeSubview2}>
                                <Text style={styles.itemTitle}>
                                    {ConstantStrings.Currency}
                                </Text>
                            </View>
                            <Text style={styles.currencyDisplayStyle}>
                                {currentCurrency && currentCurrency.fiat}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.itemView}>
                    <Image
                        source={require('@assets/testnet_change_icon.png')}
                        resizeMode="contain"
                        style={styles.itmeIcon}></Image>
                    <View style={styles.itmeSubview}>
                        <View
                            style={[
                                styles.itmeSubview2,
                                styles.alignItemCenterStyle,
                            ]}>
                            <Text style={styles.itemTitle}>
                                {ConstantStrings.SHOW_TESTNET}
                            </Text>
                            {/* <Image
                                source={require('@assets/Question.png')}
                                resizeMode="contain"
                                style={styles.infoIconStyle}></Image> */}
                        </View>
                        <CSwitch
                            value={testnetStatus}
                            onValueChange={() => {
                                setTestnetStatus(!testnetStatus);
                                saveKeyValueData(
                                    ConstStorage.SHOW_HIDE_TESTNET,
                                    !testnetStatus ? 'true' : 'false',
                                );
                                resetStateWalletChains(dispatch);
                            }}
                            condition={testnetStatus}
                        />
                    </View>
                </View>

                <View style={styles.followView}>
                    <Text style={styles.itemTitle}>{Followuson}</Text>
                    <View style={styles.followSubView}>
                        <TouchableOpacity onPress={telegramClickEvent}>
                            <Image
                                source={require('@assets/Telegram.png')}
                                resizeMode="contain"
                                style={styles.socialIcon}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={twitterClickEvent}>
                            <Image
                                source={require('@assets/Twitter.png')}
                                resizeMode="contain"
                                style={styles.socialIcon}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={linkedInClieckEvent}>
                            <Image
                                source={require('@assets/Linkedin.png')}
                                resizeMode="contain"
                                style={styles.socialIcon}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={InstagramClickEvent}>
                            <Image
                                source={require('@assets/Instagram.png')}
                                resizeMode="contain"
                                style={styles.socialIcon}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomView}>
                <TouchableOpacity onPress={singOutClickevent}>
                    <View style={styles.btnSignout}>
                        <Text style={styles.txtSignOut}>{Logout}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.txtFooter}>{CopyRights}</Text>
                    <View style={styles.followSubView}>
                        <Text
                            style={styles.txtFooterWithLine}
                            onPress={termsofuseClickEvent}>
                            {TermsConditions}
                        </Text>
                        <Text
                            style={styles.txtFooterWithLine}
                            onPress={privacyClickEvent}>
                            {PrivacyPolicy}
                        </Text>
                    </View>
                    <Text style={styles.txtFooter}>
                        {`V ${VersionCheck.getCurrentVersion()}`}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );

    function navigateToBackupWallet() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_backup_wallet, eventObject);
        navigation.navigate('BackUpStatus');
    }

    async function singOutClickevent() {
        const result = await getAllNotBackedUpWallets();
        if (result.rows.length == 0) {
            setShowLogOutPopUP(true);
        } else {
            setShowBackupWarning(true);
        }
    }

    function navigateToSecurity() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_security, eventObject);
        navigation.navigate('SecuritySetting');
    }

    function navigateToAddressBook() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_address_book, eventObject);
        navigation.navigate('AddressBook');
    }
    // eslint-disable-next-line no-unused-vars
    function navigateToFAQ() {
        navigation.navigate('FAQ');
    }
    async function logoutCallback() {
        try {
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.settings_log_out, eventObject);
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            clearStorage();
            clearDatabase();

            clearAllReduxData();
            await Wallet.disconnectAllSessions();
            saveKeyValueData(ConstStorage.WALLETBACKUPED, 'FALSE');
            saveKeyValueData(ConstStorage.SHOW_HIDE_TESTNET, 'false');

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'OnBoarding' }],
                });
            }, 200);
        } catch (error) {
            logger('logout error :: ', error);
        }
    }

    function clearAllReduxData() {
        // clear data from redux
        resetWalletState(dispatch);
        resetStateDepositQR(dispatch);
        resetStateTokens(dispatch);
        resetStateWalletChains(dispatch);
        resetAssestsState(dispatch);
        resetStateAddressbook(dispatch);
        resetStateFAQ(dispatch);
        resetStateQR(dispatch);
        resetStateSwapAllData(dispatch);
        resetBackupStatus(dispatch);
        resetNFTListFromAction(dispatch);
    }

    function telegramClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_telegram, eventObject);
        Linking.openURL('https://t.me/AvartaOfficial');
    }

    function twitterClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_twitter, eventObject);
        Linking.openURL('https://twitter.com/me3wallet');
    }

    function linkedInClieckEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_linkedin, eventObject);
        Linking.openURL('https://www.linkedin.com/company/me3wallet/');
    }

    function InstagramClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_instagram, eventObject);
        Linking.openURL('https://www.instagram.com/me3wallet/');
    }

    function privacyClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_privacy, eventObject);
        Linking.openURL('https://www.me3.io/privacy-policy');
    }

    function termsofuseClickEvent() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.settings_terms, eventObject);
        Linking.openURL('https://www.me3.io/terms-of-use');
    }
}

const styles = StyleSheet.create({
    alignItemCenterStyle: {
        alignItems: 'center',
    },
    bottomView: {
        alignSelf: 'center',
        bottom: 10,
        position: 'absolute',
        width: Width,
    },
    btnSignout: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 12,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        margin: 20,
    },

    content: {
        backgroundColor: colors.white,
        flex: 1,
    },

    currencyDisplayStyle: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        color: theme.colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        marginRight: 20,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
    },

    currentlyLogin: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,

        marginLeft: 24,
    },

    followSubView: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    followView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: calculateHeight(175),
        paddingLeft: 24,
        paddingRight: 24,
        paddingVertical: 24,
    },
    footerView: {
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: 10,
        marginLeft: 10,
    },
    googleIcon: {
        height: 20,
        width: 20,
    },
    itemTitle: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
    itemView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 8,
        flex: 1,
        flexDirection: 'row',
        height: calculateHeight(52),
        marginLeft: 24,
        marginRight: 24,
        marginTop: 10,
    },

    itmeIcon: {
        height: 36,
        marginLeft: 12,
        width: 36,
    },

    itmeSubview: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    itmeSubview2: {
        alignItems: 'flex-start',
        flex: 0.9,
        flexDirection: 'row',
        marginLeft: 10,
    },

    loginView: {
        alignItems: 'center',
        borderColor: colors.gray_border_color,
        borderRadius: 10,
        borderWidth: 1.5,
        flexDirection: 'row',
        height: 50,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 8,
        paddingLeft: 12,
    },

    marginHorizontal20: { marginHorizontal: 20 },

    socialIcon: {
        height: 24,
        margin: 4,
        width: 24,
    },

    txtEmail: {
        color: theme.colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,

        marginLeft: 8,
    },

    txtFooter: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
    },

    txtFooterWithLine: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        margin: 4,
        textDecorationLine: 'underline',
    },
    txtSignOut: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
});
