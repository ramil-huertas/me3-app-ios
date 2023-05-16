import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
    fonts,
    sizes,
} from '@constants/theme';
import { theme } from '@constants';
import { SELECT_CURRENCY } from '@constants/ConstantStrings';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { useDispatch } from 'react-redux';
import { resetAssestsState, getTotalAssets } from '@redux/Action/HomeAction';
import { resetStateTokens } from '@redux/Action/TokenAction';
import { resetStateSwapAllData } from '@redux/Action/SwapAction';

export default function SelectCurrency({
    setShowCurrencyPopupStatus,
    setSelectedCurrency,
    currentCurrency,
}) {
    const dispatch = useDispatch();
    const DATA = [
        {
            createTime: '2022-05-27 03:54:52',
            fiat: 'USD',
            icon: '$',
            id: 1,
            name: 'United State Dollar',
            sort: 1,
            updateTime: '2022-05-27 03:54:52',
            image: require('@assets/flag_us.png'),
        },
        {
            createTime: '2022-10-27 23:54:11',
            fiat: 'IDR',
            icon: 'Rp',
            id: 2,
            name: 'Indonesian Rupiah',
            sort: 2,
            updateTime: '2022-10-27 23:54:11',
            image: require('@assets/flag_indo.png'),
        },
        {
            createTime: '2022-12-09 14:02:50',
            fiat: 'PHP',
            icon: '₱',
            id: 3,
            name: 'Philippine Peso',
            sort: 3,
            updateTime: '2022-12-09 14:02:50',
            image: require('@assets/flag_Php.png'),
        },
        {
            createTime: '2022-12-09 14:04:50',
            fiat: 'THB',
            icon: '฿',
            id: 4,
            name: 'Thailand Baht',
            sort: 4,
            updateTime: '2022-12-09 14:04:50',
            image: require('@assets/flag_Thb.png'),
        },
        {
            createTime: '2022-12-09 14:04:50',
            fiat: 'SGD',
            icon: '$',
            id: 5,
            name: 'Singapore Dollars',
            sort: 5,
            updateTime: '2022-12-09 14:04:50',
            image: require('@assets/flag_Sgd.png'),
        },
    ];

    const renderItem = Item => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        resetAssestsState(dispatch);
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        if (Item.item.fiat == 'IDR') {
                            firebaseAnalytics(
                                firebaseEvents.settings_currency_IDR,
                                eventObject,
                            );
                        } else {
                            firebaseAnalytics(
                                firebaseEvents.settings_currency_USD,
                                eventObject,
                            );
                        }
                        setSelectedCurrency(Item.item);
                        resetStateTokens(dispatch)
                        resetStateSwapAllData(dispatch)
                        getTotalAssets(dispatch);
                        setShowCurrencyPopupStatus(false);
                    }}>
                    <View
                        style={
                            currentCurrency &&
                                currentCurrency.fiat == Item.item.fiat
                                ? styles.detailsSelectedView
                                : styles.detailsView
                        }>
                        <Image
                            style={styles.iconStyle}
                            source={Item.item.image}></Image>
                        <View style={styles.cyptoSubView}>
                            <View style={styles.backupTextView}>
                                <Text style={styles.txtCyptoHead}>
                                    {Item.item.name}
                                    <Text style={styles.fiatTextStyle}>
                                        {' '}
                                        ({Item.item.icon})
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            animationType="fade"
            onRequestClose={() => {
                setShowCurrencyPopupStatus(false);
            }}
            transparent={true}>
            <View style={styles.contain}>
                <View style={styles.popupView}>
                    <View style={styles.titleView}>
                        <Text style={styles.title}>{SELECT_CURRENCY}</Text>
                        <TouchableOpacity onPress={onCancelClick}>
                            <Image
                                source={require('@assets/close.png')}
                                style={theme.customStyle.closeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={styles.flatListContainer}
                        style={styles.flatList}></FlatList>
                </View>
            </View>
        </Modal>
    );

    function onCancelClick() {
        setShowCurrencyPopupStatus(false);
    }
}

const styles = StyleSheet.create({
    backupTextView: {
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 10,
    },

    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'flex-end',
    },

    cyptoSubView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },

    detailsSelectedView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: calculateHeight(4),
        paddingLeft: calculateWidth(16),
        padding: calculateHeight(12),
    },

    detailsView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: calculateHeight(4),
        paddingLeft: calculateWidth(16),
        padding: calculateHeight(12),
    },

    fiatTextStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },

    flatList: {
        marginBottom: calculateHeight(16),
        marginHorizontal: calculateWidth(24),
    },
    flatListContainer: { paddingBottom: 5 },
    iconStyle: {
        height: 25,
        marginRight: 8,
        resizeMode: 'contain',
        width: 25,
    },

    popupView: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: calculateHeight(10),

        // height: '50%'
    },

    title: {
        color: colors.mainColor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
    },

    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 28,
        paddingHorizontal: 10,
    },
    txtCyptoHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
});
