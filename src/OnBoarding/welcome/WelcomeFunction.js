import { colors } from '@constants/theme';
export const getBackgroundColour = (cell, op1, op2, op3) => {
    if (cell == 1) {
        return op1 == 1 && op2 == 0
            ? colors.purpple_background_color50
            : colors.purple_button_color;
    } else if (cell == 2) {
        return op1 == 1 && op2 == 1 && op3 == 0
            ? colors.purpple_background_color50
            : colors.purple_button_color;
    } else {
        return colors.purpple_background_color50;
    }
};
