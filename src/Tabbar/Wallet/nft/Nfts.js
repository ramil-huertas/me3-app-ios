import {
    View,
    Text,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes, Width } from '@constants/theme';
import ConstantStrings, {
    IMPORTNFT,
    SEARCHNFTS,
} from '@constants/ConstantStrings';
import { apiGetNFTList } from '@api/NFTsApi';
import ImportNFTModel from './ImportNFTModel';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { logger } from '@constants/Log';
import { getKeyboardType } from '@constants/commonFuncation';
import { useSelector } from 'react-redux';
const width = (Width - 40) / 2 - 12;

const Nfts = ({ navigation, clickedWallet }) => {

    const [searchText, setSearchText] = useState('');
    const [showNoNFTView, setShowNoNFTView] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [allNftList, setAllNftList] = useState([]);
    const [load, setLoad] = useState(false);
    const [showImportNFT, setShowImportNFT] = useState(false);
    const NFTReducer = useSelector(state => state.NFTReducer)
    useEffect(() => {
        getAllData();
    }, []);

    const getAllData = async () => {
        setLoad(true);
        setIsRefreshing(true);
        let nftList = NFTReducer.nftList;

        const temp = nftList?.filter(item => {
            return item.chain.toLowerCase() === clickedWallet.chain.toLowerCase()
        });
        if (temp && temp.length > 0) {
            setAllNftList(temp);
            setIsRefreshing(false);
            setLoad(false);
            if (temp.length == 0) setShowNoNFTView(true);
            else setShowNoNFTView(false);
        } else {
            callApiToRefreshData()
        }
    };

    const callApiToRefreshData = async () => {
        setLoad(true);
        setIsRefreshing(true);
        try {
            const params = {
                chainName: clickedWallet.chain,
                address: clickedWallet.address,
                pageNo: 1,
                pageSize: 10000000000,
            };
            let allNftList = await apiGetNFTList(params);
            let allNFTList = [];
            allNFTList = allNFTList.concat(
                allNftList.map(item => {
                    item.image =
                        item.image == null
                            ? null
                            : item.image.startsWith('ipfs')
                                ? `https://ipfs.io/ipfs/${item.image.slice(7)}`
                                : item.image;
                    return item;
                }),
            );
            setAllNftList(allNFTList);
            setIsRefreshing(false);
            setLoad(false);
            if (allNftList.length == 0) setShowNoNFTView(true);
            else setShowNoNFTView(false);
        } catch (error) {
            setIsRefreshing(false);
            logger('error from try catch of getAlldata in Nfts.js', error);
            setLoad(false);
        }
    }
    const renderItem = item => {
        return (
            <TouchableOpacity
                onPress={() => {
                    const sendObj = item.item;
                    sendObj.chain = clickedWallet.chain;
                    navigation.navigate('NftDetail', {
                        selectedNft: sendObj,
                        clickedWallet: clickedWallet,
                    });
                }}
                style={styles.margin6Style}>
                <View
                    style={styles.skeletonContainerStyle}>
                    <SkeletonPlaceholder enabled={load}>
                        {item.item.image != null ? (
                            <FastImage
                                source={{ uri: item.item.image }}
                                style={styles.fastImageStyle}
                                resizeMode={'cover'}
                            />
                        ) : (
                            <Image
                                style={styles.imageStyle}
                                resizeMode={'contain'}></Image>
                        )}
                    </SkeletonPlaceholder>
                </View>
            </TouchableOpacity>
        );
    };
    const onAddNFT = () => {
        logger('add nft called');
        setShowImportNFT(true);
    };
    return (
        <View style={styles.emptyView}>
            {showImportNFT && (
                <ImportNFTModel
                    setShowNFTImport={setShowImportNFT}></ImportNFTModel>
            )}

            <View style={styles.flexAlignItemStyle}>
                <View
                    style={styles.searchContainerStyle}>
                    <Image
                        source={require('@assets/search.png')}
                        style={[
                            styles.icon,
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
                        placeholder={SEARCHNFTS}
                        selectionColor={colors.gray1_textcolor}
                        keyboardType={getKeyboardType()}
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete={'off'}
                    />
                </View>
                <TouchableOpacity style={styles.addToken} onPress={onAddNFT}>
                    <Image
                        source={require('@assets/Add.png')}
                        style={styles.addTokenIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.addTokenText}>{IMPORTNFT}</Text>
                </TouchableOpacity>
            </View>
            <View>
                {showNoNFTView ? (
                    <View
                        style={styles.nonftContainerStyle}>
                        <Image
                            style={styles.emptyListIconStyle}
                            source={require('@assets/listEmpty.png')}
                        />
                        <Text style={styles.emptyText}>
                            {ConstantStrings.NO_NFTS_HERE_YET}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.marginHoriz0Style}>
                        {allNftList && allNftList.length > 0 && (
                            <FlatList
                                columnWrapperStyle={styles.flatlistColumnWrapperStyle}
                                data={allNftList}
                                horizontal={false}
                                numColumns={2}
                                keyExtractor={(item, index) => index}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={callApiToRefreshData}
                                    />
                                }
                                style={styles.marginTop10Style}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default Nfts;
const styles = StyleSheet.create({
    addToken: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: 109,
    },
    addTokenIcon: {
        height: 20,
        marginRight: 4,
        tintColor: colors.white,
        width: 20,
    },
    addTokenText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
    emptyListIconStyle: {
        height: 140,
        width: 140,
    },
    emptyText: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.f14,
    },
    emptyView: {
        // alignItems: 'center',
    },
    fastImageStyle: {
        borderRadius: 12,
        height: 160,
        width: width,
    },
    flatlistColumnWrapperStyle: {
        justifyContent: 'space-between',
    },
    flexAlignItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    icon: {
        height: 24,
        width: 24,
    },
    imageStyle: {
        borderRadius: 12,
        height: 160,
        width: width,
    },
    margin6Style: {
        margin: 6,
    },
    marginHoriz0Style: {
        marginHorizontal: 0,
    },
    marginTop10Style: {
        marginTop: 10,
    },
    nonftContainerStyle: {
        alignItems: 'center',
        marginTop: 28,
    },
    searchContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    searchTokenTextInput: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 : 4,
    },
    skeletonContainerStyle: {
        alignItems: 'center',
        backgroundColor: colors.gray_background_1,
        borderRadius: 12,
        height: 160,
        justifyContent: 'center',
        width: width,
    },
});
