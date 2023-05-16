//
//  SessionManager.swift
//  Me3App
//
//  Created by plusinfosys on 29/12/22.
//

import Foundation
import WalletConnect

public struct WCSessionStoreItem: Codable {
    public let session: WCSession?
    public let sessionId: String
    public let chainId: Int
    public let peerId: String
    public let remotePeerId: String
    public let remotePeerMeta: WCPeerMeta
    public let isAutoSign: Bool
    public let date: Date
    public let address: String
}

let SessionManager = WCSessionStore.Shared

class WCSessionStore {
    static let Shared = WCSessionStore()

    static let prefix = "org.walletconnect.currentsessions"

    var allSessions: [WCSessionStoreItem] = UserDefaults.standard.codableValue(forKey: WCSessionStore.prefix) ?? []

    func store(_ session: WCSession, sessionId: String, chainId: Int, peerId: String, remotePeerId: String, remotePeerMeta: WCPeerMeta, isAutoSign: Bool = false, date: Date = Date(), address: String) {
        let item = WCSessionStoreItem(session: session, sessionId: sessionId, chainId: chainId, peerId: peerId, remotePeerId: remotePeerId, remotePeerMeta: remotePeerMeta, isAutoSign: isAutoSign, date: date, address: address)
        store(item)
    }

    func store(_ item: WCSessionStoreItem) {
        allSessions.append(item)
        store(allSessions)
    }

    func clearAll() {
        allSessions.removeAll()
        store(allSessions)
    }

    func clear(_ topic: String) {
        for (index, session) in allSessions.enumerated() {
            if session.sessionId == topic {
                allSessions.remove(at: index)
                store(allSessions)
                break
            }
        }
    }

    private func store(_ sessions: [WCSessionStoreItem]) {
        UserDefaults.standard.setCodable(sessions, forKey: WCSessionStore.prefix)
    }
}

extension UserDefaults {
    func setCodable<T: Codable>(_ value: T, forKey: String) {
        let data = try? JSONEncoder().encode(value)
        set(data, forKey: forKey)
    }

    func codableValue<T: Codable>(forKey: String) -> T? {
        guard let data = data(forKey: forKey),
              let value = try? JSONDecoder().decode(T.self, from: data) else {
            return nil
        }
        return value
    }
}
