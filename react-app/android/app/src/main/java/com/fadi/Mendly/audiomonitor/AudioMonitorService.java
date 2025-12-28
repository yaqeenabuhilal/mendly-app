package com.fadi.Mendly.audiomonitor;

import android.app.*;
import android.content.Intent;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.IBinder;

import android.app.PendingIntent;
import android.content.Context;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.fadi.Mendly.MainActivity;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;

public class AudioMonitorService extends Service {

  private static final String CHANNEL_ID = "mendly_audio_monitor";
  private static final int NOTIF_ID = 9001;

  // Actions
  public static final String ACTION_STOP = "com.fadi.Mendly.audiomonitor.STOP";
  public static final String ACTION_EVENT = "com.fadi.Mendly.audiomonitor.EVENT";

  // Shared running flag for isRunning()
  private static final AtomicBoolean RUNNING_FLAG = new AtomicBoolean(false);
  public static boolean isRunningStatic() { return RUNNING_FLAG.get(); }

  private Thread worker;
  private final AtomicBoolean running = new AtomicBoolean(false);

  @Override
  public void onCreate() {
    super.onCreate();
    createChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null && ACTION_STOP.equals(intent.getAction())) {
      stopSelf();
      return START_NOT_STICKY;
    }

    startForeground(NOTIF_ID, buildNotification("Listening… Tap to open Mendly"));
    startWorker();
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    stopWorker();
    super.onDestroy();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void startWorker() {
    if (running.getAndSet(true)) return;
    RUNNING_FLAG.set(true);

    worker = new Thread(() -> {
      int sampleRate = 16000;
      int minBuf = AudioRecord.getMinBufferSize(
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT
      );

      AudioRecord recorder = new AudioRecord(
        MediaRecorder.AudioSource.MIC,
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT,
        minBuf
      );

      short[] buffer = new short[Math.max(512, minBuf / 2)];
      recorder.startRecording();

      // MVP threshold (NOT crying detection)
      final double LOUD_THRESHOLD_RMS = 6000;

      while (running.get()) {
        int read = recorder.read(buffer, 0, buffer.length);
        if (read > 0) {
          double rms = calcRms(buffer, read);

          if (rms > LOUD_THRESHOLD_RMS) {
            // Example: "SCREAM" event (placeholder)
            emitEvent("SCREAM", 0.6);

            // Update notification text briefly
            startForeground(NOTIF_ID, buildNotification("Detected loud sound (possible stress)"));
            try { Thread.sleep(1200); } catch (Exception ignored) {}
            startForeground(NOTIF_ID, buildNotification("Listening… Tap to open Mendly"));
          }
        }
      }

      recorder.stop();
      recorder.release();
    });

    worker.start();
  }

  private void stopWorker() {
    running.set(false);
    RUNNING_FLAG.set(false);
    if (worker != null) {
      try { worker.join(1000); } catch (Exception ignored) {}
      worker = null;
    }
  }

  private void emitEvent(String type, double confidence) {
    Intent i = new Intent(ACTION_EVENT);
    i.setPackage(getPackageName());
    i.putExtra("type", type);
    i.putExtra("confidence", confidence);
    i.putExtra("ts", Instant.now().toString());
    sendBroadcast(i);
  }

  private double calcRms(short[] data, int len) {
    double sum = 0;
    for (int i = 0; i < len; i++) {
      double v = data[i];
      sum += v * v;
    }
    return Math.sqrt(sum / len);
  }

  private Notification buildNotification(String text) {
  Intent openIntent = new Intent(this, MainActivity.class);
  openIntent.setAction(Intent.ACTION_MAIN);
  openIntent.addCategory(Intent.CATEGORY_LAUNCHER);
  openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);

  int flags = PendingIntent.FLAG_UPDATE_CURRENT;
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    flags |= PendingIntent.FLAG_IMMUTABLE;
  }

  PendingIntent pi = PendingIntent.getActivity(this, 0, openIntent, flags);

  return new NotificationCompat.Builder(this, CHANNEL_ID)
    .setContentTitle("Mendly Audio Monitor")
    .setContentText(text)
    .setSmallIcon(android.R.drawable.ic_btn_speak_now)
    .setOngoing(true)
    .setContentIntent(pi)          // ✅ tap opens app
    .setAutoCancel(false)
    .build();
}


  private void createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Mendly Audio Monitor",
        NotificationManager.IMPORTANCE_LOW
      );
      NotificationManager nm = getSystemService(NotificationManager.class);
      nm.createNotificationChannel(channel);
    }
  }
}
