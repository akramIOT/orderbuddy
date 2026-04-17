package com.orderbuddy.app;

import android.app.Application;
import android.util.Log;
import java.util.Map;
import java.util.HashMap;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class OrderBuddyApp extends Application {
    public static AzureMonitorClient monitorClient;
    private static final String TAG = "OrderBuddyApp";

    @Override
    public void onCreate() {
        super.onCreate();
        
        initializeAzureMonitor();
        setupExceptionHandler();
            initializeFirebaseCrashlytics(); 

        // Track app launch event
        if (monitorClient != null) {
            monitorClient.trackEvent("AppLaunched", null);
        }
    }
    private void initializeFirebaseCrashlytics() {
    try {
        FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
        Log.i(TAG, "Firebase Crashlytics initialized successfully");
    } catch (Exception e) {
        Log.e(TAG, "Failed to initialize Firebase Crashlytics", e);
    }
}
    private void initializeAzureMonitor() {
        try {
            String connectionString = getString(R.string.azure_monitor_connection_string);
            monitorClient = new AzureMonitorClient(getApplicationContext(), connectionString);
            Log.i(TAG, "Azure Monitor initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Azure Monitor", e);
        }
    }
    
    private void setupExceptionHandler() {
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            private Thread.UncaughtExceptionHandler defaultHandler = 
                    Thread.getDefaultUncaughtExceptionHandler();
                    
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                try {
                    Log.e(TAG, "Uncaught exception", throwable);
                    if (monitorClient != null) {
                        Map<String, String> properties = new HashMap<>();
                        properties.put("threadName", thread.getName());
                        properties.put("threadId", String.valueOf(thread.getId()));
                        monitorClient.trackException(throwable, properties);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to track exception", e);
                } finally {
                    if (defaultHandler != null) {
                        defaultHandler.uncaughtException(thread, throwable);
                    }
                }
            }
        });
    }
}