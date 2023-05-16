import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    FlatList,
    Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateHeight, calculateWidth, colors, fonts, NativeBaseModalStyle, sizes } from '@constants/theme';
import ConstantStrings, {
    IFYOUREHOLDING,
    SEARCHTOKEN,
} from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import { useDispatch, useSelector } from 'react-redux';
import { getKeyboardType } from '@constants/commonFuncation';
import { updateStatusOfToken } from '@redux/Action/TokenAction';
import AddCustomToken from './AddCustomToken';
import { Center, Modal } from 'native-base';
export default function ManageTokens({
    setIsShowManageTokens,
    clickedWallet,
    chainName,
    address,
    tokenAddedCallback,
    isShowManageTokens,
}) {
    const TokenReducer = useSelector(state => state.TokenReducer);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [searchedArray, setSearchedArray] = useState([]);
    const [tokenListData, setTokenListData] = useState([]);
    const [showAddCustomTokenModal, setShowAddCustomTokenModal] =
        useState(false);

    useEffect(() => {
        const tempData = TokenReducer.mergedList.filter(item => {
            return (
                item.chainName.toLowerCase() ==
                    clickedWallet.chain.toLowerCase() &&
                item.contractAddr?.length > 0
            );
        });
        setSearchedArray(tempData);
        setTokenListData(tempData);
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
            if (tokenListData.length > 0) {
                setSearchedArray(tokenListData);
            }
        }
    }, [searchText.length]);

    const getBackgroundColor = item => {
        if (item.isShow) {
            return colors.gray_background;
        } else return null;
    };

    const renderItem = item => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => {
                        updateStatusOfToken(dispatch, item.item);
                    }}
                    style={styles.itemView(getBackgroundColor(item.item))}>
                    <View style={styles.flexAlignItemStyle}>
                        <View style={styles.imageLogoContainerStyle}>
                            <CustomImage
                                imageUrl={item.item.icon}
                                isImageHeight25={true}
                            />
                        </View>
                        <Text style={styles.chainTitles}>
                            {item.item.symbol}
                        </Text>
                        {item.item.isShow && (
                            <Image
                                style={styles.checkboxImageStyle}
                                source={require('@assets/checkbox.png')}></Image>
                        )}
                    </View>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <>
            {showAddCustomTokenModal && (
                <AddCustomToken
                    setShowAddCustomTokenModal={setShowAddCustomTokenModal}
                    showAddCustomTokenModal={showAddCustomTokenModal}
                    chainName={chainName}
                    address={address}
                    tokenAddedCallback={tokenAddedCallback}
                />
            )}

            <Modal
                isOpen={isShowManageTokens && !showAddCustomTokenModal}
                onClose={() => setIsShowManageTokens(false)}
                size={'full'}
                backgroundColor={colors.popupBgcolor}>
                <Modal.Content style={[NativeBaseModalStyle.ModalContent,styles.popupView]}>
                    <Modal.Header style={styles.modalHeaderFooter} pb={NativeBaseModalStyle.setHeaderPaddingBottom}>
                        <View style={styles.titleView}>
                            <Text style={styles.title}>
                                {ConstantStrings.MANAGE_TOKEN}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsShowManageTokens(false);
                                }}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={styles.closeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchContainerStyle}>
                            <Image
                                source={require('@assets/search.png')}
                                style={[
                                    styles.searchIcon,
                                    {
                                        tintColor: colors.menuDotsTint,
                                    },
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
                    </Modal.Header>

                    <FlatList
                        data={searchedArray}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        style={styles.flatListStyle}
                    />

                    <Modal.Footer
                        style={[
                            styles.modalHeaderFooter,
                            styles.extraModalFooter,
                        ]}
                        pt={NativeBaseModalStyle.setFooterPaddingTop}>
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
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    chainTitles: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginLeft: 8,
    },
    checkboxImageStyle: {
        height: 20,
        tintColor: colors.purple_button_color,
        width: 20,
    },
    closeIcon: {
        height: 24,
        width: 24,
    },
    extraInfo: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14 + 2.8,
    },
    extraModalFooter: {
        justifyContent: 'center',
    },
    flatListStyle: {
        margin: calculateHeight(8),
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
    imageLogoContainerStyle: {
        width: 35,
    },

    itemView: backgroundColor => ({
        borderRadius: 30,
        marginVertical: 2,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor,
    }),
    modalHeaderFooter: {
        backgroundColor: colors.white,
        borderColor: colors.transparent,
    },
    popupView: {
        maxHeight: '60%',
    },
    searchContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 20,
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
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 : 4,
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
