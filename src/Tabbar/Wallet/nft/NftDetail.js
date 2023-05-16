import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ImageBackground,
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
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import { apiGetNFTDetail } from '@api/NFTsApi';
import Clipboard from '@react-native-clipboard/clipboard';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { logger } from '@constants/Log';
import { useDispatch } from 'react-redux';
import { showMessageToast } from '@redux/Action/ToastAlert';
import CustomImage from '@components/CustomImage';
import { getWalletForChain, getChainDetail } from '@database/sql';

const NftDetail = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [nftDetail, setNftDetail] = useState(null);
    const [nftImage, setNftImage] = useState('');
    const [load, setLoad] = useState(false);
    const [chainIcon, setChainIcon] = useState(null);
    const [chainName, setChainName] = useState(null);
    const { chain, address } = route.params && route.params.clickedWallet;
    useEffect(() => {
        //   setNftDetail(route.params.selectedNft)
        getNFTDetail();
        getNFTChainDetails();
    }, []);

    function getNFTDetail() {
        setLoad(true);
        const params = {
            tokenId: route.params.selectedNft.tokenId,
            tokenAddress: route.params.selectedNft.tokenAddress,
            chainName: route.params.selectedNft.chain,
        };
        apiGetNFTDetail(params)
            .then(result => {
                //  setNftMetadata(JSON.parse(result.metadata))
                //
                logger('nftdetail', result);
                if (result.metadata && JSON.parse(result.metadata).image) {
                    const newImageUrl =
                        JSON.parse(result.metadata).image == null
                            ? null
                            : JSON.parse(result.metadata).image.startsWith(
                                'ipfs',
                            )
                                ? `https://ipfs.io/ipfs/${JSON.parse(
                                    result.metadata,
                                ).image.slice(7)}`
                                : JSON.parse(result.metadata).image;
                    logger('result.metadata', newImageUrl);
                    setNftImage(newImageUrl);
                    setLoad(false);
                } else {
                    logger('set', '');
                    setNftImage('');
                    setLoad(false);
                }

                setNftDetail(result);
            })
            .catch(error => {
                logger('NFT detail error => ', error);
                setLoad(false);
            });
    }

    const getNFTChainDetails = async () => {
        const walletofChain = await getWalletForChain(chain);
        const ChainDetails = await getChainDetail(
            walletofChain.rows.item(0).chain,
        );
        const DetailsOfChain = ChainDetails.rows.item(0);
        setChainIcon(DetailsOfChain.chain_icon);
        setChainName(DetailsOfChain.name);
    };
    return (
        <SafeAreaView style={styles.containerStyle}>
            <StatusBar
                animated={true}
                backgroundColor={colors.white}
                barStyle={'dark-content'}
            />
            <ScrollView style={styles.scrollviewStyle} bounces={false}>
                <SkeletonPlaceholder enabled={load}>
                    <View
                        style={styles.imageContainerStyle}>
                        {nftImage && nftImage.length > 0 ? (
                            <FastImage
                                source={{ uri: nftImage }}
                                resizeMode={'contain'}
                                style={{
                                    width: Width,
                                    height: Width,
                                }}
                            />
                        ) : (
                            <Image
                                style={styles.imageStyle}></Image>
                        )}
                    </View>
                </SkeletonPlaceholder>
                <TouchableOpacity
                    onPress={() => {
                        navigation.pop();
                    }}
                    style={styles.backButtonView}>
                    <Image
                        source={require('@assets/back.png')}
                        style={[
                            theme.customStyle.closeIcon,
                            { tintColor: colors.white },
                        ]}
                    />
                </TouchableOpacity>

                <View style={{ marginHorizontal: calculateWidth(32) }}>
                    <Text style={styles.title}>
                        {nftDetail && nftDetail.name}
                    </Text>

                    <View
                        style={styles.chainContainerStyle}>
                        <TouchableOpacity style={styles.walletView}>
                            <View>
                                <CustomImage
                                    imageUrl={chainIcon && chainIcon}
                                />
                            </View>
                            <View style={{ marginLeft: calculateWidth(8) }}>
                                <Text
                                    style={{
                                        fontFamily: fonts.titillium_bold,
                                        fontSize: sizes.f16,
                                        color: colors.mainColor,
                                    }}>
                                    {chainName && chainName.trim()}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode={'tail'}
                                    style={{
                                        fontFamily: fonts.titillium_bold,
                                        fontSize: sizes.f12,
                                        color: colors.gray_textcolor,
                                        width: calculateWidth(65),
                                    }}>
                                    {address && address}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.sendNFTStyle}>
                            <TouchableOpacity
                                onPress={() => {
                                    logger(
                                        'route.params.selectedNft',
                                        route.params.selectedNft,
                                    );
                                    logger(
                                        'route.params.clickedWallet',
                                        route.params.clickedWallet,
                                    );
                                    navigation.navigate('SendNFT', {
                                        nftImage: nftImage,
                                        selectedNft: route.params.selectedNft,
                                        clickedWallet:
                                            route.params.clickedWallet,
                                    });
                                }}
                                style={styles.itemButton}>
                                <Image
                                    source={require('@assets/send.png')}
                                    style={styles.itemIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Text style={styles.itemButtonText}>
                                {ConstantStrings.send}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.DetailsText}>
                            {ConstantStrings.DETAILS}
                        </Text>

                        <View style={styles.desscriptionContainerStyle}>
                            <Text style={styles.labelStyle}>
                                {ConstantStrings.CONTRACT_ADDRESS}
                            </Text>
                            <SkeletonPlaceholder enabled={load}>
                                <TouchableOpacity
                                    style={styles.copiedTouchableStyle}
                                    onPress={() => {
                                        Clipboard.setString(
                                            nftDetail.token_address,
                                        );
                                        showMessageToast(
                                            dispatch,
                                            'Contract Address Copied to clipboard.',
                                        );
                                    }}>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                        style={[
                                            styles.valueStyle,
                                            styles.tokenAddressStyle,
                                        ]}>
                                        {nftDetail && nftDetail.token_address}
                                    </Text>
                                    <Image
                                        style={styles.copyImageStyle}
                                        source={require('@assets/copy.png')}
                                    />
                                </TouchableOpacity>
                            </SkeletonPlaceholder>
                        </View>

                        <View style={styles.tokenIdContainerStyle}>
                            <Text style={styles.labelStyle}>
                                {ConstantStrings.TOKEN_ID}
                            </Text>
                            <SkeletonPlaceholder enabled={load}>
                                <TouchableOpacity
                                    style={styles.tokenIdCopiedStyle}
                                    onPress={() => {
                                        Clipboard.setString(nftDetail.token_id);
                                        showMessageToast(
                                            dispatch,
                                            'TokenID Copied to clipboard.',
                                        );
                                    }}>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={[
                                            styles.valueStyle,
                                            styles.tokenIdValueStyle,
                                        ]}>
                                        {nftDetail && nftDetail.token_id}
                                    </Text>
                                    <Image
                                        style={styles.copyIconStyle}
                                        source={require('@assets/copy.png')}
                                    />
                                </TouchableOpacity>
                            </SkeletonPlaceholder>
                        </View>

                        <View style={styles.flexDirectionStyle}>
                            <Text style={styles.labelStyle}>
                                {ConstantStrings.TOKEN_STANDARD}
                            </Text>
                            <SkeletonPlaceholder enabled={load}>
                                <Text style={styles.valueStyle}>
                                    {nftDetail && nftDetail.contract_type}
                                </Text>
                            </SkeletonPlaceholder>
                        </View>
                        <View style={styles.flexDirectionStyle}>
                            <Text style={styles.labelStyle}>
                                {ConstantStrings.BLOCKCHAIN}
                            </Text>
                            <SkeletonPlaceholder enabled={load}>
                                <Text style={styles.valueStyle}>
                                    {nftDetail && nftDetail.symbol}
                                </Text>
                            </SkeletonPlaceholder>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NftDetail;

const styles = StyleSheet.create({
    DetailsText: {
        color: theme.colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24 + 4,
    },
    backButtonView: {
        alignItems: 'center',
        backgroundColor: colors.RaisinBlack_opacity43,
        borderRadius: 50,
        justifyContent: 'center',
        margin: calculateHeight(34),
        padding: calculateHeight(6),
        position: 'absolute',
    },
    chainContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: calculateHeight(17),
    },
    containerStyle: {
        backgroundColor: theme.colors.white,
        flex: 1,
    },
    copiedTouchableStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    copyIconStyle: {
        height: 15,
        marginTop: 1,
        tintColor:
            theme.colors
                .purple_button_color,
        width: 15,
    },
    copyImageStyle: {
        height: 15,
        marginTop: 1,
        tintColor:
            theme.colors
                .purple_button_color,
        width: 15,
    },
    desscriptionContainerStyle: {
        flexDirection: 'row',
        marginTop: 5,
    },
    flexDirectionStyle: {
        flexDirection: 'row',
    },
    imageContainerStyle: {
        alignItems: 'center',
        alignSelf: 'center',
        height: Width,
        justifyContent: 'center',
        width: Width,
    },
    imageStyle: {
        backgroundColor:
            theme.colors.gray_textcolor,
        height: Width,
        resizeMode: 'contain',
        width: Width,
    },
    itemButton: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 30,
        justifyContent: 'center',
        padding: 12,
    },
    itemButtonText: {
        color: theme.colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginTop: 4,
    },
    itemIcon: {
        height: 20,
        width: 20,
    },
    labelStyle: {
        color: theme.colors.dark_gray,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
        marginBottom: 2,
        marginTop: 2,
    },

    scrollviewStyle: {
        marginBottom: 10,
    },
    sendNFTStyle: {
        alignItems: 'center',
        marginTop: 8,
    },

    title: {
        color: theme.colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f18,
        lineHeight: theme.sizes.lh24 + 4,
        marginTop: calculateHeight(20),
        textAlign: 'center',
    },
    tokenAddressStyle: {
        color: theme.colors
            .purple_button_color,
        marginRight: 8,
        textAlign: 'left',
    },
    tokenIdContainerStyle: {
        flexDirection: 'row',
    },
    tokenIdCopiedStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    tokenIdValueStyle: {
        color: theme.colors
            .purple_button_color,
        marginRight: 8,
    },
    valueStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        lineHeight: theme.sizes.lh18,
        marginBottom: 2,
        marginTop: 2,
        textAlign: 'right',
        width: Width / 3,
    },
    walletView: {
        alignItems: 'center',
        backgroundColor: colors.ghost_white,
        borderRadius: 30,
        flex: 1,
        flexDirection: 'row',
        marginRight: calculateWidth(16),
        paddingHorizontal: calculateHeight(12),
        paddingVertical: calculateWidth(8),
    },
});
