package com.me3app.walletconnect;

public interface Signable {
    String getMessage();
    long getCallbackId();
    byte[] getPrehash();
    String getOrigin();
    CharSequence getUserMessage();
    SignMessageType getMessageType();
}
