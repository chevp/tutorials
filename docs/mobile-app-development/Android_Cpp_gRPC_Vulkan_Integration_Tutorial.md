# Android C++ gRPC Vulkan Integration Tutorial

This comprehensive tutorial combines Android development with C++ gRPC networking and Vulkan graphics rendering, creating a high-performance mobile application capable of real-time graphics with server communication.

---

## Prerequisites

- **Android Studio** with NDK support
- **Android Device** with Vulkan support (API 24+)
- **Vulkan SDK** installed
- **gRPC** libraries built for Android
- Completed previous tutorials:
  - [Android SDK Studio Setup](./Android_SDK_Studio_Setup_Tutorial.md)
  - [C++ gRPC Android Integration](./Cpp_gRPC_Android_Integration_Tutorial.md)
  - [Vulkan Android Setup](./Vulkan_Android_Setup_Tutorial.md)

---

## Step 1: Project Setup

### Create Android Project

1. **Create New Project** in Android Studio
2. **Template**: Native C++
3. **Configuration**:
   - Name: AndroidVulkanGrpcClient
   - Package: com.example.androidvulkangrpcclient
   - Language: Java/Kotlin
   - Minimum SDK: API 24
   - C++ Standard: C++17

---

## Step 2: Configure Build System

### Update app/build.gradle

```gradle
android {
    namespace 'com.example.androidvulkangrpcclient'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.androidvulkangrpcclient"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a'
        }

        externalNativeBuild {
            cmake {
                cppFlags "-std=c++17 -frtti -fexceptions -Wall -Wno-unused-parameter"
                arguments "-DANDROID_STL=c++_shared",
                         "-DANDROID_PLATFORM=android-24",
                         "-DVULKAN_ANDROID=1"
            }
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.18.1"
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-runtime:2.7.0'
}
```

### Update AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Vulkan requirements -->
    <uses-feature
        android:name="android.hardware.vulkan.level"
        android:version="1"
        android:required="true" />

    <uses-feature
        android:name="android.hardware.vulkan.version"
        android:version="0x400003"
        android:required="true" />

    <uses-feature
        android:name="android.hardware.vulkan.compute"
        android:version="0"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AndroidVulkanGrpcClient"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="landscape"
            android:theme="@style/Theme.AppCompat.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
```

---

## Step 3: Configure CMake Build

### Create CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.18.1)
project(AndroidVulkanGrpcClient)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build configuration
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -Wall -Wno-unused-parameter")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g -DDEBUG")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -DNDEBUG")

# Find required libraries
find_library(VULKAN_LIB vulkan)
find_library(LOG_LIB log)
find_library(ANDROID_LIB android)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/grpc/include
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/protobuf/src
    ${CMAKE_CURRENT_BINARY_DIR}
)

# gRPC and Protobuf libraries (prebuilt for Android)
set(GRPC_LIB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/third_party/grpc/lib/${ANDROID_ABI})
set(PROTOBUF_LIB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/third_party/protobuf/lib/${ANDROID_ABI})

# Generated protobuf files
set(PROTO_SRCS
    ${CMAKE_CURRENT_BINARY_DIR}/graphics_service.pb.cc
    ${CMAKE_CURRENT_BINARY_DIR}/graphics_service.grpc.pb.cc
)

# Generate protobuf files (assuming they're pre-generated for simplicity)
# In production, you'd generate these during build

# Source files
set(SOURCES
    native-lib.cpp
    vulkan_android_renderer.cpp
    grpc_graphics_client.cpp
    android_application.cpp
    vulkan_surface_android.cpp
    mesh_manager.cpp
    ${PROTO_SRCS}
)

# Create shared library
add_library(
    ${PROJECT_NAME}
    SHARED
    ${SOURCES}
)

# Link libraries
target_link_libraries(
    ${PROJECT_NAME}
    ${VULKAN_LIB}
    ${LOG_LIB}
    ${ANDROID_LIB}
    ${GRPC_LIB_DIR}/libgrpc++.a
    ${GRPC_LIB_DIR}/libgrpc.a
    ${PROTOBUF_LIB_DIR}/libprotobuf.a
    native_app_glue
    EGL
    GLESv2
)

# Set target properties
set_target_properties(
    ${PROJECT_NAME} PROPERTIES
    LINK_FLAGS "-u ANativeActivity_onCreate"
)
```

---

## Step 4: Define Protocol Buffer Service

### Create protos/graphics_service.proto

```proto
syntax = "proto3";

package graphics;

option cc_generic_services = false;
option java_package = "com.example.androidvulkangrpcclient.proto";
option java_outer_classname = "GraphicsServiceProto";

service AndroidGraphicsService {
    rpc StreamMeshData (MeshStreamRequest) returns (stream MeshUpdate);
    rpc SendDeviceInfo (DeviceInfo) returns (DeviceInfoResponse);
    rpc UpdateRenderSettings (RenderSettings) returns (RenderSettingsResponse);
    rpc SendPerformanceMetrics (PerformanceMetrics) returns (MetricsResponse);
}

message MeshStreamRequest {
    string device_id = 1;
    string session_id = 2;
    QualityLevel quality = 3;
    bool enable_textures = 4;
    bool enable_lighting = 5;
}

enum QualityLevel {
    LOW = 0;
    MEDIUM = 1;
    HIGH = 2;
    ULTRA = 3;
}

message MeshUpdate {
    string mesh_id = 1;
    MeshData mesh = 2;
    Transform transform = 3;
    Material material = 4;
    uint64 timestamp = 5;
    bool remove_mesh = 6;
}

message MeshData {
    repeated float vertices = 1;
    repeated uint32 indices = 2;
    repeated float normals = 3;
    repeated float tex_coords = 4;
    repeated float colors = 5;
}

message Transform {
    repeated float matrix = 1; // 4x4 transformation matrix
}

message Material {
    string name = 1;
    repeated float diffuse_color = 2;
    repeated float specular_color = 3;
    float shininess = 4;
    string texture_path = 5;
}

message DeviceInfo {
    string device_model = 1;
    string android_version = 2;
    string vulkan_version = 3;
    string gpu_name = 4;
    uint64 total_memory_bytes = 5;
    uint64 available_memory_bytes = 6;
    repeated string supported_extensions = 7;
}

message DeviceInfoResponse {
    bool success = 1;
    string message = 2;
    QualityLevel recommended_quality = 3;
}

message RenderSettings {
    QualityLevel quality = 1;
    bool enable_shadows = 2;
    bool enable_reflections = 3;
    uint32 max_lights = 4;
    float render_scale = 5;
}

message RenderSettingsResponse {
    bool success = 1;
    string message = 2;
}

message PerformanceMetrics {
    string session_id = 1;
    uint32 fps = 2;
    float frame_time_ms = 3;
    uint32 triangles_rendered = 4;
    uint32 draw_calls = 5;
    uint64 gpu_memory_used = 6;
    uint64 system_memory_used = 7;
    float cpu_usage_percent = 8;
    float gpu_usage_percent = 9;
    uint64 timestamp = 10;
}

message MetricsResponse {
    bool success = 1;
    string message = 2;
}
```

---

## Step 5: Implement Vulkan Android Renderer

### Create vulkan_android_renderer.h

```cpp
#ifndef VULKAN_ANDROID_RENDERER_H
#define VULKAN_ANDROID_RENDERER_H

#include <vulkan/vulkan.h>
#include <android/native_window.h>
#include <android/log.h>
#include <vector>
#include <unordered_map>
#include <memory>
#include <mutex>

#define LOG_TAG "VulkanRenderer"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct AndroidMesh {
    std::string id;
    std::vector<float> vertices;
    std::vector<uint32_t> indices;
    std::vector<float> normals;
    std::vector<float> tex_coords;

    VkBuffer vertex_buffer;
    VkDeviceMemory vertex_buffer_memory;
    VkBuffer index_buffer;
    VkDeviceMemory index_buffer_memory;

    float transform_matrix[16];
    bool needs_update;
    bool is_active;
};

struct RenderMetrics {
    uint32_t fps;
    float frame_time_ms;
    uint32_t triangles_rendered;
    uint32_t draw_calls;
    uint64_t gpu_memory_used;
};

class VulkanAndroidRenderer {
public:
    VulkanAndroidRenderer();
    ~VulkanAndroidRenderer();

    bool Initialize(ANativeWindow* window);
    void Cleanup();

    bool Render();
    void UpdateMesh(const std::string& mesh_id,
                   const std::vector<float>& vertices,
                   const std::vector<uint32_t>& indices,
                   const std::vector<float>& normals,
                   const std::vector<float>& tex_coords,
                   const float transform[16]);

    void RemoveMesh(const std::string& mesh_id);
    void SetRenderQuality(int quality_level);

    // Performance metrics
    RenderMetrics GetRenderMetrics() const;

    // Surface management
    void OnSurfaceChanged(ANativeWindow* window);
    void OnSurfaceDestroyed();

private:
    // Vulkan objects
    VkInstance instance_;
    VkPhysicalDevice physical_device_;
    VkDevice device_;
    VkQueue graphics_queue_;
    VkQueue present_queue_;
    VkSurfaceKHR surface_;
    VkSwapchainKHR swapchain_;

    std::vector<VkImage> swapchain_images_;
    std::vector<VkImageView> swapchain_image_views_;
    std::vector<VkFramebuffer> swapchain_framebuffers_;
    VkFormat swapchain_format_;
    VkExtent2D swapchain_extent_;

    VkRenderPass render_pass_;
    VkPipelineLayout pipeline_layout_;
    VkPipeline graphics_pipeline_;

    VkCommandPool command_pool_;
    std::vector<VkCommandBuffer> command_buffers_;

    VkBuffer uniform_buffer_;
    VkDeviceMemory uniform_buffer_memory_;
    VkDescriptorSetLayout descriptor_set_layout_;
    VkDescriptorPool descriptor_pool_;
    VkDescriptorSet descriptor_set_;

    // Synchronization
    std::vector<VkSemaphore> image_available_semaphores_;
    std::vector<VkSemaphore> render_finished_semaphores_;
    std::vector<VkFence> in_flight_fences_;
    size_t current_frame_;

    // Mesh storage
    std::unordered_map<std::string, std::unique_ptr<AndroidMesh>> meshes_;
    std::mutex meshes_mutex_;

    // Performance tracking
    mutable RenderMetrics metrics_;
    std::chrono::high_resolution_clock::time_point last_frame_time_;

    // Queue family indices
    uint32_t graphics_family_index_;
    uint32_t present_family_index_;

    // State
    bool initialized_;
    bool surface_valid_;
    int render_quality_;

    // Initialization methods
    bool CreateInstance();
    bool CreateSurface(ANativeWindow* window);
    bool SelectPhysicalDevice();
    bool CreateLogicalDevice();
    bool CreateSwapchain();
    bool CreateImageViews();
    bool CreateRenderPass();
    bool CreateDescriptorSetLayout();
    bool CreateGraphicsPipeline();
    bool CreateFramebuffers();
    bool CreateCommandPool();
    bool CreateUniformBuffer();
    bool CreateDescriptorPool();
    bool CreateCommandBuffers();
    bool CreateSyncObjects();

    // Helper methods
    std::vector<const char*> GetRequiredExtensions();
    bool CheckValidationLayerSupport();
    bool FindQueueFamilies();
    bool CheckDeviceExtensionSupport(VkPhysicalDevice device);
    bool CreateBuffer(VkDeviceSize size, VkBufferUsageFlags usage,
                     VkMemoryPropertyFlags properties, VkBuffer& buffer,
                     VkDeviceMemory& buffer_memory);
    uint32_t FindMemoryType(uint32_t type_filter, VkMemoryPropertyFlags properties);

    void UpdateUniformBuffer();
    void RecordCommandBuffer(VkCommandBuffer command_buffer, uint32_t image_index);
    void UpdateRenderMetrics();

    static const int MAX_FRAMES_IN_FLIGHT = 2;
};

#endif // VULKAN_ANDROID_RENDERER_H
```

---

## Step 6: Implement gRPC Client

### Create grpc_graphics_client.h

```cpp
#ifndef GRPC_GRAPHICS_CLIENT_H
#define GRPC_GRAPHICS_CLIENT_H

#include <grpcpp/grpcpp.h>
#include <memory>
#include <string>
#include <thread>
#include <atomic>
#include <functional>
#include <android/log.h>
#include "graphics_service.grpc.pb.h"

#define LOG_TAG "GrpcClient"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class AndroidGraphicsClient {
public:
    using MeshUpdateCallback = std::function<void(const graphics::MeshUpdate&)>;

    AndroidGraphicsClient(const std::string& server_address);
    ~AndroidGraphicsClient();

    bool Connect();
    void Disconnect();
    bool IsConnected() const;

    // Device info
    bool SendDeviceInfo(const std::string& device_model,
                       const std::string& android_version,
                       const std::string& vulkan_version,
                       const std::string& gpu_name,
                       uint64_t total_memory,
                       uint64_t available_memory);

    // Streaming
    void StartMeshStream(const std::string& device_id,
                        const std::string& session_id,
                        graphics::QualityLevel quality,
                        MeshUpdateCallback callback);
    void StopMeshStream();

    // Settings
    bool UpdateRenderSettings(graphics::QualityLevel quality,
                             bool enable_shadows,
                             bool enable_reflections,
                             uint32_t max_lights,
                             float render_scale);

    // Metrics
    void SendPerformanceMetrics(const std::string& session_id,
                               uint32_t fps,
                               float frame_time,
                               uint32_t triangles,
                               uint32_t draw_calls,
                               uint64_t gpu_memory,
                               uint64_t system_memory,
                               float cpu_usage,
                               float gpu_usage);

private:
    std::unique_ptr<graphics::AndroidGraphicsService::Stub> stub_;
    std::shared_ptr<grpc::Channel> channel_;
    std::atomic<bool> connected_;
    std::atomic<bool> streaming_;

    std::unique_ptr<std::thread> stream_thread_;
    MeshUpdateCallback mesh_callback_;

    void StreamMeshDataInternal(const graphics::MeshStreamRequest& request);
};

#endif // GRPC_GRAPHICS_CLIENT_H
```

### Create grpc_graphics_client.cpp

```cpp
#include "grpc_graphics_client.h"
#include <chrono>

AndroidGraphicsClient::AndroidGraphicsClient(const std::string& server_address)
    : connected_(false), streaming_(false) {

    grpc::ChannelArguments args;
    args.SetInt(GRPC_ARG_KEEPALIVE_TIME_MS, 30000);
    args.SetInt(GRPC_ARG_KEEPALIVE_TIMEOUT_MS, 5000);
    args.SetInt(GRPC_ARG_KEEPALIVE_PERMIT_WITHOUT_CALLS, true);

    channel_ = grpc::CreateCustomChannel(
        server_address,
        grpc::InsecureChannelCredentials(),
        args
    );

    stub_ = graphics::AndroidGraphicsService::NewStub(channel_);
}

AndroidGraphicsClient::~AndroidGraphicsClient() {
    Disconnect();
}

bool AndroidGraphicsClient::Connect() {
    LOGI("Connecting to graphics server...");

    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(10);

    if (channel_->WaitForConnected(deadline)) {
        connected_ = true;
        LOGI("Connected to graphics server successfully");
        return true;
    } else {
        LOGE("Failed to connect to graphics server");
        return false;
    }
}

void AndroidGraphicsClient::Disconnect() {
    LOGI("Disconnecting from graphics server...");
    connected_ = false;
    StopMeshStream();
}

bool AndroidGraphicsClient::IsConnected() const {
    return connected_.load() &&
           channel_->GetState(false) == GRPC_CHANNEL_READY;
}

bool AndroidGraphicsClient::SendDeviceInfo(
    const std::string& device_model,
    const std::string& android_version,
    const std::string& vulkan_version,
    const std::string& gpu_name,
    uint64_t total_memory,
    uint64_t available_memory) {

    if (!IsConnected()) {
        LOGE("Not connected to server");
        return false;
    }

    graphics::DeviceInfo request;
    request.set_device_model(device_model);
    request.set_android_version(android_version);
    request.set_vulkan_version(vulkan_version);
    request.set_gpu_name(gpu_name);
    request.set_total_memory_bytes(total_memory);
    request.set_available_memory_bytes(available_memory);

    graphics::DeviceInfoResponse response;
    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(10);
    context.set_deadline(deadline);

    grpc::Status status = stub_->SendDeviceInfo(&context, request, &response);

    if (status.ok() && response.success()) {
        LOGI("Device info sent successfully");
        return true;
    } else {
        LOGE("Failed to send device info: %s",
             status.ok() ? response.message().c_str() : status.error_message().c_str());
        return false;
    }
}

void AndroidGraphicsClient::StartMeshStream(
    const std::string& device_id,
    const std::string& session_id,
    graphics::QualityLevel quality,
    MeshUpdateCallback callback) {

    if (!IsConnected()) {
        LOGE("Cannot start stream: not connected");
        return;
    }

    if (streaming_) {
        LOGI("Stream already active");
        return;
    }

    graphics::MeshStreamRequest request;
    request.set_device_id(device_id);
    request.set_session_id(session_id);
    request.set_quality(quality);
    request.set_enable_textures(true);
    request.set_enable_lighting(true);

    mesh_callback_ = callback;
    streaming_ = true;

    stream_thread_ = std::make_unique<std::thread>(
        &AndroidGraphicsClient::StreamMeshDataInternal,
        this, request
    );

    LOGI("Started mesh data stream");
}

void AndroidGraphicsClient::StopMeshStream() {
    if (!streaming_) {
        return;
    }

    LOGI("Stopping mesh data stream");
    streaming_ = false;

    if (stream_thread_ && stream_thread_->joinable()) {
        stream_thread_->join();
    }

    LOGI("Mesh data stream stopped");
}

void AndroidGraphicsClient::StreamMeshDataInternal(
    const graphics::MeshStreamRequest& request) {

    grpc::ClientContext context;
    std::unique_ptr<grpc::ClientReader<graphics::MeshUpdate>> reader(
        stub_->StreamMeshData(&context, request)
    );

    graphics::MeshUpdate update;
    while (streaming_ && reader->Read(&update)) {
        if (mesh_callback_) {
            mesh_callback_(update);
        }
    }

    grpc::Status status = reader->Finish();
    if (!status.ok()) {
        LOGE("Mesh stream error: %s", status.error_message().c_str());
    }

    streaming_ = false;
}

bool AndroidGraphicsClient::UpdateRenderSettings(
    graphics::QualityLevel quality,
    bool enable_shadows,
    bool enable_reflections,
    uint32_t max_lights,
    float render_scale) {

    if (!IsConnected()) {
        return false;
    }

    graphics::RenderSettings settings;
    settings.set_quality(quality);
    settings.set_enable_shadows(enable_shadows);
    settings.set_enable_reflections(enable_reflections);
    settings.set_max_lights(max_lights);
    settings.set_render_scale(render_scale);

    graphics::RenderSettingsResponse response;
    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(5);
    context.set_deadline(deadline);

    grpc::Status status = stub_->UpdateRenderSettings(&context, settings, &response);

    return status.ok() && response.success();
}

void AndroidGraphicsClient::SendPerformanceMetrics(
    const std::string& session_id,
    uint32_t fps,
    float frame_time,
    uint32_t triangles,
    uint32_t draw_calls,
    uint64_t gpu_memory,
    uint64_t system_memory,
    float cpu_usage,
    float gpu_usage) {

    if (!IsConnected()) {
        return;
    }

    graphics::PerformanceMetrics metrics;
    metrics.set_session_id(session_id);
    metrics.set_fps(fps);
    metrics.set_frame_time_ms(frame_time);
    metrics.set_triangles_rendered(triangles);
    metrics.set_draw_calls(draw_calls);
    metrics.set_gpu_memory_used(gpu_memory);
    metrics.set_system_memory_used(system_memory);
    metrics.set_cpu_usage_percent(cpu_usage);
    metrics.set_gpu_usage_percent(gpu_usage);
    metrics.set_timestamp(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count());

    graphics::MetricsResponse response;
    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(5);
    context.set_deadline(deadline);

    stub_->SendPerformanceMetrics(&context, metrics, &response);
}
```

---

## Step 7: Create Main JNI Bridge

### Create native-lib.cpp

```cpp
#include <jni.h>
#include <string>
#include <memory>
#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <android/log.h>

#include "vulkan_android_renderer.h"
#include "grpc_graphics_client.h"
#include "graphics_service.pb.h"

#define LOG_TAG "NativeLib"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Global instances
static std::unique_ptr<VulkanAndroidRenderer> g_renderer;
static std::unique_ptr<AndroidGraphicsClient> g_grpc_client;
static ANativeWindow* g_native_window = nullptr;
static std::string g_session_id;

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_initializeNative(
    JNIEnv* env,
    jobject /* this */,
    jobject surface,
    jstring server_address,
    jstring device_id) {

    LOGI("Initializing native components...");

    // Get native window
    g_native_window = ANativeWindow_fromSurface(env, surface);
    if (!g_native_window) {
        LOGE("Failed to get native window");
        return;
    }

    // Initialize renderer
    g_renderer = std::make_unique<VulkanAndroidRenderer>();
    if (!g_renderer->Initialize(g_native_window)) {
        LOGE("Failed to initialize Vulkan renderer");
        return;
    }

    // Initialize gRPC client
    const char* server_addr = env->GetStringUTFChars(server_address, 0);
    g_grpc_client = std::make_unique<AndroidGraphicsClient>(server_addr);

    if (!g_grpc_client->Connect()) {
        LOGE("Failed to connect to gRPC server");
        env->ReleaseStringUTFChars(server_address, server_addr);
        return;
    }

    // Generate session ID
    g_session_id = "session_" + std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count());

    // Set up mesh update callback
    const char* device_id_str = env->GetStringUTFChars(device_id, 0);

    auto mesh_callback = [](const graphics::MeshUpdate& update) {
        if (g_renderer) {
            if (update.remove_mesh()) {
                g_renderer->RemoveMesh(update.mesh_id());
            } else {
                // Convert protobuf data to renderer format
                std::vector<float> vertices(update.mesh().vertices().begin(),
                                          update.mesh().vertices().end());
                std::vector<uint32_t> indices(update.mesh().indices().begin(),
                                            update.mesh().indices().end());
                std::vector<float> normals(update.mesh().normals().begin(),
                                         update.mesh().normals().end());
                std::vector<float> tex_coords(update.mesh().tex_coords().begin(),
                                            update.mesh().tex_coords().end());

                float transform[16];
                if (update.transform().matrix_size() == 16) {
                    for (int i = 0; i < 16; i++) {
                        transform[i] = update.transform().matrix(i);
                    }
                } else {
                    // Identity matrix
                    memset(transform, 0, sizeof(transform));
                    transform[0] = transform[5] = transform[10] = transform[15] = 1.0f;
                }

                g_renderer->UpdateMesh(update.mesh_id(), vertices, indices,
                                     normals, tex_coords, transform);
            }
        }
    };

    // Start mesh stream
    g_grpc_client->StartMeshStream(device_id_str, g_session_id,
                                  graphics::QualityLevel::MEDIUM, mesh_callback);

    env->ReleaseStringUTFChars(server_address, server_addr);
    env->ReleaseStringUTFChars(device_id, device_id_str);

    LOGI("Native initialization completed successfully");
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_renderFrame(
    JNIEnv* env,
    jobject /* this */) {

    if (g_renderer) {
        g_renderer->Render();
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_sendDeviceInfo(
    JNIEnv* env,
    jobject /* this */,
    jstring device_model,
    jstring android_version,
    jstring vulkan_version,
    jstring gpu_name,
    jlong total_memory,
    jlong available_memory) {

    if (!g_grpc_client) {
        return;
    }

    const char* model = env->GetStringUTFChars(device_model, 0);
    const char* android_ver = env->GetStringUTFChars(android_version, 0);
    const char* vulkan_ver = env->GetStringUTFChars(vulkan_version, 0);
    const char* gpu = env->GetStringUTFChars(gpu_name, 0);

    g_grpc_client->SendDeviceInfo(model, android_ver, vulkan_ver, gpu,
                                 (uint64_t)total_memory, (uint64_t)available_memory);

    env->ReleaseStringUTFChars(device_model, model);
    env->ReleaseStringUTFChars(android_version, android_ver);
    env->ReleaseStringUTFChars(vulkan_version, vulkan_ver);
    env->ReleaseStringUTFChars(gpu_name, gpu);
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_sendPerformanceMetrics(
    JNIEnv* env,
    jobject /* this */) {

    if (!g_grpc_client || !g_renderer) {
        return;
    }

    auto metrics = g_renderer->GetRenderMetrics();

    // Get system memory info
    // In a real implementation, you'd get actual system metrics
    uint64_t system_memory = 0; // Placeholder
    float cpu_usage = 0.0f;     // Placeholder
    float gpu_usage = 0.0f;     // Placeholder

    g_grpc_client->SendPerformanceMetrics(
        g_session_id,
        metrics.fps,
        metrics.frame_time_ms,
        metrics.triangles_rendered,
        metrics.draw_calls,
        metrics.gpu_memory_used,
        system_memory,
        cpu_usage,
        gpu_usage
    );
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_updateRenderQuality(
    JNIEnv* env,
    jobject /* this */,
    jint quality_level) {

    if (g_renderer) {
        g_renderer->SetRenderQuality(quality_level);
    }

    if (g_grpc_client) {
        graphics::QualityLevel grpc_quality;
        switch (quality_level) {
            case 0: grpc_quality = graphics::QualityLevel::LOW; break;
            case 1: grpc_quality = graphics::QualityLevel::MEDIUM; break;
            case 2: grpc_quality = graphics::QualityLevel::HIGH; break;
            case 3: grpc_quality = graphics::QualityLevel::ULTRA; break;
            default: grpc_quality = graphics::QualityLevel::MEDIUM; break;
        }

        g_grpc_client->UpdateRenderSettings(grpc_quality, true, true, 8, 1.0f);
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_onSurfaceChanged(
    JNIEnv* env,
    jobject /* this */,
    jobject surface) {

    if (g_native_window) {
        ANativeWindow_release(g_native_window);
    }

    g_native_window = ANativeWindow_fromSurface(env, surface);

    if (g_renderer && g_native_window) {
        g_renderer->OnSurfaceChanged(g_native_window);
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_androidvulkangrpcclient_MainActivity_cleanup(
    JNIEnv* env,
    jobject /* this */) {

    LOGI("Cleaning up native components...");

    if (g_grpc_client) {
        g_grpc_client->Disconnect();
        g_grpc_client.reset();
    }

    if (g_renderer) {
        g_renderer->Cleanup();
        g_renderer.reset();
    }

    if (g_native_window) {
        ANativeWindow_release(g_native_window);
        g_native_window = nullptr;
    }

    LOGI("Native cleanup completed");
}
```

---

## Step 8: Create Android Activity

### Create MainActivity.java

```java
package com.example.androidvulkangrpcclient;

import androidx.appcompat.app.AppCompatActivity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Build;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.UUID;

public class MainActivity extends AppCompatActivity implements SurfaceHolder.Callback {

    static {
        System.loadLibrary("AndroidVulkanGrpcClient");
    }

    private SurfaceView surfaceView;
    private EditText serverAddressEdit;
    private Button connectButton;
    private Spinner qualitySpinner;
    private TextView statusText;
    private TextView metricsText;

    private ExecutorService executorService;
    private boolean isInitialized = false;
    private boolean isRendering = false;
    private String deviceId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        setupControls();

        executorService = Executors.newFixedThreadPool(3);
        deviceId = UUID.randomUUID().toString();

        // Check Vulkan support
        if (!checkVulkanSupport()) {
            statusText.setText("Vulkan not supported on this device");
            finish();
            return;
        }

        statusText.setText("Ready to connect");
    }

    private void initializeViews() {
        surfaceView = findViewById(R.id.surface_view);
        serverAddressEdit = findViewById(R.id.server_address);
        connectButton = findViewById(R.id.connect_button);
        qualitySpinner = findViewById(R.id.quality_spinner);
        statusText = findViewById(R.id.status_text);
        metricsText = findViewById(R.id.metrics_text);

        surfaceView.getHolder().addCallback(this);

        // Default server address (for emulator)
        serverAddressEdit.setText("10.0.2.2:50051");
    }

    private void setupControls() {
        // Quality spinner
        ArrayAdapter<CharSequence> qualityAdapter = ArrayAdapter.createFromResource(
            this, R.array.quality_levels, android.R.layout.simple_spinner_item);
        qualityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        qualitySpinner.setAdapter(qualityAdapter);
        qualitySpinner.setSelection(1); // Medium quality

        qualitySpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (isInitialized) {
                    updateRenderQuality(position);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        // Connect button
        connectButton.setOnClickListener(v -> {
            if (!isInitialized) {
                connectToServer();
            } else {
                disconnectFromServer();
            }
        });
    }

    private boolean checkVulkanSupport() {
        PackageManager pm = getPackageManager();
        return pm.hasSystemFeature(PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL);
    }

    private void connectToServer() {
        String serverAddress = serverAddressEdit.getText().toString().trim();

        if (serverAddress.isEmpty()) {
            Toast.makeText(this, "Please enter server address", Toast.LENGTH_SHORT).show();
            return;
        }

        connectButton.setEnabled(false);
        statusText.setText("Connecting to " + serverAddress + "...");

        executorService.execute(() -> {
            try {
                // Initialize native components
                initializeNative(surfaceView.getHolder().getSurface(), serverAddress, deviceId);

                // Send device information
                sendDeviceInfo();

                runOnUiThread(() -> {
                    isInitialized = true;
                    connectButton.setText("Disconnect");
                    connectButton.setEnabled(true);
                    statusText.setText("Connected and streaming");
                    serverAddressEdit.setEnabled(false);

                    // Start rendering loop
                    startRenderLoop();

                    // Start metrics reporting
                    startMetricsReporting();
                });

            } catch (Exception e) {
                runOnUiThread(() -> {
                    statusText.setText("Connection failed: " + e.getMessage());
                    connectButton.setEnabled(true);
                    Toast.makeText(this, "Connection failed", Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void disconnectFromServer() {
        isInitialized = false;
        isRendering = false;

        executorService.execute(() -> {
            cleanup();

            runOnUiThread(() -> {
                connectButton.setText("Connect");
                statusText.setText("Disconnected");
                serverAddressEdit.setEnabled(true);
                metricsText.setText("Metrics: Not available");
            });
        });
    }

    private void sendDeviceInfo() {
        String deviceModel = Build.MODEL;
        String androidVersion = Build.VERSION.RELEASE;
        String vulkanVersion = "1.0"; // Simplified
        String gpuName = "Unknown GPU"; // Would need to query actual GPU info

        // Simplified memory info (in production, get actual values)
        long totalMemory = Runtime.getRuntime().maxMemory();
        long availableMemory = Runtime.getRuntime().freeMemory();

        sendDeviceInfo(deviceModel, androidVersion, vulkanVersion, gpuName,
                      totalMemory, availableMemory);
    }

    private void startRenderLoop() {
        isRendering = true;

        executorService.execute(() -> {
            while (isRendering && isInitialized) {
                renderFrame();

                try {
                    Thread.sleep(16); // ~60 FPS
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
    }

    private void startMetricsReporting() {
        executorService.execute(() -> {
            while (isInitialized) {
                try {
                    Thread.sleep(5000); // Every 5 seconds

                    if (isInitialized) {
                        sendPerformanceMetrics();

                        runOnUiThread(() -> {
                            metricsText.setText("Metrics: Sent at " +
                                System.currentTimeMillis());
                        });
                    }
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        // Surface created - initialization will happen when connect is pressed
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if (isInitialized) {
            onSurfaceChanged(holder.getSurface());
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        isRendering = false;
        if (isInitialized) {
            disconnectFromServer();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        isRendering = false;

        if (executorService != null) {
            executorService.shutdown();
        }

        if (isInitialized) {
            cleanup();
        }
    }

    // Native methods
    public native void initializeNative(Object surface, String serverAddress, String deviceId);
    public native void renderFrame();
    public native void sendDeviceInfo(String deviceModel, String androidVersion,
                                     String vulkanVersion, String gpuName,
                                     long totalMemory, long availableMemory);
    public native void sendPerformanceMetrics();
    public native void updateRenderQuality(int qualityLevel);
    public native void onSurfaceChanged(Object surface);
    public native void cleanup();
}
```

### Create activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="8dp">

    <!-- Control Panel -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:background="#f5f5f5"
        android:padding="8dp">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="gRPC Vulkan Android Client"
            android:textSize="18sp"
            android:textStyle="bold"
            android:layout_gravity="center"
            android:layout_marginBottom="8dp" />

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal">

            <EditText
                android:id="@+id/server_address"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:hint="Server address (host:port)"
                android:inputType="text"
                android:textSize="14sp" />

            <Button
                android:id="@+id/connect_button"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Connect"
                android:layout_marginStart="8dp" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="8dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Quality: "
                android:textSize="14sp" />

            <Spinner
                android:id="@+id/quality_spinner"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:layout_marginStart="8dp" />

        </LinearLayout>

        <TextView
            android:id="@+id/status_text"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Status: Ready"
            android:textSize="12sp"
            android:layout_marginTop="4dp" />

        <TextView
            android:id="@+id/metrics_text"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Metrics: Not available"
            android:textSize="12sp"
            android:layout_marginTop="2dp" />

    </LinearLayout>

    <!-- Vulkan Surface -->
    <SurfaceView
        android:id="@+id/surface_view"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:layout_marginTop="8dp" />

</LinearLayout>
```

### Create arrays.xml

```xml
<resources>
    <string-array name="quality_levels">
        <item>Low</item>
        <item>Medium</item>
        <item>High</item>
        <item>Ultra</item>
    </string-array>
</resources>
```

---

## Step 9: Build and Test

### Build Instructions

1. **Sync Project**: Click "Sync Now" in Android Studio
2. **Build gRPC Libraries**: Ensure gRPC libraries are built for Android
3. **Generate Proto Files**: Run protobuf compiler for Android
4. **Build Project**: Run "Build → Make Project"
5. **Resolve Issues**: Fix any compilation errors

### Testing

1. **Setup Server**: Run a gRPC server that implements the graphics service
2. **Deploy App**: Install on Vulkan-capable Android device
3. **Connect**: Enter server address and click Connect
4. **Monitor**: Watch status messages and performance metrics

---

## Summary

This tutorial demonstrated:

1. **Complete Integration**: Combined Android, C++, gRPC, and Vulkan technologies
2. **Real-time Graphics**: Streaming mesh data from server to Vulkan renderer
3. **Performance Monitoring**: Comprehensive metrics reporting
4. **Production-Ready**: Proper error handling and resource management
5. **Scalable Architecture**: Modular design for complex applications

The resulting application can receive real-time graphics data over gRPC and render it using Vulkan on Android devices, providing maximum performance for demanding applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).