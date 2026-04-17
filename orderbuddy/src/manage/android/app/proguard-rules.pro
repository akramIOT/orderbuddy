# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
# Azure Monitor SDK rules
-keep class com.azure.** { *; }
-keep class com.microsoft.applicationinsights.** { *; }
-keep class com.microsoft.azure.** { *; }

# Keep important Azure Monitor classes
-keep class com.azure.android.monitor.** { *; }
-keep class com.azure.android.core.** { *; }

# Don't warn about Azure SDK classes
-dontwarn com.azure.**
-dontwarn com.microsoft.azure.**
-dontwarn com.microsoft.applicationinsights.**

# Jackson rules (used by Azure SDK)
-keep class com.fasterxml.jackson.** { *; }
-dontwarn com.fasterxml.jackson.**

# Keep your custom Azure Monitor client
-keep class com.orderbuddy.app.AzureMonitorClient { *; }

# General Android rules
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Exceptions

# Required for crash reporting to work properly
-keep public class * extends java.lang.Exception

# Keep the BuildConfig
-keep class com.orderbuddy.app.BuildConfig { *; }