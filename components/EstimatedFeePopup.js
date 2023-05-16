import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import React from 'react';
import { colors, calculateWidth, calculateHeight } from '@constants/theme';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import WarningMessage from './WarningMessage';

export default function EstimatedFeePopup({ setEstimatedFeePopupShowStatus }) {
    return (
        <Modal
            onRequestClose={() => {
                setEstimatedFeePopupShowStatus(false);
            }}
            visible={true}
            transparent={true}>
            <TouchableOpacity
                activeOpacity={1}
                style={styles.contain}
                onPress={() => {
                    setEstimatedFeePopupShowStatus(false);
                }}>
                <TouchableOpacity activeOpacity={1} style={styles.popupStyle}>
                    <View style={styles.closeButtonView}>
                        <TouchableOpacity
                            onPress={() => {
                                setEstimatedFeePopupShowStatus(false);
                            }}>
                            <Image
                                source={require('@assets/close.png')}
                                style={{
                                    height: calculateHeight(20),
                                    width: calculateHeight(20),
                                }}></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.estimatedFeeChartParentView}>
                        <Image
                            source={require('@assets/estimated_fee_chart_image.png')}
                            resizeMode="contain"
                            style={styles.estimatedFeeChartImage}
                        />
                    </View>
                    <Text style={styles.txtHeaderStyle}>
                        {ConstantStrings.WHAT_IS_ESTIMATED_FEE}
                    </Text>
                    <Text style={styles.txtInfoStyle}>
                        {ConstantStrings.ESTIMATED_FEE_INFO_TEXT}
                    </Text>
                    {/* <Image source={require('@assets/fee_line.png')} style={{width : Width/1.5}} resizeMode={'contain'}></Image> */}
                    <View style={styles.estimatedFeesParentView}>
                        <Text style={styles.estimatedFeeStyle}>
                            {ConstantStrings.ESTIMATED_FEES}
                        </Text>

                        <Image
                            source={require('@assets/Question.png')}
                            style={styles.questionImage}
                            resizeMode="contain"
                        />
                        <View style={styles.flexOne} />
                        <Text style={[styles.estimatedFeeStyle, styles.sixEth]}>
                            0.00006 ETH
                        </Text>
                    </View>
                    <WarningMessage
                        message={
                            ConstantStrings.YOU_NEED_TO_HAVE_SUFFICIENT_BALANCE
                        }
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    closeButtonView: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        height: calculateHeight(24),
        justifyContent: 'center',
        width: calculateHeight(24),
    },
    contain: {
        alignItems: 'center',
        backgroundColor: colors.black_opacity40,
        flex: 1,
        justifyContent: 'center',
    },
    estimatedFeeChartImage: {
        height: calculateHeight(135),
        width: calculateWidth(199),
    },
    estimatedFeeChartParentView: {
        alignItems: 'center',
    },
    estimatedFeeStyle: {
        color: theme.colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f10,
        // lineHeight: theme.sizes.lh12,
    },
    estimatedFeesParentView: {
        alignItems: 'center',
        backgroundColor: theme.colors.gray_background,
        borderRadius: 20,
        flexDirection: 'row',
        paddingLeft: calculateWidth(12),
        paddingRight: calculateWidth(4),
        paddingVertical: calculateHeight(4),
    },
    flexOne: {
        flex: 1,
    },
    popupStyle: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 23,
        padding: calculateHeight(20),
    },
    questionImage: {
        height: calculateHeight(10),
        marginLeft: 8,
        width: calculateHeight(10),
    },
    sixEth: {
        borderColor: theme.colors.purple_button_color,
        borderRadius: 20,
        borderWidth: 2,
        margin: calculateWidth(-8),
        paddingBottom: calculateHeight(4),
        paddingHorizontal: calculateWidth(8),
        paddingVertical: calculateHeight(8),
    },
    txtHeaderStyle: {
        color: theme.colors.mainColor,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f20,
    },
    txtInfoStyle: {
        color: theme.colors.neutral60,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        fontWeight: theme.sizes.fw600,
        marginVertical: calculateHeight(16),
    },
});
