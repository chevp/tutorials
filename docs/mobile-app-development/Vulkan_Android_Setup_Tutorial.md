# Vulkan Android Setup Tutorial

This tutorial covers setting up Vulkan for Android development, enabling high-performance graphics programming with direct GPU access. Vulkan provides low-level control over the GPU, making it ideal for demanding graphics applications.

---

## Prerequisites

- **Android Studio** with NDK support
- **Android device** with Vulkan support (API level 24+, Android 7.0+)
- **Vulkan SDK** installed on development machine
- Basic knowledge of C++, Android NDK, and graphics programming
- Completed [Android SDK Studio Setup Tutorial](./Android_SDK_Studio_Setup_Tutorial.md)

---

## Step 1: Verify Vulkan Support

### Check Device Compatibility

Not all Android devices support Vulkan. Check compatibility:

```java
// In your Android activity
PackageManager pm = getPackageManager();
boolean vulkanSupported = pm.hasSystemFeature(PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL);

if (vulkanSupported) {
    FeatureInfo[] features = pm.getSystemAvailableFeatures();
    for (FeatureInfo feature : features) {
        if (PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL.equals(feature.name)) {
            int vulkanLevel = feature.version;
            Log.i("Vulkan", "Vulkan level: " + vulkanLevel);
        }
    }
}
```

### Install Vulkan SDK

Download and install the Vulkan SDK from [LunarG](https://vulkan.lunarg.com/):

```bash
# Linux
wget https://sdk.lunarg.com/sdk/download/latest/linux/vulkan-sdk.tar.gz
tar -xf vulkan-sdk.tar.gz

# Set environment variables
export VULKAN_SDK=/path/to/vulkan/sdk
export PATH=$VULKAN_SDK/bin:$PATH
export LD_LIBRARY_PATH=$VULKAN_SDK/lib:$LD_LIBRARY_PATH
export VK_LAYER_PATH=$VULKAN_SDK/etc/explicit_layer.d
```

---

## Step 2: Create Android Vulkan Project

### Create New Project

1. Open Android Studio
2. Choose **Native C++** template
3. Configure project:
   - **Name**: VulkanAndroidApp
   - **Package**: com.example.vulkanandroidapp
   - **Language**: Java or Kotlin
   - **Minimum SDK**: API 24 (Android 7.0)
   - **C++ Standard**: C++17

---

## Step 3: Configure Project for Vulkan

### Update app/build.gradle

```gradle
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.example.vulkanandroidapp"
        minSdk 24  // Minimum for Vulkan support
        targetSdk 34
        versionCode 1
        versionName "1.0"

        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a'
        }

        externalNativeBuild {
            cmake {
                cppFlags "-std=c++17 -frtti -fexceptions -Wall -Werror"
                arguments "-DANDROID_STL=c++_shared",
                         "-DANDROID_PLATFORM=android-24"
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
}
```

### Update AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Declare Vulkan requirement -->
    <uses-feature
        android:name="android.hardware.vulkan.level"
        android:version="1"
        android:required="true" />

    <uses-feature
        android:name="android.hardware.vulkan.version"
        android:version="0x400003"
        android:required="true" />

    <!-- Optional: Request specific Vulkan features -->
    <uses-feature
        android:name="android.hardware.vulkan.compute"
        android:version="0"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.VulkanAndroidApp">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
```

---

## Step 4: Configure CMake for Vulkan

### Update CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.18.1)
project("vulkanandroidapp")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Vulkan package
find_package(Vulkan REQUIRED)

# Android Vulkan wrapper library
find_library(VULKAN_LIB vulkan)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${Vulkan_INCLUDE_DIRS}
)

# Source files
set(SOURCES
    native-lib.cpp
    vulkan_wrapper.cpp
    vulkan_renderer.cpp
    android_vulkan_surface.cpp
)

# Create shared library
add_library(
    vulkanandroidapp
    SHARED
    ${SOURCES}
)

# Link libraries
target_link_libraries(
    vulkanandroidapp
    ${VULKAN_LIB}
    android
    native_app_glue
    log
    EGL
    GLESv2
)

# Add Android native app glue
set_target_properties(
    vulkanandroidapp PROPERTIES
    LINK_FLAGS "-u ANativeActivity_onCreate"
)
```

---

## Step 5: Create Vulkan Wrapper

### Create vulkan_wrapper.h

```cpp
#ifndef VULKAN_WRAPPER_H
#define VULKAN_WRAPPER_H

#include <vulkan/vulkan.h>
#include <android/log.h>
#include <vector>
#include <string>

#define LOG_TAG "VulkanWrapper"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class VulkanWrapper {
public:
    VulkanWrapper();
    ~VulkanWrapper();

    bool Initialize();
    void Cleanup();

    bool CreateInstance();
    bool CreateDevice();
    bool CreateSurface(ANativeWindow* window);
    bool CreateSwapchain();
    bool CreateRenderPass();
    bool CreatePipeline();

    void Render();

    // Getters
    VkInstance GetInstance() const { return instance_; }
    VkDevice GetDevice() const { return device_; }
    VkPhysicalDevice GetPhysicalDevice() const { return physical_device_; }

private:
    // Core Vulkan objects
    VkInstance instance_;
    VkPhysicalDevice physical_device_;
    VkDevice device_;
    VkQueue graphics_queue_;
    VkQueue present_queue_;

    // Surface and swapchain
    VkSurfaceKHR surface_;
    VkSwapchainKHR swapchain_;
    std::vector<VkImage> swapchain_images_;
    std::vector<VkImageView> swapchain_image_views_;
    VkFormat swapchain_image_format_;
    VkExtent2D swapchain_extent_;

    // Render pass and pipeline
    VkRenderPass render_pass_;
    VkPipelineLayout pipeline_layout_;
    VkPipeline graphics_pipeline_;

    // Command buffers
    VkCommandPool command_pool_;
    std::vector<VkCommandBuffer> command_buffers_;

    // Synchronization
    std::vector<VkSemaphore> image_available_semaphores_;
    std::vector<VkSemaphore> render_finished_semaphores_;
    std::vector<VkFence> in_flight_fences_;
    size_t current_frame_;

    // Queue families
    uint32_t graphics_family_index_;
    uint32_t present_family_index_;

    // Helper methods
    std::vector<const char*> GetRequiredExtensions();
    bool CheckValidationLayerSupport();
    bool IsDeviceSuitable(VkPhysicalDevice device);
    VkSurfaceFormatKHR ChooseSwapSurfaceFormat(const std::vector<VkSurfaceFormatKHR>& formats);
    VkPresentModeKHR ChooseSwapPresentMode(const std::vector<VkPresentModeKHR>& modes);
    VkExtent2D ChooseSwapExtent(const VkSurfaceCapabilitiesKHR& capabilities);

    static const int MAX_FRAMES_IN_FLIGHT = 2;
};

#endif // VULKAN_WRAPPER_H
```

### Create vulkan_wrapper.cpp

```cpp
#include "vulkan_wrapper.h"
#include <android_native_app_glue.h>
#include <set>
#include <algorithm>

// Validation layers for debugging
const std::vector<const char*> validation_layers = {
    "VK_LAYER_KHRONOS_validation"
};

// Device extensions required
const std::vector<const char*> device_extensions = {
    VK_KHR_SWAPCHAIN_EXTENSION_NAME
};

#ifdef NDEBUG
    const bool enable_validation_layers = false;
#else
    const bool enable_validation_layers = true;
#endif

VulkanWrapper::VulkanWrapper()
    : instance_(VK_NULL_HANDLE)
    , physical_device_(VK_NULL_HANDLE)
    , device_(VK_NULL_HANDLE)
    , surface_(VK_NULL_HANDLE)
    , swapchain_(VK_NULL_HANDLE)
    , render_pass_(VK_NULL_HANDLE)
    , pipeline_layout_(VK_NULL_HANDLE)
    , graphics_pipeline_(VK_NULL_HANDLE)
    , command_pool_(VK_NULL_HANDLE)
    , current_frame_(0)
    , graphics_family_index_(UINT32_MAX)
    , present_family_index_(UINT32_MAX) {
}

VulkanWrapper::~VulkanWrapper() {
    Cleanup();
}

bool VulkanWrapper::Initialize() {
    LOGI("Initializing Vulkan...");

    if (!CreateInstance()) {
        LOGE("Failed to create Vulkan instance");
        return false;
    }

    if (!CreateDevice()) {
        LOGE("Failed to create Vulkan device");
        return false;
    }

    LOGI("Vulkan initialized successfully");
    return true;
}

bool VulkanWrapper::CreateInstance() {
    LOGI("Creating Vulkan instance...");

    // Application info
    VkApplicationInfo app_info = {};
    app_info.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    app_info.pApplicationName = "Vulkan Android App";
    app_info.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    app_info.pEngineName = "No Engine";
    app_info.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    app_info.apiVersion = VK_API_VERSION_1_0;

    // Instance create info
    VkInstanceCreateInfo create_info = {};
    create_info.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    create_info.pApplicationInfo = &app_info;

    // Get required extensions
    auto extensions = GetRequiredExtensions();
    create_info.enabledExtensionCount = static_cast<uint32_t>(extensions.size());
    create_info.ppEnabledExtensionNames = extensions.data();

    // Enable validation layers if available
    if (enable_validation_layers && CheckValidationLayerSupport()) {
        create_info.enabledLayerCount = static_cast<uint32_t>(validation_layers.size());
        create_info.ppEnabledLayerNames = validation_layers.data();
        LOGI("Validation layers enabled");
    } else {
        create_info.enabledLayerCount = 0;
    }

    // Create instance
    VkResult result = vkCreateInstance(&create_info, nullptr, &instance_);
    if (result != VK_SUCCESS) {
        LOGE("Failed to create Vulkan instance: %d", result);
        return false;
    }

    LOGI("Vulkan instance created successfully");
    return true;
}

bool VulkanWrapper::CreateDevice() {
    LOGI("Creating Vulkan device...");

    // Find physical device
    uint32_t device_count = 0;
    vkEnumeratePhysicalDevices(instance_, &device_count, nullptr);

    if (device_count == 0) {
        LOGE("No Vulkan capable devices found");
        return false;
    }

    std::vector<VkPhysicalDevice> devices(device_count);
    vkEnumeratePhysicalDevices(instance_, &device_count, devices.data());

    // Select suitable device
    for (const auto& device : devices) {
        if (IsDeviceSuitable(device)) {
            physical_device_ = device;
            break;
        }
    }

    if (physical_device_ == VK_NULL_HANDLE) {
        LOGE("Failed to find suitable GPU");
        return false;
    }

    // Find queue families
    uint32_t queue_family_count = 0;
    vkGetPhysicalDeviceQueueFamilyProperties(physical_device_, &queue_family_count, nullptr);

    std::vector<VkQueueFamilyProperties> queue_families(queue_family_count);
    vkGetPhysicalDeviceQueueFamilyProperties(physical_device_, &queue_family_count, queue_families.data());

    for (uint32_t i = 0; i < queue_families.size(); i++) {
        if (queue_families[i].queueFlags & VK_QUEUE_GRAPHICS_BIT) {
            graphics_family_index_ = i;
            present_family_index_ = i; // Assume same queue for now
            break;
        }
    }

    if (graphics_family_index_ == UINT32_MAX) {
        LOGE("No suitable queue family found");
        return false;
    }

    // Create logical device
    std::vector<VkDeviceQueueCreateInfo> queue_create_infos;
    std::set<uint32_t> unique_queue_families = {graphics_family_index_, present_family_index_};

    float queue_priority = 1.0f;
    for (uint32_t queue_family : unique_queue_families) {
        VkDeviceQueueCreateInfo queue_create_info = {};
        queue_create_info.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queue_create_info.queueFamilyIndex = queue_family;
        queue_create_info.queueCount = 1;
        queue_create_info.pQueuePriorities = &queue_priority;
        queue_create_infos.push_back(queue_create_info);
    }

    VkPhysicalDeviceFeatures device_features = {};

    VkDeviceCreateInfo create_info = {};
    create_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    create_info.queueCreateInfoCount = static_cast<uint32_t>(queue_create_infos.size());
    create_info.pQueueCreateInfos = queue_create_infos.data();
    create_info.pEnabledFeatures = &device_features;
    create_info.enabledExtensionCount = static_cast<uint32_t>(device_extensions.size());
    create_info.ppEnabledExtensionNames = device_extensions.data();

    if (enable_validation_layers) {
        create_info.enabledLayerCount = static_cast<uint32_t>(validation_layers.size());
        create_info.ppEnabledLayerNames = validation_layers.data();
    } else {
        create_info.enabledLayerCount = 0;
    }

    VkResult result = vkCreateDevice(physical_device_, &create_info, nullptr, &device_);
    if (result != VK_SUCCESS) {
        LOGE("Failed to create logical device: %d", result);
        return false;
    }

    // Get device queues
    vkGetDeviceQueue(device_, graphics_family_index_, 0, &graphics_queue_);
    vkGetDeviceQueue(device_, present_family_index_, 0, &present_queue_);

    LOGI("Vulkan device created successfully");
    return true;
}

std::vector<const char*> VulkanWrapper::GetRequiredExtensions() {
    std::vector<const char*> extensions;

    // Required for Android
    extensions.push_back("VK_KHR_surface");
    extensions.push_back("VK_KHR_android_surface");

    return extensions;
}

bool VulkanWrapper::CheckValidationLayerSupport() {
    uint32_t layer_count;
    vkEnumerateInstanceLayerProperties(&layer_count, nullptr);

    std::vector<VkLayerProperties> available_layers(layer_count);
    vkEnumerateInstanceLayerProperties(&layer_count, available_layers.data());

    for (const char* layer_name : validation_layers) {
        bool layer_found = false;

        for (const auto& layer_properties : available_layers) {
            if (strcmp(layer_name, layer_properties.layerName) == 0) {
                layer_found = true;
                break;
            }
        }

        if (!layer_found) {
            return false;
        }
    }

    return true;
}

bool VulkanWrapper::IsDeviceSuitable(VkPhysicalDevice device) {
    VkPhysicalDeviceProperties device_properties;
    VkPhysicalDeviceFeatures device_features;
    vkGetPhysicalDeviceProperties(device, &device_properties);
    vkGetPhysicalDeviceFeatures(device, &device_features);

    LOGI("Checking device: %s", device_properties.deviceName);

    // Check device extensions
    uint32_t extension_count;
    vkEnumerateDeviceExtensionProperties(device, nullptr, &extension_count, nullptr);

    std::vector<VkExtensionProperties> available_extensions(extension_count);
    vkEnumerateDeviceExtensionProperties(device, nullptr, &extension_count, available_extensions.data());

    std::set<std::string> required_extensions(device_extensions.begin(), device_extensions.end());

    for (const auto& extension : available_extensions) {
        required_extensions.erase(extension.extensionName);
    }

    return required_extensions.empty();
}

void VulkanWrapper::Cleanup() {
    if (device_ != VK_NULL_HANDLE) {
        vkDeviceWaitIdle(device_);

        if (graphics_pipeline_ != VK_NULL_HANDLE) {
            vkDestroyPipeline(device_, graphics_pipeline_, nullptr);
        }
        if (pipeline_layout_ != VK_NULL_HANDLE) {
            vkDestroyPipelineLayout(device_, pipeline_layout_, nullptr);
        }
        if (render_pass_ != VK_NULL_HANDLE) {
            vkDestroyRenderPass(device_, render_pass_, nullptr);
        }

        for (auto image_view : swapchain_image_views_) {
            vkDestroyImageView(device_, image_view, nullptr);
        }

        if (swapchain_ != VK_NULL_HANDLE) {
            vkDestroySwapchainKHR(device_, swapchain_, nullptr);
        }

        vkDestroyDevice(device_, nullptr);
    }

    if (surface_ != VK_NULL_HANDLE && instance_ != VK_NULL_HANDLE) {
        vkDestroySurfaceKHR(instance_, surface_, nullptr);
    }

    if (instance_ != VK_NULL_HANDLE) {
        vkDestroyInstance(instance_, nullptr);
    }

    LOGI("Vulkan cleanup completed");
}
```

---

## Step 6: Create Android Native Activity

### Create native-lib.cpp

```cpp
#include <jni.h>
#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <android/log.h>
#include "vulkan_wrapper.h"

#define LOG_TAG "VulkanNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static VulkanWrapper* g_vulkan_wrapper = nullptr;
static ANativeWindow* g_native_window = nullptr;

extern "C" JNIEXPORT void JNICALL
Java_com_example_vulkanandroidapp_MainActivity_initVulkan(
        JNIEnv* env,
        jobject /* this */,
        jobject surface) {

    LOGI("Initializing Vulkan...");

    // Get native window from surface
    g_native_window = ANativeWindow_fromSurface(env, surface);
    if (!g_native_window) {
        LOGE("Failed to get native window from surface");
        return;
    }

    // Create Vulkan wrapper
    g_vulkan_wrapper = new VulkanWrapper();
    if (!g_vulkan_wrapper->Initialize()) {
        LOGE("Failed to initialize Vulkan");
        delete g_vulkan_wrapper;
        g_vulkan_wrapper = nullptr;
        return;
    }

    // Create surface and swapchain
    if (!g_vulkan_wrapper->CreateSurface(g_native_window)) {
        LOGE("Failed to create Vulkan surface");
        return;
    }

    if (!g_vulkan_wrapper->CreateSwapchain()) {
        LOGE("Failed to create swapchain");
        return;
    }

    if (!g_vulkan_wrapper->CreateRenderPass()) {
        LOGE("Failed to create render pass");
        return;
    }

    if (!g_vulkan_wrapper->CreatePipeline()) {
        LOGE("Failed to create graphics pipeline");
        return;
    }

    LOGI("Vulkan initialization completed successfully");
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_vulkanandroidapp_MainActivity_renderFrame(
        JNIEnv* env,
        jobject /* this */) {

    if (g_vulkan_wrapper) {
        g_vulkan_wrapper->Render();
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_vulkanandroidapp_MainActivity_cleanupVulkan(
        JNIEnv* env,
        jobject /* this */) {

    LOGI("Cleaning up Vulkan...");

    if (g_vulkan_wrapper) {
        delete g_vulkan_wrapper;
        g_vulkan_wrapper = nullptr;
    }

    if (g_native_window) {
        ANativeWindow_release(g_native_window);
        g_native_window = nullptr;
    }

    LOGI("Vulkan cleanup completed");
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_vulkanandroidapp_MainActivity_getVulkanInfo(
        JNIEnv* env,
        jobject /* this */) {

    std::string info = "Vulkan Android App\n";

    if (g_vulkan_wrapper) {
        info += "Vulkan initialized successfully";
    } else {
        info += "Vulkan not initialized";
    }

    return env->NewStringUTF(info.c_str());
}
```

---

## Step 7: Create Android Activity

### Update MainActivity.java

```java
package com.example.vulkanandroidapp;

import androidx.appcompat.app.AppCompatActivity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity implements SurfaceHolder.Callback {

    static {
        System.loadLibrary("vulkanandroidapp");
    }

    private SurfaceView surfaceView;
    private TextView infoText;
    private boolean vulkanInitialized = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        infoText = findViewById(R.id.info_text);
        surfaceView = findViewById(R.id.surface_view);

        // Check Vulkan support
        if (!checkVulkanSupport()) {
            Toast.makeText(this, "Vulkan not supported on this device", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        // Set up surface
        surfaceView.getHolder().addCallback(this);

        // Display Vulkan info
        String info = getVulkanInfo();
        infoText.setText(info);
    }

    private boolean checkVulkanSupport() {
        PackageManager pm = getPackageManager();
        boolean vulkanSupported = pm.hasSystemFeature(PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL);

        if (vulkanSupported) {
            infoText.append("Device supports Vulkan\n");
            return true;
        } else {
            infoText.append("Device does NOT support Vulkan\n");
            return false;
        }
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        // Initialize Vulkan when surface is created
        initVulkan(holder.getSurface());
        vulkanInitialized = true;

        // Start rendering loop
        startRenderLoop();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        // Handle surface changes if needed
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        cleanupVulkan();
        vulkanInitialized = false;
    }

    private void startRenderLoop() {
        new Thread(() -> {
            while (vulkanInitialized) {
                renderFrame();
                try {
                    Thread.sleep(16); // ~60 FPS
                } catch (InterruptedException e) {
                    break;
                }
            }
        }).start();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (vulkanInitialized) {
            cleanupVulkan();
        }
    }

    // Native methods
    public native void initVulkan(Object surface);
    public native void renderFrame();
    public native void cleanupVulkan();
    public native String getVulkanInfo();
}
```

### Create activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/info_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Vulkan Android App\n"
        android:textSize="16sp"
        android:padding="8dp"
        android:background="#f0f0f0"
        android:layout_marginBottom="16dp" />

    <SurfaceView
        android:id="@+id/surface_view"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />

</LinearLayout>
```

---

## Step 8: Build and Test

### Build Project

1. **Sync Project**: Click "Sync Now"
2. **Build**: Go to **Build → Make Project**
3. **Resolve Issues**: Fix any compilation errors

### Test on Device

1. **Connect Device**: Use USB debugging on Vulkan-capable device
2. **Deploy**: Run the application
3. **Verify**: Check that Vulkan initializes and renders

---

## Step 9: Common Vulkan Operations

### Basic Triangle Rendering

Add to your render pass:

```cpp
// Vertex data for triangle
const std::vector<float> vertices = {
     0.0f, -0.5f, 1.0f, 0.0f, 0.0f,  // Top vertex, red
     0.5f,  0.5f, 0.0f, 1.0f, 0.0f,  // Bottom right, green
    -0.5f,  0.5f, 0.0f, 0.0f, 1.0f   // Bottom left, blue
};

// Create vertex buffer
VkBuffer vertex_buffer;
VkDeviceMemory vertex_buffer_memory;
CreateBuffer(sizeof(float) * vertices.size(),
             VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
             VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
             vertex_buffer, vertex_buffer_memory);

// Copy vertex data
void* data;
vkMapMemory(device_, vertex_buffer_memory, 0, sizeof(float) * vertices.size(), 0, &data);
memcpy(data, vertices.data(), sizeof(float) * vertices.size());
vkUnmapMemory(device_, vertex_buffer_memory);
```

---

## Troubleshooting

### Common Issues

**Vulkan Not Available:**
- Check device compatibility (Android 7.0+)
- Verify manifest declarations
- Test on different devices

**Build Errors:**
```bash
# Check NDK version
$ANDROID_NDK_HOME/ndk-build --version

# Verify Vulkan SDK
echo $VULKAN_SDK
```

**Runtime Crashes:**
- Check validation layers output
- Verify queue family indices
- Ensure proper synchronization

**Performance Issues:**
- Profile with Android GPU Inspector
- Check memory allocations
- Optimize render passes

---

## Summary

This tutorial covered:

1. Setting up Vulkan development environment for Android
2. Configuring Android Studio project for Vulkan
3. Creating Vulkan wrapper classes
4. Implementing native Android surface integration
5. Basic Vulkan initialization and rendering setup
6. Testing and troubleshooting

You now have a foundation for Vulkan graphics programming on Android, ready for integration with other systems like gRPC for networked graphics applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).