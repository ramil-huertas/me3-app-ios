import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { colors, fonts, sizes, calculateHeight } from '@constants/theme';
import {
    NO_RESULT_FOUND_IN_FAQS,
    TRY_SEARCHING_IN_FAQS,
} from '@constants/ConstantStrings';

const EmptyFaq = () => {
    return (
        <View style={styles.emptyComponent}>
            <Image
                source={require('@assets/no_faqs.png')}
                style={styles.no_faqs}
                resizeMode="contain"
            />
            <Text style={styles.noResultFound}>{NO_RESULT_FOUND_IN_FAQS}</Text>
            <Text style={styles.noResultFoundSubText}>
                {TRY_SEARCHING_IN_FAQS}
            </Text>
        </View>
    );
};

export default EmptyFaq;
const styles = StyleSheet.create({
    emptyComponent: {
        alignItems: 'center',
        marginTop: calculateHeight(48),
    },
    noResultFound: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginTop: calculateHeight(8),
    },
    noResultFoundSubText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginTop: calculateHeight(4),
    },
    no_faqs: {
        height: calculateHeight(126),
        width: calculateHeight(126),
    },
});
