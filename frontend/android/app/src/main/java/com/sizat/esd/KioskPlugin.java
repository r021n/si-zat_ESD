package com.sizat.esd;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "KioskMode")
public class KioskPlugin extends Plugin {

    @PluginMethod
    public void startLockTask(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                Activity activity = getActivity();
                if (activity != null) {
                    activity.startLockTask();
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                } else {
                    call.reject("Activity is null");
                }
            } catch (Exception e) {
                call.reject("Failed to start LockTask: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopLockTask(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                Activity activity = getActivity();
                if (activity != null) {
                    activity.stopLockTask();
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                } else {
                    call.reject("Activity is null");
                }
            } catch (Exception e) {
                // stopLockTask may throw if not currently in lock task mode
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", e.getMessage());
                call.resolve(ret);
            }
        });
    }

    @PluginMethod
    public void isInLockTaskMode(PluginCall call) {
        try {
            ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
            boolean isLocked = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (am != null) {
                    isLocked = am.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                if (am != null) {
                    isLocked = am.isInLockTaskMode();
                }
            }
            JSObject ret = new JSObject();
            ret.put("isLocked", isLocked);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to check LockTask mode: " + e.getMessage());
        }
    }
}
