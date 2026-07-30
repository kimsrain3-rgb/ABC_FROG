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
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

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

        // 안드로이드 13+ 의 새 뒤로가기 방식 등록 (아래 "물리 뒤로가기 처리" 주석 참고)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            try {
                registerBackCallback();
            } catch (Exception e) {
                // 등록 실패해도 앱은 계속 동작 (구방식 onKeyDown 이 남아 있음)
            }
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

    // === 물리 뒤로가기 처리 ===
    // 안드로이드 13부터 '예측형 뒤로가기'가 생겼고, 이 앱처럼 targetSdk 35 이상이면 기본으로 켜진다.
    // 켜져 있으면 시스템이 뒤로가기를 먼저 가로채 아래 onKeyDown() 을 아예 부르지 않는다
    // → 게임/퍼즐 중에도 앱이 그냥 홈으로 밀려났다(2026-07-30 실기기 2대에서 동일 확인).
    // 그래서 새 방식(OnBackInvokedCallback)에도 같은 처리를 등록한다. 두 방식이 하는 일은 완전히 동일:
    //   웹에서 뒤로 갈 데가 있으면 웹에 맡기고(script.js 가 popstate 로 받아 화면만 닫음),
    //   갈 데가 없으면(=시작 화면) 다른 앱들처럼 한 번에 종료.
    // ※ '뒤로 갈 데'의 유무는 웹 쪽 syncBackGuard() 가 화면에 맞춰 관리한다.
    private Object backCallback;   // OnBackInvokedCallback (API 33+). 구버전에서 클래스 로딩이 안 되게 Object 로 보관

    private void handleBack() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            finish();
        }
    }

    private void registerBackCallback() {
        OnBackInvokedCallback cb = new OnBackInvokedCallback() {
            @Override
            public void onBackInvoked() {
                handleBack();
            }
        };
        backCallback = cb;
        getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT, cb);
    }

    // 안드로이드 12 이하(예측형 뒤로가기 없음)에서 쓰이는 기존 방식 — 그대로 유지
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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && backCallback != null) {
            try {
                getOnBackInvokedDispatcher()
                        .unregisterOnBackInvokedCallback((OnBackInvokedCallback) backCallback);
            } catch (Exception e) {
                // 이미 해제됐거나 지원 안 함 — 무시
            }
            backCallback = null;
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
