import analytics from '@react-native-firebase/analytics';

export const firebaseAnalytics = async (eventName, eventObject) => {
    await analytics().logEvent(eventName, eventObject);
};

/**
 *
 * Dummy format for sending events
 *
 * const eventObject = {
 *      ...
 *      timeOfClick: new Date().toLocaleString()
 *      ...
 * }
 * firebaseAnalytics(firebaseEvents.home_qr_scanner, eventObject)
 **/
