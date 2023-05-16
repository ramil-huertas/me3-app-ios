import {
    Image,
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    Platform,
    SafeAreaView,
} from 'react-native';
import React, { useState } from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
    fonts,
} from '@constants/theme';
import { saveKeyValueData } from '@constants/Storage';
import { theme } from '@constants';
import CheckBox from '@react-native-community/checkbox';
import storageConst from '@constants/ConstStorage';
import {
    IUNDERSTANDTHAT,
    KEEPYOURKEYSSAFE,
    YOUCANKEEPYOURKEY,
    DONOTSHARE,
    CONTINUE,
} from '@constants/ConstantStrings';
import { setBackUpStatus } from '@redux/Action/BackupAction';
import { useDispatch } from 'react-redux';

export default function BackConfirmationPopup({
    setShowBackConfirmationPopup,
    navigation,
}) {
    const dispatch = useDispatch();
    const [isCheck, setIsCheck] = useState(false);

    const styles = StyleSheet.create({
        btnOk: {
            alignItems: 'center',
            backgroundColor: isCheck
                ? colors.purple_button_color
                : colors.purple_disable_button_color,
            borderRadius: 12,
            justifyContent: 'center',
            marginVertical: calculateHeight(24),
            padding: calculateHeight(16),
        },

        checkBoxView: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
        },
        iconLock: {
            alignSelf: 'center',
            height: 140,
            marginTop: 142 + StatusBar.currentHeight,
            width: 140,
        },

        mainContainer: {
            bottom: 0,
            marginHorizontal: calculateWidth(24),
            position: 'absolute',
        },

        popupView: {
            backgroundColor: colors.white,
            borderRadius: 12,
            flex: 1,
            position: 'relative',
        },
        txtContain: {
            alignItems: 'center',
            margin: calculateHeight(24),
        },
        txtDesc: {
            color: colors.gray_textcolor,
            fontFamily: fonts.titillium_bold,
            fontSize: theme.sizes.f14,
            marginBottom: calculateHeight(42),
            textAlign: 'center',
        },

        txtDesc1: {
            color: colors.purple_button_color,
            fontFamily: fonts.titillium_bold,
            fontSize: theme.sizes.f14,
            marginBottom: calculateHeight(42),
            textAlign: 'center',
        },

        txtIunderstand: {
            color: colors.gray_textcolor,
            fontFamily: fonts.titillium_bold,
            fontSize: theme.sizes.f12,
            marginLeft: calculateWidth(15),
        },
        txtOk: {
            color: colors.white,
            fontFamily: theme.fonts.titillium_bold,
            fontSize: theme.sizes.f14,
        },
        txtTitle: {
            color: colors.black,
            fontFamily: fonts.titillium_bold,
            fontSize: theme.sizes.f24,
            marginBottom: calculateHeight(18),
        },
    });

    const getCheckBoxStyles = () => {
        return Platform.OS === 'ios'
            ? null
            : { height: calculateHeight(25), width: calculateHeight(25) };
    };

    return (
        <Modal
            onRequestClose={() => {
                navigation.goBack();
            }}
            transparent={false}>
            <SafeAreaView style={styles.popupView}>
                <View style={styles.mainContainer}>
                    <View style={styles.checkBoxView}>
                        <CheckBox
                            style={getCheckBoxStyles()}
                            tintColors={{
                                true: theme.colors.purple_dark,
                                false: '#E4E4E4',
                            }}
                            disabled={false}
                            value={isCheck}
                            onValueChange={newValue => setIsCheck(newValue)}
                            boxType={'square'}
                            onAnimationType={'bounce'}
                            offAnimationType={'bounce'}
                            onCheckColor={theme.colors.white}
                            onFillColor={theme.colors.purple_dark}
                            onTintColor={theme.colors.purple_dark}
                        />
                        <Text style={styles.txtIunderstand}>
                            {IUNDERSTANDTHAT}
                        </Text>
                    </View>
                    <TouchableOpacity
                        disabled={!isCheck}
                        style={styles.btnOk}
                        onPress={btnOkClickEvent}>
                        <Text style={styles.txtOk}>{CONTINUE}</Text>
                    </TouchableOpacity>
                </View>
                <Image
                    source={require('@assets/lockAnimation.gif')}
                    style={styles.iconLock}
                    resizeMode="contain"></Image>
                <View style={styles.txtContain}>
                    <Text style={styles.txtTitle}>{KEEPYOURKEYSSAFE}</Text>
                    <Text style={styles.txtDesc}>{YOUCANKEEPYOURKEY}</Text>
                    <Text style={styles.txtDesc1}>{DONOTSHARE}</Text>
                </View>
            </SafeAreaView>
        </Modal>
    );

    function btnOkClickEvent() {
        saveKeyValueData(storageConst.BACKUPEDARGEE, 'TRUE');
        setBackUpStatus(dispatch, true);
        setShowBackConfirmationPopup(false);
    }
}
