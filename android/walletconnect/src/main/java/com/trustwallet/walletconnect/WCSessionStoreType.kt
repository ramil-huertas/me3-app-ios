package com.trustwallet.walletconnect

import android.content.SharedPreferences
import android.util.Log
import com.github.salomonbrys.kotson.*
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import java.lang.reflect.Type

class WCSessionStoreType(
    private val sharedPreferences: SharedPreferences,
): WCSessionStore {
    private val gson =  GsonBuilder()
        .serializeNulls()
        .create()

    private fun store(item: WCSessionStoreItem?) {
        if (item != null) {
            sharedPreferences.edit().putString(SESSION_KEY, gson.toJson(item)).apply()
        } else {
            sharedPreferences.edit().remove(SESSION_KEY).apply()
        }
    }

    private fun load(): WCSessionStoreItem? {
        val json = sharedPreferences.getString(SESSION_KEY, null) ?: return null
        return gson.fromJson(json)
    }

    override var session: WCSessionStoreItem?
        set(item) = store(item)
        get() = load()


    override var sessionList: List<WCSessionStoreItem>?
        set(item) = storeList(item)
        get() = loadList()

    private fun storeList(item: List<WCSessionStoreItem>?) {
        if (item != null) {
            sharedPreferences.edit().putString(SESSION_KEY, gson.toJson(item)).apply()
        } else {
            sharedPreferences.edit().remove(SESSION_KEY).apply()
        }
    }

    private fun loadList(): List<WCSessionStoreItem>? {
        val json = sharedPreferences.getString(SESSION_KEY, null) ?: return null
        val type: Type = object : TypeToken<List<WCSessionStoreItem?>?>() {}.getType()
        return gson.fromJson(json, type)
    }


    companion object {
        private const val SESSION_KEY = "org.walletconnect.session"
    }
}