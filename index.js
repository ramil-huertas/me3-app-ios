/* eslint-disable import/first */
if (__DEV__) {
    import('./src/utilities/reactotronConfig');
}
import './shim.js';
/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
import { name as appName } from './app.json';
import AppWrapper from './AppWrapper';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => AppWrapper);
