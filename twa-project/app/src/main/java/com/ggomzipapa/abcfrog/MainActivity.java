package com.ggomzipapa.abcfrog;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
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
import android.webkit.WebResourceResponse;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
public class MainActivity extends Activity {

    private WebView webView;
    private ReviewManager reviewManager;
    private ReviewInfo reviewInfo;
    // 게임 주소 — 자체 도메인으로 이사 (2026-08-27, vc12 예정)
    // ⚠️ 빌드·제출 전에 https://abcfrog.kr/ 이 200 을 주는지 반드시 확인할 것.
    //    저장소에 CNAME 파일이 없으면 abcfrog.kr 은 404 다 → 앱은 오프라인 안내화면만 뜬다.
    private static final String GAME_URL = "https://abcfrog.kr/";

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

            // ═══ 앱에 담은 사본 먼저 쓰기 (B-3, 2026-08-27) ═══
            // 웹뷰가 파일을 하나 달라고 할 때마다 여기를 지나간다.
            //   앱에 있으면 → 앱 것을 준다 (인터넷이 없어도 열리고, 있어도 훨씬 빠르다)
            //   앱에 없으면 → null 을 돌려준다 = 지금까지처럼 인터넷에서 받는다
            // 어디서 걸려 넘어져도 null 로 빠져나가므로 "지금보다 나빠지는" 경우는 없다.
            //
            // ⚠ 이 함수는 화면 그리는 스레드가 아닌 곳에서 불린다. UI 를 건드리면 안 된다.
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return localCopyFor(request);
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.setBackgroundColor(Color.parseColor("#4CAF50"));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 앱에 담은 웹 파일 (B-3, 2026-08-27) — app/src/main/assets/web/ 아래
    //
    // [무엇을 담았나] 첫 화면 + 파리잡기에 필요한 것만 135개 4.3MB.
    //   담는 목록은 twa-project/bake-web-assets.sh 에 있고, 그 스크립트를 다시 돌리면 갱신된다.
    //   퍼즐(과일·동물·공룡)·파닉스·영상은 일부러 안 담았다 → 그것들은 인터넷이 있어야 한다.
    //
    // [규칙이 둘로 나뉜다 — 중요]
    //   ① 그림·소리 : 언제나 앱 것이 먼저다. 빠르고, 인터넷이 없어도 돈다.
    //        낡을 걱정은 캐시 번호가 막는다. 코드가 `bgm.mp3?v=20260827` 처럼 번호를 붙여 부르는데,
    //        웹에서 파일을 갈아끼우고 번호를 올리면 앱에 적힌 번호(web/BAKED.txt)와 안 맞는다.
    //        그러면 앱은 자기 사본을 버리고 인터넷 것을 받는다. → 캐시 번호 = 비상 스위치
    //        ⚠ 그래서 앱에 담은 그림·소리를 "같은 이름으로" 바꿀 땐 반드시 ?v= 를 올리거나
    //          파일명을 바꿔야 한다. 안 그러면 앱을 새로 낼 때까지 옛 파일이 쓰인다.
    //
    //   ② 코드 6개(index.html·script.js·style.css·error-tracker.js·frog-reactions.js·video-quality.js)
    //        : 인터넷이 되면 인터넷 것을 쓴다. 앱 것은 인터넷이 없을 때만 꺼내는 구명보트다.
    //        이유 = 이 프로젝트의 불변 규칙 "푸시하면 유저가 반드시 최신을 받는다"(CLAUDE.md 배포/캐시 규칙 1).
    //        코드까지 앱 것으로 고정하면, 급한 버그를 고쳐도 심사(3~7일) 전엔 아이들에게 못 간다.
    //        (2026-08-26 도메인 사고 때 몇 분 만에 되돌릴 수 있었던 것이 바로 이 성질 덕이다.)
    // ═══════════════════════════════════════════════════════════════════════
    private static final Set<String> CODE_FILES = new HashSet<>(Arrays.asList(
            "index.html", "script.js", "style.css",
            "error-tracker.js", "frog-reactions.js", "video-quality.js"));

    private static final Set<String> OUR_HOSTS = new HashSet<>(Arrays.asList(
            "abcfrog.kr", "www.abcfrog.kr", "kimsrain3-rgb.github.io"));

    private Map<String, String> bakedVer;      // 경로 → 앱에 담을 당시의 캐시 번호 (web/BAKED.txt)

    private synchronized Map<String, String> bakedVer() {
        if (bakedVer != null) return bakedVer;
        Map<String, String> m = new HashMap<>();
        BufferedReader r = null;
        try {
            r = new BufferedReader(new InputStreamReader(getAssets().open("web/BAKED.txt")));
            String line;
            while ((line = r.readLine()) != null) {
                int at = line.lastIndexOf(" v=");
                if (at > 0) m.put(line.substring(0, at).trim(), line.substring(at + 3).trim());
            }
        } catch (Exception e) {
            // 목록을 못 읽으면 빈 채로 둔다 → 번호가 붙은 요청은 전부 인터넷으로 (안전한 쪽)
        } finally {
            try { if (r != null) r.close(); } catch (Exception e) { }
        }
        bakedVer = m;
        return m;
    }

    // 인터넷이 실제로 되는가. 모르겠으면 '된다'로 본다 = 지금과 똑같은 동작.
    private boolean isOnline() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return true;
            Network n = cm.getActiveNetwork();
            if (n == null) return false;
            NetworkCapabilities c = cm.getNetworkCapabilities(n);
            if (c == null) return false;
            // VALIDATED 까지 봐야 '와이파이는 잡혔는데 인터넷은 안 되는' 경우를 거른다
            return c.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    && c.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
        } catch (Exception e) {
            return true;
        }
    }

    private static String mimeOf(String p) {
        String s = p.toLowerCase(Locale.US);
        if (s.endsWith(".html")) return "text/html";
        if (s.endsWith(".js"))   return "application/javascript";
        if (s.endsWith(".css"))  return "text/css";
        if (s.endsWith(".json")) return "application/json";
        if (s.endsWith(".svg"))  return "image/svg+xml";
        if (s.endsWith(".webp")) return "image/webp";
        if (s.endsWith(".png"))  return "image/png";
        if (s.endsWith(".jpg") || s.endsWith(".jpeg")) return "image/jpeg";
        if (s.endsWith(".mp3"))  return "audio/mpeg";
        if (s.endsWith(".mp4"))  return "video/mp4";
        if (s.endsWith(".webm")) return "video/webm";
        return "application/octet-stream";
    }

    private static boolean isText(String mime) {
        return mime.startsWith("text/") || mime.equals("application/javascript")
                || mime.equals("application/json") || mime.equals("image/svg+xml");
    }

    private WebResourceResponse localCopyFor(WebResourceRequest request) {
        try {
            if (request == null) return null;
            if (!"GET".equalsIgnoreCase(request.getMethod())) return null;

            Uri u = request.getUrl();
            if (u == null) return null;
            String host = u.getHost();
            if (host == null || !OUR_HOSTS.contains(host.toLowerCase(Locale.US))) return null;

            String path = u.getPath();
            if (path == null) return null;
            // 옛 주소(github.io)는 /ABC_FROG/ 아래에 있다 — 접두사를 떼어 새 주소와 같은 모양으로
            if (path.startsWith("/ABC_FROG/")) path = path.substring("/ABC_FROG".length());
            if (path.startsWith("/")) path = path.substring(1);
            if (path.isEmpty()) path = "index.html";
            if (path.contains("..")) return null;                 // 경로 장난 차단

            boolean isCode = CODE_FILES.contains(path);

            // ② 코드 = 인터넷이 되면 인터넷 것. (푸시 즉시 반영 보장)
            if (isCode && isOnline()) return null;

            // ① 그림·소리 = 캐시 번호가 붙어 있으면 앱에 담을 때의 번호와 같을 때만 앱 것.
            if (!isCode) {
                String v = null;
                try { v = u.getQueryParameter("v"); } catch (Exception e) { }
                if (v != null) {
                    String baked = bakedVer().get(path);
                    if (baked == null || !baked.equals(v)) return null;   // 웹에서 갈아끼웠다 → 인터넷 것
                }
            }

            InputStream in;
            try {
                in = getAssets().open("web/" + path);
            } catch (Exception e) {
                return null;                                      // 앱에 없다 → 인터넷 것
            }

            String mime = mimeOf(path);
            WebResourceResponse res = new WebResourceResponse(mime, isText(mime) ? "utf-8" : null, in);
            try {
                Map<String, String> h = new HashMap<>();
                // 앱 안에서 꺼내 주는 것이라 브라우저 캐시에 또 쌓을 이유가 없다
                h.put("Cache-Control", "no-store");
                res.setResponseHeaders(h);
            } catch (Exception e) { }
            return res;

        } catch (Exception e) {
            return null;                                          // 무슨 일이 있어도 인터넷으로 넘긴다
        }
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
