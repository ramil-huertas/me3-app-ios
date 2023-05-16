import {
    CONSECUTIVE_ERROR,
    SAME_VALUE_ERROR,
} from '@constants/ConstantStrings';

export const getTopLeftRadius = index => {
    if (index == 0) {
        return 24;
    } else {
        return 0;
    }
};
export const getTopRightRadius = (pagecount, index) => {
    if (index == 5) {
        return 24;
    } else {
        return pagecount == index + 1 ? 24 : 0;
    }
};
export const getBottomRightRadius = (pagecount, index) => {
    if (index == 5) {
        return 24;
    } else {
        return pagecount == index + 1 ? 24 : 0;
    }
};
export const getBottomLeftRadius = index => {
    if (index == 0) {
        return 24;
    } else {
        return 0;
    }
};
export const validatePasscode = (value, setErrorMessage) => {
    let arrayPassword = value.toString().split('');
    const hasTripple = /(.)\1\1/.test(value);
    if (!hasTripple) {
        return consecutive(arrayPassword, setErrorMessage);
    } else {
        setErrorMessage(SAME_VALUE_ERROR);
        return false;
    }
};

function consecutive(array, setErrorMessage) {
    let i = 2;
    let d;
    while (i < array.length) {
        d = array[i - 1] - array[i - 2];
        if (Math.abs(d) === 1 && d === array[i] - array[i - 1]) {
            setErrorMessage(CONSECUTIVE_ERROR);
            return false;
        }
        i++;
    }
    return true;
}
