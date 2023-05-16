import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import React, { useState } from 'react';
import { colors, fonts, NativeBaseModalStyle, sizes } from '@constants/theme';
import { theme } from '@constants';
import { apiAddCusstomToken } from '@api/WalletAPIs';
import ConstantStrings, {
    PLESE_ENTER_DECIMAL,
    PLESE_ENTER_SYMBOL,
    PLESE_ENTER_TOEKN_ADDRESS,
} from '@constants/ConstantStrings';
import { logger } from '@constants/Log';
import { useDispatch, useSelector } from 'react-redux';
import { getKeyboardType } from '@constants/commonFuncation';
import { apiGetCoinList } from '@api/CoinApis';
import { Center, Modal } from 'native-base';
import { updateTokenListFromApiItems } from '@redux/Action/TokenAction';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
export default function AddCustomToken({
    setShowAddCustomTokenModal,
    chainName,
    address,
    tokenAddedCallback,
    showAddCustomTokenModal,
}) {
    const dispatch = useDispatch();
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenDecimal, setTokenDecimal] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const [isShowError, setIsShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const TokenReducer = useSelector(state => state.TokenReducer);
    const onCancelClick = () => {
        setShowAddCustomTokenModal(false);
    };
    const onBackClick = () => {
        setShowAddCustomTokenModal(false);
    };
    const onImportClick = () => {
        logger(chainName);
        logger(address);
        if (tokenAddress != '') {
            if (tokenSymbol != '') {
                if (tokenDecimal != '') {
                    const params = {
                        address: address,
                        contractAddress: tokenAddress,
                        chainName: chainName,
                        symbol: tokenSymbol,
                        decimals: tokenDecimal,
                    };

                    setShowProgress(true);
                    apiAddCusstomToken(params)
                        .then(responceData => {
                            logger('apiAddCusstomToken Responce', responceData);

                            refreshTokenList(
                                tokenAddress,
                                tokenSymbol,
                                chainName,
                            );
                        })
                        .catch(error => {
                            setShowProgress(false);
                            setErrorMessage(
                                'Unable to import custom token, check the contract address and network of the token.',
                            );
                            setMessageShowStatus();
                            logger('apiAddCusstomToken Error', error);
                        });
                } else {
                    setErrorMessage(PLESE_ENTER_DECIMAL);
                    setMessageShowStatus();
                }
            } else {
                setErrorMessage(PLESE_ENTER_SYMBOL);
                setMessageShowStatus();
            }
        } else {
            setErrorMessage(PLESE_ENTER_TOEKN_ADDRESS);
            setMessageShowStatus();
        }
    };

    const setMessageShowStatus = () => {
        setIsShowError(true);
        setTimeout(() => {
            setIsShowError(false);
            setErrorMessage('');
        }, 3000);
    };
    const refreshTokenList = (tokenAddress, tokenSymbol, chainName) => {
        const tempData = TokenReducer.mergedList.filter(item => {
            return item.chainName.toLowerCase() == chainName.toLowerCase();
        });
        if (tempData.length > 0) {
            let params = {
                chainName: chainName,
                address: address,
                pageNo: 1,
                pageSize: '10000000000',
            };

            apiGetCoinList(params)
                .then(data => {
                    setShowProgress(false);
                    // get all selected chain data from reducer
                    let chainData = TokenReducer.mergedList.filter(
                        token_item => {
                            return (
                                token_item.chainName.toLowerCase() ==
                                chainName.toLowerCase()
                            );
                        },
                    );
                    let newItemsArray = [];
                    data.data.map(dataItem => {
                        let fData = chainData.find(itemtofind => {
                            return itemtofind.id == dataItem.id;
                        });
                        if (!fData) {
                            newItemsArray.push(dataItem);
                        }
                    });

                    if (newItemsArray.length > 0) {
                        // get only new records from api response and find imported token from there and update in redux
                        let importedTokenObject = newItemsArray.find(item11 => {
                            return (
                                item11.chainName.toLowerCase() ==
                                    chainName.toLowerCase() &&
                                item11.contractAddr.toLowerCase() ==
                                    tokenAddress.toLowerCase()
                            );
                        });
                        importedTokenObject.isShow = true;
                        const finalRefreshedList = TokenReducer.mergedList;
                        let newDataArrayToSave = [
                            ...finalRefreshedList,
                            importedTokenObject,
                        ];
                        console.log(
                            'new data array to save ::  ,',
                            newDataArrayToSave,
                        );
                        updateTokenListFromApiItems(
                            dispatch,
                            newDataArrayToSave,
                        );
                        setShowAddCustomTokenModal(false);
                        setShowProgress(false);
                        tokenAddedCallback(newDataArrayToSave);
                    } else {
                        // if updated token is already there in redux then change status of that token to isShow = true
                        let tokenDetail = TokenReducer.mergedList.find(
                            token_item => {
                                return (
                                    token_item.chainName.toLowerCase() ==
                                        chainName.toLowerCase() &&
                                    token_item.contractAddr.toLowerCase() ==
                                        tokenAddress.toLowerCase()
                                );
                            },
                        );
                        tokenDetail.isShow = true;
                        const finalRefreshedList = TokenReducer.mergedList;
                        updateTokenListFromApiItems(
                            dispatch,
                            finalRefreshedList,
                        );
                        setShowAddCustomTokenModal(false);
                        setShowProgress(false);
                        tokenAddedCallback(finalRefreshedList);
                    }
                })
                .catch(error => {
                    setShowProgress(false);
                    logger(error);
                });
        }
    };
    return (
        <Modal
            isOpen={showAddCustomTokenModal}
            onClose={() => setShowAddCustomTokenModal(false)}
            size={'full'}
            backgroundColor={colors.popupBgcolor}
            backdropVisible={true}
            safeAreaTop
            animationPreset="fade">
            <KeyboardAwareScrollView
                style={styles.keyboardAwareStyles}
                contentContainerStyle={styles.keyboardAwareContentStyles}
                nestedScrollEnabled={true}
                enableOnAndroid={true}
                bounces={false}
                enableAutomaticScroll={true}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}>
                <Center>
                    <Modal.Content style={NativeBaseModalStyle.ModalContent}>
                        <Modal.Header
                            style={styles.modalHeaderFooter}
                            pb={NativeBaseModalStyle.setHeaderPaddingBottom}>
                            <View style={styles.titleView}>
                                <TouchableOpacity onPress={onBackClick}>
                                    <Image
                                        source={require('@assets/back.png')}
                                        style={theme.customStyle.closeIcon}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.title}>
                                    {ConstantStrings.IMPORTCUSTOMTOKENS}
                                </Text>
                                <TouchableOpacity onPress={onCancelClick}>
                                    <Image
                                        source={require('@assets/close.png')}
                                        style={theme.customStyle.closeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </Modal.Header>
                        <Modal.Body _scrollview={{ bounces: false }}>
                            <View style={styles.hintIconContainerStyle}>
                                <Image
                                    source={require('@assets/hint.png')}
                                    style={styles.hintIcon}
                                />
                                <View style={styles.flex1Style}>
                                    <Text style={styles.extraInfoTitle}>
                                        {ConstantStrings.IMPORTINGCUSTOMTOKENS}
                                    </Text>
                                    <Text style={styles.extraInfo}>
                                        {ConstantStrings.TOADDACUSTOMTOKEN}
                                    </Text>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.textInputLabelStyle}>
                                    {ConstantStrings.TOKENADDRESS}
                                </Text>
                                <TextInput
                                    keyboardType={getKeyboardType()}
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    value={tokenAddress}
                                    onChangeText={text => {
                                        setTokenAddress(text);
                                    }}
                                    style={styles.textInputStyle}
                                    placeholderTextColor={
                                        colors.gray1_textcolor
                                    }
                                    placeholder={'0x...'}
                                    selectionColor={colors.gray1_textcolor}
                                />
                            </View>
                            <View>
                                <Text style={styles.textInputLabelStyle}>
                                    {ConstantStrings.TOKENSYMBOL}
                                </Text>
                                <TextInput
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    value={tokenSymbol}
                                    onChangeText={text => {
                                        setTokenSymbol(text);
                                    }}
                                    style={styles.textInputStyle}
                                    placeholderTextColor={
                                        colors.gray1_textcolor
                                    }
                                    placeholder={'GNO'}
                                    keyboardType="ascii-capable"
                                    selectionColor={colors.gray1_textcolor}
                                />
                            </View>
                            <View>
                                <Text style={styles.textInputLabelStyle}>
                                    {ConstantStrings.TOKENDECIMAL}
                                </Text>
                                <TextInput
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    value={tokenDecimal}
                                    onChangeText={text => {
                                        setTokenDecimal(text);
                                    }}
                                    style={styles.textInputStyle}
                                    placeholderTextColor={
                                        colors.gray1_textcolor
                                    }
                                    placeholder={'18'}
                                    keyboardType="decimal-pad"
                                    selectionColor={colors.gray1_textcolor}
                                />
                            </View>
                        </Modal.Body>

                        <Modal.Footer
                            pt={NativeBaseModalStyle.setFooterPaddingTop}
                            style={[
                                styles.modalHeaderFooter,
                                styles.extraModalFooter,
                                styles.bottomButtonContainerStyle,
                            ]}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.gray_background },
                                ]}
                                onPress={onCancelClick}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.gray_textcolor },
                                    ]}>
                                    {ConstantStrings.Cancel}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.addButtonExtraStyle,
                                ]}
                                onPress={onImportClick}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.white },
                                    ]}>
                                    {ConstantStrings.ADD}
                                </Text>
                            </TouchableOpacity>
                        </Modal.Footer>
                    </Modal.Content>
                    {isShowError && (
                        <View
                            style={[
                                styles.errorMessageContainerStyle,
                                styles.getBottomPosition,
                            ]}>
                            <View style={styles.toastPopupviewStyle}>
                                <Text style={styles.txtTitle}>
                                    {errorMessage}
                                </Text>
                            </View>
                        </View>
                    )}
                </Center>
            </KeyboardAwareScrollView>
        </Modal>
    );
}
const styles = StyleSheet.create({
    addButtonExtraStyle: {
        backgroundColor: colors.purple_button_color,
        marginLeft: 12,
    },
    bottomButtonContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    button: {
        alignItems: 'center',
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    buttonTitles: {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    errorMessageContainerStyle: {
        alignSelf: 'center',
        elevation: 10000,
        padding: 10,
        position: 'absolute',
        zIndex: 10000,
    },
    extraInfo: {
        color: colors.purple_dark,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f10,
        lineHeight: sizes.lh12,
        marginTop: 3,
    },
    extraInfoTitle: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    extraModalFooter: {
        justifyContent: 'center',
    },
    flex1Style: {
        flex: 1,
    },
    getBottomPosition: {
        bottom: Platform.OS === 'ios' ? 45 : 25,
    },
    hintIcon: {
        height: 20,
        marginRight: 16,
        width: 20,
    },
    hintIconContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 12,
        flexDirection: 'row',
        marginBottom: 8,
        padding: 12,
    },
    keyboardAwareContentStyles: {
        flex: 1,
        justifyContent: 'center',
    },
    keyboardAwareStyles: {
        width: '100%',
    },
    modalHeaderFooter: {
        backgroundColor: colors.white,
        borderColor: colors.transparent,
    },
    textInputLabelStyle: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
        marginVertical: 8,
    },
    textInputStyle: {
        backgroundColor: colors.gray_background,
        borderColor: colors.gray_background_1,
        borderRadius: 10,
        borderWidth: 1,
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginBottom: 8,
        padding: 18,
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
    },
    toastPopupviewStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        shadowColor: colors.shadow2,
        shadowOpacity: 0.12,
    },
    txtTitle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
    },
});
