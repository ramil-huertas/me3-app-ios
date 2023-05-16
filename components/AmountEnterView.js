import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useState } from 'react';
import ConstantStrings from '@constants/ConstantStrings';
import { countDecimalPoint } from '../src/Tabbar/TabbarFuncation';
import CustomImage from '@components/CustomImage';
import {
    calculateHeight,
    calculateWidth,
    flexDirectionRow,
    sizes,
    colors,
    fonts,
} from '@constants/theme';

export default function AmountEnterView({
    sendAmount,
    setSendAmount,
    selectedTokenToSend,
    setShowTokenList,
    previewClicked,
    isShowNumberError,
    setNumberShowErrorStatus,
    numberErrorMessage,
    setNumberShowErrorMessage,
}) {
    const [isRefresh, setIsRefresh] = useState(false);
    function validationForBalance(amount) {
        let balance_check =
            parseFloat(amount) <=
            parseFloat(selectedTokenToSend && selectedTokenToSend.balance);
        const countResult = countDecimalPoint(amount);
        if (amount != '' && !balance_check) {
            setNumberShowErrorStatus(true);
            setNumberShowErrorMessage(
                `${ConstantStrings.YOU_DO_NOT_HAVE_ENOUGH} ${selectedTokenToSend && selectedTokenToSend.symbol
                }`,
            );
        } else if (countResult > 1) {
            setNumberShowErrorStatus(true);
            setNumberShowErrorMessage(`Invalid amount format`);
        } else {
            setNumberShowErrorStatus(false);
        }
        setIsRefresh(!isRefresh);
    }
    return (
        <View>
            <View style={styles.parentView}>
                <View style={flexDirectionRow}>
                    <View style={styles.flex1Style}>
                        <TextInput
                            value={sendAmount}
                            onChangeText={text => {
                                setSendAmount(text);
                                let amount = text;
                                validationForBalance(amount);
                            }}
                            keyboardType={'numeric'}
                            style={styles.searchTokenTextInput}
                            placeholderTextColor={colors.gray1_textcolor}
                            placeholder={'0.00'}
                            selectionColor={colors.gray1_textcolor}
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete={'off'}
                        />
                        {/* commented temporary <Text style={styles.subTextStylel}>{CurrencyReducer.currentCurrency && CurrencyReducer.currentCurrency.icon} {(sendAmount * mainCurrency.usdtRate).toFixed(5)}</Text> */}
                    </View>
                    <View
                        style={styles.containerViewSstyle}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            setShowTokenList(true);
                        }}>
                        <View style={styles.setShowTokenListTouchable}>
                            <View>
                                <CustomImage
                                    imageUrl={
                                        selectedTokenToSend &&
                                        selectedTokenToSend.icon
                                    }
                                />
                            </View>
                            <Text
                                style={styles.symbolText}>
                                {selectedTokenToSend &&
                                    selectedTokenToSend.symbol}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.MaxText}>
                {ConstantStrings.MAX}
                <Text style={styles.MaxAmountText}>
                    {` ${selectedTokenToSend &&
                        selectedTokenToSend.balance &&
                        parseFloat(selectedTokenToSend.balance).toFixed(4)}  ${selectedTokenToSend && selectedTokenToSend.symbol}`}
                </Text>
            </Text>
            {isShowNumberError && (
                <Text style={[styles.subText, { color: colors.error_color }]}>
                    {numberErrorMessage}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  MaxAmountText: {
        color: colors.purple_dark,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginTop: calculateHeight(8),
        paddingVertical: calculateHeight(0),
    },
    MaxText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginTop: calculateHeight(8),
        paddingVertical: calculateHeight(0),
    },
    containerViewSstyle: {
        backgroundColor: colors.gray1_textcolor,
        height: 28,
        width: 1,
    },
    flex1Style: {
    flex: 1,
  },
    parentView: {
        backgroundColor: colors.white,
        borderColor: colors.white,
        borderRadius: 10,
        borderWidth: 1,
        marginVertical: calculateHeight(5),
        paddingLeft: calculateWidth(12),
        paddingRight: calculateWidth(8),
        paddingVertical: calculateHeight(6),
    },

    searchTokenTextInput: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        paddingVertical: sizes.mvp8,
    },
    setShowTokenListTouchable: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    subText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginTop: 4,
    },
    symbolText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        marginLeft: 5
    },
});
