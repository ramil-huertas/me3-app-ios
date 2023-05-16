import React from 'react';

import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Image,
    StatusBar,
} from 'react-native';
import { theme } from '@constants';
import string from '@constants/ConstantStrings';

export default function GooglePermissionDenied({ navigation, route }) {
    return (
        <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.mainColor}
                barStyle={'light-content'}
            />
            <View style={styles.allowAccessContainerStyle}>
                <Text style={[styles.textStyle, styles.allowMeThreeAccessText]}>
                    {string.ALLOW_ME3_TO_ACCESS_GOOGLE_DRIVE}
                </Text>
                <Text
                    style={[styles.textStyle, styles.meThreeRequireAccessText]}>
                    {string.ME3_REQUIRE_ACCESS_DESCRIPTION}
                </Text>
                <TouchableOpacity
                    style={styles.googleSignInTouchable}
                    onPress={() => {
                        route.params.key();
                        navigation.goBack();
                    }}>
                    <View style={styles.bottomSigninButtonStyle}>
                        <Image
                            style={styles.googleSignInIcon}
                            source={require('@assets/google_icon.png')}></Image>
                        <Text style={styles.bottomButtonStyle}>
                            {string.SIGN_IN_WITH_GOOGLE}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    allowAccessContainerStyle: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    allowMeThreeAccessText: {
        fontSize: theme.sizes.h1,
        width: '88%',
    },
    bottomButtonStyle: {
        color: theme.colors.black,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.button_text_size,
        marginLeft: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    bottomSigninButtonStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.sizes.button_border_radius,
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'center',
    },

    container: {
        backgroundColor: theme.colors.mainColor,
        flex: 1,
        justifyContent: 'center',
    },
    googleSignInIcon: {
        height: 23,
        width: 23,
    },
    googleSignInTouchable: {
        height: '8%',
        width: '88%',
    },
    meThreeRequireAccessText: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 18,
        marginBottom: '10%',
        marginTop: '10%',
    },
    textStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_bold,
        marginBottom: 10,
        textAlign: 'center',
        width: '88%',
    },
});
