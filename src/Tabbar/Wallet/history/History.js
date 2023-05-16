import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
    SectionList,
} from 'react-native';
import React, { useState } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import {
    NOTRANSACTIONSYET,
    PENDING,
    REJECTED,
    SUCCESSFUL,
    FROM,
    TO,
} from '@constants/ConstantStrings';
import { apiGetHistory } from '@api/TransactionApis';
import { useFocusEffect } from '@react-navigation/native';
var _ = require('lodash');
import { logger } from '@constants/Log';
import { checkType } from '@constants/commonFuncation';
const History = ({ chainName, address, navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [refreshFlatList, setRefreshFlatList] = useState(false);
    const [allData, setAllData] = useState([]);
    const [data, setData] = useState([]);

    function checkTransationStatus(status) {
        if (status == '0') {
            return PENDING;
        } else if (status == '1') {
            return SUCCESSFUL;
        } else {
            return REJECTED;
        }
    }

    const renderItem = item => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                // onPress={() => {
                //   logger("historyItemClick ::", item.item);
                //   navigation.navigate("HistoryDetail", { data: item.item, chainName: chainName, address: address })
                // }}
                style={styles.contain}>
                <View style={styles.renderItemContainerStyle}>
                    <View
                        style={[
                            styles.iconView,
                            {
                                backgroundColor: checkType(item.item, false)
                                    .tintColor,
                            },
                        ]}>
                        <Image
                            source={checkType(item.item, false).img}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.styleFlex1}>
                        <View
                            style={styles.titleStyle}>
                            <Text style={styles.mainText}>
                                {checkType(item.item, false).title}
                            </Text>
                            <View
                                style={
                                    checkTransationStatus(
                                        item.item.tx_status,
                                    ) === PENDING
                                        ? styles.statusDisplayPending
                                        : checkTransationStatus(
                                            item.item.tx_status,
                                        ) === SUCCESSFUL
                                            ? styles.statusDisplaySuccess
                                            : styles.statusDisplayReject
                                }
                            />
                            <Text
                                style={
                                    checkTransationStatus(
                                        item.item.tx_status,
                                    ) === PENDING
                                        ? styles.PendingText
                                        : checkTransationStatus(
                                            item.item.tx_status,
                                        ) === SUCCESSFUL
                                            ? styles.SuccessText
                                            : styles.RejectText
                                }>
                                {checkTransationStatus(item.item.tx_status)}
                            </Text>
                            {/* </View> */}
                        </View>
                        <Text
                            numberOfLines={1}
                            style={styles.subText}>
                            {checkType(item.item, false).description}
                        </Text>
                    </View>
                    <View>
                        <Text
                            style={[
                                styles.mainText,
                                styles.symbolFlexEndStyle,
                            ]}>
                            {item.item.amount} {item.item.symbol}
                        </Text>

                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyComponent = () => {
        return (
            <View
                style={styles.emptyContainerStyle}>
                <Image
                    style={styles.noHistoryImageStyle}
                    source={require('@assets/noHistory.png')}
                />
                <Text style={styles.emptyText}>{NOTRANSACTIONSYET}</Text>
            </View>
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            refreshList();
        }, []),
    );

    const refreshList = () => {
        logger('HISTORY API CALL');
        setCurrentPage(0);
        GetHistory(false, 0);
    };

    const GetHistory = (isLoadMore, CurentPage) => {
        setIsRefreshing(true);
        const params = {
            address: address, //
            page: CurentPage,
            pageSize: 30,
            symbolType: chainName,
            type: 0,
        };

        logger('Request', params);
        apiGetHistory(params)
            .then(responceData => {
                if (isLoadMore) {
                    logger(isLoadMore);
                    let tempArray = allData.concat(responceData.lightTxResList);

                    const sorted = tempArray.sort((a, b) => {
                        const dateA = new Date(`${a.dateTime}`).valueOf();
                        const dateB = new Date(`${b.dateTime}`).valueOf();
                        if (dateA > dateB) {
                            return -1; // return -1 here for DESC order
                        }
                        return 1; // return 1 here for DESC Order
                    });
                    setAllData(sorted);
                    logger('LOAD MORE');
                    logger('sorted', sorted);
                    let filteredData = _.chain(sorted)
                        .groupBy('dateTime')
                        .map((value, key) => ({ title: key, data: value }))
                        .value();
                    logger('filtered data ', filteredData);
                    setData(filteredData);

                    setRefreshFlatList(!refreshFlatList);
                } else {
                    logger('Total Page', responceData.lightTxResList.legnth);
                    setTotalPage(responceData.pageCount);
                    logger(responceData.lightTxResList);

                    let data = responceData.lightTxResList;
                    setAllData(data);
                    let filteredData = _.chain(data)
                        .groupBy('dateTime')
                        .map((value, key) => ({ title: key, data: value }))
                        .value();
                    logger('filtered data ', filteredData);
                    setData(filteredData);
                }
                setIsRefreshing(false);
            })
            .catch(error => {
                logger(error);
                setIsRefreshing(false);
            });
    };

    const handleLoadMore = () => {
        if (currentPage <= totalPage && hasScrolled) {
            var updateCount = currentPage + 1;
            setCurrentPage(updateCount);
            logger('load more calling');
            GetHistory(true, updateCount);
            setHasScrolled(false);
        }
    };

    return (
        <View style={styles.containerStyle}>
            <SectionList
                stickySectionHeadersEnabled={false}
                extraData={refreshFlatList}
                onScroll={() => setHasScrolled(true)}
                onEndReached={handleLoadMore}
                sections={data}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshList}
                    />
                }
                ListEmptyComponent={EmptyComponent}
                renderItem={renderItem}
                renderSectionHeader={({ section }) => (
                    <Text
                        style={[
                            styles.mainText,
                            styles.dateHeaderStyle,
                        ]}>
                        {new Date(section.title).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                )}
                keyExtractor={(item, index) => index}
            />
        </View>
    );
};

export default History;
const styles = StyleSheet.create({
    PendingText: {
        color: colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    RejectText: {
        color: colors.offRed,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    SuccessText: {
        color: colors.success,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    contain: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        marginVertical: 4,
        padding: 16,
    },
    containerStyle: {
        flex: 1,
        marginBottom: 12,
    },
    dateHeaderStyle: {
        marginBottom: 12,
        marginTop: 12,
    },
    emptyContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 58,
    },
    emptyText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.f14,
    },
    icon: {
        height: calculateHeight(18),
        tintColor: colors.white,
        width: calculateHeight(18),
    },
    iconView: {
        alignItems: 'center',
        borderRadius: 100,
        justifyContent: 'center',
        marginRight: 10,
        padding: calculateHeight(8),
    },
    mainText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginRight: calculateWidth(8),
    },
    noHistoryImageStyle: {
        height: 140,
        width: 140,
    },
    renderItemContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    statusDisplayPending: {
        backgroundColor: colors.purple_button_color,
        borderRadius: 5,
        height: 5,
        justifyContent: 'center',
        marginRight: 4,
        width: 5,
    },

    statusDisplayReject: {
        backgroundColor: colors.offRed,
        borderRadius: 5,
        height: 5,
        justifyContent: 'center',
        marginRight: 4,
        width: 5,
    },
    statusDisplaySuccess: {
        backgroundColor: colors.success,
        borderRadius: 5,
        height: 5,
        marginRight: 4,
        width: 5,
    },
    styleFlex1: {
        flex: 1,
    },
    subText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginVertical: 4,
        width: '80%'
    },
    symbolFlexEndStyle: {
        alignSelf: 'flex-end',
    },
    titleStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});
