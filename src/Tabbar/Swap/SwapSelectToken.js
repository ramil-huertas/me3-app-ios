import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Image,
    TextInput,
    Platform,
    FlatList,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { logger } from '@constants/Log';
import { useDispatch, useSelector } from 'react-redux';
import { fonts, sizes } from '@constants/theme';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { getKeyboardType, formatBalanceValue } from '@constants/commonFuncation';
import { apiGetCoinList } from '@api/CoinApis';
import { updateMainCurrencyOnRefresh, updateTokenListFromApiItems } from '@redux/Action/TokenAction';
import { setPayChain } from '@redux/Action/SwapAction';
export default function SwapSelectToken({
    setShowTokenList,
    swapSymbolList,
    clickedType,
    changePay,
    changeReceive,
    currentClickedWallet
}) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);
    const TokenReducer = useSelector(state => state.TokenReducer)
    const swapReducer = useSelector(state => state.SwapReducer)
    const [searchText, setSearchText] = useState('');
    const [searchedArray, setSearchedArray] = useState(swapSymbolList);
    const [isRefreshing, setIsRefreshing] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        if (clickedType == 'pay')
            filterZeroBalanceValue()
        else
            setSearchedArray(swapSymbolList);
    }, []);
    const filterZeroBalanceValue = () => {
        let filteredList = swapSymbolList.filter(item => {
            return item.balance > 0 || item.contractAddr?.length == 0
        });
        setSearchedArray(filteredList);
    }

    const checkForTypeAndFilterRecords = (data) => {
        if (clickedType == 'pay') {
            let filteredList = data.filter(item => {
                return item.balance > 0 || item.contractAddr?.length == 0
            });
            setSearchedArray(filteredList);
        } else {
            setSearchedArray(data)
        }
    }

    useEffect(() => {
        if (searchText.length != 0) {
            const temp = swapSymbolList.filter(item => {
                return item.symbol
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
            setSearchedArray(temp);
        } else {
            if (clickedType == 'pay')
                filterZeroBalanceValue()
            else
                setSearchedArray(swapSymbolList);
        }
    }, [searchText.length]);

    function refreshListOnPullTo() {

        const tempData = TokenReducer.mergedList.filter(item => {
            return (
                item.chainName.toLowerCase() ==
                currentClickedWallet.chain.toLowerCase()
            );
        });
        if (tempData.length > 0) {
            setIsRefreshing(true);
            setSearchedArray(null);
            let params = {
                chainName: currentClickedWallet.chain,
                address: currentClickedWallet.address,
                pageNo: 1,
                pageSize: '10000000000',
            };

            apiGetCoinList(params)
                .then(data => {
                    const paySymbolDetail = swapReducer.paySymbolDetails
                    let updated = data.data.map(item => {
                        let tokenDetail = TokenReducer.mergedList.find(token_item => {
                            return token_item.id == item.id;
                        });
                        tokenDetail.balance = item.balance
                        if (paySymbolDetail.id == item.id) {
                            dispatch(setPayChain(item))
                        }
                        if (item.balance > 0)
                            tokenDetail.isShow = true
                        return tokenDetail ? tokenDetail : false;
                    });
                    checkForTypeAndFilterRecords(updated)
                    setIsRefreshing(false);

                    const data1 = TokenReducer.mergedList
                    updateTokenListFromApiItems(dispatch, data1);

                    const mCurrency = TokenReducer.mainCurrency.filter(item => {
                        return (
                            item.chainName.toLowerCase() !=
                            currentClickedWallet.chain.toLowerCase()
                        );
                    });

                    let dataMainCurency = data.mainCurrency;
                    dataMainCurency.isShow = true
                    let newCurrencyList = [...mCurrency, dataMainCurency]
                    updateMainCurrencyOnRefresh(dispatch, newCurrencyList)

                })
                .catch(error => {
                    logger(error);
                });
        }
    }
    const renderItem = item => {
        if (item.item.coinType == 0 && item.item.canSwap == 1)
            return (
                <>
                    <TouchableOpacity
                        onPress={() => {
                            if (clickedType == 'pay') {
                                changePay(item.item);
                            } else if (clickedType == 'receive')
                                changeReceive(item.item);
                            setShowTokenList(false);
                        }}
                        style={styles.contain}>
                        <View
                            style={styles.imageContainerStyle}>
                            <View style={styles.iconView}>
                                
                                <CustomImage imageUrl={item.item.icon} />
                            </View>
                            <View style={styles.symbolContainerStyle}>
                                <Text style={styles.mainText}>
                                    {item.item.symbol}
                                </Text>
                                <Text style={styles.subText}>
                                    {item.item.symbol}
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={[
                                        styles.mainText,
                                        styles.flexEndStyle,
                                    ]}>
                                    {`${parseFloat(item.item.balance).toFixed(5)} ${item.item.symbol}`}
                                </Text>
                                <Text
                                    style={[
                                        styles.subText,
                                        styles.flexEndStyle,
                                    ]}>
                                    {`${CurrencyReducer.currentCurrency?.icon} ${item.item.currencyRate &&
                                        formatBalanceValue(
                                            item.item.currencyRate,
                                        )}`}

                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.border} />
                </>
            );
    };

    const topBackClick = () => {
        setShowTokenList(false);
    };

    return (
        <Modal
            onRequestClose={() => {
                setShowTokenList(false);
            }}
            transparent={true}>
            <SafeAreaView
                style={styles.safeareaviewStyle}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.white}
                    barStyle={'dark-content'}
                />
                <View style={styles.parentView}>
                    <ScreenTopHeader
                        title={ConstantStrings.SELECT_TOKEN_TO_SWAP}
                        topBackClick={topBackClick}
                        showBack={true}></ScreenTopHeader>
                    <View
                        style={styles.searchIconContainerStyle}>
                        <Image
                            source={require('@assets/search.png')}
                            style={[
                                styles.icon,
                                { tintColor: theme.colors.menuDotsTint },
                            ]}
                        />
                        <TextInput
                            keyboardType={getKeyboardType()}
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete={'off'}
                            onChangeText={text => {
                                setSearchText(text);
                            }}
                            style={styles.searchTokenTextInput}
                            placeholderTextColor={theme.colors.gray1_textcolor}
                            placeholder={ConstantStrings.SEARCHTOKEN}
                            selectionColor={theme.colors.gray1_textcolor}
                        />
                    </View>
                    <View
                        style={styles.cryptoCurrencyViewStyle}>
                        <Text style={styles.mainText}>
                            {ConstantStrings.CRYPTO_CURRENCY}
                        </Text>
                        <Text style={styles.subText}>
                            {ConstantStrings.AVAILABLE}
                        </Text>
                    </View>
                    <View style={styles.container}>
                        <FlatList
                            data={searchedArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index}
                            contentContainerStyle={styles.paddingBtm10}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={refreshListOnPullTo}
                                />
                            }
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    border: {
        borderBottomColor: theme.colors.menuDotsTint,
        borderBottomWidth: 1,
        marginHorizontal: 24,
        marginTop: 10,
        opacity: 0.1,
    },
    contain: {
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 16,
    },
    container: { flex: 1 },
    cryptoCurrencyViewStyle: {
        flexDirection: 'row',
        marginTop: 15,
        paddingHorizontal: 2,
    },
    flexEndStyle: {
        alignSelf: 'flex-end',
    },
    icon: {
        borderRadius: 22 / 2,
        height: 22,
        width: 22,
    },
    imageContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        lineHeight: theme.sizes.lh20,
    },
    paddingBtm10: { paddingBottom: 10 },
    parentView: {
        flex: 1,
        marginHorizontal: 20,
    },
    safeareaviewStyle: {
        backgroundColor: theme.colors.white,
        flex: 1,
    },
    searchIconContainerStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.gray_background_1,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    searchTokenTextInput: {
        color: theme.colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 : 4,
    },
    subText: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        lineHeight: theme.sizes.lh14,
        marginTop: 4,
    },
    symbolContainerStyle: {
        flex: 1,
        marginLeft: 10,
    },
});
