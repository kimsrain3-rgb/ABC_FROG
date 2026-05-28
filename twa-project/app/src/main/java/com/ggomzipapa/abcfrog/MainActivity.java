package com.ggomzipapa.abcfrog;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
public class MainActivity extends Activity {

    private WebView webView;
    private ReviewManager reviewManager;
    private ReviewInfo reviewInfo;
    private static final String GAME_URL = "https://kimsrain3-rgb.github.io/ABC_FROG/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#4CAF50"));
            getWindow().setNavigationBarColor(Color.parseColor("#4CAF50"));
        }

        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        try {
            webView = new WebView(this);
            setContentView(webView);
            setupWebView();
            webView.loadUrl(GAME_URL);
            prepareReview();
        } catch (Exception e) {
            showErrorScreen();
        }
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.setBackgroundColor(Color.parseColor("#4CAF50"));
    }

    private void prepareReview() {
        try {
            reviewManager = ReviewManagerFactory.create(this);
            reviewManager.requestReviewFlow().addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    reviewInfo = task.getResult();
                }
            });
        } catch (Exception e) {
            // Review API not available
        }
    }

    private void launchReview() {
        try {
            if (reviewManager != null && reviewInfo != null) {
                reviewManager.launchReviewFlow(this, reviewInfo);
            }
        } catch (Exception e) {
            // Silently fail
        }
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void requestReview() {
            runOnUiThread(() -> launchReview());
        }
    }

    private void showErrorScreen() {
        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(Color.parseColor("#4CAF50"));
        TextView tv = new TextView(this);
        tv.setText("ABC Frog requires an internet connection.\nPlease check your connection and try again.");
        tv.setTextColor(Color.WHITE);
        tv.setTextSize(18);
        tv.setPadding(48, 48, 48, 48);
        layout.addView(tv);
        setContentView(layout);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
