import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
    Width,
} from '@constants/theme';
import ScreenTopHeader from '@components/ScreenTopHeader';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { checkType } from '@constants/commonFuncation';
import { getIconFromSymbol } from '@database/sql';
import { useDispatch } from 'react-redux';
import TransactionDetailCellsView from '@components/TransactionDetailCellsView';
import moment from 'moment/moment';
const HistoryDetail = ({ navigation, route }) => {
    const [historyData, setHistoryData] = useState(null);
    const [chainIconURL, setChainIconURL] = useState(null);
    const [dataToDisplay, setDataToDisplay] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const data = route.params.data;
        var timestemp = new Date(data.txTime);
        //   var formatted = timestemp.format("dd/mm/yyyy hh:MM:ss");
        setHistoryData(data);
        getIconFromSymbol(data.symbol).then(result => {
            if (result != undefined || result.rows.length > 0) {
                setChainIconURL(result.rows.item(0).chain_icon);
            } else setChainIconURL(null);
        });
        setDataToDisplay(getWalletType(data));
    }, []);

    const getWalletType = data => {
        const chainName = route.params.chainName.toLowerCase();
        let nameToDisplay, urlToRedirect;
        switch (chainName) {
            case 'btctest':
                nameToDisplay = '';
                urlToRedirect =
                    'https://mumbai.polygonscan.com/tx/' + data.txid;
                break;
            case 'bch':
                nameToDisplay = '';
                urlToRedirect =
                    'https://mumbai.polygonscan.com/tx/' + data.txid;
                break;
            case 'ltc':
                nameToDisplay = '';
                urlToRedirect =
                    'https://mumbai.polygonscan.com/tx/' + data.txid;
                break;
            case 'eth':
                nameToDisplay = 'Etherscan';
                urlToRedirect = 'https://etherscan.io/tx/' + data.txid;
                break;
            case 'bsc':
                nameToDisplay = '';
                urlToRedirect = 'https://bscscan.com/tx/' + data.txid;
                break;
            case 'polygontest':
                nameToDisplay = 'PolygonScan';
                urlToRedirect =
                    'https://mumbai.polygonscan.com/tx/' + data.txid;
                break;
            case 'bsctest':
                nameToDisplay = '';
                urlToRedirect = 'https://testnet.bscscan.com/tx/' + data.txid;
                break;
            case 'polygon':
                nameToDisplay = 'PolygonScan';
                urlToRedirect = 'https://polygonscan.com/tx/' + data.txid;
                break;
            case 'hecotest':
                nameToDisplay = '';
                urlToRedirect =
                    'https://testnet.hecoinfo.com/en-us/tx/' + data.txid;
                break;
            case 'fuji':
                nameToDisplay = '';
                urlToRedirect = 'https://testnet.snowtrace.io/tx/' + data.txid;
                break;
            case 'avax':
                nameToDisplay = '';
                urlToRedirect = 'https://snowtrace.io/tx/' + data.txid;
                break;
        }

        return {
            name: ConstantStrings.VIEW_ON + ' ' + nameToDisplay,
            urlToRedirect,
        };
    };
    const topBackClick = () => {
        navigation.pop();
    };
    return (
        <SafeAreaView style={styles.containerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={colors.white}
                barStyle={'dark-content'}
            />
            <View style={{}}>
                <ScreenTopHeader
                    title={ConstantStrings.TRANSACTION_DETAILS}
                    topBackClick={topBackClick}
                    showBack={true}
                    center={false}
                />
                <Text style={styles.transactionTypeTextStyle}>
                    {historyData && checkType(historyData, true).title}
                </Text>

                <View style={[styles.detailsView, {}]}>
                    <View
                        style={[
                            styles.iconView,
                            { backgroundColor: colors.menuDotsTint },
                        ]}>
                        <Image
                            source={
                                historyData && checkType(historyData, true).img
                            }
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <Text
                        numberOfLines={1}
                        style={styles.txtCyptoHead}>
                        {historyData && historyData.amount}
                    </Text>
                    <CustomImage
                        imageUrl={chainIconURL}
                        isImageHeight20={false}
                        isImageHeight25={true}
                    />
                    <Text
                        numberOfLines={1}
                        style={styles.txtCyptoSymbol}>
                        {historyData && historyData.symbol}
                    </Text>
                </View>
                <View
                    style={styles.containerStyle1}>
                    <View style={styles.confirmStatusPareentViewStyle}>
                        <Image
                            style={styles.successImageStyle}
                            source={require('@assets/CopySuccess.png')}></Image>
                        <Text style={styles.confirmStatusTextStyle}>
                            {ConstantStrings.CONFIRMED}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewOnScanStyle}
                        onPress={() => { }}>
                        <Text style={styles.viewOnScanTextstyle}>
                            {dataToDisplay && dataToDisplay.name}
                        </Text>
                        <Image
                            style={styles.viewOnScanIconStyle}
                            source={require('@assets/view_on_scan.png')}></Image>
                    </TouchableOpacity>
                </View>

                <TransactionDetailCellsView
                    label={ConstantStrings.LABEL_HASH}
                    value={historyData && historyData.txid}
                    isShowCopy={true}
                />
                <TransactionDetailCellsView
                    label={ConstantStrings.LABEL_DATE}
                    value={
                        historyData &&
                        moment(historyData.dateTime).format('DD MMM YYYY')
                    }
                    isShowCopy={false}
                />
                <TransactionDetailCellsView
                    label={ConstantStrings.FROM}
                    value={route.params.address}
                    isShowCopy={false}
                />
                <TransactionDetailCellsView
                    label={ConstantStrings.TO}
                    value={historyData && historyData.address}
                    isShowCopy={false}
                />
                <TransactionDetailCellsView
                    label={ConstantStrings.LABEL_GAS_FEE}
                    value={0}
                    isShowCopy={false}
                />
                {/* <View style={{ backgroundColor: colors.ghost_white, padding: 16, borderRadius: 4, flexDirection: 'row', marginTop: 5 }}>
                    <Text style={styles.labelStyle}>
                        {ConstantStrings.LABEL_HASH}
                    </Text>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            Clipboard.setString(nftDetail.token_address);
                            showMessageToast(
                                dispatch,
                                'Hash Copied to clipboard.',
                            );
                        }}>
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="middle"
                            style={[
                                styles.valueStyle,
                                {
                                    marginRight: 8,
                                    textAlign: 'left',
                                },
                            ]}>
                            1231232132131231
                        </Text>
                        <Image
                            style={{
                                width: 15,
                                height: 15,
                                marginTop: 1,
                                tintColor: colors.gray_textcolor,
                            }}
                            source={require('@assets/copy.png')}
                        />
                    </TouchableOpacity>
                </View> */}
            </View>
        </SafeAreaView>
    );
};

export default HistoryDetail;
const styles = StyleSheet.create({

    confirmStatusTextStyle: {
        color: colors.dark_green,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        marginHorizontal: 6,
    },
    containerStyle: {
        backgroundColor: colors.white,
        flex: 1,
        paddingHorizontal: 20,
    },
    containerStyle1: {
        flexDirection: 'row',
        marginVertical: calculateHeight(12),
    },

    detailsView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
        paddingRight: 24,
        padding: 12,
    },
    icon: {
        height: calculateHeight(22),
        tintColor: colors.white,
        width: calculateHeight(22),
    },
    iconView: {
        // height: 30,
        // width: 30,
        borderRadius: 100,
        marginLeft: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: calculateHeight(8),
    },

    successImageStyle: {
        height: 15,
        width: 15,
    },
    transactionTypeTextStyle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        marginTop: 10,
        textAlign: 'center',
    },
    txtCyptoHead: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f28 + 2,
        marginLeft: 12, marginRight: 10
    },
    txtCyptoSymbol: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f22,
        marginLeft: 5,
    },
    viewOnScanIconStyle: {
        height: 15,
        marginHorizontal: 5,
        width: 15,
    },
    viewOnScanStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
    },
    viewOnScanTextstyle: {
        color: colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
});
