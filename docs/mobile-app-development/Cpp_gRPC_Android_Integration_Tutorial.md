# C++ gRPC Android Integration Tutorial

This tutorial demonstrates how to integrate C++ gRPC client functionality into an Android application using the Android NDK, enabling high-performance network communication with gRPC servers.

---

## Prerequisites

- **Android Studio** with NDK support installed
- **Android SDK** API level 21+
- **CMake** and **LLDB** (installed via SDK Manager)
- Basic knowledge of C++, JNI, and Android development
- Completed [Android SDK Studio Setup Tutorial](./Android_SDK_Studio_Setup_Tutorial.md)

---

## Step 1: Create Android Project with C++ Support

### Create New Project

1. Open Android Studio
2. Choose **Native C++** template
3. Configure project:
   - **Name**: gRPCAndroidClient
   - **Package**: com.example.grpcandroidclient
   - **Language**: Java or Kotlin
   - **Minimum SDK**: API 21
   - **C++ Standard**: C++17

---

## Step 2: Add gRPC Dependencies

### Update app/build.gradle

```gradle
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.example.grpcandroidclient"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"

        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
        }

        externalNativeBuild {
            cmake {
                cppFlags "-std=c++17 -frtti -fexceptions"
                arguments "-DANDROID_STL=c++_shared"
            }
        }
    }

    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.18.1"
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
```

---

## Step 3: Configure CMake Build System

### Create CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.18.1)
project("grpcandroidclient")

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(PkgConfig REQUIRED)

# gRPC and Protobuf paths
set(GRPC_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/third_party/grpc)
set(PROTOBUF_ROOT ${GRPC_ROOT}/third_party/protobuf)

# Include directories
include_directories(
    ${GRPC_ROOT}/include
    ${PROTOBUF_ROOT}/src
    ${CMAKE_CURRENT_BINARY_DIR}
)

# Add subdirectories for gRPC and Protobuf
add_subdirectory(${GRPC_ROOT} grpc EXCLUDE_FROM_ALL)
add_subdirectory(${PROTOBUF_ROOT}/cmake protobuf EXCLUDE_FROM_ALL)

# Generate protobuf and gRPC files
set(PROTO_FILES ${CMAKE_CURRENT_SOURCE_DIR}/protos/greet.proto)

# Custom command to generate protobuf files
add_custom_command(
    OUTPUT
        ${CMAKE_CURRENT_BINARY_DIR}/greet.pb.cc
        ${CMAKE_CURRENT_BINARY_DIR}/greet.pb.h
        ${CMAKE_CURRENT_BINARY_DIR}/greet.grpc.pb.cc
        ${CMAKE_CURRENT_BINARY_DIR}/greet.grpc.pb.h
    COMMAND
        $<TARGET_FILE:protobuf::protoc>
    ARGS
        --grpc_out=${CMAKE_CURRENT_BINARY_DIR}
        --cpp_out=${CMAKE_CURRENT_BINARY_DIR}
        -I${CMAKE_CURRENT_SOURCE_DIR}/protos
        --plugin=protoc-gen-grpc=$<TARGET_FILE:grpc_cpp_plugin>
        ${PROTO_FILES}
    DEPENDS
        ${PROTO_FILES}
        protobuf::protoc
        grpc_cpp_plugin
)

# Create native library
add_library(
    grpcandroidclient
    SHARED
    native-lib.cpp
    grpc_client.cpp
    ${CMAKE_CURRENT_BINARY_DIR}/greet.pb.cc
    ${CMAKE_CURRENT_BINARY_DIR}/greet.grpc.pb.cc
)

# Link libraries
target_link_libraries(
    grpcandroidclient
    grpc++
    grpc
    protobuf
    log
    android
)
```

---

## Step 4: Download and Build gRPC for Android

### Download gRPC Source

```bash
# Create third_party directory in app/src/main/cpp/
cd app/src/main/cpp/
mkdir -p third_party
cd third_party

# Clone gRPC with submodules
git clone --recurse-submodules -b v1.54.0 https://github.com/grpc/grpc
```

### Configure gRPC for Android Cross-compilation

Create `build_grpc_android.sh` script:

```bash
#!/bin/bash

# Android NDK path
export ANDROID_NDK=$ANDROID_NDK_HOME

# Target architectures
ABIS=("armeabi-v7a" "arm64-v8a" "x86" "x86_64")

for ABI in "${ABIS[@]}"; do
    echo "Building gRPC for $ABI"

    # Create build directory
    mkdir -p grpc/build_android_$ABI
    cd grpc/build_android_$ABI

    # Configure CMake for Android
    cmake .. \
        -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
        -DANDROID_ABI=$ABI \
        -DANDROID_NATIVE_API_LEVEL=21 \
        -DANDROID_STL=c++_shared \
        -DgRPC_BUILD_TESTS=OFF \
        -DgRPC_BUILD_CSHARP_EXT=OFF \
        -DgRPC_BUILD_GRPC_CSHARP_PLUGIN=OFF \
        -DgRPC_BUILD_GRPC_NODE_PLUGIN=OFF \
        -DgRPC_BUILD_GRPC_OBJECTIVE_C_PLUGIN=OFF \
        -DgRPC_BUILD_GRPC_PHP_PLUGIN=OFF \
        -DgRPC_BUILD_GRPC_PYTHON_PLUGIN=OFF \
        -DgRPC_BUILD_GRPC_RUBY_PLUGIN=OFF \
        -DCMAKE_BUILD_TYPE=Release

    # Build gRPC
    cmake --build . -j$(nproc)

    cd ../..
done
```

---

## Step 5: Define Protocol Buffer Service

### Create protos/greet.proto

```proto
syntax = "proto3";

package greet;

option cc_generic_services = false;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
  rpc SayHelloStream (HelloRequest) returns (stream HelloReply);
}

message HelloRequest {
  string name = 1;
  int32 age = 2;
}

message HelloReply {
  string message = 1;
  int64 timestamp = 2;
}
```

---

## Step 6: Implement C++ gRPC Client

### Create grpc_client.h

```cpp
#ifndef GRPC_CLIENT_H
#define GRPC_CLIENT_H

#include <string>
#include <memory>
#include <grpcpp/grpcpp.h>
#include "greet.grpc.pb.h"

class GrpcClient {
public:
    explicit GrpcClient(const std::string& server_address);
    ~GrpcClient();

    std::string SayHello(const std::string& name, int32_t age);
    void SayHelloStream(const std::string& name, int32_t age,
                       std::function<void(const std::string&)> callback);

    bool IsConnected() const;
    void Disconnect();

private:
    std::unique_ptr<greet::Greeter::Stub> stub_;
    std::shared_ptr<grpc::Channel> channel_;
    bool connected_;
};

#endif // GRPC_CLIENT_H
```

### Create grpc_client.cpp

```cpp
#include "grpc_client.h"
#include <android/log.h>
#include <chrono>

#define LOG_TAG "GrpcClient"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

GrpcClient::GrpcClient(const std::string& server_address) : connected_(false) {
    LOGI("Creating gRPC client for: %s", server_address.c_str());

    // Create channel with credentials
    grpc::ChannelArguments args;
    args.SetInt(GRPC_ARG_KEEPALIVE_TIME_MS, 30000);
    args.SetInt(GRPC_ARG_KEEPALIVE_TIMEOUT_MS, 5000);
    args.SetInt(GRPC_ARG_KEEPALIVE_PERMIT_WITHOUT_CALLS, true);

    channel_ = grpc::CreateCustomChannel(
        server_address,
        grpc::InsecureChannelCredentials(),
        args
    );

    stub_ = greet::Greeter::NewStub(channel_);

    // Test connection
    auto state = channel_->GetState(true);
    if (state == GRPC_CHANNEL_READY || state == GRPC_CHANNEL_IDLE) {
        connected_ = true;
        LOGI("gRPC client connected successfully");
    } else {
        LOGE("Failed to connect to gRPC server");
    }
}

GrpcClient::~GrpcClient() {
    Disconnect();
}

std::string GrpcClient::SayHello(const std::string& name, int32_t age) {
    if (!connected_) {
        return "Error: Not connected to server";
    }

    greet::HelloRequest request;
    request.set_name(name);
    request.set_age(age);

    greet::HelloReply reply;
    grpc::ClientContext context;

    // Set timeout
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(30);
    context.set_deadline(deadline);

    // Make the RPC call
    grpc::Status status = stub_->SayHello(&context, request, &reply);

    if (status.ok()) {
        LOGI("gRPC call successful: %s", reply.message().c_str());
        return reply.message();
    } else {
        std::string error_msg = "gRPC call failed: " + status.error_message();
        LOGE("%s", error_msg.c_str());
        return error_msg;
    }
}

void GrpcClient::SayHelloStream(const std::string& name, int32_t age,
                               std::function<void(const std::string&)> callback) {
    if (!connected_) {
        callback("Error: Not connected to server");
        return;
    }

    greet::HelloRequest request;
    request.set_name(name);
    request.set_age(age);

    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(60);
    context.set_deadline(deadline);

    std::unique_ptr<grpc::ClientReader<greet::HelloReply>> reader(
        stub_->SayHelloStream(&context, request));

    greet::HelloReply reply;
    while (reader->Read(&reply)) {
        callback(reply.message());
    }

    grpc::Status status = reader->Finish();
    if (!status.ok()) {
        std::string error_msg = "Stream failed: " + status.error_message();
        LOGE("%s", error_msg.c_str());
        callback(error_msg);
    }
}

bool GrpcClient::IsConnected() const {
    return connected_ && channel_->GetState(false) == GRPC_CHANNEL_READY;
}

void GrpcClient::Disconnect() {
    connected_ = false;
    LOGI("gRPC client disconnected");
}
```

---

## Step 7: Create JNI Bridge

### Update native-lib.cpp

```cpp
#include <jni.h>
#include <string>
#include <memory>
#include <android/log.h>
#include "grpc_client.h"

#define LOG_TAG "NativeLib"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

// Global client instance
static std::unique_ptr<GrpcClient> g_client;

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_grpcandroidclient_MainActivity_stringFromJNI(
        JNIEnv *env,
        jobject /* this */) {
    std::string hello = "Hello from C++ gRPC Client";
    return env->NewStringUTF(hello.c_str());
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_example_grpcandroidclient_MainActivity_connectToServer(
        JNIEnv *env,
        jobject /* this */,
        jstring server_address) {

    const char *address = env->GetStringUTFChars(server_address, 0);
    LOGI("Connecting to server: %s", address);

    try {
        g_client = std::make_unique<GrpcClient>(address);
        bool connected = g_client->IsConnected();

        env->ReleaseStringUTFChars(server_address, address);
        return connected ? JNI_TRUE : JNI_FALSE;
    } catch (const std::exception& e) {
        LOGI("Connection failed: %s", e.what());
        env->ReleaseStringUTFChars(server_address, address);
        return JNI_FALSE;
    }
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_grpcandroidclient_MainActivity_sayHello(
        JNIEnv *env,
        jobject /* this */,
        jstring name,
        jint age) {

    if (!g_client) {
        return env->NewStringUTF("Error: Client not initialized");
    }

    const char *name_str = env->GetStringUTFChars(name, 0);
    std::string result = g_client->SayHello(name_str, age);

    env->ReleaseStringUTFChars(name, name_str);
    return env->NewStringUTF(result.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_grpcandroidclient_MainActivity_disconnect(
        JNIEnv *env,
        jobject /* this */) {

    if (g_client) {
        g_client->Disconnect();
        g_client.reset();
    }
}
```

---

## Step 8: Update Android Activity

### Update MainActivity.java

```java
package com.example.grpcandroidclient;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {
    static {
        System.loadLibrary("grpcandroidclient");
    }

    private TextView resultText;
    private EditText serverAddressEdit;
    private EditText nameEdit;
    private EditText ageEdit;
    private Button connectButton;
    private Button sendButton;

    private ExecutorService executorService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        setupClickListeners();

        executorService = Executors.newFixedThreadPool(2);
    }

    private void initializeViews() {
        resultText = findViewById(R.id.result_text);
        serverAddressEdit = findViewById(R.id.server_address);
        nameEdit = findViewById(R.id.name_input);
        ageEdit = findViewById(R.id.age_input);
        connectButton = findViewById(R.id.connect_button);
        sendButton = findViewById(R.id.send_button);

        // Set default values
        serverAddressEdit.setText("10.0.2.2:50051"); // Default for Android emulator
        nameEdit.setText("Android User");
        ageEdit.setText("25");

        sendButton.setEnabled(false);
    }

    private void setupClickListeners() {
        connectButton.setOnClickListener(v -> connectToServer());
        sendButton.setOnClickListener(v -> sendMessage());
    }

    private void connectToServer() {
        String serverAddress = serverAddressEdit.getText().toString().trim();

        if (serverAddress.isEmpty()) {
            Toast.makeText(this, "Please enter server address", Toast.LENGTH_SHORT).show();
            return;
        }

        connectButton.setEnabled(false);
        resultText.setText("Connecting...");

        executorService.execute(() -> {
            boolean connected = connectToServer(serverAddress);

            runOnUiThread(() -> {
                if (connected) {
                    resultText.setText("Connected to " + serverAddress);
                    sendButton.setEnabled(true);
                    connectButton.setText("Connected");
                    Toast.makeText(this, "Connected successfully!", Toast.LENGTH_SHORT).show();
                } else {
                    resultText.setText("Failed to connect");
                    connectButton.setEnabled(true);
                    Toast.makeText(this, "Connection failed!", Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    private void sendMessage() {
        String name = nameEdit.getText().toString().trim();
        String ageStr = ageEdit.getText().toString().trim();

        if (name.isEmpty()) {
            Toast.makeText(this, "Please enter a name", Toast.LENGTH_SHORT).show();
            return;
        }

        int age;
        try {
            age = Integer.parseInt(ageStr);
        } catch (NumberFormatException e) {
            age = 0;
        }

        sendButton.setEnabled(false);
        resultText.setText("Sending request...");

        executorService.execute(() -> {
            String response = sayHello(name, age);

            runOnUiThread(() -> {
                resultText.setText("Response: " + response);
                sendButton.setEnabled(true);
            });
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executorService != null) {
            executorService.shutdown();
        }
        disconnect();
    }

    // Native methods
    public native String stringFromJNI();
    public native boolean connectToServer(String serverAddress);
    public native String sayHello(String name, int age);
    public native void disconnect();
}
```

---

## Step 9: Create Layout

### Update activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="gRPC Android Client"
        android:textSize="24sp"
        android:textStyle="bold"
        android:layout_gravity="center"
        android:layout_marginBottom="24dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Server Address:"
        android:textSize="16sp"
        android:layout_marginBottom="8dp" />

    <EditText
        android:id="@+id/server_address"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="localhost:50051"
        android:inputType="text"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/connect_button"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Connect"
        android:layout_marginBottom="24dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Name:"
        android:textSize="16sp"
        android:layout_marginBottom="8dp" />

    <EditText
        android:id="@+id/name_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter your name"
        android:inputType="text"
        android:layout_marginBottom="16dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Age:"
        android:textSize="16sp"
        android:layout_marginBottom="8dp" />

    <EditText
        android:id="@+id/age_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter your age"
        android:inputType="number"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/send_button"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Send gRPC Request"
        android:layout_marginBottom="24dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Result:"
        android:textSize="16sp"
        android:textStyle="bold"
        android:layout_marginBottom="8dp" />

    <ScrollView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1">

        <TextView
            android:id="@+id/result_text"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="No response yet..."
            android:textSize="14sp"
            android:padding="12dp"
            android:background="#f0f0f0"
            android:textIsSelectable="true" />

    </ScrollView>

</LinearLayout>
```

---

## Step 10: Build and Test

### Build the Project

1. **Sync Gradle**: Click "Sync Now" when prompted
2. **Build**: Go to **Build → Make Project**
3. **Resolve Issues**: Fix any build errors that appear

### Test the Application

1. **Run Server**: Start a gRPC server using the C++ gRPC tutorial
2. **Launch App**: Deploy to device/emulator
3. **Connect**: Enter server address and click "Connect"
4. **Send Request**: Fill in name/age and send gRPC request

---

## Troubleshooting

### Common Issues

**NDK Build Errors:**
```bash
# Verify NDK installation
echo $ANDROID_NDK_HOME

# Check CMake version
cmake --version
```

**gRPC Library Issues:**
- Ensure correct ABI matching between app and libraries
- Check that all gRPC dependencies are built for Android
- Verify protobuf version compatibility

**Connection Issues:**
- Use `10.0.2.2:50051` for Android emulator (maps to host `localhost`)
- Use actual IP address for physical devices
- Check firewall settings on server

---

## Summary

This tutorial covered:
1. Setting up Android project with C++ and gRPC support
2. Building gRPC libraries for Android
3. Creating Protocol Buffer definitions
4. Implementing C++ gRPC client with JNI bridge
5. Integrating with Android UI
6. Testing and troubleshooting

You now have a fully functional Android app that can communicate with gRPC servers using C++ for high-performance networking.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).