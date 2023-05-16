import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

/**
 * Add your list of API to ignore here,
 * in regex or plain text
 */
const URL_EXCEPTIONS = [
    /http:\/\/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:[0-9]*/,
    new RegExp('/generate_204', 'i'),
    new RegExp('jpg|gif|png|bmp|svg', 'i'),
    new RegExp('/docs/securesc', 'i'),
];

// Add actions to be ignored
const ACTION_EXCEPTIONS = [
    'EFFECT_TRIGGERED',
    'EFFECT_RESOLVED',
    'EFFECT_REJECTED',
];

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({ name: 'me3' })
    .useReactNative({
        networking: {
            ignoreUrls: new RegExp(
                URL_EXCEPTIONS.map(regex => regex.source).join('|'),
            ),
        },
    })
    .use(
        reactotronRedux({
            except: ACTION_EXCEPTIONS,
        }),
    )
    .connect();

reactotron.clear();

// console.tron to log into reactotron console
// eslint-disable-next-line no-console
console.tron = reactotron.log;

export default reactotron;
