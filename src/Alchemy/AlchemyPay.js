import {
    Image,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    SafeAreaView,
    TouchableHighlight,
} from 'react-native';
import React, { useEffect } from 'react';
import {
    colors,
    sizes,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { logger } from '@constants/Log';
import {
    BUY,
    FEES_TO_BE_CALCULATED,
    PROCEED_TO_CHECKOUT,
    SELL,
    ENTER_AMOUNT_YOU_WANT_TO,
    MAX,
    PROCEED_TO_SELL,
    YOU_DO_NOT_HAVE_ENOUGH_BALANCE,
} from '@constants/ConstantStrings';
import AlchemyChangeWallet from '../Alchemy/AlchemyChangeWallet';
import AlchemyWalletSelection from '@components/AlchemyWalletSelection';
import { getAllWalletsWithchainDetail } from '@database/sql';
import CustomImage from '@components/CustomImage';
import Progress from '@components/Progress';
import SelectCurrency from '../Tabbar/Home/Settings/currency/SelectCurrency';
import { retrieveKeyValueData } from '@constants/Storage';
import ConstStorage from '@constants/ConstStorage';
import { saveTokenListAndChain } from '@redux/Action/TokenAction';
import { useDispatch, useSelector } from 'react-redux';
import AlchemyPayStyles from './AlchemyStyles';
import {
    getBackgroundWhenTabChange,
    getBuySellStrings,
    getColorOfBalance,
    getColorOfCurrency,
    getTextColourWhenTabChange,
    getImageTintWhenTabChange,
    getTokenImageTintWhenTabChange,
    getTokenBackgroundWhenTabChange,
    getTokenColorOfCurrency,
} from './AlchemyFunctions';
import AlchemyTokenSelectModal from './AlchemyTokenSelectModal';
import { formatBalanceValue } from '@constants/commonFuncation';
import CustomModal from '@components/CustomModal';

const crypto = require('crypto');
const AlchemyPay = ({ navigation }) => {
    const dispatch = useDispatch();
    const TokenReducer = useSelector(state => state.TokenReducer);

    const [amount, setAmount] = React.useState(0);
    const [refresh, setRefresh] = React.useState(false);
    const [chainName, setChainName] = React.useState(false);
    const [showTokenList, setShowTokenList] = React.useState(false);
    const [showChangeWallet, setShowChangeWallet] = React.useState(false);
    const [currentClickedWallet, setCurrentClickedWallet] =
        React.useState(null);
    const [selectedToken, setSelectedToken] = React.useState({});
    const [data, setData] = React.useState(TokenReducer.list);
    const [isShowProgress, setIsShowProgress] = React.useState(false);
    const [showCurrencyPopupStatus, setShowCurrencyPopupStatus] =
        React.useState(false);
    const [currentCurrency, setCurrentCurrency] = React.useState(null);
    const [buyTabSelected, setBuyTabSelected] = React.useState(true);
    const [changeWalletList, setChangeWalletList] = React.useState([]);

    const [isShowNoEnoughBalance, setIsShowNoEnoughBalance] =
        React.useState(false);
    const eth = 'eth';
    const btc = 'btc';

    useEffect(() => {
        retrieveKeyValueData(ConstStorage.LEGAL_DETAIL)
            .then(currency => {
                setCurrentCurrency(JSON.parse(currency));
            })
            .catch(error => {
                logger('error legaldetail', error);
            });

        getWalletList();
    }, [buyTabSelected]);

    useEffect(() => {
        if (!buyTabSelected) {
            if (selectedToken.balance < amount) setIsShowNoEnoughBalance(true);
            else setIsShowNoEnoughBalance(false);
        }
    }, [amount]);
    async function getWalletList() {
        let allWallets = await getAllWalletsWithchainDetail();
        let walletList = [];
        for (let i = 0; i < allWallets.rows.length; i++) {
            walletList.push(allWallets.rows.item(i));
        }

        let chainlist = JSON.parse(await retrieveKeyValueData('allChains'));

        for (const item of walletList) {
            let chain_detail = chainlist.find(chain_item => {
                return (
                    chain_item.chain.toLowerCase() == item.chain.toLowerCase()
                );
            });
            item.chainDetail = chain_detail;
        }
        if (!buyTabSelected) {
            const list = walletList.filter(item => {
                return (
                    item.chain.toLowerCase() == btc ||
                    item.chain.toLowerCase() == eth
                );
            });
            const itemOne = list[0];
            setChainName(itemOne.chain);
            setCurrentClickedWallet(itemOne);
            getCoinList(itemOne.address, itemOne.chain);
            setChangeWalletList(list);
        } else {
            //  let walletListtoSet = await getWalletsBasedOnSetting(walletList)
            const itemOne = walletList[0];
            setChainName(itemOne.chain);
            setCurrentClickedWallet(itemOne);
            getCoinList(itemOne.address, itemOne.chain);
            setChangeWalletList(walletList);
        }
    }

    async function getCoinList(address, chain) {
        setIsShowProgress(true);
        const checkPresenceOfMainCurrency =
            TokenReducer.mainCurrency &&
            TokenReducer.mainCurrency.filter(item => {
                return item.chainName == chain;
            }).length;

        try {
            if (checkPresenceOfMainCurrency != 0) {
                setIsShowProgress(false);
                return;
            } else {
                setIsShowProgress(true);
                const result = await saveTokenListAndChain(
                    dispatch,
                    chain,
                    address,
                    TokenReducer.mergedList,
                );
                if (result != []) {
                    setData(result.data);
                    setSelectedToken(result.mainCurrency);
                    setTimeout(() => {
                        setIsShowProgress(false);
                    }, 600);
                } else {
                    setTimeout(() => {
                        setIsShowProgress(false);
                    }, 300);
                }
            }
        } catch (error) {
            logger('Tokenreducer Error ::  ', error);
        }

        /** var params = {
        *   chainName: chain,
        *   address: address,
        *   pageNo: 1,
        *   pageSize: '10000000000',
        * };

        * apiGetCoinList(params)
        *   .then(data => {
        *     setMainCurrency(data.mainCurrency);
        *     setSelectedToken(data.mainCurrency);
        *     setData(data.data);
        *     setIsShowProgress(false);
        *   })
        *   .catch(error => {
        *     logger(error);
        *     setIsShowProgress(false);
        *   }); 
        **/
    }

    useEffect(() => {
        try {
            const tempData =
                TokenReducer.mainCurrency &&
                TokenReducer.mainCurrency.filter(item => {
                    return (
                        item.chainName.toLowerCase() == chainName.toLowerCase()
                    );
                });
            setSelectedToken(tempData[0]);

            const tempList =
                TokenReducer.mergedList &&
                TokenReducer.mergedList.filter(item => {
                    return (
                        item.chainName.toLowerCase() == chainName.toLowerCase()
                    );
                });
            setData(tempList);
            setRefresh(!refresh);
        } catch (error) {
            logger('chainName error from use effect :: ', error);
        }
    }, [chainName]);

    const setPasscode = async value => {
        if (amount.toString().length > 15) {
            return;
        }
        if (amount.toString().includes('.')) {
            const AmountEntered = amount.toString() + value.toString();
            setAmount(AmountEntered);
        } else {
            if (amount == 0) {
                if (value === '.') {
                    const AmountEntered = amount.toString() + value.toString();
                    setAmount(AmountEntered);
                    return;
                }
                const AmountEntered = value;
                setAmount(AmountEntered);
            } else {
                const AmountEntered = amount.toString() + value.toString();
                setAmount(AmountEntered);
            }
        }
    };
    const removePasscode = () => {
        if (amount.toString().includes('.')) {
            const newAmount = amount
                .toString()
                .slice(0, amount.toString().length - 1);
            if (newAmount == '') {
                setAmount(0);
                return;
            }
            setAmount(newAmount);
        } else {
            if (amount == 0) {
                return;
            }
            const newAmount = amount
                .toString()
                .slice(0, amount.toString().length - 1);
            if (newAmount == '') {
                setAmount(0);
                return;
            }
            setAmount(newAmount);
        }
    };

    const getBackgroundColourOfSellButtonIfDisabled = () => {
        if (amount == 0 || isShowNoEnoughBalance) {
            return AlchemyPayStyles.proceedToCheckoutButtonWithLowOpacity;
        } else {
            return AlchemyPayStyles.proceedToCheckoutButton;
        }
    };

    function selectedChain(selectedChain1) {
        setCurrentClickedWallet(selectedChain1);
        setChainName(selectedChain1.chain);
        getCoinList(selectedChain1.address, selectedChain1.chain);
        setRefresh(!refresh);
    }
    function setSelectedCurrency(currency) {
        setCurrentCurrency(currency);
    }
    async function func() {
        /**
         * to create an encoded sign
         * app id - pass
         * address - pass
         * fiat amount - pass
         * fiat - pass
         * sign - pass
         */
        const AlchemyAppId = 'f83Is2y7L425rxl8';
        const appSecret = `4Yn8RkxDXN71Q3p0`;
        const address = currentClickedWallet && currentClickedWallet.address;
        const fiat = currentCurrency && currentCurrency.fiat;
        const fiatAmount = amount.toString();
        try {
            /* const response = await AlchemyPay.getEncryptedSign(
             *   address,
             *   AlchemyAppId,
             *   appSecret,
             *   fiat,
             *   fiatAmount,
             * );
             * logger('alchemy pay native emodule response :: ', response);
             *   // setEncodedSign(response)
             * return response; */
            const plaintext_buy = `address=${address}&appId=${AlchemyAppId}&fiat=${fiat}&fiatAmount=${fiatAmount}`;
            const plaintext_sell = `address=${address}&appId=${AlchemyAppId}&fiat=${fiat}`;
            const plaintext = buyTabSelected ? plaintext_buy : plaintext_sell;
            const ciphertext = encrypt(plaintext, appSecret);
            logger('encrypted text :: ', ciphertext);
            const encode = encodeURIComponent(ciphertext);
            logger('encoded :: ', encode);
            return encode;
        } catch (error) {
            logger('alchemy pay native emodule error :: ', error);
        }
    }
    function encrypt(plainText, secretKeyData) {
        try {
            const plainTextData = Buffer.from(plainText, 'utf8');
            const secretKey = Buffer.from(secretKeyData, 'utf8');
            const iv = secretKeyData.substring(0, 16);
            const cipher = crypto.createCipheriv('aes-128-cbc', secretKey, iv);
            let encrypted = cipher.update(plainTextData);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return encrypted.toString('base64');
        } catch (e) {
            logger(`AES encrypting exception, msg is ${e.toString()}`);
        }
        return null;
    }

    async function bottomButtonClickEvent() {
        try {
            let email = await retrieveKeyValueData(
                ConstStorage.CURRENT_USER_EMAIL,
            );
            let userEmail = email;
            const encodedSign = await func();
            navigation.navigate('AlchemyRamp', {
                tokenName: selectedToken.symbol,
                walletName: currentClickedWallet && currentClickedWallet.chain,
                walletAddress:
                    currentClickedWallet && currentClickedWallet.address,
                fiatValue: currentCurrency && currentCurrency.fiat,
                amount: amount,
                encodedSign: encodedSign,
                email: userEmail,
                BuyTabSelected: buyTabSelected,
            });
        } catch (error) {
            logger(error);
        }
    }

    function renderKeyboard(dataArray) {
        return dataArray.map(number => {
            return (
                <TouchableHighlight
                    key={number}
                    underlayColor={colors.keyboard_button_highlight_color}
                    activeOpacity={1}
                    onPress={() => {
                        setPasscode(number);
                    }}
                    style={AlchemyPayStyles.btnKeyboard}>
                    <Text style={AlchemyPayStyles.keyboardTxt}>{number}</Text>
                </TouchableHighlight>
            );
        });
    }
    return (
        <>
            <LinearGradient
                colors={colors.LavenderIndigo_PaleLavender}
                style={AlchemyPayStyles.flexOne}>
                <SafeAreaView style={AlchemyPayStyles.flexOne}>
                    <StatusBar
                        animated={true}
                        backgroundColor={colors.mainColor}
                        barStyle={'light-content'}
                    />
                    {showTokenList && (
                        <AlchemyTokenSelectModal
                            setSelectedTokenToSend={setSelectedToken}
                            setShowTokenList={setShowTokenList}
                            tokenList={data}
                            BuyTabSelected={buyTabSelected}
                            showTokenList={showTokenList}
                        />
                    )}

                    {showCurrencyPopupStatus && (
                        <SelectCurrency
                            setShowCurrencyPopupStatus={
                                setShowCurrencyPopupStatus
                            }
                            setSelectedCurrency={setSelectedCurrency}
                            currentCurrency={currentCurrency}
                        />
                    )}
                    {isShowProgress && <Progress></Progress>}
                    <CustomModal
                        isModalVisible={showChangeWallet}
                        closeModal={setShowChangeWallet}>
                        <AlchemyChangeWallet
                            setShowChangeWallet={setShowChangeWallet}
                            setSelectedChainWallet={selectedChain}
                            ChangeWalletList={changeWalletList}
                        />
                    </CustomModal>
                    <View style={{ margin: sizes.mhp20 }}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.goBack();
                            }}
                            style={AlchemyPayStyles.backIconView}>
                            <Image
                                source={require('@assets/back.png')}
                                style={AlchemyPayStyles.BackIcons}
                            />
                        </TouchableOpacity>
                        <View style={AlchemyPayStyles.TabView}>
                            <TouchableOpacity
                                disabled={buyTabSelected}
                                style={
                                    buyTabSelected
                                        ? [AlchemyPayStyles.SelectedTab]
                                        : [AlchemyPayStyles.NonSelectedTab]
                                }
                                onPress={() => {
                                    setAmount(0);
                                    setCurrentClickedWallet({});
                                    setBuyTabSelected(true);
                                }}>
                                <Image
                                    source={require('@assets/buyIcon.png')}
                                    style={AlchemyPayStyles.titleIcons}
                                />
                                <Text
                                    style={
                                        buyTabSelected
                                            ? [
                                                  AlchemyPayStyles.SelectedTabTitle,
                                              ]
                                            : [
                                                  AlchemyPayStyles.NonSelectedTabTitle,
                                              ]
                                    }>
                                    {BUY}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!buyTabSelected}
                                style={
                                    !buyTabSelected
                                        ? [AlchemyPayStyles.SelectedTab]
                                        : [AlchemyPayStyles.NonSelectedTab]
                                }
                                onPress={() => {
                                    setAmount(0);
                                    setCurrentClickedWallet({});
                                    setBuyTabSelected(false);
                                }}>
                                <Image
                                    source={require('@assets/Arrow_45.png')}
                                    style={AlchemyPayStyles.titleIcons}
                                />
                                <Text
                                    style={
                                        !buyTabSelected
                                            ? [
                                                  AlchemyPayStyles.SelectedTabTitle,
                                              ]
                                            : [
                                                  AlchemyPayStyles.NonSelectedTabTitle,
                                              ]
                                    }>
                                    {SELL}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView
                        style={AlchemyPayStyles.flexOne}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={
                            AlchemyPayStyles.scrollViewContainer
                        }>
                        <View style={AlchemyPayStyles.amountContainerStyle}>
                            <View style={AlchemyPayStyles.payTextContainer}>
                                <View
                                    style={
                                        AlchemyPayStyles.currentCurrencyIconParentView
                                    }>
                                    <Text
                                        style={[
                                            AlchemyPayStyles.currencyIcon,
                                            getColorOfCurrency(buyTabSelected),
                                        ]}>
                                        {currentCurrency &&
                                            currentCurrency.icon + ' '}
                                    </Text>
                                </View>
                                <Text
                                    adjustsFontSizeToFit={true}
                                    numberOfLines={1}
                                    style={[
                                        AlchemyPayStyles.amountText,
                                        { flex: amount.length > 5 ? 1 : null },
                                    ]}>
                                    {formatBalanceValue(amount)}
                                </Text>
                                {!buyTabSelected ? (
                                    <TouchableOpacity
                                        disabled={data.length == 1}
                                        onPress={() => {
                                            setShowTokenList(true);
                                        }}
                                        style={[
                                            AlchemyPayStyles.tokenContainer,
                                            getTokenBackgroundWhenTabChange(
                                                buyTabSelected,
                                            ),
                                        ]}>
                                        <CustomImage
                                            imageUrl={
                                                selectedToken &&
                                                selectedToken.icon
                                            }
                                            isImageHeight20={true}
                                        />
                                        <Text
                                            style={[
                                                AlchemyPayStyles.currencyText,
                                                getTokenColorOfCurrency(
                                                    buyTabSelected,
                                                ),
                                                {
                                                    fontSize: sizes.f16,
                                                    marginLeft:
                                                        calculateWidth(6),
                                                },
                                            ]}>
                                            {selectedToken &&
                                                selectedToken.symbol}
                                        </Text>
                                        {data.length > 1 && (
                                            <Image
                                                source={require('@assets/arrowBottomBlack.png')}
                                                style={[
                                                    AlchemyPayStyles.changeCurrencyIcon,
                                                    getTokenImageTintWhenTabChange(
                                                        buyTabSelected,
                                                    ),
                                                ]}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowCurrencyPopupStatus(true);
                                        }}
                                        style={[
                                            AlchemyPayStyles.currencyContainer,
                                            getBackgroundWhenTabChange(
                                                buyTabSelected,
                                            ),
                                        ]}>
                                        <Text
                                            style={[
                                                AlchemyPayStyles.currencyText,
                                                getTextColourWhenTabChange(
                                                    buyTabSelected,
                                                ),
                                            ]}>
                                            {currentCurrency &&
                                                currentCurrency.fiat}
                                        </Text>
                                        <Image
                                            source={require('@assets/SwapIcon.png')}
                                            style={[
                                                AlchemyPayStyles.swapIcon,
                                                getImageTintWhenTabChange(
                                                    buyTabSelected,
                                                ),
                                            ]}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View
                                style={AlchemyPayStyles.maxValueContainerStyle}>
                                <Text
                                    style={[
                                        AlchemyPayStyles.BalanceAmount,
                                        getColorOfBalance(buyTabSelected),
                                    ]}>
                                    {`${MAX} ${
                                        selectedToken &&
                                        selectedToken.balance &&
                                        parseFloat(
                                            selectedToken.balance,
                                        ).toFixed(4)
                                    } ${selectedToken && selectedToken.symbol}`}
                                </Text>
                                {!buyTabSelected && isShowNoEnoughBalance && (
                                    <View
                                        style={
                                            AlchemyPayStyles.notEnoughBalanceViewStyle
                                        }>
                                        <Text
                                            style={
                                                AlchemyPayStyles.noEnoughBalanceTextStyle
                                            }>{`${YOU_DO_NOT_HAVE_ENOUGH_BALANCE} ${selectedToken.symbol}`}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={AlchemyPayStyles.payReceiveTitle}>
                                {`${ENTER_AMOUNT_YOU_WANT_TO} ${getBuySellStrings(
                                    buyTabSelected,
                                ).toLowerCase()}`}
                            </Text>
                        </View>
                        <LinearGradient
                            colors={colors.white_magnolia_light}
                            locations={[0.5, 1]}
                            style={AlchemyPayStyles.keyboardView}>
                            <View
                                style={
                                    AlchemyPayStyles.convertedAmountContainer
                                }>
                                <View style={AlchemyPayStyles.flexTwo}>
                                    <AlchemyWalletSelection
                                        imageIcon={
                                            currentClickedWallet &&
                                            currentClickedWallet.chainDetail &&
                                            currentClickedWallet.chainDetail
                                                .chain_icon
                                        }
                                        chainname={
                                            currentClickedWallet &&
                                            currentClickedWallet.chainDetail &&
                                            currentClickedWallet.chainDetail
                                                .name
                                        }
                                        walletAddress={
                                            currentClickedWallet &&
                                            currentClickedWallet.address
                                        }
                                        clickEvent={() => {
                                            setShowChangeWallet(true);
                                        }}
                                        ShowWalletAddress={true}
                                    />
                                </View>
                                <View>
                                    {buyTabSelected ? (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowTokenList(true);
                                            }}
                                            style={[
                                                AlchemyPayStyles.tokenContainer,
                                                getTokenBackgroundWhenTabChange(
                                                    buyTabSelected,
                                                ),
                                            ]}>
                                            <CustomImage
                                                imageUrl={
                                                    selectedToken &&
                                                    selectedToken.icon
                                                }
                                                isImageHeight20={true}
                                            />
                                            <Text
                                                style={[
                                                    AlchemyPayStyles.currencyText,
                                                    getTokenColorOfCurrency(
                                                        buyTabSelected,
                                                    ),
                                                    {
                                                        fontSize: sizes.f16,
                                                        marginLeft:
                                                            calculateWidth(6),
                                                    },
                                                ]}>
                                                {selectedToken &&
                                                    selectedToken.symbol}
                                            </Text>
                                            <Image
                                                source={require('@assets/arrowBottomBlack.png')}
                                                style={[
                                                    AlchemyPayStyles.changeCurrencyIcon,
                                                    getTokenImageTintWhenTabChange(
                                                        buyTabSelected,
                                                    ),
                                                ]}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowCurrencyPopupStatus(
                                                    true,
                                                );
                                            }}
                                            style={[
                                                AlchemyPayStyles.currencyContainer,
                                                getBackgroundWhenTabChange(
                                                    buyTabSelected,
                                                ),
                                            ]}>
                                            <Text
                                                style={[
                                                    AlchemyPayStyles.currencyText,
                                                    getTextColourWhenTabChange(
                                                        buyTabSelected,
                                                    ),
                                                ]}>
                                                {currentCurrency &&
                                                    currentCurrency.fiat}
                                            </Text>
                                            <Image
                                                source={require('@assets/SwapIcon.png')}
                                                style={[
                                                    AlchemyPayStyles.swapIcon,
                                                    getImageTintWhenTabChange(
                                                        buyTabSelected,
                                                    ),
                                                ]}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <View style={AlchemyPayStyles.keyboardSubview}>
                                {renderKeyboard([1, 2, 3])}
                            </View>
                            <View style={AlchemyPayStyles.keyboardSubview}>
                                {renderKeyboard([4, 5, 6])}
                            </View>
                            <View style={AlchemyPayStyles.keyboardSubview}>
                                {renderKeyboard([7, 8, 9])}
                            </View>
                            <View style={AlchemyPayStyles.keyboardSubview}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => {
                                        const countDecimalPoints = (
                                            amount.toString().match(/\./g) || []
                                        ).length;
                                        if (countDecimalPoints === 0) {
                                            setPasscode('.');
                                        }
                                    }}
                                    style={AlchemyPayStyles.btnKeyboardBack}>
                                    <Text style={AlchemyPayStyles.keyboardTxt}>
                                        .
                                    </Text>
                                </TouchableOpacity>

                                <TouchableHighlight
                                    underlayColor={
                                        colors.keyboard_button_highlight_color
                                    }
                                    activeOpacity={1}
                                    style={AlchemyPayStyles.btnKeyboard}
                                    onPress={() => {
                                        setPasscode(0);
                                    }}>
                                    <Text style={AlchemyPayStyles.keyboardTxt}>
                                        0
                                    </Text>
                                </TouchableHighlight>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={removePasscode}
                                    style={AlchemyPayStyles.btnKeyboardBack}>
                                    <Image
                                        source={require('@assets/backIcon.png')}
                                        style={AlchemyPayStyles.backImageStyle}
                                        resizeMode="contain"></Image>
                                </TouchableOpacity>
                            </View>
                            <Text style={AlchemyPayStyles.FeesToBeCalculated}>
                                {FEES_TO_BE_CALCULATED}
                            </Text>
                            {buyTabSelected ? (
                                <TouchableOpacity
                                    onPress={bottomButtonClickEvent}
                                    style={
                                        AlchemyPayStyles.proceedToCheckoutButton
                                    }>
                                    <Image
                                        source={require('@assets/buyIcon.png')}
                                        style={{
                                            height: calculateHeight(20),
                                            width: calculateHeight(20),
                                        }}
                                        resizeMode="contain"
                                    />
                                    <Text
                                        style={
                                            AlchemyPayStyles.proceedToCheckoutText
                                        }>
                                        {PROCEED_TO_CHECKOUT}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={bottomButtonClickEvent}
                                    disabled={
                                        amount == 0 || isShowNoEnoughBalance
                                    }
                                    style={getBackgroundColourOfSellButtonIfDisabled()}>
                                    <Image
                                        source={require('@assets/Arrow_45.png')}
                                        style={{
                                            height: calculateHeight(20),
                                            width: calculateHeight(20),
                                        }}
                                        resizeMode="contain"
                                    />
                                    <Text
                                        style={
                                            AlchemyPayStyles.proceedToCheckoutText
                                        }>
                                        {PROCEED_TO_SELL}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
            <SafeAreaView style={AlchemyPayStyles.safeareaStyle} />
        </>
    );
};

export default AlchemyPay;
