package com.trustwallet.walletconnect

import com.trustwallet.walletconnect.models.WCPeerMeta
import com.trustwallet.walletconnect.models.session.WCSession
import java.util.*

data class WCSessionStoreItem(
    val sessionId :String,
    val session: WCSession,
    val chainId: Int,
    val peerId: String,
    val remotePeerId: String,
    val remotePeerMeta: WCPeerMeta,
    val isAutoSign: Boolean = false,
    val address:String,
    val date: Date = Date()
)

interface WCSessionStore {
    var session: WCSessionStoreItem?
    var sessionList: List<WCSessionStoreItem>?

}