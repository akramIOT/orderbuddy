package com.orderbuddy.starprinter

import android.util.Log

/**
 * Guard class to prevent duplicate printing of orders
 */
object PrintGuard {
    private val printedOrders = mutableSetOf<String>()

    /**
     * Mark an order as printed.
     * @param orderId The order ID to check/add
     * @return true if it's the first time, false if already printed
     */
    @Synchronized
    fun canPrint(orderId: String): Boolean {
        if (printedOrders.contains(orderId)) {
            Log.d("PrintGuard", "Duplicate print attempt detected for order $orderId")
            return false // already printed
        }
        printedOrders.add(orderId)
        return true // proceed with printing
    }
}