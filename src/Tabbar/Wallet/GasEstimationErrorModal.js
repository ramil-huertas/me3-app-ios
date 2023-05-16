import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { calculateHeight, calculateWidth, colors, fonts, sizes } from '@constants/theme';
import ConstantStrings from '@constants/ConstantStrings';


const GasEstimationErrorModal = ({ setShowGasEstimationModal }) => {
    return (
        <View>
            <View style={styles.gasEstimationImageView}>
                <Image style={styles.gasEstimationImage} source={require('@assets/gasEstimationError.png')}/>
            </View>
            <Text style={styles.gasEstimationText}>{ConstantStrings.UNABLE_TO_ESTIMATE_GAS}</Text>
            <Text style={styles.gasEstimationSubText}>{ConstantStrings.THE_TRANSACTION_CANNOT_PROCEED}</Text>
            <TouchableOpacity
                onPress={() => {
                    setShowGasEstimationModal(false);
                }}
                style={styles.gasEstimationCloseButton}>
                <Text style={styles.gasEstimationCloseText}>{ConstantStrings.CLOSE}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GasEstimationErrorModal;

const styles = StyleSheet.create({
    gasEstimationCloseButton: {
        alignItems: 'center',
        backgroundColor:colors.ghost_white,
        borderRadius:10,
        justifyContent: 'center',
        paddingHorizontal:calculateWidth(18),
        paddingVertical:calculateHeight(16),

    },
    gasEstimationCloseText: {
        color:colors.gray_textcolor,
        fontFamily:fonts.titillium_bold,
        fontSize:sizes.f14,
    },
    gasEstimationImage: {
        height:calculateHeight(80),
        width:calculateHeight(80)
    },
    gasEstimationImageView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.lavender_opacity_10,
        borderRadius:100,
        justifyContent: 'center',
        marginBottom:calculateHeight(20),
        padding: calculateHeight(24)
    },
    gasEstimationSubText: {
        color:colors.gray_textcolor,
        fontFamily:fonts.titillium_Regular,
        fontSize:sizes.f14,
        lineHeight:sizes.f18,
        marginVertical:calculateHeight(20),
        textAlign:'center'
    },
    gasEstimationText: {
        color:colors.mainColor,
        fontFamily:fonts.titillium_bold,
        fontSize:sizes.f20,
        lineHeight:sizes.f24,
        textAlign:'center'
    },
});
