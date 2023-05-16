import { View, StyleSheet } from 'react-native';
import React from 'react';
import { calculateHeight, calculateWidth } from '@constants/theme';
import { BUY_SELL, Deposit, SEND, SWAP } from '@constants/ConstantStrings';
import RowButton from './RowButton';

const RowButtonsGroup = ({
    depositFunction,
    swapFunction,
    sendFunction,
    buyFunction,
    fontColor,
    isFromInChain
}) => {
    return (
        <View style={styles.btnGroup}>
            <RowButton
                buttonTitle={Deposit}
                imageSource={require('@assets/arrowBottom.png')}
                imageStyle={styles.arrowBottom}
                onPressFunction={depositFunction}
                key={Deposit}
                fontColor={fontColor}
            />
            {/* <RowButton
                buttonTitle={BUY_SELL}
                imageSource={require('@assets/buyIcon.png')}
                imageStyle={styles.arrowBottom}
                onPressFunction={buyFunction}
                key={BUY_SELL}
                fontColor={fontColor}
            /> */}
            {
                !isFromInChain &&

                < RowButton
                    buttonTitle={SWAP}
                    imageSource={require('@assets/swap.png')}
                    imageStyle={styles.arrowBottom}
                    onPressFunction={swapFunction}
                    key={SWAP}
                    fontColor={fontColor}
                />
            }
            <RowButton
                buttonTitle={SEND}
                imageSource={require('@assets/send.png')}
                imageStyle={styles.arrowBottom}
                onPressFunction={sendFunction}
                key={SEND}
                fontColor={fontColor}
            />
        </View>
    );
};

export default RowButtonsGroup;
const styles = StyleSheet.create({
    arrowBottom: {
        height: calculateHeight(20),
        width: calculateHeight(20),
    },
    btnGroup: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        // marginHorizontal: calculateWidth(16),
        marginTop: calculateHeight(16),
    },
});
