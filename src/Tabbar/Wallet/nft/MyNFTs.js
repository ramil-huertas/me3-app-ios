import {
    View,
    Text,
    Image,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import { getWalletForChain } from '@database/sql';
import ConstantStrings from '@constants/ConstantStrings';
import { theme } from '@constants';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { logger } from '@constants/Log';
import { getNFTList, resetNFTListFromAction } from '@redux/Action/NFTAction';
import { useDispatch, useSelector } from 'react-redux';
const width = (Dimensions.get('screen').width - 40) / 2 - 12;
const MyNFTs = ({ navigation }) => {
    const [showNoNFTView, setShowNoNFTView] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [allNftList, setAllNftList] = useState([]);
    const [load, setLoad] = useState(false);
    const dispatch = useDispatch()
    const NFTReducer = useSelector(state => state.NFTReducer);

    useEffect(() => {
        getAllData();
    }, []);

    const getAllData = async () => {
        let nftList = NFTReducer.nftList;
        if (nftList == 0) {
            refreshDataByCallingApi()
        } else {
            setAllNftList(nftList);
            if (nftList.length == 0) setShowNoNFTView(true);
        }
    };

    const refreshDataByCallingApi = async () => {
        resetNFTListFromAction(dispatch)
        setIsRefreshing(true);
        setAllNftList([]);
        setLoad(true);
        setShowNoNFTView(false);
        await getNFTList(dispatch).then(allNFTList => {
            setAllNftList(allNFTList);
            if (allNFTList.length == 0) setShowNoNFTView(true);
        }).catch(error => console.log("error :: ", error));
        setIsRefreshing(false);
        setLoad(false);
    }

    const renderItem = item => {
        return (
            <SkeletonPlaceholder enabled={load}>
                <TouchableOpacity
                    onPress={async () => {
                        let selectedWallet;
                        await getWalletForChain(`${item.item.chain}`)
                            .then(async walletResult => {
                                selectedWallet = await walletResult.rows.item(
                                    0,
                                );
                            })
                            .catch(error => {
                                logger('Error ', error);
                            });
                        navigation.navigate('NftDetail', {
                            selectedNft: item.item,
                            clickedWallet: selectedWallet,
                        });
                    }}
                    style={styles.margin6Style}>
                    <View style={styles.imageContainerStyle}>
                        {load && (
                            <ActivityIndicator
                                style={styles.indicatorStyle}
                                size={'small'}
                                color={theme.colors.purple_button_color}
                            />
                        )}
                        {item.item.image != null ? (
                            <FastImage
                                source={{ uri: item.item.image }}
                                style={styles.fastImageStyle}
                                resizeMode={'cover'}
                            />
                        ) : (
                            <Image style={styles.imageStyle}></Image>
                        )}
                    </View>
                </TouchableOpacity>
            </SkeletonPlaceholder>
        );
    };
    return (
        <View>
            {showNoNFTView && (
                <View style={styles.emptyView}>
                    <Image
                        style={styles.emptyListImageStyle}
                        source={require('@assets/listEmpty.png')}
                    />
                    <Text style={styles.emptyText}>
                        {ConstantStrings.NO_NFTS_HERE_YET}
                    </Text>
                </View>
            )}
            <View style={styles.marginStyle}>
                {isRefreshing ? (
                    <ActivityIndicator color={colors.purple_dark} size={'large'} />
                ) : (
                    allNftList && (
                        <FlatList
                            columnWrapperStyle={styles.justifyContentStyle}
                            data={allNftList}
                            horizontal={false}
                            numColumns={2}
                            keyExtractor={(item, index) => index}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={refreshDataByCallingApi}
                                />
                            }
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                )}
            </View>
        </View>
    );
};

export default MyNFTs;

const styles = StyleSheet.create({
    emptyListImageStyle: {
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
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    fastImageStyle: {
        borderRadius: 12,
        height: 160,
        width: width,
    },
    imageContainerStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.gray_background_1,
        borderRadius: 12,
        height: 160,
        justifyContent: 'center',
        width: width,
    },
    imageStyle: {
        height: 160,
        resizeMode: 'stretch',
        width: width,
    },
    indicatorStyle: {
        zIndex: 1000,
    },
    justifyContentStyle: {
        justifyContent: 'space-between',
    },
    margin6Style: {
        margin: 6,
    },
    marginStyle: {
        marginHorizontal: 20,
    },
});
