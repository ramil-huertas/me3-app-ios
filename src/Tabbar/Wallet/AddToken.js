import {
    Image,
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import ConstantStrings, {
    IFYOUREHOLDING,
    SEARCHTOKEN,
} from '@constants/ConstantStrings';
import AddCustomToken from './AddCustomToken';
import { apiGetTokensToImport, apiFollowToken } from '@api/WalletAPIs';
import CustomImage from '@components/CustomImage';
import { logger } from '@constants/Log';
import { useDispatch } from 'react-redux';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { getKeyboardType } from '../../../constant/commonFuncation';
export default function AddToken({
    setshowAddTokenModal,
    clickedWallet,
    refreshList,
    chainName,
    address,
    tokenAddedCallback,
}) {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [searchedArray, setSearchedArray] = useState([]);
    const [showAddCustomTokenModal, setShowAddCustomTokenModal] =
        useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [tokenListData, setTokenListData] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);

    useEffect(() => {
        const params = {
            pageNo: pageNum,
            pageSize: 20,
            address: clickedWallet.address,
            chainName: clickedWallet.chain,
            keyword: keyword,
        };
        apiGetTokensToImport(params)
            .then(result => {
                setTokenListData(result);
                setSearchedArray(result);
            })
            .catch(error => {
                logger('search token error ', error);
            });
    }, []);

    useEffect(() => {
        if (searchText.length != 0) {
            const temp = tokenListData.filter(item => {
                return item.symbol
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
            setSearchedArray(temp);
        } else {
            setSearchedArray(tokenListData);
        }
    }, [searchText.length]);

    const onCancelClick = () => {
        setshowAddTokenModal(false);
        refreshList();
    };
    const onImportClick = () => {
        // call api  to follow tokenhere
        if (selectedToken == null) {
            showMessageToast(dispatch, 'Please select token');
            return;
        }
        const params = {
            address: clickedWallet.address,
            chainName: clickedWallet.chain,
            id: selectedToken.id,
            flag: 1,
        };
        apiFollowToken(params)
            .then(result => {
                setshowAddTokenModal(false);
                refreshList();
            })
            .catch(error => showMessageToast(dispatch, error + ''));
    };

    const getBackgroundColor = (item) => {
        if (item.item.show)
            return colors.gray_background
        else return null
    }
    const renderItem = item => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedToken(item.item);
                    }}
                    style={styles.itemView(getBackgroundColor)}>
                    <View
                        style={styles.flexAlignItemStyle}>
                        <View style={styles.iconView}>
                            <CustomImage imageUrl={item.item.icon} />
                        </View>
                        <Text style={styles.chainTitles}>
                            {item.item.symbol}
                        </Text>
                    </View>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <>
            {showAddCustomTokenModal && (
                <AddCustomToken
                    setshowAddTokenModal={setshowAddTokenModal}
                    setshowAddCustomTokenModal={setShowAddCustomTokenModal}
                    chainName={chainName}
                    address={address}
                    tokenAddedCallback={tokenAddedCallback}
                />
            )}
            <Modal
                onRequestClose={() => {
                    setshowAddTokenModal(false);
                }}
                transparent={true}>
                <View style={styles.contain}>
                    <View style={styles.popupView}>
                        <View style={styles.titleView}>
                            <Text style={styles.title}>Add/Import Token</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setshowAddTokenModal(false);
                                }}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={styles.closeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={styles.searchContainerStyle}>
                            <Image
                                source={require('@assets/search.png')}
                                style={[
                                    styles.searchIcon,
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
                        {searchedArray && (
                            <FlatList
                                data={searchedArray}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index}
                                style={styles.flatListStyle}
                            />
                        )}

                        <View style={styles.flexRowStyle}>
                            <Text style={styles.extraInfo}>
                                {IFYOUREHOLDING}
                                <Text
                                    style={{
                                        color: colors.purple_button_color,
                                    }}
                                    onPress={() => {
                                        setShowAddCustomTokenModal(true);
                                    }}>
                                    {' '}
                                    {ConstantStrings.ADD_CUSTOM_TOKEN_HERE}
                                </Text>
                            </Text>
                            <Image
                                source={require('@assets/forward_color_icon.png')}
                                style={styles.forwardImageStyle}
                            />
                        </View>
                        <View
                            style={styles.bottomButtonStyle}>
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
                                    styles.addButtonSecondStyle,
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
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    addButtonSecondStyle: {
        backgroundColor:
            colors.purple_button_color,
        marginLeft: 12,
    },
    bottomButtonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 16,
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
    chainTitles: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginLeft: 8
    },
    closeIcon: {
        height: 24,
        width: 24,
    },
    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'space-around',
        margin: 0,
    },
    extraInfo: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14 + 2.8,
    },
    flatListStyle: {
        height: '30%',
        marginVertical: 16,
    },
    flexAlignItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flexRowStyle: {
        flexDirection: 'row',
    },

    forwardImageStyle: {
        height: 11,
        marginLeft: 5,
        marginTop: 2,
        resizeMode: 'stretch',
        width: 14,
    },
   
    itemView: backgroundColor => ({
        borderRadius: 30,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor
    }),
    popupView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 20,
        padding: 20,
    },
    searchContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    searchIcon: {
        height: 24,
        width: 24,
    },
    searchTokenTextInput: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
        marginLeft: 8,
        paddingVertical: 4,
    },
    title: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
    },
    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});
