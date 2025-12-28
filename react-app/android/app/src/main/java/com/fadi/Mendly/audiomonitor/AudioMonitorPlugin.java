package com.fadi.Mendly.audiomonitor;

import android.Manifest;
import android.content.Intent;

import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
  name = "AudioMonitor",
  permissions = {
    @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
  }
)
public class AudioMonitorPlugin extends Plugin {

  private static boolean running = false;

  @PluginMethod
  public void start(PluginCall call) {
    // Request runtime mic permission if missing
    if (getPermissionState("microphone") != PermissionState.GRANTED) {
      requestPermissionForAlias("microphone", call, "onMicPermsResult");
      return;
    }
    startService(call);
  }

  @PermissionCallback
  private void onMicPermsResult(PluginCall call) {
    if (getPermissionState("microphone") == PermissionState.GRANTED) {
      startService(call);
    } else {
      call.reject("Microphone permission not granted");
    }
  }

  private void startService(PluginCall call) {
    Intent i = new Intent(getContext(), AudioMonitorService.class);
    getContext().startForegroundService(i);
    running = true;
    call.resolve();
  }

  @PluginMethod
  public void stop(PluginCall call) {
    Intent i = new Intent(getContext(), AudioMonitorService.class);
    getContext().stopService(i);
    running = false;
    call.resolve();
  }

  @PluginMethod
  public void isRunning(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("running", running);
    call.resolve(ret);
  }
}
