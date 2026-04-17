package com.orderbuddy.app;

import android.content.Context;
import android.os.Build;
import android.util.Log;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.json.JSONObject;
import org.json.JSONArray;


public class AzureMonitorClient {
    private static final String TAG = "AzureMonitorClient";
    private final String instrumentationKey;
    private final String ingestionEndpoint;
    private final Map<String, String> commonProperties;
    private final Context context;
    
    public AzureMonitorClient(Context context, String connectionString) {
        this.context = context;
        this.commonProperties = new HashMap<>();
        
        // Parse connection string
        Map<String, String> connectionParams = parseConnectionString(connectionString);
        this.instrumentationKey = connectionParams.get("InstrumentationKey");
        this.ingestionEndpoint = connectionParams.get("IngestionEndpoint");
        Log.i(TAG, "connectionParams: " + connectionParams);
        Log.i(TAG, "InstrumentationKey: " + this.instrumentationKey);
        Log.i(TAG, "IngestionEndpoint: " + this.ingestionEndpoint);
        
        // Set default properties
        initializeDefaultProperties();
    }
    
    private Map<String, String> parseConnectionString(String connectionString) {
        Map<String, String> params = new HashMap<>();
        String[] pairs = connectionString.split(";");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2) {
                params.put(keyValue[0], keyValue[1]);
            }
        }
        return params;
    }
    
    private void initializeDefaultProperties() {
        commonProperties.put("osName", "Android");
        commonProperties.put("osVersion", Build.VERSION.RELEASE);
        commonProperties.put("deviceModel", Build.MODEL);
        commonProperties.put("deviceType", "Mobile");
    }
    
    public Map<String, String> getCommonProperties() {
        return commonProperties;
    }
    
    public void trackEvent(String name, Map<String, String> properties) {
        Map<String, String> allProperties = new HashMap<>(commonProperties);
        if (properties != null) {
            allProperties.putAll(properties);
        }
        
        sendTelemetry("Event", name, allProperties, null);
    }
    
    public void trackException(Throwable throwable, Map<String, String> properties) {
        Map<String, String> allProperties = new HashMap<>(commonProperties);
        if (properties != null) {
            allProperties.putAll(properties);
        }
        
        // Add exception details
        allProperties.put("exceptionType", throwable.getClass().getName());
        allProperties.put("exceptionMessage", throwable.getMessage());
        
        StringBuilder stackTrace = new StringBuilder();
        for (StackTraceElement element : throwable.getStackTrace()) {
            stackTrace.append(element.toString()).append("\n");
        }
        allProperties.put("stackTrace", stackTrace.toString());
        
        sendTelemetry("Exception", throwable.getClass().getName(), allProperties, null);
    }
    
    private void sendTelemetry(final String type, final String name, 
                              final Map<String, String> properties, final Map<String, Double> metrics) {
        new Thread(() -> {
            try {
                Log.i(TAG, "Create telemetry payload: ");
                // Create telemetry payload
                // Create proper timestamp in ISO 8601 format
                String timestamp = java.time.format.DateTimeFormatter.ISO_INSTANT
                    .format(java.time.Instant.now());

                // Create telemetry payload with correct format
                JSONObject telemetry = new JSONObject();
                telemetry.put("name", type + "Data");  // "EventData" or "ExceptionData"
                telemetry.put("time", timestamp);  // MUST be a valid timestamp, not null
                telemetry.put("iKey", instrumentationKey);

                // Set up tags with proper Azure format
                JSONObject tags = new JSONObject();
                // Add required contextual tags with proper Azure format
                tags.put("ai.device.id", getDeviceId());
                tags.put("ai.device.type", "Mobile");
                tags.put("ai.device.os", "Android");
                tags.put("ai.device.osVersion", Build.VERSION.RELEASE);
                tags.put("ai.device.model", Build.MODEL);
                tags.put("ai.session.id", UUID.randomUUID().toString());
                tags.put("ai.operation.id", UUID.randomUUID().toString());

                // Add custom properties with proper prefix
                for (Map.Entry<String, String> entry : properties.entrySet()) {
                    if (!entry.getKey().startsWith("ai.")) {
                        tags.put(entry.getKey(), entry.getValue());
                    }
                }
                telemetry.put("tags", tags);

                // Set up data with correct format
                JSONObject data = new JSONObject();
                data.put("baseType", type + "Data");  // "EventData" or "ExceptionData"

                // Create base data with correct format
                JSONObject baseData = new JSONObject();
                baseData.put("ver", 2);
                baseData.put("name", name);

                // Add metrics if available
                if (metrics != null) {
                    JSONObject metricsObj = new JSONObject();
                    for (Map.Entry<String, Double> entry : metrics.entrySet()) {
                        metricsObj.put(entry.getKey(), entry.getValue());
                    }
                    baseData.put("measurements", metricsObj);
                }

                // Format properties correctly
                JSONObject propertiesObj = new JSONObject();
                for (Map.Entry<String, String> entry : properties.entrySet()) {
                    if (!entry.getKey().startsWith("ai.")) {
                        propertiesObj.put(entry.getKey(), entry.getValue());
                    }
                }
                baseData.put("properties", propertiesObj);

                // Add type-specific fields
                if ("Exception".equals(type)) {
                    // Format exception data according to AI schema
                    JSONArray exceptions = new JSONArray();
                    JSONObject exception = new JSONObject();
                    exception.put("typeName", name);
                    exception.put("message", properties.getOrDefault("exceptionMessage", "Unknown error"));
                    exception.put("hasFullStack", true);
                    exception.put("stack", properties.getOrDefault("stackTrace", ""));
                    exceptions.put(exception);
                    baseData.put("exceptions", exceptions);
                    baseData.put("severityLevel", 3);  // Error level
                }

                data.put("baseData", baseData);
                telemetry.put("data", data);
                
                // Prepare JSON array payload
                JSONArray telemetryArray = new JSONArray();
                telemetryArray.put(telemetry);
                String payload = telemetryArray.toString();
                Log.i(TAG, "payload: " + payload);
                // Send telemetry
                String endpoint = ingestionEndpoint;
                if (endpoint.endsWith("/")) {
                    endpoint = endpoint.substring(0, endpoint.length() - 1);
                }
                URL url = new URL(endpoint + "/v2.1/track");
                Log.i(TAG, "POST URL: " + url);

                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
               conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("User-Agent", "OrderBuddyApp/1.0");
                conn.setRequestProperty("Connection", "keep-alive");
                conn.setRequestProperty("Content-Length", String.valueOf(payload.length()));
                conn.setDoOutput(true);
                conn.setConnectTimeout(10000); // 10 seconds timeout
                
                   try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.getBytes(StandardCharsets.UTF_8));
                }
                int responseCode = conn.getResponseCode();
                // Always read and close the InputStream to avoid resource leaks
                try (java.io.InputStream is = (responseCode >= 200 && responseCode < 300)
                        ? conn.getInputStream()
                        : conn.getErrorStream()) {
                    if (is != null) {
                        while (is.read() != -1) {
                            // Read the stream fully and discard the content
                        }
                    }
                }
                if (responseCode >= 200 && responseCode < 300) {
                    Log.i(TAG, "Telemetry POST successful: HTTP " + responseCode);
                } else {
                    Log.e(TAG, "Failed to send telemetry: HTTP " + responseCode);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error sending telemetry", e);
            }
        }).start();
    }

    private String getDeviceId() {
    String deviceId = android.provider.Settings.Secure.getString(
        context.getContentResolver(), 
        android.provider.Settings.Secure.ANDROID_ID);
    
        // Fallback if device ID is not available
        if (deviceId == null || deviceId.isEmpty()) {
            // Use a stored UUID from SharedPreferences
            android.content.SharedPreferences prefs = 
                context.getSharedPreferences("AzureMonitor", Context.MODE_PRIVATE);
            deviceId = prefs.getString("device_id", null);
            
            if (deviceId == null) {
                deviceId = UUID.randomUUID().toString();
                prefs.edit().putString("device_id", deviceId).apply();
            }
        }
        
        return deviceId;
    }
    
    public void flush() {
        // No-op in this implementation as we send immediately
    }
}