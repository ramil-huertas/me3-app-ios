import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { colors, fonts } from '@constants/theme';
import { theme } from '@constants';
import LinearGradient from 'react-native-linear-gradient';
import ConstantStrings, {
    myHoldings,
    myNFTs,
    walletBalance,
} from '@constants/ConstantStrings';
import DualTab from '@components/DualTab';
import MyHoldings from './MyHoldings';
import MyNFTs from './nft/MyNFTs';
import { apiGetFocusChains } from '@api/WalletAPIs';
import { saveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';
import { useFocusEffect } from '@react-navigation/native';
import { checkBalanceIsHidden } from '../TabbarFuncation';
import { logger } from '@constants/Log';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { useSelector } from 'react-redux';
import { getFlex } from '@constants/commonFuncation';

export default function Wallet({ navigation }) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);
    const [selectedTab, setSelectedTab] = useState(myHoldings);
    const [chainList, setChainList] = useState(null);
    const [eyeOnOffStatus, setEyeOnOffStatus] = useState(true);
    const [topBalance, setTopBalance] = useState(0)

    //this is to refresh list whenever get focus on the screen
    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, []),
    );

    useEffect(() => {
        chainList && refreshData()
    }, []);

    const refreshData = () => {
        const params = {
            chainName: '',
            sort: '',
        };
        apiGetFocusChains(params)
            .then(chainList1 => {
                for (const item of chainList1) {
                    item.show = false;
                    item.isDisable = false;
                }

                setChainList(chainList1);
            })
            .catch(error => {
                logger('error ', error);
            });
    };

    useFocusEffect(
        useCallback(() => {
            checkBalanceIsHidden().then(result => {
                setEyeOnOffStatus(result);
            });
        }, []),
    );

    function navigateToScan() {
        navigation.navigate('QrScanner', {
            eventName: firebaseEvents.wallet_qr_scanner_import,
        });
    }

    const refreshTopBalance = (balance) => {
        setTopBalance(`${CurrencyReducer.currentCurrency.icon} ${balance}`)
    }
    return (
        <SafeAreaView style={styles.containerStyle}>
            <View style={{ flex: getFlex() }}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.white}
                    barStyle={'dark-content'}
                />
                <View style={styles.header}>
                    <Text style={styles.headText}>
                        {ConstantStrings.MY_WALLET}
                    </Text>
                    <View style={styles.logoView}>
                        <TouchableOpacity onPress={navigateToScan}>
                            <Image
                                source={require('@assets/ScanBlack.png')}
                                style={styles.icon}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
                <LinearGradient
                    colors={colors.magnolia_white}
                    style={styles.wallet}>
                    <View style={styles.walletTitleView}>
                    </View>
                    <View style={styles.totalTitleView}>
                        <Text style={styles.txtTotalTitle}>
                            {`${walletBalance} `}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                saveKeyValueData(
                                    ConstStorage.EYE_ON_OFF_STATUS,
                                    eyeOnOffStatus ? '1' : '0',
                                );
                                setEyeOnOffStatus(!eyeOnOffStatus);

                                if (eyeOnOffStatus) {
                                    const eventObject = {
                                        timeOfClick:
                                            new Date().toLocaleString(),
                                    };
                                    firebaseAnalytics(
                                        firebaseEvents.wallet_hide_balance,
                                        eventObject,
                                    );
                                }
                            }}>
                            <Image
                                source={
                                    eyeOnOffStatus
                                        ? require('@assets/eye_on.png')
                                        : require('@assets/eye_off.png')
                                }
                                style={styles.arrowEye}
                                resizeMode="contain"></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.balanceView}>
                        <Text style={styles.txtTotal}>
                            {eyeOnOffStatus
                                ? topBalance
                                : '*****'}
                        </Text>
                    </View>
                </LinearGradient>

                <DualTab
                    viewStyle={styles.dualTabView}
                    tabOneTitle={myHoldings}
                    tabTwoTitle={myNFTs}
                    tabOnePress={() => {
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        firebaseAnalytics(
                            firebaseEvents.wallet_my_holdings,
                            eventObject,
                        );
                        setSelectedTab(myHoldings);
                    }}
                    tabTwoPress={() => {
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        firebaseAnalytics(
                            firebaseEvents.wallet_my_nfts,
                            eventObject,
                        );
                        setSelectedTab(myNFTs);
                    }}
                    SelectedTabOneStyle={styles.marginRight4Style}
                    SelectedTabTwoStyle={styles.marginLeft4Style}
                    condition={selectedTab === myHoldings}
                />
                <View style={styles.selectedTabContainerStyle}>
                    {selectedTab === myHoldings ? (
                        chainList && (
                            <MyHoldings
                                navigation={navigation}
                                chainList={chainList}
                                eyeStatus={eyeOnOffStatus}
                                refreshTopBalance={refreshTopBalance}
                            />
                        )
                    ) : (
                        <MyNFTs navigation={navigation} />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    arrowEye: {
        height: 15,
        marginLeft: 4,
        tintColor: colors.gray_textcolor,
        width: 15,
    },
    balanceView: {
        alignSelf: 'flex-start',
        marginBottom: 9,
        marginHorizontal: 12,
        marginTop: 3,
    },

    containerStyle: {
        backgroundColor: colors.white,
        flex: 1,
    },
    dualTabView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 36,
        marginVertical: 20,
    },
    headText: {
        alignSelf: 'center',
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    icon: {
        height: 25,
        marginLeft: 10,
        width: 25,
    },
    logoView: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    marginLeft4Style: {
        marginLeft: 4,
    },
    marginRight4Style: {
        marginRight: 4,
    },

    selectedTabContainerStyle: {
        flex: 1,
        marginBottom: 10,
    },
    totalTitleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginHorizontal: 12,
    },

    txtTotal: {
        color: colors.purple_dark,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f24,
        lineHeight: theme.sizes.lh33,
    },
    txtTotalTitle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
    },

    wallet: {
        borderRadius: 16,
        marginHorizontal: 20,
        marginTop: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    walletTitleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 12,
        marginVertical: 3,
    },
});
