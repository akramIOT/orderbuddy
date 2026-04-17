package com.orderbuddy.starprinter;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;

@CapacitorPlugin(name = "StarPrinter")
public class StarPrinterPlugin extends Plugin {

    @PluginMethod
    public void printOverNetwork(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Missing data");
            return;
        }

        try {
            Moshi moshi = new Moshi.Builder().build();
            JsonAdapter<PrintPayload> adapter = moshi.adapter(PrintPayload.class);
            PrintPayload payload = adapter.fromJson(data);

            if (payload == null) {
                call.reject("print payload is null");
                return;
            }

            if (payload.printerInfo == null || payload.printerInfo.ip == null) {
                call.reject("printer identifier payload is null");
                return;
            }

            if (payload.order == null || payload.order._id == null) {
                call.reject("order in payload is null");
                return;
            }

            if ("socket".equals(payload.source) && !PrintGuard.INSTANCE.canPrint(payload.order._id)) {
                Log.d("print", "printed already");
                call.resolve();
                return;
            }

            Context context = getContext();
            StarPrinterManager starPrinterManager = new StarPrinterManager(payload.printerInfo.ip, context);
            starPrinterManager.print(payload.order, payload.restaurantInfo, payload.printerInfo);

            call.resolve();
        } catch (Exception e) {
            call.reject("Print failed", e);
            //todo: trace to app insights
        }
    }
}