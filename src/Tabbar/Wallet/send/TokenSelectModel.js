import {
    ActivityIndicator,
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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { useSelector } from 'react-redux';
import { fonts, sizes } from '@constants/theme';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { SafeAreaView } from 'react-native';
import {
    getKeyboardType,
    formatBalanceValue,
} from '@constants/commonFuncation';
export default function TokenSelectModel({
    setSelectedTokenToSend,
    setShowTokenList,
    tokenList,
}) {
    const CurrencyReducer = useSelector(state => state.CurrencyReducer);

    const [searchText, setSearchText] = useState('');
    const [searchedArray, setSearchedArray] = useState();
    useEffect(() => {
        filterZeroBalanceValue()
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
                    <View
                        style={styles.iconContinerStyle}>
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
                                {CurrencyReducer.currentCurrency &&
                                    CurrencyReducer.currentCurrency.icon}{' '}
                                {item.item.currencyRate &&
                                    formatBalanceValue(item.item.currencyRate)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.border} />
            </>
        );
    };

    const filterZeroBalanceValue = () => {
        let filteredList = tokenList.filter(item => {
            return item.balance > 0 || item.contractAddr?.length == 0
        });
        setSearchedArray(filteredList);
    }
    useEffect(() => {
        if (searchText.length != 0) {
            const temp = tokenList.filter(item => {
                return item.symbol
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) && item.balance > 0;
            });
            setSearchedArray(temp);
        } else {
            filterZeroBalanceValue()
        }
    }, [searchText.length]);
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
                style={styles.safeAreaStyle}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.white}
                    barStyle={'dark-content'}
                />
                <View style={styles.parentView}>
                    <ScreenTopHeader
                        title={ConstantStrings.SELECT_TOKEN_TO_SEND}
                        topBackClick={topBackClick}
                        showBack={true}></ScreenTopHeader>

                    <View
                        style={styles.searchContainerStyle}>
                        <Image
                            source={require('@assets/search.png')}
                            style={[
                                styles.icon,
                                { tintColor: theme.colors.menuDotsTint },
                            ]}
                        />
                        <TextInput
                            onChangeText={text => {
                                setSearchText(text);
                            }}
                            style={styles.searchTokenTextInput}
                            placeholderTextColor={theme.colors.gray1_textcolor}
                            placeholder={ConstantStrings.SEARCHTOKEN}
                            selectionColor={theme.colors.gray1_textcolor}
                            keyboardType={getKeyboardType()}
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete={'off'}
                        />
                    </View>
                    <View
                        style={styles.containerStyle}>
                        <Text style={[styles.mainText, styles.flex1Style]}>
                            {ConstantStrings.CRYPTO_CURRENCY}
                        </Text>
                        <Text style={styles.subText}>{ConstantStrings.AVAILABLE}</Text>
                    </View>
                    <View style={styles.flex1Style}>
                        <FlatList
                            data={searchedArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index}
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
    containerStyle: {
        flexDirection: 'row',
        marginTop: 15,
        paddingHorizontal: 2,
    },
    flex1Style: {
        flex: 1,
    },
    flexEndStyle: {
        alignSelf: 'flex-end',
    },
    icon: {
        borderRadius: 22 / 2,
        height: 22,
        width: 22,
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

    parentView: {
        flex: 1,
        marginHorizontal: 20,
    },
    safeAreaStyle: {
        backgroundColor: theme.colors.white,
        flex: 1,
    },
    searchContainerStyle: {
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
    symbolContaierStyle: {
        flex: 1,
        marginLeft: 10,
    },
});
