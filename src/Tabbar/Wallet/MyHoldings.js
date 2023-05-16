import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
    Height,
    Width,
} from '@constants/theme';
import ManageChain from './ManageChain';
import { getWalletForChain } from '@database/sql';
import { apiGetChainAssets } from '@api/WalletAPIs';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import { DISPLAY_CHAIN_LIST } from '@constants/ConstStorage';

import CustomImage from '@components/CustomImage';
import { useFocusEffect } from '@react-navigation/native';
import { checkBalanceIsHidden } from '../TabbarFuncation';
import { useDispatch, useSelector } from 'react-redux';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import {
    checkNullOrEmpty,
    formatBalanceValue,
    holdingListBackgroundColour,
    filterChains,
} from '@constants/commonFuncation';
import CheckBox from '@react-native-community/checkbox';
import ConstantStrings from '@constants/ConstantStrings';
import LinearGradient from 'react-native-linear-gradient';
import { getWalletAddressWithChainList } from '@redux/Action/WalletWithChainsAction';
import { getTotalAssets } from '@redux/Action/HomeAction';

export default function MyHoldings({ navigation, chainList, eyeStatus, refreshTopBalance }) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);
    const WalletWithChainsReducer = useSelector(
        state => state.WalletWithChainsReducer,
    );

    const dispatch = useDispatch();
    const [showManageChain, setShowManageChain] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
    const [chainListWithAsset, setChainListWithAsset] = useState(null);
    const [mainChainListWithAsset, setMainChainListWithAsset] = useState(null);
    const [loader, setLoader] = useState(false);
    const [hideBalances, setHideBalances] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [alphabeticallySorted, setAlphabeticallySorted] = useState(true);
    useEffect(() => {
        displayData();
    }, [refresh]);

    useFocusEffect(
        useCallback(() => {
            displayData();
            checkBalanceIsHidden().then(() => { });
        }, []),
    );

    useEffect(() => {
        const walletList = WalletWithChainsReducer.walletList;
        if (
            walletList == null ||
            walletList == undefined ||
            walletList.length == 0
        ) {
            getWalletAddressWithChainList(dispatch);
        }
    }, []);

    const calculateTopBalance = (chainData) => {
        if (chainData?.length > 0) {
            let sum = 0;
            for (const chainItem of chainData) {
                if (chainItem?.asset?.currencyBalance)
                    sum += chainItem?.asset?.currencyBalance
                else sum += 0;
            }
            // let sum = chainData.reduce((a, c) => { return a + c?.asset?.currencyBalance }, 0);
            refreshTopBalance(formatBalanceValue(sum.toFixed(2)))
        } else if (chainData != null) {
            refreshTopBalance(0)
        }
    }
    useEffect(() => {
        if (chainListWithAsset) {
            if (alphabeticallySorted) {
                const temp = chainListWithAsset;

                filterChains(temp).then(result => {
                    result.sort((a, b) => {
                        if (a.mainChainInfo.symbol > b.mainChainInfo.symbol) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    setChainListWithAsset(result);
                    setTimeout(() => {
                        calculateTopBalance(result)
                        setShowRefreshIndicator(!showRefreshIndicator);
                    }, 500);
                });
            } else {
                const temp = chainListWithAsset;
                filterChains(temp).then(result => {
                    result.sort((a, b) => {
                        if (a.asset.balance > b.asset.balance) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });
                    setChainListWithAsset(result);
                    setTimeout(() => {
                        calculateTopBalance(result)
                        setShowRefreshIndicator(!showRefreshIndicator);
                    }, 500);
                });
            }
        }
    }, [alphabeticallySorted]);

    async function displayData() {
        const MainNetArray = [
            'AVAX',
            'BCH',
            'BSC',
            'BTC',
            'ETH',
            'LTC',
            'POLYGON',
        ];
        //    const MainNetArray = [1, 137, 43114, 56];
        const defaultAssetValue = {
            balance: '0',
            change: '0',
            currencyBalance: '0',
            rate: '0',
        };
        retrieveKeyValueData(DISPLAY_CHAIN_LIST).then(async savechainData => {
            setLoader(true);
            let arrSavechainData = checkNullOrEmpty(savechainData)
                ? []
                : JSON.parse(savechainData);
            if (savechainData != null && arrSavechainData.length > 0) {
                arrSavechainData.map(async item => {
                    const param = {
                        chainName: item.chainName,
                    };
                    const isMainNet = MainNetArray.includes(
                        item.chainName.toUpperCase(),
                    );
                    item.isMainNet = isMainNet;
                    const walletRows = await getWalletForChain(item.chainName);
                    item.isDisable =
                        walletRows.rows.item(0) == undefined ? true : false;
                    const asset = await apiGetChainAssets(param);
                    item.asset =
                        asset == null
                            ? defaultAssetValue
                            : JSON.parse(JSON.stringify(asset));

                });
                let tobeDisplayedData = arrSavechainData.filter(item => {
                    return item.show == true;
                });

                let filteredData = await filterChains(tobeDisplayedData);
                setMainChainListWithAsset(arrSavechainData);
                sortDataBasedOnSelection(filteredData);

            } else {
                chainList.map(async item => {
                    const param = {
                        chainName: item.chainName,
                    };
                    const isMainNet = MainNetArray.includes(
                        item.chainName.toUpperCase(),
                    );
                    item.isMainNet = isMainNet;
                    item.show = isMainNet;
                    const walletRows = await getWalletForChain(item.chainName);
                    item.isDisable =
                        walletRows.rows.item(0) == undefined ? true : false;
                    const asset = await apiGetChainAssets(param);
                    item.asset =
                        asset == null
                            ? defaultAssetValue
                            : JSON.parse(JSON.stringify(asset));
                });

                saveKeyValueData(DISPLAY_CHAIN_LIST, JSON.stringify(chainList));
                let tobeDisplayedData = chainList.filter(item => {
                    return item.show == true;
                });
                let filteredData = await filterChains(tobeDisplayedData);
                setMainChainListWithAsset(chainList);
                sortDataBasedOnSelection(filteredData);
            }
        }); //
    }

    const sortDataBasedOnSelection = (toBeSortedArray) => {
        if (alphabeticallySorted) {
            toBeSortedArray.sort((a, b) => {
                if (a.mainChainInfo.symbol > b.mainChainInfo.symbol) {
                    return 1;
                } else {
                    return -1;
                }
            });
        } else {
            toBeSortedArray.sort((a, b) => {
                if (a.asset.balance > b.asset.balance) {
                    return -1;
                } else {
                    return 1;
                }
            });
        }

        setChainListWithAsset(toBeSortedArray);
        setRefresh(false);
        setTimeout(() => {
            calculateTopBalance(toBeSortedArray)
            setLoader(false);
        }, 2000);
    }
    const ListEmptyComponent = () => {
        return (
            <View style={styles.noDataView}>
                <Text style={styles.txtTitle2}>
                    {ConstantStrings.NO_CHAIN_PRESENT}
                </Text>
                <Image
                    source={require('@assets/notEnoughGas.png')}
                    style={styles.gasIcon}
                    resizeMode={'contain'}
                />
            </View>
        );
    };

    const getStyles = status => {
        return status ? styles.selectedSortView : styles.nonSelectedSortView;
    };
    const RenderSortView = () => {
        return (
            <View style={styles.sortView}>
                <View style={{ padding: calculateHeight(8) }}>
                    <Text style={styles.sortByText}>
                        {ConstantStrings.SORT_BY}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setAlphabeticallySorted(true);
                        setShowSortMenu(false);
                    }}
                    style={getStyles(alphabeticallySorted)}>
                    <Text style={styles.sortByDefaultText}>
                        {ConstantStrings.DEFAULT}
                    </Text>
                    {alphabeticallySorted && (
                        <Image
                            resizeMode="contain"
                            source={require('@assets/saved_icon.png')}
                            style={[
                                styles.icon,
                                { tintColor: colors.purple_dark },
                            ]}
                        />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setAlphabeticallySorted(false);
                        setShowSortMenu(false);
                    }}
                    style={getStyles(!alphabeticallySorted)}>
                    <Text style={styles.sortByAmountText}>
                        {ConstantStrings.AMOUNT}
                    </Text>
                    {!alphabeticallySorted && (
                        <Image
                            resizeMode="contain"
                            source={require('@assets/saved_icon.png')}
                            style={[
                                styles.icon,
                                { tintColor: colors.purple_dark },
                            ]}
                        />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = item => {
        let url = item.item.mainChainInfo.symbolIcon;
        let icon = CurrencyReducer.currentCurrency.icon;
        let currency = item.item.asset
            ? formatBalanceValue(item.item.asset.currencyBalance)
            : '';


        let priceData = icon + ' ' + currency;
        if (!item.item.show) {
            return;
        } else {
            if (
                hideBalances &&
                item.item.asset &&
                parseFloat(item.item.asset.balance).toFixed(4) == 0
            ) {
                return null;
            }
            return (
                <LinearGradient
                    locations={[0, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={holdingListBackgroundColour(
                        item.item.mainChainInfo.name.trim(),
                    )}
                    style={styles.linearGradientContain}>
                    <TouchableOpacity
                        onPress={() => {
                            const eventObject = {
                                timeOfClick: new Date().toLocaleString(),
                            };
                            let eventName =
                                firebaseEvents.wallet +
                                item.item.chainName.toLowerCase();
                            firebaseAnalytics(eventName, eventObject);
                            navigation.navigate('CryptoDetails', {
                                selectedChain: item.item.chainName,
                            });
                        }}
                        style={styles.contain}>
                        <View style={styles.flexAlignStyle}>
                            <View style={styles.iconView}>
                                <CustomImage imageUrl={url} />
                            </View>
                            <View style={styles.flex1Style}>
                                <Text style={styles.mainText}>
                                    {item.item.mainChainInfo.symbol}
                                </Text>
                                <Text style={styles.subText}>
                                    {item.item.mainChainInfo.description.trim()}
                                </Text>
                            </View>
                            <View>
                                {!item.item.asset ||
                                    !item.item.mainChainInfo ||
                                    loader ? (
                                    <ActivityIndicator
                                        style={styles.indicatorStyle}
                                        color={
                                            colors.purple_dark
                                        }></ActivityIndicator>
                                ) : (
                                    <View>
                                        <Text
                                            style={[
                                                styles.mainText,
                                                styles.flexEndStyle,
                                            ]}>
                                            {!eyeStatus
                                                ? '*****'
                                                : item.item.asset &&
                                                parseFloat(
                                                    item.item.asset.balance,
                                                ).toFixed(4)}{' '}
                                            {item.item.mainChainInfo.symbol}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.subText,
                                                styles.flexEndStyle,
                                            ]}>
                                            {!eyeStatus ? '*****' : priceData}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            );
        }
    };
    return (
        <View style={styles.mainContainerStyle}>
            {showSortMenu && (
                <TouchableOpacity
                    onPress={() => {
                        setShowSortMenu(false);
                    }}
                    activeOpacity={1}
                    style={styles.sortMenuOutsideTouchableStyle}
                />
            )}
            {
                !showManageChain && <View style={styles.topOptionsViewStyle}>
                    <CheckBox
                        style={styles.checkboxStyles}
                        tintColors={{ true: colors.gray_textcolor, false: '#E4E4E4' }}
                        disabled={false}
                        value={hideBalances}
                        onValueChange={newValue => {
                            setHideBalances(newValue);
                        }}
                        boxType={'square'}
                        onAnimationType={'bounce'}
                        offAnimationType={'bounce'}
                        onCheckColor={colors.white}
                        onFillColor={colors.purple_dark}
                        onTintColor={colors.purple_dark}
                    />
                    <Text style={styles.HideBalanceText}>
                        {ConstantStrings.HIDE_ZERO_BALANCES}
                    </Text>
                    <TouchableOpacity
                        style={styles.filterButtons}
                        onPress={() => {
                            const eventObject = {
                                timeOfClick: new Date().toLocaleString(),
                            };
                            firebaseAnalytics(
                                firebaseEvents.wallet_manage_chains,
                                eventObject,
                            );
                            setShowManageChain(true);
                        }}>
                        <Image
                            source={require('@assets/filter.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <View>
                        {showSortMenu && <RenderSortView />}
                        <TouchableOpacity
                            disabled={showManageChain}
                            style={styles.filterButtons}
                            onPress={() => {
                                setShowSortMenu(true);
                            }}>
                            <Image
                                source={require('@assets/sortIcon.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        disabled={showManageChain}
                        onPress={() => {
                            getTotalAssets(dispatch);
                            displayData();
                        }}
                        style={[
                            styles.filterButtons,
                            styles.refreshListTouchableStyle,
                        ]}>
                        <Image
                            source={require('@assets/refreshList.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
            }

            <View style={styles.zinndexStyle}>
                {showManageChain ? (
                    <ManageChain
                        setRefresh={setRefresh}
                        setShowManageChain={setShowManageChain}
                        Refresh={refresh}
                        chainData={mainChainListWithAsset}
                    />
                ) : (
                    chainListWithAsset != null && (
                        <FlatList
                            data={chainListWithAsset}
                            renderItem={renderItem}
                            contentContainerStyle={
                                styles.flatlistContainerStyle
                            }
                            keyExtractor={(item, index) => index}
                            style={{
                                marginVertical: calculateHeight(10),
                                marginBottom: calculateHeight(50),
                            }}
                            ListEmptyComponent={ListEmptyComponent}
                        />
                    )
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    HideBalanceText: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        //  marginLeft: calculateWidth(1),
    },
    checkboxStyles: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
    },
    contain: {
        alignItems: 'center',
        borderRadius: 8,
    },

    filterButtons: {
        alignItems: 'center',
        backgroundColor: colors.ghost_white,
        borderRadius: 10,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(4),
        paddingHorizontal: calculateWidth(12),
        paddingVertical: calculateHeight(10),
    },
    flatlistContainerStyle: {
        paddingVertical: 10,
    },
    flex1Style: {
        flex: 1,
    },
    flexAlignStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flexEndStyle: {
        alignSelf: 'flex-end',
    },
    gasIcon: {
        height: calculateHeight(80),
        width: calculateHeight(80),
        // marginVertical: calculateHeight(24),
    },
    icon: {
        height: calculateHeight(15),
        width: calculateHeight(15),
    },

    iconView: {
        alignItems: 'center',
        height: 30,
        justifyContent: 'center',
        marginRight: 10,
        width: 30,
    },
    indicatorStyle: {
        height: 20,
        width: 20,
    },
    linearGradientContain: {
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 4,
        padding: 16,
    },
    mainContainerStyle: {
        marginHorizontal: 20,
    },
    mainText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
    },
    noDataView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: calculateWidth(12),
        paddingVertical: calculateHeight(24),
    },

    nonSelectedSortView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: calculateHeight(8),
    },

    refreshListTouchableStyle: {
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 30,
    },
    selectedSortView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: calculateHeight(8),
    },

    sortByAmountText: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    sortByDefaultText: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    sortByText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    sortMenuOutsideTouchableStyle: {
        height: Height,
        left: 0,
        position: 'absolute',
        right: 0,
        top: -Height / 2,
        width: Width,
    },
    sortView: {
        backgroundColor: colors.ghost_white,
        borderRadius: 12,
        elevation: 5,
        padding: calculateHeight(8),
        position: 'absolute',
        right: 0,
        shadowColor: colors.shadow1,
        shadowOffset: { height: 3, width: -3 },
        shadowOpacity: 0.12,
        top: 0,
        width: calculateWidth(133),
        zIndex: 1,
    },
    subText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginTop: 4,
    },

    topOptionsViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: calculateWidth(10),
    },
    txtTitle2: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginRight: calculateWidth(12),
        width: calculateWidth(152),
    },
    zinndexStyle: {
        zIndex: -1,
    },
});
