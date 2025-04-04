package org.note.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

import java.io.*;

@CapacitorPlugin(name = "SafPlugin")
public class SafPlugin extends Plugin {

    private PluginCall pendingCall;
    private ActivityResultLauncher<Intent> directoryPickerLauncher;

    @Override
    public void load() {
        super.load();
        directoryPickerLauncher = getActivity().registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (pendingCall == null) return;
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri uri = result.getData().getData();
                    getActivity().getContentResolver().takePersistableUriPermission(uri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    JSObject res = new JSObject();
                    res.put("uri", uri.toString());
                    pendingCall.resolve(res);
                } else {
                    pendingCall.reject("Cancelled");
                }
                pendingCall = null;
            });
    }

    @PluginMethod
    public void writeFile(PluginCall call) {
        WrapPluginCall.wrapPluginCall(call, () -> {
            Uri dirUri = Uri.parse(call.getString("uri"));
            String fileName = call.getString("fileName");
            String data = call.getString("data");

            DocumentFile dir = DocumentFile.fromTreeUri(getContext(), dirUri);
            DocumentFile file = dir.findFile(fileName);
            if (file == null) file = dir.createFile("application/octet-stream", fileName);

            try (OutputStream os = getActivity().getContentResolver().openOutputStream(file.getUri())) {
                os.write(data.getBytes());
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void readFile(PluginCall call) {
        WrapPluginCall.wrapPluginCall(call, () -> {
            Uri fileUri = Uri.parse(call.getString("uri"));
            InputStream in = getActivity().getContentResolver().openInputStream(fileUri);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            int nRead;
            byte[] data = new byte[16384];
            while ((nRead = in.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            String result = buffer.toString("UTF-8");

            JSObject res = new JSObject();
            res.put("data", result);
            call.resolve(res);
        });
    }

    @PluginMethod
    public void delete(PluginCall call) {
        WrapPluginCall.wrapPluginCall(call, () -> {
            Uri uri = Uri.parse(call.getString("uri"));
            DocumentFile file = DocumentFile.fromSingleUri(getContext(), uri);
            if (file != null && file.delete()) {
                call.resolve();
            } else {
                call.reject("Failed to delete file or directory");
            }
        });
    }

    @PluginMethod
    public void mkdir(PluginCall call) {
        WrapPluginCall.wrapPluginCall(call, () -> {
            Uri pathUri = Uri.parse(call.getString("path"));
            DocumentFile parentDir = DocumentFile.fromTreeUri(getContext(), pathUri);
            if (parentDir == null || !parentDir.isDirectory()) {
                call.reject("Invalid path URI");
                return;
            }

            String folderName = pathUri.getLastPathSegment();
            DocumentFile newDir = parentDir.createDirectory(folderName);
            if (newDir != null && newDir.exists()) {
                JSObject res = new JSObject();
                res.put("uri", newDir.getUri().toString());
                call.resolve(res);
            } else {
                call.reject("Failed to create directory");
            }
        });
    }

    @PluginMethod
    public void openDirectoryPicker(PluginCall call) {
        pendingCall = call;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        directoryPickerLauncher.launch(intent);
    }

    @PluginMethod
    public void fileInfo(PluginCall call) {
        WrapPluginCall.wrapPluginCall(call, () -> {
            Uri uri = Uri.parse(call.getString("uri"));
            DocumentFile file = DocumentFile.fromSingleUri(getContext(), uri);

            if (file != null) {
                JSObject res = new JSObject();
                res.put("name", file.getName());
                res.put("uri", file.getUri().toString());
                res.put("type", file.isDirectory() ? "directory" : "file");
                res.put("size", file.length());
                res.put("mtime", file.lastModified());
                call.resolve(res);
            } else {
                call.reject("File not found");
            }
        });
    }
}
