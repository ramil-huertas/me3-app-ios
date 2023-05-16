import { View, StyleSheet, Image } from 'react-native';
import React from 'react';
import { SvgUri } from 'react-native-svg';

const CustomImage = ({
    imageUrl,
    isImageHeight20,
    ImageStyle,
    SvgImageHeight,
    SvgImageWidth,
    isImageHeight25,
}) => {
    const getHeight = () => {
        return SvgImageHeight ? SvgImageHeight : '32';
    };
    const getWidth = () => {
        return SvgImageWidth ? SvgImageWidth : '32';
    };
    const getStylesBasedOnisImageHeight20 = () => {
        if (isImageHeight20) {
            return styles.iconFrameStyle2;
        } else if (isImageHeight25) {
            return styles.iconFrameStyle3;
        } else {
            return styles.iconFrameStyle1;
        }
    };

    if (imageUrl && imageUrl.endsWith('.svg')) {
        return (
            <View>
                <SvgUri
                    width={getWidth()}
                    height={getHeight()}
                    uri={imageUrl}
                    fill={'black'}
                />
            </View>
        );
    } else if (imageUrl) {
        return (
            <View>
                <Image
                    source={{ uri: imageUrl }}
                    resizeMode="contain"
                    style={getStylesBasedOnisImageHeight20()}
                />
            </View>
        );
    } else {
        return (
            <View>
                <Image
                    source={require('@assets/TokenPlaceholder.png')}
                    resizeMode="contain"
                    style={getStylesBasedOnisImageHeight20()}
                />
            </View>
        );
    }
};

export default CustomImage;

const styles = StyleSheet.create({
    iconFrameStyle1: {
        borderRadius: 30 / 2,
        height: 30,
        width: 30,
    },
    iconFrameStyle2: {
        borderRadius: 30 / 2,
        height: 20,
        width: 20,
    },
    iconFrameStyle3: {
        borderRadius: 30 / 2,
        height: 25,
        width: 25,
    },
});
