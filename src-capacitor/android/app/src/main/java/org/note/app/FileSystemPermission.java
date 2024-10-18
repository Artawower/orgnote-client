package org.note.app;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FileSystemPermission")
public class FileSystemPermission extends Plugin {

 @PluginMethod()
 public void requestAccess(PluginCall call) {
  ActivityCompat.requestPermissions(this.getActivity(),
   new String[]{Manifest.permission.READ_EXTERNAL_STORAGE,
    Manifest.permission.MANAGE_EXTERNAL_STORAGE}, 1);

  JSObject ret = new JSObject();
  if (Environment.isExternalStorageManager()) {
   ret.put("hasAccess", true);
   call.resolve(ret);
   return;
  }

  this.openPermissionsSettings();

  ret.put("hasAccess", Environment.isExternalStorageManager());
  call.resolve(ret);
 }

 @PluginMethod()
 public void hasAccess(PluginCall call) {
  JSObject ret = new JSObject();
  ret.put("hasAccess", Environment.isExternalStorageManager());
  call.resolve(ret);
 }

 @PluginMethod()
 public void openAccess(PluginCall call) {
  this.openPermissionsSettings();
  JSObject ret = new JSObject();
  ret.put("hasAccess", Environment.isExternalStorageManager());
  call.resolve(ret);
 }

 public void openPermissionsSettings() {
  Intent intent = new Intent();
  intent.setAction(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
  Uri uri = Uri.fromParts("package", this.getActivity().getPackageName(), null);
  intent.setData(uri);
  this.getActivity().startActivity(intent);
 }
}
