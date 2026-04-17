package com.orderbuddy.starprinter

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.util.Log
import com.google.zxing.BarcodeFormat
import com.google.zxing.WriterException
import com.google.zxing.qrcode.QRCodeWriter
import com.starmicronics.stario10.InterfaceType
import com.starmicronics.stario10.StarConnectionSettings
import com.starmicronics.stario10.StarDeviceDiscoveryManager
import com.starmicronics.stario10.StarDeviceDiscoveryManagerFactory
import com.starmicronics.stario10.StarIO10ErrorCode
import com.starmicronics.stario10.StarIO10IllegalHostDeviceStateException
import com.starmicronics.stario10.StarPrinter
import com.starmicronics.stario10.starxpandcommand.DocumentBuilder
import com.starmicronics.stario10.starxpandcommand.PrinterBuilder
import com.starmicronics.stario10.starxpandcommand.StarXpandCommandBuilder
import com.starmicronics.stario10.starxpandcommand.printer.CutType
import com.starmicronics.stario10.starxpandcommand.printer.ImageParameter
import kotlinx.coroutines.runBlocking

class StarPrinterManager(private val ipAddress: String, context: Context) {
    private val appContext = context.applicationContext
    //private var _manager: StarDeviceDiscoveryManager? = null

    fun print(order: OrderInfo, restaurantInfo: RestaurantInfo, printerInfo: PrinterInfo) {
        printReceipt(
            order,
            restaurantInfo,
            printerInfo.ip,
            appContext
        )
    }

    companion object {
        @JvmStatic
        fun printReceipt(
            order: OrderInfo,
            restaurantInfo: RestaurantInfo,
            printerIp: String,
            context: Context
        ) {
            val bitmap =
                generatePrintImage(order, restaurantInfo)
            val imageParam = ImageParameter(bitmap, 576)

            val builder = StarXpandCommandBuilder().apply {
                addDocument(
                    DocumentBuilder().addPrinter(
                        PrinterBuilder()
                            .actionPrintImage(imageParam)
                            .actionCut(CutType.Partial)
                    )
                )
            }

            val command = builder.getCommands()
            val settings = StarConnectionSettings(InterfaceType.Lan, printerIp, true)
            val printer = StarPrinter(settings, context)

            try {
                runBlocking {
                    printer.openAsync().await()
                    printer.printAsync(command).await()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                try {
                    runBlocking {
                        printer.closeAsync().await()
                    }
                } catch (ignored: Exception) {
                }
            }
        }

        @JvmStatic
        fun generatePrintImage(
            order: OrderInfo,
            restaurantInfo: RestaurantInfo
        ): Bitmap {
            val width = 576

            val paint = Paint().apply {
                color = Color.BLACK
                textSize = 36f
                typeface = Typeface.MONOSPACE
                isAntiAlias = true
            }

            // 🔢 1. Measure required height
            var y = 50f
            y += 50f // restaurant line
            y += 40f // customer
            y += 40f // order id + origin
            y += 40f // separator

            order.items?.forEach { item ->
                y += 40f // item name
                item.variants?.forEach { _ -> y += 30f }
                item.modifiers?.forEach { _ -> y += 30f }
                y += 10f // spacer
                y += 40f // separator between items
            }

            y += 40f // item count
            y += 60f // total
            y += 300f + 30f // QR code
            y += 60f // branding

            val finalHeight = y.toInt().coerceAtLeast(300)

            // 🖼️ 2. Create exact-size bitmap
            val bitmap = Bitmap.createBitmap(width, finalHeight, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)

            // 🖊️ 3. Reuse paint and draw same flow
            y = 50f
            canvas.drawText(
                "${restaurantInfo.restaurantName} - ${restaurantInfo.locationName}",
                10f, y, paint
            ).also { y += 50f }

            canvas.drawText(order.customer?.name.orEmpty(), 10f, y, paint).also { y += 40f }

            canvas.drawText(
                "#${order._id.takeLast(4).uppercase()} ${order.origin?.name.orEmpty()}",
                10f, y, paint
            ).also { y += 40f }

            canvas.drawText("------------------------------", 10f, y, paint).also { y += 40f }

            order.items?.forEach { item ->
                canvas.drawText(item.name, 10f, y, paint).also { y += 40f }

                item.variants?.forEach { variant ->
                    canvas.drawText("> ${variant.name}", 20f, y, paint).also { y += 30f }
                }

                item.modifiers?.forEach { mod ->
                    val options = mod.options?.joinToString(", ") { it.name } ?: ""
                    canvas.drawText("- ${mod.name}: $options", 20f, y, paint).also { y += 30f }
                }

                y += 10f
                canvas.drawText("------------------------------", 10f, y, paint).also { y += 40f }
            }

            canvas.drawText("Items: ${order.items?.size ?: 0}", 10f, y, paint).also { y += 40f }

            canvas.drawText(
                "Total: $${"%.2f".format(order.totalPriceCents / 100.0)}",
                10f, y, paint
            ).also { y += 60f }

            val qrText =
                "https://order.orderbuddyapp.com/menus/${restaurantInfo.restaurantId}/${restaurantInfo.locationName}/${restaurantInfo.locationId}"
            val qrBitmap = generateQrBitmap(qrText, 300)

            qrBitmap?.let {
                canvas.drawBitmap(it, (width - it.width) / 2f, y, null)
                y += it.height + 30f
            }

            paint.isFakeBoldText = true
            canvas.drawText("OrderBuddy", width - 250f, y, paint).also { y += 60f }

            return bitmap
        }

        @JvmStatic
        fun generateQrBitmap(content: String, size: Int): Bitmap? {
            return try {
                val bitMatrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
                Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).apply {
                    for (x in 0 until size) {
                        for (y in 0 until size) {
                            setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
                        }
                    }
                }
            } catch (e: WriterException) {
                e.printStackTrace()
                null
            }
        }
    }

    fun discover() {
        try {
            val interfaceTypes = listOf(InterfaceType.Lan)
            val manager = StarDeviceDiscoveryManagerFactory.create(
                interfaceTypes, appContext
            )

            manager.stopDiscovery()
            manager.discoveryTime = 10000
            manager.callback = object : StarDeviceDiscoveryManager.Callback {
                override fun onPrinterFound(printer: StarPrinter) {
                    Log.d("Discovery", "Found printer: ${printer.connectionSettings.identifier}.")
                }

                override fun onDiscoveryFinished() {
                    Log.d("Discovery", "Discovery finished.")
                }
            }
            manager.startDiscovery()

        } catch (e: StarIO10IllegalHostDeviceStateException) {
            if (e.errorCode == StarIO10ErrorCode.BluetoothUnavailable) {
                // Example of error: Bluetooth capability of Android device is disabled.
                // This may be due to the Android device's Bluetooth being off.
            }
        } catch (e: Exception) {
            Log.d("Discovery", "Error: ${e}")
        }
    }

}
