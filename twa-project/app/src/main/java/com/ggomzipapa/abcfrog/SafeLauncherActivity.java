package com.ggomzipapa.abcfrog;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import java.util.List;

/**
 * Safe launcher that checks for Custom Tabs support before launching TWA.
 * Falls back to WebView if Chrome/Custom Tabs not available.
 */
public class SafeLauncherActivity extends Activity {

    private static final String TAG = "SafeLauncher";
    private static final String URL = "https://kimsrain3-rgb.github.io/ABC_FROG/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (isCustomTabsSupported()) {
                Log.d(TAG, "Custom Tabs supported, launching TWA");
                launchTWA();
            } else {
                Log.d(TAG, "Custom Tabs NOT supported, using WebView fallback");
                launchWebViewFallback();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error launching TWA, falling back to WebView", e);
            launchWebViewFallback();
        }
    }

    private boolean isCustomTabsSupported() {
        try {
            Intent serviceIntent = new Intent("android.support.customtabs.action.CustomTabsService");
            serviceIntent.setPackage("com.android.chrome");
            PackageManager pm = getPackageManager();
            List<ResolveInfo> resolveInfos = pm.queryIntentServices(serviceIntent, 0);

            if (resolveInfos != null && !resolveInfos.isEmpty()) {
                return true;
            }

            // Check other browsers that support Custom Tabs
            serviceIntent.setPackage(null);
            resolveInfos = pm.queryIntentServices(serviceIntent, 0);
            return resolveInfos != null && !resolveInfos.isEmpty();
        } catch (Exception e) {
            Log.e(TAG, "Error checking Custom Tabs support", e);
            return false;
        }
    }

    private void launchTWA() {
        try {
            Intent intent = new Intent(this,
                com.google.androidbrowserhelper.trusted.LauncherActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        } catch (Exception e) {
            Log.e(TAG, "TWA launch failed, falling back", e);
            launchWebViewFallback();
        }
    }

    private void launchWebViewFallback() {
        try {
            Intent intent = new Intent(this, WebViewFallbackActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        } catch (Exception e) {
            Log.e(TAG, "WebView fallback also failed", e);
            finish();
        }
    }
}
