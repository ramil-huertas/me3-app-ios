// Copyright © 2017-2019 Trust Wallet.
//
// This file is part of Trust. The full Trust copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

import Foundation

//public struct WCSessionStoreItem: Codable {
//    public let session: WCSession
//    public let sessionId : String
//    public let chainId : Int
//    public let peerId: String
//    public let remotepeerId : String
//    public let remotepeerMeta: WCPeerMeta
//    public let autoSign: Bool
//    public let date: Date
//    public let walletData : String
//
//}
//
//public struct WCSessionStore {
//
//    static let prefix = "org.walletconnect.sessions"
//
//    public static var allSessions: [String: WCSessionStoreItem] {
//        let sessions: [String: WCSessionStoreItem] = UserDefaults.standard.codableValue(forKey: prefix) ?? [:]
//        return sessions
//    }
//
//    public static func store(_ session: WCSession,sessionId:String,chainId:Int, peerId: String,remotepeerId:String, remotepeerMeta: WCPeerMeta, autoSign: Bool = false, date: Date = Date(),walletData:String) {
//        let item = WCSessionStoreItem(session: session, sessionId: sessionId, chainId: chainId, peerId: peerId, remotepeerId: remotepeerId, remotepeerMeta: remotepeerMeta, autoSign: false, date: date, walletData: walletData)
//        store(item)
//    }
//
//    public static func store(_ item: WCSessionStoreItem) {
//        var sessions = allSessions
//        sessions[item.session.topic] = item
//        store(sessions)
//    }
//
//    public static func load(_ topic: String) -> WCSessionStoreItem? {
//        guard let item = allSessions[topic] else { return nil }
//        return item
//    }
//
//    public static func clear( _ topic: String) {
//        var sessions = allSessions
//        sessions.removeValue(forKey: topic)
//        store(sessions)
//    }
//
//    public static func clearAll() {
//        store([:])
//    }
//
//    private static func store(_ sessions: [String: WCSessionStoreItem]) {
//        UserDefaults.standard.setCodable(sessions, forKey: prefix)
//    }
//}
//
//extension UserDefaults {
//    func setCodable<T: Codable>(_ value: T, forKey: String) {
//        let data = try? JSONEncoder().encode(value)
//        set(data, forKey: forKey)
//    }
//
//    func codableValue<T: Codable>(forKey: String) -> T? {
//        guard let data = data(forKey: forKey),
//            let value = try? JSONDecoder().decode(T.self, from: data) else {
//            return nil
//        }
//        return value
//    }
//}
