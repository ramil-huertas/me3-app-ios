import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
    colors,
    fonts,
    Width,
    sizes,
    flexDirectionRow,
} from '@constants/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { useDispatch } from 'react-redux';

export default function TransactionDetailCellsView({
    label,
    value,
    isShowCopy,
}) {
    const dispatch = useDispatch();

    return (
        <View>
            <View style={styles.parentView}>
                <Text style={styles.labelStyle}>{label}</Text>
                {isShowCopy ? (
                    <TouchableOpacity
                        style={flexDirectionRow}
                        onPress={() => {
                            Clipboard.setString(value);
                            showMessageToast(
                                dispatch,
                                'Hash Copied to clipboard.',
                            );
                        }}>
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="middle"
                            style={[styles.valueStyle, styles.valueExtraStyle]}>
                            {value}
                        </Text>
                        <Image
                            style={styles.copyImage}
                            source={require('@assets/copy.png')}
                        />
                    </TouchableOpacity>
                ) : (
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={styles.valueStyle}>
                        {value}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    copyImage: {
        height: 15,
        marginTop: 1,
        tintColor: colors.gray_textcolor,
        width: 15,
    },
    labelStyle: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh18,
        marginBottom: 2,
        marginTop: 2,
    },
    parentView: {
        backgroundColor: colors.ghost_white,
        borderRadius: 4,
        flexDirection: 'row',
        marginTop: 5,
        padding: 16,
    },
    valueExtraStyle: {
        marginRight: 8,
        textAlign: 'left',
    },
    valueStyle: {
        //    flex:0.5,
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh18,
        marginBottom: 2,
        marginTop: 2,
        textAlign: 'right',
        width: Width / 4,
    },
});
