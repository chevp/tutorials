# Android SDK and Android Studio Setup Tutorial

This tutorial will guide you through setting up Android SDK and Android Studio for developing Android applications, with a focus on supporting C++ development with NDK.

---

## Prerequisites

- **System Requirements**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+ recommended)
- **RAM**: Minimum 8GB, recommended 16GB+
- **Storage**: At least 4GB for Android Studio + additional space for SDK components
- **Java**: JDK 8 or higher (Android Studio includes OpenJDK)

---

## Step 1: Download and Install Android Studio

### Download Android Studio

1. Visit the [Android Studio official website](https://developer.android.com/studio)
2. Click "Download Android Studio"
3. Accept the terms and conditions
4. Download the installer for your operating system

### Install Android Studio

**Windows:**
```bash
# Run the downloaded .exe file
# Follow the installation wizard
# Choose "Standard" installation type
```

**macOS:**
```bash
# Open the downloaded .dmg file
# Drag Android Studio to Applications folder
# Launch Android Studio from Applications
```

**Linux:**
```bash
# Extract the downloaded .tar.gz file
tar -xzf android-studio-*.tar.gz

# Navigate to the android-studio/bin directory
cd android-studio/bin

# Run the studio.sh script
./studio.sh
```

---

## Step 2: Initial Android Studio Setup

1. **Launch Android Studio**
2. **Setup Wizard**: Choose "Standard" setup for most components
3. **SDK Components**: The wizard will download:
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform (latest API level)

---

## Step 3: Install Android NDK for C++ Development

### Through Android Studio

1. Open Android Studio
2. Go to **File → Settings** (Windows/Linux) or **Android Studio → Preferences** (macOS)
3. Navigate to **Appearance & Behavior → System Settings → Android SDK**
4. Click the **SDK Tools** tab
5. Check the following items:
   - **NDK (Side by side)**
   - **CMake**
   - **LLDB**
6. Click **Apply** and **OK** to install

### Verify NDK Installation

```bash
# Check NDK installation path
# Default locations:
# Windows: %LOCALAPPDATA%\Android\Sdk\ndk\[version]
# macOS: ~/Library/Android/sdk/ndk/[version]
# Linux: ~/Android/Sdk/ndk/[version]

# Set environment variable (add to your shell profile)
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/[version]
```

---

## Step 4: Configure SDK Manager

1. Open **Tools → SDK Manager**
2. **SDK Platforms tab**: Install desired API levels (recommended: API 21+ for modern apps)
3. **SDK Tools tab**: Ensure these are installed:
   - Android SDK Build-Tools (latest)
   - Android SDK Platform-Tools
   - Android SDK Tools
   - NDK (Side by side)
   - CMake
   - LLDB (for debugging C++ code)

---

## Step 5: Set Up Android Virtual Device (AVD)

### Create an Emulator

1. Open **Tools → AVD Manager**
2. Click **Create Virtual Device**
3. Select a device definition (e.g., Pixel 4)
4. Choose a system image:
   - **API Level**: 21+ recommended
   - **ABI**: x86_64 (for better performance) or arm64-v8a (for ARM testing)
5. Configure AVD settings:
   - **RAM**: 2GB+ recommended
   - **Internal Storage**: 2GB+ recommended
6. Click **Finish**

### Launch Emulator

```bash
# From command line (optional)
emulator -avd [AVD_NAME]
```

---

## Step 6: Configure Environment Variables

### Windows
```powershell
# Add to System Environment Variables
ANDROID_HOME=C:\Users\[username]\AppData\Local\Android\Sdk
ANDROID_NDK_HOME=%ANDROID_HOME%\ndk\[version]

# Add to PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_NDK_HOME%
```

### macOS/Linux
```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk        # Linux
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/[version]
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_NDK_HOME
```

---

## Step 7: Verify Installation

### Check SDK Installation
```bash
# Verify SDK installation
adb version
android --version  # Deprecated but may be available

# List installed packages
sdkmanager --list
```

### Check NDK Installation
```bash
# Navigate to NDK directory and check
ls $ANDROID_NDK_HOME

# Verify NDK tools
$ANDROID_NDK_HOME/ndk-build --version
```

---

## Step 8: Create Your First Android Project with C++ Support

1. **Start New Project**: Click "Start a new Android Studio project"
2. **Choose Template**: Select "Native C++" template
3. **Configure Project**:
   - Name: Your app name
   - Package name: com.example.yourapp
   - Language: Java/Kotlin (for Android part)
   - Minimum SDK: API 21+ recommended
4. **Configure C++ Support**:
   - C++ Standard: C++14 or higher
   - Toolchain Default: clang (recommended)
5. Click **Finish**

---

## Step 9: Test the Setup

### Build and Run Test Project

1. Wait for Gradle sync to complete
2. Connect a physical device or start an emulator
3. Click the **Run** button (green play icon)
4. Verify the app launches successfully

### Verify C++ Integration

The Native C++ template includes:
- `app/src/main/cpp/` directory for C++ source files
- `CMakeLists.txt` for build configuration
- JNI bridge for Java/Kotlin ↔ C++ communication

---

## Common Issues and Troubleshooting

### Issue: NDK not found
```bash
# Solution: Verify NDK path in local.properties
echo "ndk.dir=$ANDROID_NDK_HOME" >> local.properties
```

### Issue: Emulator performance
- Enable Hardware Acceleration (Intel HAXM/AMD Processor)
- Allocate sufficient RAM to emulator
- Use x86_64 system images when possible

### Issue: Gradle sync failed
- Check internet connection
- Update Gradle wrapper if needed
- Clear cache: **File → Invalidate Caches and Restart**

---

## Next Steps

With Android Studio and NDK properly configured, you're ready to:
- Develop Android applications with C++ backend
- Integrate gRPC for network communication
- Use Vulkan for high-performance graphics
- Build complex native applications

---

## Summary

This tutorial covered:
1. Installing Android Studio
2. Setting up Android SDK and NDK
3. Configuring development environment
4. Creating Android projects with C++ support
5. Troubleshooting common issues

You now have a complete Android development environment ready for advanced features like gRPC and Vulkan integration.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).