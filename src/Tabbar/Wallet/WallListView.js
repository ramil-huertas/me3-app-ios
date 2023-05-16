import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@constants';

export default function WallListView({ Item, optionClickCallback }) {
    return (
        <LinearGradient
            colors={['#F5EBFF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.linearGradient}>
            <View style={styles.subView}>
                <Text style={styles.txtTitle}>My Game Wallet</Text>
                <Text style={styles.txtSubTitle}>Rp 0</Text>
            </View>
            <TouchableOpacity onPress={optionClickEvent}>
                <Image
                    source={require('@assets/Option.png')}
                    style={styles.opetionIcon}
                    resizeMode="contain"></Image>
            </TouchableOpacity>
        </LinearGradient>
    );

    function optionClickEvent() {
        optionClickCallback();
    }
}

const styles = StyleSheet.create({
    linearGradient: {
        alignItems: 'center',
        borderRadius: 16,
        flexDirection: 'row',
        flex: 1,
        height: 92,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 12,
    },

    opetionIcon: {
        height: 24,
        marginRight: 24,
        width: 24,
    },

    subView: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 24,
    },

    txtSubTitle: {
        color: theme.colors.purple_dark,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: 22,
    },

    txtTitle: {
        color: theme.colors.purple_dark,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 12,
    },
});
