//
//  WalletManager.swift
//  WalletConnectObjc
//
//  Created by plusinfosys on 22/12/22.
//

import AVFoundation
import Foundation
import MapKit
import PromiseKit
import UIKit
import WalletConnect

@objc class WalletConnectManager: NSObject {
    // MARK: Variable

    var session: WCSession?
    var lastSessionId: String = ""
    var remotePeerMeta: WCPeerMeta!
    var interactor: WCInteractor!
    lazy var arrInteractor: [WCInteractor] = []
    let clientMeta = WCPeerMeta(name: "Me3", url: "https://www.me3.io/")

    // MARK: Block

    @objc var blockSessionConnected: ((Bool) -> Void)?
    @objc var blockSessionRequest: ((Dictionary<String, Any>) -> Void)?
    @objc var blockSessionDisconnectd: (() -> Void)?
    @objc var blockSessionError: ((Error) -> Void)?
    @objc var blockSessionSwitch: ((Dictionary<String, Any>) -> Void)?
    @objc var blockSessionSwitchSuccess: ((Dictionary<String, Any>) -> Void)?
    @objc var blockSessionEthOnSign: ((Dictionary<String, Any>) -> Void)?
    @objc var blockSessionApproveSuccess: ((Dictionary<String, Any>) -> Void)?
    @objc var blockSessionEthOnTransaction: ((Dictionary<String, Any>) -> Void)?

    // MARK: Intialization

    @objc func createSession(url: String) {
        session = WCSession.from(string: url)
        if session != nil {
            let interactor = connect(_session: session!, _url: url)
            arrInteractor.append(interactor)
            self.interactor = interactor
            print("interactor : =>", arrInteractor.count)
        }
    }

    @objc func connectAll() {
        for wcSessionStoreItem in SessionManager.allSessions {
            let intecator = self.createInteractorItem(wcSessionStoreItem: wcSessionStoreItem)
            self.arrInteractor.append(intecator)
        }
    }

  func createInteractorItem(wcSessionStoreItem: WCSessionStoreItem) -> WCInteractor {
      let addressData = convertStringToDictionary(text: wcSessionStoreItem.address) ?? [:]
      let sessionObj = wcSessionStoreItem.session
      let clientMeta = WCPeerMeta(name: "Me3", url: "https://www.me3.io/", description: addressData["address"] as? String ?? "", icons: ["https://uploads-ssl.webflow.com/62d7bdd20d395b7513f7fffc/62d7bdd20d395bada6f80019_me3-logo.svg"])
      let interactor = WCInteractor(session: sessionObj!, meta: clientMeta, uuid: wcSessionStoreItem.peerId, remotepeerId: wcSessionStoreItem.remotePeerId)
      configure(interactor: interactor)
      interactor.connect().cauterize()
      return interactor
  }

    // MARK: Delegate Mehods

    func connect(_session: WCSession, _url: String) -> WCInteractor {
        let interactor = WCInteractor(session: _session, meta: clientMeta, uuid: UUID().description.lowercased())
        configure(interactor: interactor)
        interactor.connect().cauterize()
        return interactor
    }

    @objc func clearAll() {
        SessionManager.clearAll()
    }

    @objc func approveSession(sessionData: String) {
        if let dictData = convertStringToDictionary(text: sessionData), let address = dictData["address"] as? String, let chainId = dictData["chainId"] as? Int {
            interactor.approveSession(accounts: [address], chainId: chainId).cauterize()
            if interactor != nil {
                lastSessionId = interactor.session.topic
                SessionManager.store(interactor.session, sessionId: interactor.session.topic, chainId: chainId, peerId: interactor.clientId, remotePeerId: interactor.remotepeerId!, remotePeerMeta: interactor.remotepeerMeta!, isAutoSign: false, date: Date(), address: sessionData.trimmingCharacters(in: .whitespaces))

                let encodedData = try! JSONEncoder().encode(SessionManager.allSessions)
                let storageString = String(data: encodedData,
                                           encoding: .utf8)

                var requestData = Dictionary<String, Any>()
                requestData["approved"] = storageString

                guard blockSessionApproveSuccess != nil else {
                    return
                }
                blockSessionApproveSuccess!(requestData)
            }
        }
    }

    @objc func rejectSession() {
        if interactor != nil {
            interactor.rejectSession().cauterize()
        }
    }

    @objc func rejectRequest(_id: Int64, _message: String) {
        if interactor != nil {
            interactor.rejectRequest(id: _id, message: _message).cauterize()
        }
    }

    @objc func approveRequest(_id: Int64, _message: String) {
        if interactor != nil {
            interactor.approveRequest(id: _id, result: _message).cauterize()
        }
    }

    @objc func disconnectSession(sessionData: String) {
        if let dictData = convertStringToDictionary(text: sessionData), let sessionId = dictData["sessionId"] as? String {
            lastSessionId = sessionId
            let foundObject = self.arrInteractor.filter { interactorObj in
                interactorObj.session.topic == sessionId
            }

            if foundObject.count > 0 {
                if foundObject[0].session.key.isEmpty {
                    guard self.blockSessionDisconnectd != nil else {
                        return
                    }
                    self.blockSessionDisconnectd!()
                } else {
                    foundObject[0].killSession().cauterize()
                }
            }
        }
    }

    @objc func disconnectAllSession() {
        for interactorObj in arrInteractor {
            interactorObj.killSession().cauterize()
        }
        SessionManager.clearAll()
    }

    @objc func removeSessionData() -> Dictionary<String, Any> {
        if SessionManager.allSessions.count == 0 {
            let encodedData = try! JSONEncoder().encode(SessionManager.allSessions)
            let storageString = String(data: encodedData,
                                       encoding: .utf8)

            var requestData = Dictionary<String, Any>()
            requestData["connectedDapps"] = storageString
            return requestData
        } else if lastSessionId != nil && lastSessionId != "" {
            SessionManager.clear(lastSessionId)
            lastSessionId = ""
            let encodedData = try! JSONEncoder().encode(SessionManager.allSessions)
            let storageString = String(data: encodedData,
                                       encoding: .utf8)

            var requestData = Dictionary<String, Any>()
            requestData["connectedDapps"] = storageString
            return requestData
        } else {
            return Dictionary<String, Any>()
        }
    }

    @objc func switchChain(sessionData: String, isSwtichFromMobile: Bool) {
        if let walletData = convertStringToDictionary(text: sessionData) {
            var addressString = ""
            var address = ""
            if let addressData = walletData["address"] as? [String: Any] {
                addressString = try! addressData.toJson()
                address = addressData["address"] as? String ?? ""
            }

            let chainId = Int(walletData["chainId"] as? String ?? "0") ?? 0
            let sessionId = walletData["sessionId"] as? String ?? ""
            let peerId = walletData["peerId"] as? String ?? ""
            let remotePeerId = walletData["remotePeerId"] as? String ?? ""
            let requestId = Int64(walletData["requestId"] as? String ?? "0") ?? 0

            var session: WCSession!
            if let sessionData = walletData["session"], let topic = sessionData["topic"] as? String, let version = sessionData["version"] as? String, let bridge = sessionData["bridge"] as? String, let key = sessionData["key"] as? String {
                session = WCSession.Init(topic: topic, version: version, bridge: URL(string: bridge)!, key: key)
            }

            var remotePeerMeta: WCPeerMeta!
            if let remotePeerMetaData = walletData["remotePeerMeta"], let name = remotePeerMetaData["name"] as? String, let url = remotePeerMetaData["url"] as? String, let description = remotePeerMetaData["description"] as? String, let icons = remotePeerMetaData["icons"] as? [String] {
                remotePeerMeta = WCPeerMeta(name: name, url: url, description: description, icons: icons)
            }

            if isSwtichFromMobile {
                if let addressData = walletData["address"] as? [String: Any] {
                    let chainId = addressData["chainId"] as? Int ?? 0

                    let foundObject = self.arrInteractor.filter { interactorObj in
                        interactorObj.session.topic == sessionId
                    }

                    if foundObject.count > 0 {
                        foundObject[0].UpdateSession(chainId: chainId, account: [address]).cauterize()
                    }
                }
            } else {
                interactor.UpdateSession(chainId: chainId, account: [address]).cauterize()
                approveRequest(_id: requestId, _message: "")
            }

            SessionManager.clear(sessionId)
            SessionManager.store(session, sessionId: sessionId, chainId: chainId, peerId: peerId, remotePeerId: remotePeerId, remotePeerMeta: remotePeerMeta, isAutoSign: false, date: Date(), address: addressString)

            let encodedData = try! JSONEncoder().encode(SessionManager.allSessions)
            let storageString = String(data: encodedData,
                                       encoding: .utf8)

            var requestData = Dictionary<String, Any>()
            requestData["connectedDapps"] = storageString
            requestData["Success"] = "chain switch success"

            guard blockSessionSwitchSuccess != nil else { return }
            blockSessionSwitchSuccess!(requestData)
        }
    }

    @objc func rejectSendRequest(sessionData: String) {
        if let sendRequestData = convertStringToDictionary(text: sessionData) {
            let requestId = sendRequestData["requestId"] as? Int
            rejectRequest(_id: Int64(requestId ?? 0), _message: "User canceled")
        }
    }

    @objc func approveSendRequest(sessionData: String) {
        if let sendRequestData = convertStringToDictionary(text: sessionData) {
            let requestId = sendRequestData["requestId"] as? Int
            let rawTransaction = sendRequestData["rawTransaction"] as? String
            approveRequest(_id: Int64(requestId ?? 0), _message: rawTransaction ?? "")
        }
    }

    // MARK: Session Callback Mehods

    func configure(interactor: WCInteractor) {
        interactor.onError = { [weak self] error in
            self?.interactor = interactor
            guard self?.blockSessionError != nil else { return }
            self?.blockSessionError!(error)
        }

        interactor.onSessionRequest = { [weak self] id, peerParam in
            self?.interactor = interactor
            let peer = peerParam.peerMeta
            self?.remotePeerMeta = peer
            let encodedData = try! JSONEncoder().encode(peer)
            let peerMetaString = String(data: encodedData,
                                        encoding: .utf8)

            var requestData = Dictionary<String, Any>()
            requestData["request"] = peerMetaString
            requestData["requestID"] = id

            guard self?.blockSessionRequest != nil else {
                return
            }
            self?.blockSessionRequest!(requestData)
        }

        interactor.onDisconnect = { [weak self] error in
            self?.interactor = interactor
            self?.lastSessionId = interactor.session.topic

            if let error = error {
                print(error)
            }

            guard self?.blockSessionDisconnectd != nil else {
                return
            }

            self?.blockSessionDisconnectd!()
        }

        interactor.eth.onSign = { [weak self] id, payload in
            self?.interactor = interactor
            if UserDefaults.standard.object(forKey: "EncodedData") != nil {
                let encodedData = try! JSONEncoder().encode(self?.remotePeerMeta)
                let peerMetaString = String(data: encodedData,
                                            encoding: .utf8)

                var requestData = Dictionary<String, Any>()
                requestData["ethsign"] = self?.json(from: UserDefaults.standard.object(forKey: "EncodedData")!)
                requestData["ethsignId"] = id
                requestData["peerdata"] = peerMetaString
                requestData["message"] = payload.message
                requestData["type"] = payload.method

                guard self?.blockSessionEthOnSign != nil else {
                    return
                }

                self?.blockSessionEthOnSign!(requestData)

                UserDefaults.standard.set(nil, forKey: "EncodedData")
                UserDefaults.standard.synchronize()
            }
        }

        interactor.eth.onTransaction = { [weak self] id, _, transaction in
            self?.interactor = interactor
            var requestData = Dictionary<String, Any>()
            var selectedIndex = 0
            for (Index, obj) in SessionManager.allSessions.enumerated() {
                if obj.sessionId == interactor.session.topic {
                    requestData["address"] = obj.address
                    selectedIndex = Index
                }
            }

            let transactionData = try! JSONEncoder().encode(transaction)
            let transactionString = String(data: transactionData,
                                           encoding: .utf8)

            let remotepeerMeta = try! JSONEncoder().encode(interactor.remotepeerMeta)
            let remotepeerMetaString = String(data: remotepeerMeta,
                                              encoding: .utf8)

            let sessionData = try! JSONEncoder().encode(SessionManager.allSessions[selectedIndex])
            let itemToReturnString = String(data: sessionData,
                                            encoding: .utf8)

            requestData["requestId"] = id
            requestData["data"] = transactionString
            requestData["remotepeerdata"] = remotepeerMetaString
            requestData["allData"] = itemToReturnString
            guard self?.blockSessionEthOnTransaction != nil else { return }
            self?.blockSessionEthOnTransaction!(requestData)
        }

        interactor.onCustomRequest = { [weak self] id, request in
            self?.interactor = interactor
            guard let methods = request["method"] as? String, methods == "wallet_switchEthereumChain" else { return }
            guard let dictData = request["params"] as? [[String: Any]] else { return }
            if dictData.count > 0, let chainId = dictData[0]["chainId"] as? String {
                let value = UInt32(chainId.dropFirst(2), radix: 16) ?? 0

                let walletObj = SessionManager.allSessions.filter { objSession in
                    objSession.sessionId == interactor.session.topic
                }

                if walletObj.count > 0 {
                    let encodedData = try! JSONEncoder().encode(walletObj[0])
                    let sessionDataString = String(data: encodedData,
                                                   encoding: .utf8)

                    var requestData = Dictionary<String, Any>()
                    requestData["requestId"] = String(id)
                    requestData["chainId"] = String(value)
                    requestData["data"] = sessionDataString
                    guard self?.blockSessionSwitch != nil else { return }
                    self?.blockSessionSwitch!(requestData)
                }
            }
        }
    }
}

// MARK: OTHER Funcation

extension WalletConnectManager {
    func convertStringToDictionary(text: String) -> [String: AnyObject]? {
        if let data = text.data(using: .utf8) {
            do {
                let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: AnyObject]
                return json
            } catch {
                print("Something went wrong")
            }
        }
        return nil
    }

    func json(from object: Any) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: object, options: []) else {
            return nil
        }
        return String(data: data, encoding: String.Encoding.utf8)
    }
}

extension Dictionary {
    /// Convert Dictionary to JSON string
    /// - Throws: exception if dictionary cannot be converted to JSON data or when data cannot be converted to UTF8 string
    /// - Returns: JSON string
    func toJson() throws -> String {
        let data = try JSONSerialization.data(withJSONObject: self)
        if let string = String(data: data, encoding: .utf8) {
            return string
        }
        throw NSError(domain: "Dictionary", code: 1, userInfo: ["message": "Data cannot be converted to .utf8 string"])
    }
}
