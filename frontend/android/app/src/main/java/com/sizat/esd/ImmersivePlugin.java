package com.sizat.esd;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ImmersiveMode")
public class ImmersivePlugin extends Plugin {

    @PluginMethod
    public void hide(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getActivity().getWindow().getInsetsController();
                if (controller != null) {
                    controller.hide(
                        WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()
                    );
                    controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    );
                }
            } else {
                int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                getActivity().getWindow().getDecorView().setSystemUiVisibility(flags);
            }
            call.resolve(new JSObject().put("hidden", true));
        });
    }

    @PluginMethod
    public void show(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getActivity().getWindow().getInsetsController();
                if (controller != null) {
                    controller.show(
                        WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()
                    );
                    controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_DEFAULT
                    );
                }
            } else {
                getActivity().getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_VISIBLE
                );
            }
            call.resolve(new JSObject().put("hidden", false));
        });
    }
}
