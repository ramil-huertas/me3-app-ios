import EncryptedStorage from 'react-native-encrypted-storage';
import { logger } from '@constants/Log';

async function saveKeyValueData(key, value) {
    try {
        await EncryptedStorage.setItem(key, value);
    } catch (error) {
        logger('error ', error);
    }
}

async function retrieveKeyValueData(key) {
    try {
        const session = await EncryptedStorage.getItem(key);
        if (session !== undefined) {
            return session;
        }
    } catch (error) {
        return '';
    }
    return '';
}
async function clearStorage() {
    try {
        await EncryptedStorage.clear();
        // Congrats! You've just cleared the device storage!
    } catch (error) {
        // There was an error on the native side
    }
}
async function removeValue(key) {
    try {
        await EncryptedStorage.removeItem(key);
        // Congrats! You've just removed your first value!
    } catch (error) {
        // There was an error on the native side
    }
}
export { saveKeyValueData, retrieveKeyValueData, clearStorage, removeValue };
