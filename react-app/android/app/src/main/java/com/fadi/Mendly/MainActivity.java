package com.fadi.Mendly;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.fadi.Mendly.audiomonitor.AudioMonitorPlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(AudioMonitorPlugin.class);
    // Allow HTTP (cleartext) API calls from the Capacitor WebView (mixed-content)
    WebSettings settings = this.getBridge().getWebView().getSettings();
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

    // Optional: allow debugging WebView from chrome://inspect
    android.webkit.WebView.setWebContentsDebuggingEnabled(true);
  }
}
