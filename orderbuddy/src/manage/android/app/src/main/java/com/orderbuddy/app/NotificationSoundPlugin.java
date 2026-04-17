package com.orderbuddy.app;

import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotificationSound")
public class NotificationSoundPlugin extends Plugin {

    private Ringtone currentRingtone;

    @PluginMethod
    public void playNotificationSound(PluginCall call) {
        try {
            // Stop any currently playing sound
            if (currentRingtone != null && currentRingtone.isPlaying()) {
                currentRingtone.stop();
            }

            // Always use the default notification sound
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            // Create and play the ringtone
            currentRingtone = RingtoneManager.getRingtone(getContext(), soundUri);
            
            // Set audio attributes for notification sounds
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                AudioAttributes attributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                currentRingtone.setAudioAttributes(attributes);
            }
            
            // Play the sound and log the result
            currentRingtone.play();
            android.util.Log.i("NotificationSound", "Successfully played notification sound");

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Notification sound played successfully");
            Log.d("NotificationSound", "Sound played successfully");

            call.resolve(ret);
        } catch (Exception e) {
            String errorMsg = "Failed to play notification sound: " + e.getMessage();
            android.util.Log.e("NotificationSound", errorMsg, e);
            
            // Additional logging for debugging
            Log.e("NotificationSound", "Error details:", e);
            Log.e("NotificationSound", "Device info: " + android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL);
            Log.e("NotificationSound", "Android version: " + android.os.Build.VERSION.SDK_INT);
            
            call.reject(errorMsg, e);
        }
    }
    
    @PluginMethod
    public void stopSound(PluginCall call) {
        if (currentRingtone != null && currentRingtone.isPlaying()) {
            currentRingtone.stop();
            android.util.Log.i("NotificationSound", "Sound stopped successfully");
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Sound stopped successfully");
            call.resolve(ret);
        } else {
            android.util.Log.w("NotificationSound", "Attempted to stop sound but no sound was playing");
            call.reject("No sound is currently playing");
        }
    }
    
 
}
