package org.tactical.dashboard.data

import kotlinx.browser.window

object Storage {
    fun save(key: String, value: String) {
        window.localStorage.setItem(key, value)
    }

    fun load(key: String): String? {
        return window.localStorage.getItem(key)
    }
}
