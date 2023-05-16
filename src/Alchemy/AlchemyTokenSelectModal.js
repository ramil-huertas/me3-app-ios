import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    FlatList,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { useSelector } from 'react-redux';
import { colors, fonts, NativeBaseModalStyle, sizes } from '@constants/theme';
import { formatBalanceValue } from '@constants/commonFuncation';
import { calculateHeight } from '../../constant/theme';
import { SELECT_TOKEN } from '../../constant/ConstantStrings';
import { Modal } from 'native-base';

export default function AlchemyTokenSelectModal({
    setSelectedTokenToSend,
    setShowTokenList,
    tokenList,
    BuyTabSelected,
    showTokenList,
}) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);

    const [searchText, setSearchText] = useState('');
    const [searchedArray, setSearchedArray] = useState([]);

    const busd = 'busd';
    const eth = 'eth';
    const usdc = 'usdc';
    const usdt = 'usdt';

    useEffect(() => {
        if (!BuyTabSelected) {
            const list = tokenList.filter(item => {
                return (
                    item.symbol.toLowerCase() == busd ||
                    item.symbol.toLowerCase() == eth ||
                    item.symbol.toLowerCase() == usdc ||
                    item.symbol.toLowerCase() == usdt
                );
            });
            setSearchedArray(list);
        } else {
            setSearchedArray(tokenList);
        }
    }, []);
    const renderItem = item => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedTokenToSend(item.item);
                        setShowTokenList(false);
                    }}
                    style={styles.contain}>
                    <View style={styles.iconContinerStyle}>
                        <View style={styles.iconView}>
                            <CustomImage imageUrl={item.item.icon} />
                        </View>
                        <View style={styles.symbolContaierStyle}>
                            <Text style={styles.mainText}>
                                {item.item.symbol}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={[styles.mainText, styles.flexEndStyle]}>
                                {parseFloat(item.item.balance).toFixed(5)}{' '}
                                {item.item.symbol}
                            </Text>
                            <Text style={[styles.subText, styles.flexEndStyle]}>
                                {CurrencyReducer.currentCurrency &&
                                    CurrencyReducer.currentCurrency.icon}{' '}
                                {item.item.currencyRate &&
                                    formatBalanceValue(item.item.currencyRate)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        );
    };

    useEffect(() => {
        if (searchText.length != 0) {
            const temp = tokenList.filter(item => {
                return item.symbol
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
            if (!BuyTabSelected) {
                const list = temp.filter(item => {
                    return (
                        item.symbol.toLowerCase() == busd ||
                        item.symbol.toLowerCase() == eth ||
                        item.symbol.toLowerCase() == usdc ||
                        item.symbol.toLowerCase() == usdt
                    );
                });
                setSearchedArray(list);
            } else {
                setSearchedArray(temp);
            }
        } else {
            if (!BuyTabSelected) {
                const list = tokenList.filter(item => {
                    return (
                        item.symbol.toLowerCase() == busd ||
                        item.symbol.toLowerCase() == eth ||
                        item.symbol.toLowerCase() == usdc ||
                        item.symbol.toLowerCase() == usdt
                    );
                });
                setSearchedArray(list);
            } else {
                setSearchedArray(tokenList);
            }
        }
    }, [searchText.length]);
    return (
        <Modal
            isOpen={showTokenList}
            onClose={() => {
                setShowTokenList(false);
            }}
            size={'full'}
            animationPreset="fade"
            background={colors.popupBgcolor}>
            <Modal.Content style={NativeBaseModalStyle.setBottomModal}>
                <Modal.Header
                    style={NativeBaseModalStyle.HeaderFooterStyle}
                    pl={'6'}
                    pr={'6'}>
                    <View style={styles.titleView}>
                        <Text style={styles.title}>{SELECT_TOKEN}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowTokenList(false);
                            }}>
                            <Image
                                source={require('@assets/close.png')}
                                style={[
                                    theme.customStyle.closeIcon,
                                    { tintColor: theme.colors.gray1_textcolor },
                                ]}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.mainText}>
                        {ConstantStrings.CRYPTO_CURRENCY}
                    </Text>
                </Modal.Header>
                <Modal.Body _scrollview={{ bounces: false }} pt={'0'}>
                    <FlatList
                        data={searchedArray}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        ItemSeparatorComponent={() => {
                            return <View style={styles.border} />;
                        }}
                        contentContainerStyle={{ paddingBottom: 15 }}
                    />
                </Modal.Body>
            </Modal.Content>
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

    flexEndStyle: {
        alignSelf: 'flex-end',
    },

    iconContinerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        lineHeight: theme.sizes.lh20,
    },
    subText: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        lineHeight: theme.sizes.lh14,
        marginTop: 4,
    },
    symbolContaierStyle: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        color: theme.colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
    },

    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: calculateHeight(15),
    },
});
