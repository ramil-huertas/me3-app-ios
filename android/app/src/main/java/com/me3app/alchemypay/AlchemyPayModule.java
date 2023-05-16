package com.me3app.alchemypay;

import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;


public class AlchemyPayModule extends ReactContextBaseJavaModule{
    public AlchemyPayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AlchemyPay";
    }

    @ReactMethod
    public void getEncryptedSign(String address,String appID, String key, String fiat, String fiatAmount,Promise promise) throws UnsupportedEncodingException {
        try {
            String rawData = "address="+address+"&appId="+appID+"&fiat="+fiat+"&fiatAmount="+fiatAmount;
            Log.d("getEncryptedSign", "getEncryptedSign: rawData "+rawData);
            String sign = encrypt(rawData, key);//appSecret
            Log.d("getEncryptedSign", "getEncryptedSign: sign is "+sign);
            String urlEncodeData = URLEncoder.encode(sign, "UTF-8");
            Log.d("getEncryptedSign", "getEncryptedSign: encode sign is "+urlEncodeData);
            promise.resolve(urlEncodeData);
        }catch (Exception exception){
            promise.reject("error message",exception);
        }
    }

    public static String encrypt(String plainText, String secretKeyData)  {
        try {
            byte[] plainTextData = plainText.getBytes(StandardCharsets.UTF_8);
            byte[] secretKey = secretKeyData.getBytes(StandardCharsets.UTF_8);
            String iv = new String(secretKey).substring(0, 16);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");

            byte[] dataBytes = plainTextData;
            int plaintextLength = dataBytes.length;
            byte[] plaintext = new byte[plaintextLength];
            System.arraycopy(dataBytes, 0, plaintext, 0, dataBytes.length);

            SecretKeySpec keyspec = new SecretKeySpec(secretKey, "AES");
            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes());

            cipher.init(Cipher.ENCRYPT_MODE, keyspec, ivspec);
            byte[] encrypted = cipher.doFinal(plaintext);

            return new String(Base64.getEncoder().encode(encrypted));

        } catch (Exception e) {
            System.out.println("AES encrypting exception , msg is {}" + e.toString());
        }
        return null;
    }

    public static String decrypt(String cipherText, String secretKeyData) {
        try {

            byte[] cipherTextData = cipherText.getBytes(StandardCharsets.UTF_8);
            byte[] secretKey = secretKeyData.getBytes(StandardCharsets.UTF_8);
            String iv = new String(secretKey).substring(0, 16);

            byte[] encrypted = Base64.getDecoder().decode(cipherTextData);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            SecretKeySpec keyspec = new SecretKeySpec(secretKey, "AES");
            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes());

            cipher.init(Cipher.DECRYPT_MODE, keyspec, ivspec);

            byte[] original = cipher.doFinal(encrypted);
            String originalString = new String(original);
            return originalString;
        } catch (Exception e) {
            System.out.println("AES decrypting exception: msg is {}" + e.toString());
        }
        return null;
    }

}
