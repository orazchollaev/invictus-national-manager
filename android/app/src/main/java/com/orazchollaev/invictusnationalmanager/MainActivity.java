package com.orazchollaev.invictusnationalmanager;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // targetSdk 35+ always draws edge-to-edge, and Android's WebView only maps
    // display-cutout insets into CSS env() — the status/navigation bar insets
    // never reach it. Without this, --safe-area-inset-* (assets/style/variables.css)
    // falls back to 0 until something else happens to trigger a relayout, which
    // is what showed up as content jumping at the top/bottom edges. Measure the
    // real insets natively instead and mirror them onto <html> ourselves.
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    ViewCompat.setOnApplyWindowInsetsListener(
        getWindow().getDecorView(),
        (view, insets) -> {
          Insets bars =
              insets.getInsets(
                  WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
          applyInsets(bars);
          return insets;
        });
  }

  private void applyInsets(Insets bars) {
    WebView webView = getBridge() != null ? getBridge().getWebView() : null;
    if (webView == null) return;

    float density = getResources().getDisplayMetrics().density;
    String js =
        String.format(
            Locale.US,
            "document.documentElement.style.setProperty('--safe-area-inset-top','%.2fpx');"
                + "document.documentElement.style.setProperty('--safe-area-inset-bottom','%.2fpx');"
                + "document.documentElement.style.setProperty('--safe-area-inset-left','%.2fpx');"
                + "document.documentElement.style.setProperty('--safe-area-inset-right','%.2fpx');",
            bars.top / density,
            bars.bottom / density,
            bars.left / density,
            bars.right / density);

    webView.post(() -> webView.evaluateJavascript(js, null));
  }
}
