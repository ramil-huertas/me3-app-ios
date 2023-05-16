package com.me3app.walletconnect;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.trustwallet.walletconnect.WCClient;
import com.trustwallet.walletconnect.WCSessionStoreItem;
import com.trustwallet.walletconnect.WCSessionStoreType;
import com.trustwallet.walletconnect.models.WCPeerMeta;
import com.trustwallet.walletconnect.models.WCSignTransaction;
import com.trustwallet.walletconnect.models.ethereum.WCEthereumSignMessage;
import com.trustwallet.walletconnect.models.ethereum.WCEthereumTransaction;
import com.trustwallet.walletconnect.models.session.WCAddNetwork;
import com.trustwallet.walletconnect.models.session.WCSession;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import kotlin.Unit;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.functions.Function2;
import okhttp3.OkHttpClient;

public class WalletConnectModule extends ReactContextBaseJavaModule {
    WCClient wcClient;
    public WCPeerMeta peerMeta;
    WCSession wcSession;
    private static ConcurrentHashMap<String, WCClient> clientMap = new ConcurrentHashMap<>();
    WCPeerMeta wcRemotePeerMeta;
    String qrCode = null;
    public SharedPreferences sharedPreferences;
    public WCSessionStoreType storage;

    public static String me3Logo = "https://uploads-ssl.webflow.com/62d7bdd20d395b7513f7fffc/62d7bdd20d395bada6f80019_me3-logo.svg";
    ReactContext mContext;
//
//    static {
//        System.loadLibrary("TrustWalletCore");
//    }

    WalletConnectModule(ReactApplicationContext context) {
        super(context);
        mContext = context;
        sharedPreferences = context.getSharedPreferences("connect", Context.MODE_PRIVATE);
        storage = new WCSessionStoreType(sharedPreferences);
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @NonNull
    @Override
    public String getName() {
        return "WalletConnect";
    }

    @ReactMethod
    public void createSession(String url) {
        wcClient = new WCClient(new GsonBuilder(), new OkHttpClient());
        List<String> iconList = new ArrayList<>();
        iconList.add(me3Logo);
        peerMeta = new WCPeerMeta("ME3", "https://www.me3.io/", "Me3", iconList);
        setEvents(wcClient);
        qrCode = url;
        connect();
    }

    public void connect() {
        try {
            wcSession = WCSession.Companion.from(qrCode);
            wcClient.connect(wcSession, peerMeta, UUID.randomUUID().toString(), null);
        } catch (Exception e) {
            Log.d("create session exception", "connect/create session: Exception " + e);
        }
    }

    private String getSessionId() {
        if (qrCode != null) {
            String uriString = qrCode.replace("wc:", "wc://");
            return Uri.parse(uriString).getUserInfo();
        } else if (wcSession != null) {
            return wcSession.getTopic();
        } else {
            return null;
        }
    }

    public void disconnect() {
        Log.e("Session disconnect", "session disconnect method called");
        if (wcClient.getSession() != null) {
            wcClient.killSession();
        } else {
            wcClient.disconnect();
        }
    }

    JSONObject selectedWalletData;

    @ReactMethod
    public void clearAllData() {
        storage.setSessionList(new ArrayList<>());
    }

    @ReactMethod
    public void approveSession(String selectedWallet) {

        approveCurrentSession(selectedWallet);
    }

    public void approveCurrentSession(String selectedWallet) {
        try {
            JSONObject walletData = new JSONObject(selectedWallet);
            selectedWalletData = walletData;
            List<String> addresses = new ArrayList<>();
            addresses.add(walletData.getString("address"));
            wcClient.approveSession(addresses, walletData.getInt("chainId"));

            WCSessionStoreItem saveData = new WCSessionStoreItem(getSessionId(),
                    wcSession, walletData.getInt("chainId"), wcClient.getPeerId(), wcClient.getRemotePeerId(),
                    wcRemotePeerMeta, false, walletData.toString(), new Date()
            );
            List<WCSessionStoreItem> sessionList = storage.getSessionList();
            if (sessionList == null)
                sessionList = new ArrayList<>();

            sessionList.add(saveData);
            storage.setSessionList(sessionList);
            clientMap.put(wcSession.getTopic(), wcClient);
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("approved", new Gson().toJson(storage.getSessionList()));
            sendEvent(mContext, "ApproveSession", jsonObject);
        } catch (Exception e) {
            disconnect();
            Log.d("approve seesion exception e", "approveSession: " + e);
        }
    }

    int varForTest = 0;

    @ReactMethod
    public void init() {
        if (varForTest == 0) {
            varForTest++;
            List<WCSessionStoreItem> sessionList = storage.getSessionList();
            if (sessionList != null) {
                for (int i = 0; i < sessionList.size(); i++) {
                    try {
                        WCSessionStoreItem wcSessionStoreItem = sessionList.get(i);
                        JSONObject addressData = new JSONObject(wcSessionStoreItem.getAddress());
                        WCSession session = wcSessionStoreItem.getSession();
                        WCClient client = createWalletConnectSession(addressData.getString("address"), session, wcSessionStoreItem.getPeerId(), wcSessionStoreItem.getRemotePeerId());
                        client.setSessionData(session);
                        client.setRemotePeerMeta(wcSessionStoreItem.getRemotePeerMeta());
                        setEvents(client);
                        clientMap.put(session.getTopic(), client);
                        Log.e("*********", "wcclient created for loop");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    boolean isFromDisAll, isAllDisconnected;

    @ReactMethod
    public void disconnectAllSessions() {

        isFromDisAll = true;
        storage.setSessionList(new ArrayList<>());
        for (WCClient client : clientMap.values()) {
            if (client.isConnected()) {
                client.killSession();

            }
        }
        // isAllDisconnected = true;
    }

    @ReactMethod
    public void updateSession(String clickedItem) {
        Log.e("Update session", "change chain called from react code");
        try {
            JSONObject walletData = new JSONObject(clickedItem);
            JSONObject addressData = new JSONObject(walletData.getString("address"));
            JSONObject session = walletData.getJSONObject("session");
            WCSession wcSession = new Gson().fromJson(session.toString(), WCSession.class);
            wcClient = createWalletConnectSession(addressData.getString("address"), wcSession, walletData.getString("peerId"), walletData.getString("remotePeerId"));
            wcClient.setSessionData(wcSession);
            WCPeerMeta peermeta = new Gson().fromJson((walletData.getJSONObject("remotePeerMeta").toString()), WCPeerMeta.class);
            wcClient.setRemotePeerMeta(peermeta);
            setEvents(wcClient);
            List<String> addresses = new ArrayList<>();
            addresses.add(addressData.getString("address"));
            wcClient.updateSession(addresses, addressData.getInt("chainId"), true);
            List<WCSessionStoreItem> sessionList = storage.getSessionList();
            for (int i = 0; i < sessionList.size(); i++) {
                if (sessionList.get(i).getSessionId().equalsIgnoreCase(wcSession.getTopic())) {
                    WCSessionStoreItem wcSessionStoreItem = sessionList.get(i);


                    WCSessionStoreItem dataSave = new WCSessionStoreItem(wcSessionStoreItem.getSessionId(),
                            wcSessionStoreItem.getSession(),
                            addressData.getInt("chainId"),
                            wcSessionStoreItem.getPeerId(),
                            wcSessionStoreItem.getRemotePeerId(),
                            wcSessionStoreItem.getRemotePeerMeta(),
                            false,
                            addressData.toString(),
                            wcSessionStoreItem.getDate()
                    );

                    int i1 = sessionList.indexOf(wcSessionStoreItem);
                    sessionList.remove(wcSessionStoreItem);
                    sessionList.add(dataSave);

                }
            }
            storage.setSessionList(sessionList);
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("connectedDapps", new Gson().toJson(storage.getSessionList()));
            jsonObject.putString("Success", "Chain updated from mobile app");
            sendEvent(mContext, "UpdateChainSuccess", jsonObject);

        } catch (Exception e) {
            e.printStackTrace();
        }
        // isAllDisconnected = true;
    }

    public void checkAllDisconnected() {
        List<WCSessionStoreItem> sessionList = storage.getSessionList();
        if (sessionList.size() == 0)
            isAllDisconnected = true;

    }

    @ReactMethod
    public void rejectSession() {
        wcClient.rejectSession("rejected");
        wcClient.disconnect();
    }

    @ReactMethod
    public void killSession(String clickedItem) {
        try {
            Log.e("Killsession ", clickedItem);
            JSONObject walletData = new JSONObject(clickedItem);
            JSONObject addressData = new JSONObject(walletData.getString("address"));
            JSONObject session = walletData.getJSONObject("session");
            WCSession wcSession = new Gson().fromJson(session.toString(), WCSession.class);
            wcClient = createWalletConnectSession(addressData.getString("address"), wcSession, walletData.getString("peerId"), walletData.getString("remotePeerId"));
            wcClient.setSessionData(wcSession);
            setEvents(wcClient);
            refreshDappSessionData(wcClient.sessionId());
            disconnect();
        } catch (Exception e) {
            Log.d("kill session exception", "killSession: exception" + e);
        }
    }


    public void refreshDappSessionData(String sessionId) {
        List<WCSessionStoreItem> sessionList = storage.getSessionList();
        if (sessionList != null && sessionList.size() > 0) {
            for (int i = 0; i < sessionList.size(); i++) {
                if (sessionList.get(i).getSessionId().equalsIgnoreCase(sessionId)) {
                    sessionList.remove(sessionList.get(i));
                }
            }
            storage.setSessionList(sessionList);
        }
    }

    public static WCClient createWalletConnectSession(String address, WCSession session, String peerId, String remotePeerId) {
        WCClient client = new WCClient(new GsonBuilder(), new OkHttpClient());

        com.trustwallet.walletconnect.models.WCPeerMeta peerMeta = new com.trustwallet.walletconnect.models.WCPeerMeta(
                "Me3", "https://www.me3.io/",
                address,
                new ArrayList<>(Collections.singleton(me3Logo))
        );

        client.connect(session, peerMeta, peerId, remotePeerId);

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return client;
    }

    @ReactMethod
    public void rejectRequest(String id) {
        wcClient.rejectRequest(Long.parseLong(id), "User canceled");
        refreshDappSessionData(wcClient.getSessionData().getTopic());
        clientMap.remove(wcClient.getSessionData().getTopic());
        WritableMap jsonObject = Arguments.createMap();
        jsonObject.putString("connectedDapps", new Gson().toJson(storage.getSessionList()));
        jsonObject.putString("Rejected", "Sign rejected");
        sendEvent(mContext, "ETHSignRejected", jsonObject);
    }

    public void setEvents(WCClient client) {
        client.setOnDisconnect((integer, s) -> {
            Log.d("setOnDisconnect", "session disconnected :: ");
            WritableMap params = Arguments.createMap();
            if (!isFromEthSignApprove) {
                refreshDappSessionData(client.getSessionData().getTopic());
                clientMap.remove(client.getSessionData().getTopic());
                if (isFromDisAll) {
                    isFromDisAll = false;
                    storage.setSessionList(new ArrayList<>());
                    clientMap = new ConcurrentHashMap<>();
                } else {
                    refreshDappSessionData(client.getSessionData().getTopic());
                    clientMap.remove(client.getSessionData().getTopic());
                }
                isFromEthSignApprove = false;
            } else {
                isFromEthSignApprove = false;

            }
            if (isFromDisAll) {
                isFromDisAll = false;
                storage.setSessionList(new ArrayList<>());
                clientMap = new ConcurrentHashMap<>();
            } else {
                String gson = new Gson().toJson(storage.getSessionList());
            }
            params.putString("connectedDapps", new Gson().toJson(storage.getSessionList()));
            sendEvent(mContext, "Disconnect", params);
            return null;
        });
        client.setOnFailure(throwable -> {
            Log.d("setOnFailure", "session failed :: ");
            return null;
        });
        client.setOnSessionRequest((aLong, wcPeerMeta) -> {
            Log.e("SessionRequest", "Session request method called");
            wcRemotePeerMeta = wcPeerMeta;
            client.setRemotePeerMeta(wcPeerMeta);
            client.setSessionData(wcSession);
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("request", new Gson().toJson(wcPeerMeta));
            jsonObject.putDouble("requestID", aLong);
            sendEvent(mContext, "CreateSession", jsonObject);
            return null;
        });
        client.setOnEthSign((aLong, wcEthereumSignMessage) -> {
            Log.e("ethsign", "on eth sign called");
            Signable signable = new EthereumMessage(wcEthereumSignMessage.getData(), "", aLong, SignMessageType.SIGN_PERSONAL_MESSAGE);
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("ethsign", new Gson().toJson(wcEthereumSignMessage));
            jsonObject.putDouble("ethsignId", aLong);
            jsonObject.putString("peerdata", new Gson().toJson(wcRemotePeerMeta));
            jsonObject.putString("message", signable.getUserMessage().toString());
            jsonObject.putString("type", new Gson().toJson(wcEthereumSignMessage.getType()));
            sendEvent(mContext, "ETHSign", jsonObject);

            return null;
        });
        client.setOnEthSignTransaction((aLong, wcEthereumTransaction) -> {
            Log.e("Ethsign transaction", "oneth transaction");
            return null;
        });
        client.setOnWalletAddNetwork((aLong, wcAddNetwork) -> {
            Log.e("WalletAddNetwork", "on WalletAddNetwork");
            return null;
        });
        client.setOnWalletChangeNetwork((aLong, chainId) -> {
            Log.e("WalletChangeNetwork", "on WalletChangeNetwork");
            List<WCSessionStoreItem> sessionList = storage.getSessionList();
            WCSessionStoreItem itemToReturn = null;
            for (int i = 0; i < sessionList.size(); i++) {
                if (sessionList.get(i).getSessionId().equalsIgnoreCase(client.sessionId())) {
                    itemToReturn = sessionList.get(i);
                }
            }
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("requestId", String.valueOf(aLong));
            jsonObject.putString("chainId", String.valueOf(chainId));
            if (itemToReturn != null)
                jsonObject.putString("data", new Gson().toJson(itemToReturn));
            sendEvent(mContext, "ChainChangeFromDapp", jsonObject);
            return null;
        });
        client.setOnSignTransaction((aLong, wcSignTransaction) -> {
            Log.e("setOnSignTransaction", "Sign transaction called");
            WritableMap jsonObject = Arguments.createMap();
            jsonObject.putString("data", new Gson().toJson(wcSignTransaction));
            sendEvent(mContext, "SignETHTransaction", jsonObject);
            return null;
        });
        client.setOnEthSendTransaction((aLong, wcEthereumTransaction) -> {
            Log.e("setOnEthSendTransaction", "setOnEthSendTransaction called");
            List<WCSessionStoreItem> sessionList = storage.getSessionList();
            WritableMap jsonObject = Arguments.createMap();
            WCSessionStoreItem itemToReturn = null;
            for (int i = 0; i < sessionList.size(); i++) {
                try {
                    WCSessionStoreItem wcSessionStoreItem = sessionList.get(i);
                    if (wcSessionStoreItem.getSessionId().equalsIgnoreCase(client.getSessionData().getTopic())) {
                        jsonObject.putString("address", wcSessionStoreItem.getAddress());
                        itemToReturn = sessionList.get(i);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            jsonObject.putString("requestId", String.valueOf(aLong));
            jsonObject.putString("data", new Gson().toJson(wcEthereumTransaction));
            jsonObject.putString("remotepeerdata", new Gson().toJson(client.getRemotePeerData()));
            if (itemToReturn != null)
                jsonObject.putString("allData", new Gson().toJson(itemToReturn));
            sendEvent(mContext, "SendETHTransaction", jsonObject);
            return null;
        });
    }

    @ReactMethod
    public void rejectSendRequest(String allData) {
        try {
            WCClient client = setClient(allData);
            JSONObject jsondata = new JSONObject(allData);
            String requestId = jsondata.getString("requestId");
            client.rejectRequest(Long.parseLong(requestId), "User canceled");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }


    public WCClient setClient(String dataToparse) {
        try {
            JSONObject jsondata = new JSONObject(dataToparse);
            JSONObject address = jsondata.getJSONObject("address");
            String peerId = jsondata.getString("peerId");
            JSONObject session = jsondata.getJSONObject("session");
            String remotePeerId = jsondata.getString("remotePeerId");
            String remotePeerMeta = jsondata.getString("remotePeerMeta");
            WCSession wcSession = new Gson().fromJson(session.toString(), WCSession.class);
            WCClient client = createWalletConnectSession(address.getString("address"), wcSession, peerId, remotePeerId);
            client.setSessionData(wcSession);
            client.setRemotePeerMeta(new Gson().fromJson(remotePeerMeta.toString(), WCPeerMeta.class));
           // setEvents(client);
            return client;
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    @ReactMethod
    public void approveSendRequest(String allData) {
        Log.e("alldata from react", allData);
        try {
            JSONObject jsondata = new JSONObject(allData);
            String requestId = jsondata.getString("requestId");
            String rawTransaction = jsondata.getString("rawTransaction");
            WCClient client = setClient(allData);
            client.approveRequest(Long.parseLong(requestId), rawTransaction);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void switchChain(String clickedItem) throws JSONException {

        Log.e("Android switch chain", clickedItem);
        JSONObject walletData = new JSONObject(clickedItem);
        JSONObject address = walletData.getJSONObject("address");
        String chainId = walletData.getString("chainId");
        String requestId = walletData.getString("requestId");
        String sessionId = walletData.getString("sessionId");
        String peerId = walletData.getString("peerId");

        JSONObject session = walletData.getJSONObject("session");
        String remotePeerId = walletData.getString("remotePeerId");
        String remotePeerMeta = walletData.getString("remotePeerMeta");
        WCSession wcSession = new Gson().fromJson(session.toString(), WCSession.class);
        WCClient client = createWalletConnectSession(address.getString("address"), wcSession, peerId, remotePeerId);
        client.setSessionData(wcSession);
        client.setRemotePeerMeta(new Gson().fromJson(remotePeerMeta.toString(), WCPeerMeta.class));
        setEvents(client);
        client.switchChain(Long.parseLong(requestId), Integer.parseInt(chainId), true, true);
//
        List<WCSessionStoreItem> sessionList = storage.getSessionList();
        for (int i = 0; i < sessionList.size(); i++) {
            if (sessionList.get(i).getSessionId().equalsIgnoreCase(wcSession.getTopic())) {
                WCSessionStoreItem wcSessionStoreItem = sessionList.get(i);
                WCSessionStoreItem dataSave = new WCSessionStoreItem(wcSessionStoreItem.getSessionId(),
                        wcSessionStoreItem.getSession(),
                        Integer.parseInt(walletData.getString("chainId")),
                        wcSessionStoreItem.getPeerId(),
                        wcSessionStoreItem.getRemotePeerId(),
                        wcSessionStoreItem.getRemotePeerMeta(),
                        false,
                        address.toString(),
                        wcSessionStoreItem.getDate()
                );
                sessionList.remove(wcSessionStoreItem);
                sessionList.add(dataSave);
            }
        }
        storage.setSessionList(sessionList);
        WritableMap jsonObject = Arguments.createMap();
        jsonObject.putString("connectedDapps", new Gson().toJson(storage.getSessionList()));
        jsonObject.putString("Success", "chain switch success");
        sendEvent(mContext, "ChainChangeSuccess", jsonObject);
    }

    boolean isFromEthSignApprove = false;

    @ReactMethod
    public void signRequest(String id, String message) {
        wcClient.approveRequest(Long.parseLong(id), message);
        isFromEthSignApprove = true;
        WritableMap jsonObject = Arguments.createMap();
        jsonObject.putString("success", "Approve sign success");
        sendEvent(mContext, "ETHSignSuccess", jsonObject);
    }
}
