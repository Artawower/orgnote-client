package org.note.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;


public class MainActivity extends BridgeActivity {
 @Override
 public void onCreate(Bundle savedInstanceState) {
  registerPlugin(FolderChooser.class);
  registerPlugin(FileSystemPermission.class);
  super.onCreate(savedInstanceState);
 }
}
