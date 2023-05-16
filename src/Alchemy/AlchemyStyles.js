import { StyleSheet } from 'react-native';

import {
    calculateHeight,
    calculateWidth,
    colors,
    fonts,
    sizes,
    Width,
} from '../../constant/theme';

const AlchemyPayStyles = StyleSheet.create({
    BackIcons: {
        height: 24,
        tintColor: colors.white,
        width: 24,
    },
    BalanceAmount: {
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
        marginBottom: calculateHeight(15),
        textAlign: 'center'
    },
    FeesToBeCalculated: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f12,
        marginBottom: sizes.mvp14,
        marginTop: sizes.mvp33,
    },
    NonSelectedTab: {
        alignItems: 'center',
        borderRadius: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: calculateWidth(20),
        paddingVertical: calculateHeight(12),
    },
    NonSelectedTabTitle: {
        alignSelf: 'center',
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        justifyContent: 'center',
    },
    SelectedTab: {
        alignItems: 'center',
        backgroundColor: colors.purple_dark,
        borderRadius: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: calculateWidth(20),
        paddingVertical: calculateHeight(12),
    },
    SelectedTabTitle: {
        alignSelf: 'center',
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        justifyContent: 'center',
    },
    TabView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.grape_opacity_50,
        borderRadius: 44,
        flexDirection: 'row',
        padding: calculateHeight(6),
    },
    amountContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: sizes.mhp20,
    },
    amountText: {
        color: colors.white,
        // flex:1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f56,
    },
    backIconView: {
        paddingVertical: calculateHeight(14),
        position: 'absolute',
    },
    backImageStyle: {
        height: 20,
        marginRight: 0,
        width: 20,
    },
    btnKeyboard: {
        alignItems: 'center',
        backgroundColor: colors.purpple_background_color50,
        borderRadius: 5,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(5),
        paddingVertical: calculateHeight(4)
    },
    btnKeyboardBack: {
        alignItems: 'center',
        borderRadius: 5,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(5),
        paddingVertical: calculateHeight(4)
    },

    changeCurrencyIcon: {
        height: calculateHeight(6.48),
        marginLeft: sizes.mhp8,
        width: calculateHeight(10.61),
    },
    closeImage: {
        height: 30,
        marginRight: 0,
        width: 30,
    },
    convertedAmountContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: calculateWidth(20),
        marginTop: calculateHeight(10),
    },
    currencyContainer: {
        alignItems: 'center',
        borderRadius: 44,
        flexDirection: 'row',
        marginLeft: sizes.mhp12,
        paddingHorizontal: calculateWidth(16),
        paddingVertical: calculateHeight(8),
    },

    currencyIcon: {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f24,
    },
    currencyText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
    },
    currentCurrencyIconParentView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: calculateWidth(3),
        width: calculateHeight(30),
    },
    flexOne: {
        flex: 1,
    },
    flexTwo: {
        flex: 2,
    },
    keyboardSubview: {
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: calculateWidth(24),
        marginTop: sizes.mvp12,
    },
    keyboardTxt: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f28,
    },
    keyboardTxtIfBuyTabSelected: {
        color: colors.transparent,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f28,
    },
    keyboardView: {
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'column',
        flex: 2,
        justifyContent: 'flex-start',
        width: Width,
    },

    maxValueContainerStyle: { height: 55, marginBottom: 8 },

    noEnoughBalanceTextStyle: { color: colors.white, fontFamily: fonts.titillium_bold, fontSize: sizes.f12 },
    notEnoughBalanceViewStyle: {
        alignContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: colors.offRed,
        borderRadius: 10, opacity: 0.7, paddingHorizontal: 8, paddingVertical: 4
    },
    payReceiveTitle: {
        color: colors.purple_disable_button_color,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        marginBottom: calculateHeight(20), textAlign: 'center'
    },
    payTextContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flex: 5,
        marginTop: calculateHeight(30), paddingHorizontal: sizes.mhp16
    },
    proceedToCheckoutButton: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: sizes.mvp38,
        paddingHorizontal: sizes.mhp18,
        paddingVertical: sizes.mvp20,
        width: calculateWidth(320),
    },
    proceedToCheckoutButtonWithLowOpacity: {
        alignItems: 'center',
        backgroundColor: colors.purple_disable_button_color,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: sizes.mvp38,
        paddingHorizontal: sizes.mhp18,
        paddingVertical: sizes.mvp20,
        width: calculateWidth(320),
    },
    proceedToCheckoutText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        marginLeft: sizes.mhp8,
    },
    safeareaStyle: {
        backgroundColor: colors.purpple_background_color50,
        flex: 0,
    },
    scrollViewContainer: {
        flexDirection: 'column',
        flex: 1,
    },
    swapIcon: {
        height: calculateHeight(20),
        marginLeft: sizes.mhp8,
        tintColor: colors.white,
        width: calculateHeight(20),
    },
    titleIcons: {
        height: 20,
        marginRight: calculateWidth(8),
        tintColor: colors.white,
        width: 20,
    },
    tokenContainer: {
        alignItems: 'center',
        backgroundColor: colors.ghost_white,
        borderRadius: calculateHeight(44),
        flexDirection: 'row',
        marginLeft: calculateWidth(8),
        paddingHorizontal: calculateWidth(16),
        paddingVertical: calculateHeight(12),
    },
    zeroOpacity: {
        opacity: 0,
    }
});

export default AlchemyPayStyles;
