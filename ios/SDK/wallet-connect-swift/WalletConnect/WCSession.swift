// Copyright © 2017-2019 Trust Wallet.
//
// This file is part of Trust. The full Trust copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

import Foundation
import CryptoSwift

public class WCSession : Codable {
    public var topic: String = ""
    public var version: String = ""
    public var bridge: URL? = nil
    public var key: Data = Data()

    init(topic:String,version: String,bridge: URL,key: Data) {
        self.topic = topic
        self.version = version
        self.bridge = bridge
        self.key = key
    }

    public static func Init(topic:String, version:String, bridge: URL, key:String) -> WCSession{
        return WCSession(topic: topic, version: version, bridge: bridge, key: Data(hex: key))
    }

    public static func from(string: String) -> WCSession? {
        guard string .hasPrefix("wc:") else {
            return nil
        }

        let urlString = string.replacingOccurrences(of: "wc:", with: "wc://")
        guard let url = URL(string: urlString),
            let topic = url.user,
            let version = url.host,
            let components = NSURLComponents(url: url, resolvingAgainstBaseURL: false) else {
                return nil
        }

        var dicts = [String: String]()
        for query in components.queryItems ?? [] {
            if let value = query.value {
                dicts[query.name] = value
            }
        }
        guard let bridge = dicts["bridge"],
            let bridgeUrl = URL(string: bridge),
            let key = dicts["key"] else {
                return nil
        }

        return WCSession(topic: topic, version: version, bridge: bridgeUrl, key: Data(hex: key))
    }
}
