import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import { colors, fonts, sizes, calculateHeight } from '@constants/theme';
import { theme } from '@constants';
import CustomImage from '@components/CustomImage';
import { SELCTED_WALLET } from '@constants/ConstantStrings';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';

export default function AlchemyChangeWallet({
    setShowChangeWallet,
    setSelectedChainWallet,
    ChangeWalletList,
}) {
    const renderItem = Item => {
        let imageUrl = Item.item.chainDetail.chain_icon;
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        const eventObject = {
                            timeOfClick: new Date().toLocaleString(),
                        };
                        firebaseAnalytics(
                            `swap_select_${Item.item.chain.toLowerCase()}`,
                            eventObject,
                        );
                        setSelectedChainWallet(Item.item);
                        setShowChangeWallet(false);
                    }}>
                    <View style={styles.detailsView}>
                        {console.log(imageUrl)}
                        <CustomImage imageUrl={imageUrl} />
                        <View style={styles.cyptoSubView}>
                            <View style={styles.backupTextView}>
                                <Text style={styles.txtCyptoHead}>
                                    {Item.item.chainDetail.name}
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
        <View>
            <View style={styles.titleView}>
                <Text style={styles.title}>{SELCTED_WALLET}</Text>
                <TouchableOpacity
                    onPress={() => {
                        setShowChangeWallet(false);
                    }}>
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
                data={ChangeWalletList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index}
                contentContainerStyle={styles.paddingBtm5}
                style={styles.flatList}></FlatList>
        </View>
    );
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
        marginBottom: 4,
    },

    flatList: {
        // marginTop: 1
    },

    paddingBtm5: { paddingBottom: 30 },

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
