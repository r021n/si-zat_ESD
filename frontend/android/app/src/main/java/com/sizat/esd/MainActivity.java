package com.sizat.esd;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public MainActivity() {
        registerPlugin(ImmersivePlugin.class);
    }
}
