import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    RefreshControl,
    Platform,
    LogBox,
    TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import { MANAGE_TOKEN, SEARCHTOKEN } from '@constants/ConstantStrings';
import AddToken from './AddToken';
import CustomImage from '@components/CustomImage';
import { useDispatch, useSelector } from 'react-redux';
import { getKeyboardType, formatBalanceValue } from '@constants/commonFuncation';
import axios from 'axios';
import { saveTokenListAndChain, updateMainCurrencyOnRefresh, updateTokenListFromApiItems } from '@redux/Action/TokenAction';
import ManageTokens from './ManageTokens';
import { apiGetCoinList } from '@api/CoinApis';
import { logger } from '@constants/Log';
LogBox.ignoreLogs([
    'Received data was not a string, or was not a recognised encoding',
]);

const Tokens = ({ navigation, clickedWallet, chainName, address }) => {
    const dispatch = useDispatch();
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);
    const TokenReducer = useSelector(state => state.TokenReducer);
    const [data, setData] = useState([]);
    const [searchedArray, setSearchedArray] = useState(data);
    const [searchText, setSearchText] = useState('');
    const [showAddTokenModal, setShowAddTokenModal] = useState(false);
    const [isShowManageTokens, setIsShowManageTokens] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (searchText.length != 0) {
            const temp = data.filter(item => {
                return item.symbol
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
            setSearchedArray(temp);
        } else {
            setSearchedArray(data);
        }
    }, [searchText.length]);

    useEffect(() => {
        refreshList([]);
    }, []);

    // in this method updated token list passed from AddCustomToken
    // because sometime redux data not getting reflacted directly here in RefreshList() method
    function tokenAddedCallback(dataList) {
        setIsShowManageTokens(false)
        refreshList(dataList);
    }

    const onManageTokensClick = () => {
        setIsShowManageTokens(true);
    };


    const refreshListOnPullTo = () => {
        const tempData = TokenReducer.mergedList.filter(item => {
            return (
                item.chainName.toLowerCase() ==
                clickedWallet.chain.toLowerCase()
            );
        });
        if (tempData.length > 0) {
            setIsRefreshing(true);
            setData(null);
            setSearchedArray(null);
            let params = {
                chainName: chainName,
                address: address,
                pageNo: 1,
                pageSize: '10000000000',
            };

            apiGetCoinList(params)
                .then(data => {
                    let updated = data.data.map(item => {
                        let tokenDetail = TokenReducer.mergedList.find(token_item => {
                            return token_item.id == item.id;
                        });
                        if (item.balance > 0)
                            tokenDetail.isShow = true
                        tokenDetail.balance = item.balance
                        return tokenDetail ? tokenDetail : false;
                    });
                    const tempDataFilter = updated.filter(item => {
                        return (
                            item.contractAddr?.length > 0
                        );
                    });
                    data.mainCurrency.isShow = true
                    let newList = [data.mainCurrency, ...tempDataFilter]
                    setData(newList);
                    setSearchedArray(newList);
                    setIsRefreshing(false);

                    const data1 = TokenReducer.mergedList
                    updateTokenListFromApiItems(dispatch, data1);

                    const mCurrency = TokenReducer.mainCurrency.filter(item => {
                        return (
                            item.chainName.toLowerCase() !=
                            clickedWallet.chain.toLowerCase()
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
    const refreshList = async (dataListFrommCustom) => {
        setIsRefreshing(true);
        const tempData = TokenReducer.mergedList.filter(item => {
            return (
                item.chainName.toLowerCase() ==
                clickedWallet.chain.toLowerCase()
            );
        });

        if (tempData.length == 0) {
            const result = await saveTokenListAndChain(
                dispatch,
                clickedWallet.chain,
                clickedWallet.address,
                TokenReducer.mergedList,
            );

            result.data.map(async item => {
                if (item.icon.startsWith('ipfs')) {
                    item.icon = `https://ipfs.io/ipfs/${item.icon.slice(7)}`;
                }
                await axios.get(item.icon).catch(error => {
                    if (error.message.includes('404')) {
                        item.icon = null;
                    }
                });
                if (item.balance > 0)
                    item.isShow = true
                else
                    item.isShow = false
            });

            const tempDataFilter = result.data.filter(item => {
                return (
                    item.contractAddr?.length > 0
                );
            });
            result.mainCurrency.isShow = true
            let newList = [result.mainCurrency, ...tempDataFilter]
            setData(newList);
            setSearchedArray(newList);
            setIsRefreshing(false);
        } else {
            const tempData1 = TokenReducer.mainCurrency.filter(item => {
                return (
                    item.chainName.toLowerCase() ==
                    clickedWallet.chain.toLowerCase()
                );
            });
            let contractFilter;
            if (dataListFrommCustom?.length > 0) {
                contractFilter = dataListFrommCustom.filter(item => {
                    return (
                        item.contractAddr?.length > 0
                    );
                });
            } else {
                contractFilter = tempData.filter(item => {
                    return (
                        item.contractAddr?.length > 0
                    );
                });
            }
            tempData1[0].isShow = true
            let newList = [tempData1[0], ...contractFilter]
            newList.map(async item => {
                if (item.icon.startsWith('ipfs')) {
                    item.icon = `https://ipfs.io/ipfs/${item.icon.slice(7)}`;
                }
                // item.isShow = true
                await axios.get(item.icon).catch(error => {
                    if (error.message.includes('404')) {
                        item.icon = null;
                    }
                });
            });
            setData(newList);
            setSearchedArray(newList);
            setIsRefreshing(false);
        }
    };
    const renderItem = item => {
        if (item.item.isShow) {
            return (
                <>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Send', {
                                clickedWallet: clickedWallet,
                                selectedTokenToSend: item.item,
                            });
                        }}
                        style={styles.contain}>
                        <View
                            style={styles.searchViewContainerStyle}>
                            <View style={styles.iconView}>
                                <CustomImage imageUrl={item.item.icon} />
                            </View>
                            <View style={styles.flex1style}>
                                <Text style={styles.mainText}>
                                    {item.item.symbol}
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={[
                                        styles.mainText,
                                        styles.flexEndStyle,
                                    ]}>
                                    {parseFloat(item.item.balance).toFixed(4)}{' '}
                                    {item.item.symbol}
                                </Text>
                                <Text
                                    style={[
                                        styles.subText,
                                        styles.flexEndStyle,
                                    ]}>
                                    {CurrencyReducer.currentCurrency &&
                                        CurrencyReducer.currentCurrency.icon}{' '}
                                    {formatBalanceValue(item.item.currencyRate)}
                                </Text>
                            </View>
                        </View>

                    </TouchableOpacity>
                    <View style={styles.border} />
                </>
            );
        }
    };
    return (
        <View style={styles.flex1style}>
            {isShowManageTokens && (
                <ManageTokens
                    setIsShowManageTokens={setIsShowManageTokens}
                    isShowManageTokens={isShowManageTokens}
                    clickedWallet={clickedWallet}
                    chainName={chainName}
                    address={address}
                    tokenAddedCallback={tokenAddedCallback}
                />
            )}
            <View style={styles.searchViewContainerStyle}>
                <View
                    style={styles.searchInnerContainerStyle}>
                    <Image
                        source={require('@assets/search.png')}
                        style={[
                            styles.icon,
                            { tintColor: colors.menuDotsTint },
                        ]}
                    />
                    <TextInput
                        value={searchText}
                        onChangeText={text => {
                            setSearchText(text);
                        }}
                        style={styles.searchTokenTextInput}
                        placeholderTextColor={colors.gray1_textcolor}
                        placeholder={SEARCHTOKEN}
                        selectionColor={colors.gray1_textcolor}
                        keyboardType={getKeyboardType()}
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete={'off'}
                    />
                </View>
                <TouchableOpacity style={styles.addToken} onPress={onManageTokensClick}>
                    <Text style={styles.addTokenText}>{`${MANAGE_TOKEN}`}</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={searchedArray}
                renderItem={renderItem}
                keyExtractor={(item, index) => index}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshListOnPullTo}
                    />
                }
            />
        </View>
    );
};

export default Tokens;
const styles = StyleSheet.create({
    addToken: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 20,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addTokenText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    border: {
        borderBottomColor: colors.menuDotsTint,
        borderBottomWidth: 1,
        marginHorizontal: 24,
        marginTop: 10,
        opacity: 0.1,
    },
    contain: {
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 16,
    },

    flex1style: {
        flex: 1,
    },
    flexEndStyle: {
        alignSelf: 'flex-end',
    },
    icon: {
        height: 24,
        width: 24,
    },
    iconView: {
        alignItems: 'center',
        height: 24,
        justifyContent: 'center',
        marginRight: 10,
        width: 24,
    },

    mainText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
    },
    searchInnerContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        flex: 2,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    searchTokenTextInput: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 : 4,
    },
    searchViewContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    subText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginTop: 4,
    },

});
