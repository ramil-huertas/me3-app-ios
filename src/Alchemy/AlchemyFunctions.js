import { BUY, SELL } from '@constants/ConstantStrings';
import { colors } from '@constants/theme';

export const getBackgroundWhenTabChange = BuyTabSelected => {
    return {
        backgroundColor: BuyTabSelected
            ? colors.white_opacity_10
            : colors.ghost_white,
    };
};
export const getTokenBackgroundWhenTabChange = BuyTabSelected => {
    return {
        backgroundColor: !BuyTabSelected
            ? colors.white_opacity_10
            : colors.ghost_white,
    };
};
export const getImageTintWhenTabChange = BuyTabSelected => {
    return {
        tintColor: BuyTabSelected ? colors.white : colors.menuDotsTint,
    };
};
export const getTokenImageTintWhenTabChange = BuyTabSelected => {
    return {
        tintColor: !BuyTabSelected ? colors.white : colors.menuDotsTint,
    };
};
export const getTextColourWhenTabChange = BuyTabSelected => {
    return {
        color: BuyTabSelected ? colors.white : colors.menuDotsTint,
    };
};
export const getColorOfCurrency = BuyTabSelected => {
    return {
        color: BuyTabSelected ? colors.white : colors.transparent,
    };
};
export const getTokenColorOfCurrency = BuyTabSelected => {
    return {
        color: !BuyTabSelected ? colors.white : colors.menuDotsTint,
    };
};
export const getColorOfBalance = BuyTabSelected => {
    return {
        color: !BuyTabSelected ? colors.white : colors.transparent,
    };
};

export const getBuySellStrings = BuyTabSelected => {
    return BuyTabSelected ? BUY : SELL;
};

export const getTextFlex = (length) => {
    switch (length) {
        case length > 0 && length < 3:
            return null
        case length > 3 && length <= 8:
            return 0.5
        case length > 8:
            return 1
    }
}
