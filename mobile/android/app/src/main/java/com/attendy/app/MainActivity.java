package com.attendy.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable JavaScript bridge for native features
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
            webView.getSettings().setDatabaseEnabled(true);
        }
    }
}
