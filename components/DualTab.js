import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { colors, sizes } from '@constants/theme';
import { fonts } from '../constant/theme';

const DualTab = ({
    viewStyle,
    condition,
    tabOnePress,
    SelectedTabTitleStyle,
    NonSelectedTabTitleStyle,
    SelectedTabOneStyle,
    SelectedTabTwoStyle,
    tabOneTitle,
    tabTwoTitle,
    tabTwoPress,
    fromGift,
}) => {
    return (
        <View style={viewStyle}>
            <TouchableOpacity
                style={
                    condition
                        ? [styles.SelectedTab, SelectedTabOneStyle]
                        : [styles.NonSelectedTab, SelectedTabOneStyle]
                }
                onPress={tabOnePress}>
                <Text
                    style={
                        condition
                            ? [styles.SelectedTabTitle, SelectedTabTitleStyle]
                            : [
                                  styles.NonSelectedTabTitle,
                                  NonSelectedTabTitleStyle,
                              ]
                    }>
                    {tabOneTitle}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={
                    !condition
                        ? [styles.SelectedTab, SelectedTabTwoStyle]
                        : [styles.NonSelectedTab, SelectedTabTwoStyle]
                }
                onPress={tabTwoPress}>
                <Text
                    style={
                        !condition
                            ? [styles.SelectedTabTitle, SelectedTabTitleStyle]
                            : [
                                  styles.NonSelectedTabTitle,
                                  NonSelectedTabTitleStyle,
                              ]
                    }>
                    {tabTwoTitle}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default DualTab;

const styles = StyleSheet.create({
    NonSelectedTab: {
        alignItems: 'center',
        backgroundColor: colors.neutral10,
        borderRadius: 30,
        flex: 1,
        height: 32,
        justifyContent: 'center',
    },
    NonSelectedTabTitle: {
        alignSelf: 'center',
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        justifyContent: 'center',
    },
    SelectedTab: {
        alignItems: 'center',
        backgroundColor: colors.menuDotsTint,
        borderRadius: 30,
        flex: 1,
        height: 32,
        justifyContent: 'center',
    },
    SelectedTabTitle: {
        alignSelf: 'center',
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        justifyContent: 'center',
    },
});
