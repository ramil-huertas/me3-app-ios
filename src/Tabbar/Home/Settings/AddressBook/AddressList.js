import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import {
    calculateHeight,
    calculateWidth,
    colors,
    fonts,
    sizes,
} from '@constants/theme';
import CustomImage from '@components/CustomImage';
const AddressList = ({ item, editItem, onDeleteAddress, onPress }) => {
    return (
        <View style={styles.parentView}>
            <TouchableOpacity
                style={styles.chainView}
                onPress={() => onPress(item)}>
                <View>
                    <CustomImage imageUrl={item && item.chain_icon} />
                </View>
                <View style={{ marginLeft: calculateWidth(8) }}>
                    <Text style={styles.nameStyle}>{item && item.name}</Text>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode={'middle'}
                        style={styles.addressStyle}>
                        {item && item.wallet_address}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                    editItem(item);
                }}
                style={styles.buttonView}>
                <Image
                    resizeMode="contain"
                    source={require('@assets/edit.png')}
                    style={styles.iconView}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                    onDeleteAddress(item);
                }}
                style={styles.buttonView}>
                <Image
                    resizeMode="contain"
                    source={require('@assets/delete.png')}
                    style={styles.iconView}
                />
            </TouchableOpacity>
        </View>
    );
};

export default AddressList;
const styles = StyleSheet.create({
    addressStyle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        width: calculateWidth(100),
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    chainView: {
        alignItems: 'center',

        flex: 1,
        flexDirection: 'row',
    },
    iconView: {
        height: calculateHeight(20),
        tintColor: colors.gray_textcolor,
        width: calculateHeight(20),
    },
    nameStyle: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
    parentView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 8,
        flexDirection: 'row',
        marginVertical: calculateHeight(2),
        padding: calculateHeight(12),
    },
});
