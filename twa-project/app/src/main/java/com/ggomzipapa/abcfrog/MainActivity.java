package com.ggomzipapa.abcfrog;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
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
        // 폰 '글자 크기' 설정을 웹 글자에 곱하지 않게 고정 (2026-08-12)
        // 크롬은 안 곱하는데 WebView 는 곱한다 → 글자 크게 쓰는 폰에서만 UI 가 커져 잘렸다
        // (2026-07-10 공룡 이름 잘림의 근본 원인. 웹 쪽 fitWord() 로 이미 방어했지만 여기서 원인을 없앤다)
        settings.setTextZoom(100);

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
                // ⚠️ 이 함수는 그림·소리 파일 하나만 못 받아도 불린다.
                //    isForMainFrame() 검사가 없으면 그림 한 장 실패에 게임 전체가 에러화면으로 바뀐다.
                //    → '게임 페이지 자체'를 못 열었을 때만 안내화면을 띄운다. (API 21+, minSdk 24 라 안전)
                try {
                    if (request != null && request.isForMainFrame()) {
                        showOfflineScreen();
                    }
                } catch (Exception e) {
                    // 판단 실패 시 아무것도 하지 않는다 — 지금처럼 두는 게 더 나빠지지 않는 쪽
                }
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

    // === 오프라인 안내화면 (2026-08-12) ===
    // 전엔 onReceivedError 가 비어 있어서 인터넷이 끊기면 WebView 기본 에러 페이지
    // ("웹페이지를 사용할 수 없음" + 영문 주소)가 그대로 노출됐다. 아이가 볼 화면이 아니다.
    // 개구리 + 두 줄 안내 + '다시 시도' 버튼으로 바꾼다. 글자를 못 읽는 아이도 버튼은 누를 수 있다.
    private boolean offlineShown = false;

    private void showOfflineScreen() {
        try {
            if (offlineShown) return;          // 이미 떠 있으면 다시 그리지 않는다
            offlineShown = true;

            FrameLayout layout = new FrameLayout(this);
            layout.setBackgroundColor(Color.parseColor("#4CAF50"));

            LinearLayout box = new LinearLayout(this);
            box.setOrientation(LinearLayout.VERTICAL);
            box.setGravity(Gravity.CENTER);
            box.setPadding(48, 48, 48, 48);

            TextView frog = new TextView(this);
            frog.setText("🐸");
            frog.setTextSize(72);
            frog.setGravity(Gravity.CENTER);

            TextView tv = new TextView(this);
            tv.setText("Oops! No internet.\n인터넷 연결을 확인해 주세요.");
            tv.setTextColor(Color.WHITE);
            tv.setTextSize(20);
            tv.setGravity(Gravity.CENTER);
            tv.setPadding(0, 32, 0, 40);

            Button retry = new Button(this);
            retry.setText("Try again  🔄");
            retry.setTextSize(18);
            retry.setOnClickListener(v -> retryLoad());

            box.addView(frog);
            box.addView(tv);
            box.addView(retry);
            layout.addView(box, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT));
            setContentView(layout);
        } catch (Exception e) {
            // 안내화면조차 못 그리면 그냥 둔다 (여기서 죽으면 앱 크래시 = 심사 거부)
        }
    }

    // '다시 시도' — 안내화면을 걷어내고 웹뷰를 화면에 다시 붙인 뒤 재로딩
    private void retryLoad() {
        try {
            if (webView == null) return;
            // setContentView 로 화면을 바꿀 때 웹뷰가 부모에서 떨어져 나갔을 수 있고,
            // 아직 붙어 있는 상태로 다시 addView 하면 IllegalStateException 이 난다 → 먼저 떼어낸다
            if (webView.getParent() instanceof ViewGroup) {
                ((ViewGroup) webView.getParent()).removeView(webView);
            }
            offlineShown = false;
            setContentView(webView);
            webView.loadUrl(GAME_URL);
        } catch (Exception e) {
            offlineShown = false;
        }
    }

    // WebView 자체를 못 만든 경우(onCreate 실패)용 — 이때는 재시도할 웹뷰가 없어 버튼도 의미가 없다.
    // 위 오프라인 안내와 상황이 달라 일부러 따로 둔다.
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

    // === 최신 반영 (2026-08-12) ===
    // [문제] 게임 주소를 읽는 loadUrl 이 onCreate 에만 있어서, 앱이 백그라운드에 살아 있는 한
    //   홈에서 다시 들어와도 페이지를 새로 읽지 않는다 → 서버에 새 버전이 올라가도 계속 옛 화면.
    //   2026-08-10 '개구리 인사가 나올 때/안 나올 때'가 갈린 것도,
    //   2026-08-12 '파닉스 버튼이 잠긴 채로 보인다'도 전부 같은 원인이었다.
    // [해결] 돌아왔을 때 ①오래 나가 있었고 ②지금 시작화면이면 그때만 새로 읽는다.
    //   조건을 두는 이유: 아이가 놀던 중에 잠깐 나갔다 오면 새로고침이 게임을 처음으로 되돌려버린다.
    //   그래서 '놀던 중'에는 절대 건드리지 않는다 — 판단은 웹의 inPlayScreen() 에 맡긴다.
    private long pausedAt = 0L;
    private static final long STALE_MS = 30 * 60 * 1000L;   // 30분 이상 나가 있었으면 낡은 것으로 본다

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            maybeRefresh();
        }
    }

    private void maybeRefresh() {
        try {
            if (pausedAt == 0L) return;                    // 앱을 막 켠 것 — onCreate 가 이미 최신을 받았다
            long away = System.currentTimeMillis() - pausedAt;
            pausedAt = 0L;
            if (away < STALE_MS) return;                   // 잠깐 나갔다 온 것 — 건드리지 않는다

            // 놀던 중이면 새로고침하지 않는다. 웹에 직접 물어본다.
            // 답을 못 얻거나 함수가 없으면 'true(노는 중)'로 봐서 안전한 쪽(그대로 두기)을 택한다.
            webView.evaluateJavascript(
                "(function(){try{return (typeof inPlayScreen==='function')?inPlayScreen():true;}"
              + "catch(e){return true;}})()",
                value -> {
                    try {
                        if ("false".equals(value) && webView != null) {
                            webView.reload();              // 시작화면에 있을 때만 여기 도달
                        }
                    } catch (Exception e) {
                        // 새로고침 실패해도 게임은 그대로 — 더 나빠지지 않는다
                    }
                });
        } catch (Exception e) {
            // 판단 실패 시 아무것도 하지 않는다
        }
    }

    @Override
    protected void onPause() {
        pausedAt = System.currentTimeMillis();             // 나간 시각 기록
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
