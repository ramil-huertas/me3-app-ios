import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    NativeBaseModalStyle,
} from '@constants/theme';
import { theme } from '@constants';
import { retrieveKeyValueData, saveKeyValueData } from '@constants/Storage';
import CustomImage from '@components/CustomImage';
import { SELCTED_WALLET } from '@constants/ConstantStrings';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { getAllWalletsWithchainDetail } from '@database/sql';
import { setSwapWallet } from '@redux/Action/SwapAction';
import { useDispatch } from 'react-redux';
import ConstStorage from '@constants/ConstStorage';
import {
    getWalletsBasedOnSetting,
    getMainnetChainsOnlyForSwap,
} from '@constants/commonFuncation';
import { Modal } from 'native-base';
export default function ChangeWallet({
    setShowChangeWallet,
    setSelectedChainWallet,
    AllChain,
    setSwapAmount,
    setSwapToAmount,
    setFee,
    isFromSend,
    showChangeWallet,
}) {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);

    useEffect(() => {
        getWalletList();
    }, []);
    async function getWalletList() {
        let allWallets = await getAllWalletsWithchainDetail();
        let walletList = [];
        for (let i = 0; i < allWallets.rows.length; i++) {
            walletList.push(allWallets.rows.item(i));
        }

        let chainlist = JSON.parse(await retrieveKeyValueData('allChains'));
        if (AllChain != null && AllChain) {
            for (const item of walletList) {
                let chain_detail = chainlist.find(chain_item => {
                    return (
                        chain_item.chain.toLowerCase() ==
                        item.chain.toLowerCase()
                    );
                });
                item.chainDetail = chain_detail;
            }
            let walletListtoSet = await getWalletsBasedOnSetting(walletList);
            walletListtoSet.sort((a, b) => {
                if (a.symbol > b.symbol) {
                    return 1;
                } else {
                    return -1;
                }
            });
            console.log("******", walletListtoSet)
            setData(walletListtoSet);
        } else {
            let chains = await getMainnetChainsOnlyForSwap();
            let wallets = chains
                .map(item => {
                    let wallet_detail = walletList.find(wallet_item => {
                        return (
                            wallet_item.chain.toLowerCase() ==
                            item.toLowerCase()
                        );
                    });

                    if (wallet_detail != undefined) {
                        let icon = chainlist.find(chain_item => {
                            return chain_item.chain.toLowerCase() ==
                                item.toLowerCase()
                                ? chain_item.chain_icon
                                : '';
                        });
                        wallet_detail.chainDetail = icon;
                        return wallet_detail;
                    }
                })
                .filter(item => {
                    return item ? true : false;
                });
            wallets.sort((a, b) => {
                return a.symbol > b.symbol ? 1 : -1;
            });
            console.log("******dbsjdfsdf", wallets.length)

            setData(wallets);
        }
    }
    const listItemClick = async dataItem => {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(
            `swap_select_${dataItem.chain.toLowerCase()}`,
            eventObject,
        );
        setSelectedChainWallet(dataItem);
        if (!isFromSend) {
            await saveKeyValueData(
                ConstStorage.SWAP_WALLET_CHAIN,
                JSON.stringify(dataItem),
            );
            setSwapWallet(dispatch, dataItem);
            setSwapAmount('');
            setSwapToAmount('');
        }
        setFee(0);
        setShowChangeWallet(false);
    };
    const renderItem = Item => {
        let imageUrl = Item.item.chainDetail.chain_icon;
        return (
            <View>
                <TouchableOpacity
                    onPress={async () => {
                        listItemClick(Item.item);
                    }}>
                    <View style={styles.detailsView}>
                        <CustomImage imageUrl={imageUrl} />
                        <View style={styles.cyptoSubView}>
                            <View style={styles.backupTextView}>
                                <Text style={styles.txtCyptoHead}>
                                    {Item.item.chainDetail.name.trim()}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={styles.txtCyptoSubHead}>
                                    {Item.item.address}
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
            size={'full'}
            isOpen={showChangeWallet}
            onClose={() => {
                onCancelClick();
            }}
            backgroundColor={colors.popupBgcolor}
            animationPreset="fade">
            <Modal.Content
                style={NativeBaseModalStyle.setBottomModal}
                p={'2'}
                pb={'6'}>
                <Modal.Body _scrollview={{ bounces: false }}>
                    <View style={styles.titleView}>
                        <Text style={styles.title}>{SELCTED_WALLET}</Text>
                        <TouchableOpacity onPress={onCancelClick}>
                            <Image
                                source={require('@assets/close.png')}
                                style={[
                                    theme.customStyle.closeIcon,
                                    { tintColor: theme.colors.gray1_textcolor },
                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={styles.paddingBtm5}
                        style={styles.flatList}
                    />
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );

    function onCancelClick() {
        setShowChangeWallet(false);
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

    cyptoSubView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },

    detailsView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        flexDirection: 'row',
        height: calculateHeight(58),
        justifyContent: 'center',
        // marginBottom: 4,
    },

    flatList: {
        // marginBottom: calculateHeight(10)
    },

    paddingBtm5: {},

    title: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
    },

    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
        // marginTop: 28,
    },

    txtCyptoHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
    },
    txtCyptoSubHead: {
        color: colors.neutral60,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        width: '30%',
    },
});
