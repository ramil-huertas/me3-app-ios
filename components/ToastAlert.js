/**
 * modal types = >
 * BannerError,BannerSuccess,BannerInfo
 **/

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, fonts, sizes } from '@constants/theme';
import { clearAlert, showToast } from '@redux/Action/ToastAlert';
import { ERROR, WARN } from '@constants/ConstantStrings';

const ToastAlert = () => {
    const dispatch = useDispatch();
    const ToastAlertReducer = useSelector(state => state.ToastAlert);

    useEffect(() => {
        if(ToastAlertReducer.alertObject.showAlert){
            setTimeout(() => {
                clearAlert(dispatch)
            }, 2500);
        }
    }, [ToastAlertReducer.alertObject.showAlert]);

    const getImageSource = () => {
        if (ToastAlertReducer.alertObject.modalType == WARN) {
            return require('@assets/BioError.png');
        } else if (ToastAlertReducer.alertObject.modalType == ERROR) {
            return require('@assets/error_icon.png');
        } else {
            return require('@assets/CopySuccess.png');
        }
    };

    return (
        <>
            {ToastAlertReducer.alertObject.showAlert && (
                <View style={[styles.contain, styles.getBottomPosition]}>
                    <View style={styles.popupView}>
                        {ToastAlertReducer.alertObject.showImage && (
                            <Image
                                source={getImageSource()}
                                style={styles.icon}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.txtTitle}>
                            {ToastAlertReducer.alertObject.message}
                        </Text>
                    </View>
                </View>
            )}
        </>
    );
};

export default ToastAlert;
const styles = StyleSheet.create({
    contain: {
        alignSelf: 'center',
        elevation: 10000,
        padding: 10,
        position: 'absolute',
        zIndex: 10000,
    },
    getBottomPosition: {
        bottom: Platform.OS === 'ios' ? 45 : 25,
    },

    icon: {
        height: 20,
        marginRight: 5,
        width: 20,
    },

    popupView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background,
        borderRadius: 8,
        borderWidth: 1,
        // marginBottom: 95,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        // shadowOffset:{height:0,width:0},
        shadowColor: colors.shadow2,
        shadowOpacity: 0.12,
    },

    txtTitle: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
    },
});
