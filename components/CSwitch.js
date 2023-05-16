import { Switch } from 'react-native';
import React from 'react';
import {  colors } from '@constants/theme';

const CSwitch = ({ value, onValueChange, condition }) => {
    return (
        <Switch
            value={value}
            onValueChange={onValueChange}
            thumbColor={colors.white}
            trackColor={{
                true: colors.purple_dark,
                false: colors.lightBlack,
            }}
        />
    );
};

export default CSwitch;
