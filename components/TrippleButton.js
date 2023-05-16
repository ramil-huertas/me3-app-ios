import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { fonts, colors, sizes } from '@constants/theme';

const TrippleButton = ({
    viewStyle,
    condition,
    condition1,
    condition2,
    tabOnePress,
    SelectedTabTitleStyle,
    NonSelectedTabTitleStyle,
    SelectedTabOneStyle,
    SelectedTabTwoStyle,
    SelectedTabThreeStyle,
    tabOneTitle,
    tabTwoTitle,
    tabTwoPress,
    tabThreePress,
    tabThreeTitle,
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
                    condition1
                        ? [styles.SelectedTab, SelectedTabTwoStyle]
                        : [styles.NonSelectedTab, SelectedTabTwoStyle]
                }
                onPress={tabTwoPress}>
                <Text
                    style={
                        condition1
                            ? [styles.SelectedTabTitle, SelectedTabTitleStyle]
                            : [
                                  styles.NonSelectedTabTitle,
                                  NonSelectedTabTitleStyle,
                              ]
                    }>
                    {tabTwoTitle}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={
                    condition2
                        ? [styles.SelectedTab, SelectedTabThreeStyle]
                        : [styles.NonSelectedTab, SelectedTabThreeStyle]
                }
                onPress={tabThreePress}>
                <Text
                    style={
                        condition2
                            ? [styles.SelectedTabTitle, SelectedTabTitleStyle]
                            : [
                                  styles.NonSelectedTabTitle,
                                  NonSelectedTabTitleStyle,
                              ]
                    }>
                    {tabThreeTitle}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TrippleButton;

const styles = StyleSheet.create({
    NonSelectedTab: {
        alignItems: 'center',
        backgroundColor: colors.white,
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
