import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import { logger } from '@constants/Log';
export default function ConntedWalletView({ Item, showDetailsCallback }) {
    const [selectedWallet, setSelectedWallet] = useState(null);

    useEffect(() => {
        try {
            if (Item.address != undefined) {
                let data = JSON.parse(Item.address);
                setSelectedWallet(data);
            } else {
                setSelectedWallet(null);
            }
        } catch (error) {
            logger('connected wallet error ', error);
            setSelectedWallet(null);
        }
    }, []);
    return (
        <TouchableOpacity
            onPress={() => {
                showDetailsCallback(Item);
            }}>
            <View style={styles.cryptoView}>
                <Image
                    source={{
                        uri:
                            Item &&
                            Item.remotePeerMeta &&
                            Item.remotePeerMeta.icons[0],
                    }}
                    resizeMode="contain"
                    style={styles.iconFrame}></Image>
                <View style={styles.cyptoSubView}>
                    <View style={styles.backupTextView}>
                        <Text style={styles.txtCyptoHead}>
                            {Item &&
                                Item.remotePeerMeta &&
                                Item.remotePeerMeta.name}
                        </Text>
                        <Text style={styles.txtCyptoSubHead}>
                            {selectedWallet && selectedWallet.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={styles.txtCyptoToken}>
                            {selectedWallet && selectedWallet.address}
                        </Text>
                    </View>
                    <Image
                        source={{ uri: selectedWallet && selectedWallet.icon }}
                        resizeMode="contain"
                        style={styles.iconFrame}></Image>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backupTextView: {
        alignItems: 'flex-start',
        flex: 0.9,
        flexDirection: 'column',
        marginLeft: 10,
    },

    cryptoView: {
        alignItems: 'center',
        borderRadius: 16,
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 15,
    },

    cyptoSubView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingRight: 10,
    },

    iconFrame: {
        height: 38,
        width: 38,
    },

    txtCyptoHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f14,
        marginTop: 15,
    },

    txtCyptoSubHead: {
        color: colors.black,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        marginTop: 2,
    },

    txtCyptoToken: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f12,
        marginTop: 2,
        width: '60%',
    },
});
