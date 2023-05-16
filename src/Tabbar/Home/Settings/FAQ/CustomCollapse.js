import React from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { calculateHeight, colors, sizes, fonts } from '@constants/theme';
import {
    Collapse,
    CollapseHeader,
    CollapseBody,
} from 'accordion-collapse-react-native';
import { useSelector } from 'react-redux';
import RenderHtml from 'react-native-render-html';

const CustomCollapse = ({
    onToggleFunction,
    isOpen,
    titleText,
    bodyDescription,
}) => {
    const { width } = useWindowDimensions();
    const FaqReducer = useSelector(state => state.FaqReducer);
    return (
        <View style={styles.mainContainer}>
            <Collapse onToggle={onToggleFunction}>
                <CollapseHeader>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderTexttitle}>
                            {titleText}
                        </Text>
                        <Image
                            source={
                                !isOpen
                                    ? require('@assets/minus.png')
                                    : require('@assets/Add.png')
                            }
                            style={{
                                height: calculateHeight(20),
                                width: calculateHeight(20),
                            }}
                        />
                    </View>
                </CollapseHeader>
                <CollapseBody>
                    <View style={styles.collapseBodyView}>
                        {FaqReducer.detailsLoading ? (
                            <ActivityIndicator
                                color={colors.purple_dark}
                                size={'small'}
                            />
                        ) : (
                            <RenderHtml
                                contentWidth={width}
                                source={{ html: `${bodyDescription}` }}
                                enableExperimentalMarginCollapsing={true}
                            />
                        )}
                    </View>
                </CollapseBody>
            </Collapse>
        </View>
    );
};

export default CustomCollapse;

const styles = StyleSheet.create({
    collapseBodyView: {
        // alignItems: 'center',
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // marginBottom: 4,
    },
    collapseHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: calculateHeight(4),
    },
    collapseHeaderTexttitle: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
    },
    mainContainer: {
        backgroundColor: colors.ghost_white,
        borderRadius: 8,
        marginVertical: calculateHeight(4),
        padding: calculateHeight(12),
    },
});
