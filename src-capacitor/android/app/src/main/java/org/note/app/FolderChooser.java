package org.note.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FolderChooser")
public class FolderChooser extends Plugin {


 @PluginMethod()
 public void pickFolder(PluginCall call) {
  Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);

  // Launch folder picker using call to handle the result
  startActivityForResult(call, intent, "handleFolderPicked");
 }

 // Method to handle the result using ActivityResult instead of Intent
 @ActivityCallback
 private void handleFolderPicked(PluginCall call, ActivityResult result) {
  if (result.getResultCode() == android.app.Activity.RESULT_OK) {
   Intent data = result.getData();
   if (data != null) {
    Uri uri = data.getData();
    if (uri != null) {
     String filePath = convertUriToFilePath(uri);
     JSObject ret = new JSObject();
     ret.put("path", filePath);
     call.resolve(ret);
    } else {
     call.reject("No folder selected");
    }
   }
  } else {
   call.reject("Folder selection canceled");
  }
 }

 private String convertUriToFilePath(Uri uri) {
  // Get the document ID
  String docId = DocumentsContract.getTreeDocumentId(uri);

  // Split the ID at the colon
  String[] parts = docId.split(":");
  String type = parts[0]; // primary
  String relativePath = parts[1]; // Documents/org-notes

  // Resolve the "primary" to actual storage path
  if ("primary".equalsIgnoreCase(type)) {
   return "file://" + Environment.getExternalStorageDirectory() + "/" + relativePath;
  } else {
   // Handle other storage locations (SD cards, USB drives, etc.)
   return null; // or handle accordingly
  }
 }
}
