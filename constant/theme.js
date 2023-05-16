import { Dimensions, Platform } from 'react-native';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

const colors = {
    mainColor: '#160E25',
    second_bakground_white: '#FFFFFF',
    white: '#FFFFFF',
    white_opacity: 'rgba(255, 255, 255, 0.4)',
    black: '#000000',
    lightBlack: 'rgba(38, 24, 64, 0.1)',
    popupBgcolor: 'rgba(38, 24, 64, 0.4)',
    keep_keys_safe_opacity5: '#FAF4FF0D',
    purpple_background_color50: '#F5EFFD',
    purple_color80: '#7938c5',
    purple_button_color1: '#BB8CF2',
    purple_button_color2: '#A56EE5',
    purple_button_color: '#9957E5',
    purple_disable_button_color: '#DCCBF2',
    purple_dark: '#442B73',
    gray_textcolor: '#7A728A',
    purple_light_button_color: '#D5BDF2',
    darkblue: 'rgba(255, 255, 255, 0.03)',
    gray1_textcolor: '#CBCBCB',
    gray_background: '#F7F7F7',
    gray_border_color: '#E6E6E6',
    gray_passcode_color: '#D9D9D9',
    gray_text: '#AAA6B3',
    offRed: '#F16A6A',
    menuDotsTint: '#261840',
    gray_background_1: '#E4E4E4',
    gray_background_2: '#E9E9E9',
    neutral60: '#68548E',
    success: '#2FDD7F',
    success_background: 'rgba(47, 221, 127, 0.2)',
    error_color: '#CD6468',
    error_background: 'rgba(255, 102, 102, 0.2)',
    error_dots: 'rgba(255, 102, 102,1)',
    shadow1: '#A0A0A0',
    shadow2: '#A1A1A1',
    transparent: '#FFFFFF00',
    grantAccessNormal: 'rgba(187, 140, 242, 0.2)',
    neutral10: '#F7F4FA',
    menuDotsTint_Opacity50: 'rgba(38, 24, 64, 0.5)',
    menuDotsTint_Opacity10: 'rgba(38, 24, 64, 0.1)',
    neutral10_1: '#F9F9FB',
    RaisinBlack_opacity43: 'rgba(38, 38, 38, 0.43)',
    ghost_white: '#F9F8FB',
    dark_green: '#2AC471',
    purpple_background_color50_opacity10: 'rgba(245, 239, 253, 0.1)',
    black_opacity40: 'rgba(0,0,0,0.4)',
    grape_opacity_50: 'rgba(121, 56, 197, 0.5)',
    white_opacity_10: 'rgba(255, 255, 255, 0.1)',
    lavender_opacity_10: 'rgba(153, 87, 229, 0.1)',

    //gradient colors
    magnolia_white: ['#F5EBFF', '#FFFFFF'],
    white_magnolia_light: ['#FFFFFF', '#F5EFFD'],
    whiteGradient: ['#FFFFFF', '#FFFFFF'],
    DeepFuchsia_PurplePizzazz: ['#C589F9', '#EC52D4'],
    mainColorGradient: ['rgba(22, 14, 37, 0)', 'rgba(22, 14, 37, 1)'],
    LavenderIndigo_PaleLavender: ['#9957E5', '#E7D4FF'],

    eth_gradient: ['#F6F6F6', '#FFFFFF'],
    avax_gradient: ['#FFF9F9', '#FFFFFF'],
    matic_gradient: ['#F9F6FF', '#FFFFFF'],
    bnb_gradient: ['#FFF9ED', '#FFFFFF'],
    btc_gradient: ['#FDF7EF', '#FFFFFF'],
    ltc_gradient: ['#F0F6FF', '#FFFFFF'],
    btc_cash_gradient: ['#F1FFFB', '#FFFFFF'],

    keyboard_button_highlight_color: '#D5BDF2',
};

const sizes = {
    // global sizes
    base: 16,
    font: Platform.OS === 'ios' ? 12 : 14,
    radius: 6,
    padding: 25,
    headerMargin: 0,

    // font sizes
    h1: 32,
    h2: Platform.OS === 'ios' ? 18 : 20,
    h3: Platform.OS === 'ios' ? 16 : 18,
    title: Platform.OS === 'ios' ? 16 : 18,
    header: Platform.OS === 'ios' ? 15 : 16,
    body: Platform.OS === 'ios' ? 12 : 14,
    caption: Platform.OS === 'ios' ? 10 : 12,

    onboard_header: 28,
    onboard_detail: 15,

    bottom_button_view_height: '20%',
    button_border_radius: 13,
    button_text_size: 17,

    // f28: Platform.OS === 'ios' ? 28 : Height <= 1280 ? 24 : 28,
    // f24: Platform.OS === 'ios' ? 24 : Height <= 1280 ? 20 : 24,
    // f22: Platform.OS === 'ios' ? 22 : Height <= 1280 ? 18 : 22,
    // f20: Platform.OS === 'ios' ? 20 : Height <= 1280 ? 16 : 20,
    // f18: Platform.OS === 'ios' ? 18 : Height <= 1280 ? 14 : 18,
    // f16: Platform.OS === 'ios' ? 16 : Height <= 1280 ? 12 : 16,
    // f14: Platform.OS === 'ios' ? 14 : Height <= 1280 ? 10 : 14,
    // f12: Platform.OS === 'ios' ? 12 : Height <= 1280 ? 8 : 12,
    // f10: Platform.OS === 'ios' ? 10 : Height <= 1280 ? 6 : 10,

    f56: calculateHeight(56),
    f28: calculateHeight(28),
    f24: calculateHeight(24),
    f22: calculateHeight(22),
    f20: calculateHeight(20),
    f18: calculateHeight(18),
    f16: calculateHeight(16),
    f17: calculateHeight(17),
    f14: calculateHeight(14),
    f12: calculateHeight(12),
    f10: calculateHeight(10),
    f8: calculateHeight(8),

    //line height sizes
    lh33: calculateHeight(33),
    lh24: calculateHeight(24),
    lh20: calculateHeight(20),
    lh18: calculateHeight(18),
    lh14: calculateHeight(14),
    lh12: calculateHeight(12),
    lh28: calculateHeight(28),
    lh78_4: calculateHeight(78.4),

    //font weight
    fw700: '700',
    fw600: '600',

    //margin/padding Vertical
    mvp4: calculateHeight(4),
    mvp8: calculateHeight(8),
    mvp12: Platform.OS === 'ios' ? calculateHeight(6) : calculateHeight(12),
    mvp14: Platform.OS === 'ios' ? calculateHeight(8) : calculateHeight(14),
    mvp16: Platform.OS === 'ios' ? calculateHeight(10) : calculateHeight(16),
    mvp18: Platform.OS === 'ios' ? calculateHeight(12) : calculateHeight(18),
    mvp20: Platform.OS === 'ios' ? calculateHeight(14) : calculateHeight(20),
    mvp26: Platform.OS === 'ios' ? calculateHeight(20) : calculateHeight(26),
    mvp28: Platform.OS === 'ios' ? calculateHeight(22) : calculateHeight(28),
    mvp33: Platform.OS === 'ios' ? calculateHeight(28) : calculateHeight(33),
    mvp38: Platform.OS === 'ios' ? calculateHeight(32) : calculateHeight(38),
    //margin/padding horizontal
    mhp8: calculateWidth(8),
    mhp12: calculateWidth(12),
    mhp14: Platform.OS === 'ios' ? calculateWidth(8) : calculateWidth(14),
    mhp16: Platform.OS === 'ios' ? calculateWidth(10) : calculateWidth(16),
    mhp18: Platform.OS === 'ios' ? calculateWidth(12) : calculateWidth(18),
    mhp20: Platform.OS === 'ios' ? calculateWidth(14) : calculateWidth(20),
    mhp26: Platform.OS === 'ios' ? calculateWidth(20) : calculateWidth(26),
    mhp28: Platform.OS === 'ios' ? calculateWidth(22) : calculateWidth(28),
    mhp38: Platform.OS === 'ios' ? calculateWidth(32) : calculateWidth(38),

    bottomTabHeight:
        Platform.OS === 'ios' ? calculateHeight(80) : calculateHeight(75),
    paddingBottomTabLabel: Platform.OS === 'ios' ? 0 : 20,
};

export function calculateHeight(value) {
    return (value * Height) / 800;
}
export function calculateWidth(value) {
    return (value * Width) / 360;
}

const fonts = {
    titillium_bold:
        Platform.OS === 'ios' ? 'TitilliumWeb-Bold' : 'titilliumweb_bold',
    titillium_Regular:
        Platform.OS === 'ios' ? 'TitilliumWeb-Regular' : 'titilliumweb_regular',
};

const customStyle = {
    closeIcon: {
        height: 24,
        width: 24,
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16,
    },
};

const flexDirectionRow = {
    flexDirection: 'row',
    alignItems: 'center',
};

const optionalConfigObject = {
    title: 'Authentication Required', // Android
    imageColor: '#e00606', // Android
    imageErrorColor: '#ff0000', // Android
    sensorDescription: 'Touch sensor', // Android
    sensorErrorDescription: 'Failed', // Android
    cancelText: 'Cancel', // Android
    fallbackLabel: '', // iOS (if empty, then label is hidden)
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

const NativeBaseModalStyle = {
    ModalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        height: 'auto',
        maxWidth: '85%',
    },
    setBottomModal: {
        marginBottom: 0,
        marginTop: 'auto',
        backgroundColor: colors.white,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,

        height: 'auto',
    },
    HeaderFooterStyle: {
        backgroundColor: colors.white,
        borderColor: colors.transparent,
    },
    setHeaderPaddingBottom: 1.2,
    setFooterPaddingTop: 1.2,
};
export {
    colors,
    sizes,
    fonts,
    customStyle,
    Width,
    Height,
    flexDirectionRow,
    optionalConfigObject,
    NativeBaseModalStyle,
};
