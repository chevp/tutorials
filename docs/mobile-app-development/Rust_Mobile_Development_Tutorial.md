# Rust Mobile Development Tutorial

This tutorial covers building mobile applications with Rust for both iOS and Android platforms, using cross-platform frameworks and native bindings to create high-performance mobile apps.

---

## Prerequisites

- Basic knowledge of Rust programming
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)
- Basic understanding of mobile app development concepts

---

## Step 1: Mobile Development Approaches with Rust

### Available Approaches

**1. Tauri Mobile (Recommended for Cross-platform)**
- Web technologies (HTML/CSS/JS) for UI
- Rust for backend logic
- Native platform integration
- Small app size

**2. Flutter with Rust FFI**
- Flutter for UI
- Rust for performance-critical logic
- Good cross-platform support

**3. React Native with Rust**
- React Native for UI
- Rust modules via FFI
- JavaScript bridge

**4. Native Development with Rust**
- Pure Rust with platform bindings
- Maximum performance
- More complex setup

**5. Bevy Mobile (Game Development)**
- Rust game engine
- ECS architecture
- Cross-platform gaming

---

## Step 2: Setup Development Environment

### Install Rust Mobile Toolchain

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add mobile targets
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios  # iOS Simulator
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android

# Install cargo tools
cargo install cargo-mobile2
cargo install tauri-cli --version "^2.0"
cargo install flutter_rust_bridge_codegen
```

### Android Setup

```bash
# Install Android NDK (required for Rust compilation)
# Via Android Studio SDK Manager or:
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Set up NDK toolchain
mkdir ~/.NDK
$ANDROID_NDK_HOME/build/tools/make_standalone_toolchain.py \
    --api 21 --arch arm64 --install-dir ~/.NDK/arm64
$ANDROID_NDK_HOME/build/tools/make_standalone_toolchain.py \
    --api 21 --arch arm --install-dir ~/.NDK/arm
```

### iOS Setup (macOS only)

```bash
# Xcode command line tools
xcode-select --install

# Install iOS deployment tools
cargo install cargo-lipo
```

---

## Step 3: Tauri Mobile Application

### Create Tauri Mobile Project

```bash
# Create new Tauri mobile project
npm create tauri-app@latest my-tauri-mobile-app
cd my-tauri-mobile-app

# Add mobile capabilities
cargo tauri add mobile
```

### Project Structure
```
my-tauri-mobile-app/
├── src-tauri/
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   └── mobile.rs
│   ├── gen/
│   └── capabilities/
├── src/
│   ├── index.html
│   ├── main.js
│   └── styles.css
└── package.json
```

### Configure Tauri for Mobile

**Update src-tauri/Cargo.toml:**
```toml
[package]
name = "my-tauri-mobile-app"
version = "0.1.0"
edition = "2021"

[lib]
name = "my_tauri_mobile_app"
crate-type = ["staticlib", "cdylib", "rlib"]

[dependencies]
tauri = { version = "2.0", features = ["mobile"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio-rustls"] }

[target.'cfg(target_os = "android")'.dependencies]
jni = "0.21"
android_logger = "0.13"

[target.'cfg(target_os = "ios")'.dependencies]
objc = "0.2"
cocoa = "0.24"
```

### Create Mobile-Specific Rust Code

**src-tauri/src/mobile.rs:**
```rust
use tauri::{App, Manager};

#[cfg(target_os = "android")]
use jni::{
    objects::{JClass, JObject, JString, JValue},
    sys::{jboolean, jstring},
    JNIEnv,
};

// Initialize the mobile app
pub fn init_mobile_app(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "android")]
    init_android_logger();

    #[cfg(target_os = "ios")]
    init_ios_logger();

    // Register mobile-specific commands
    app.manage(MobileState::default());

    Ok(())
}

// Mobile state management
#[derive(Default)]
pub struct MobileState {
    pub device_info: DeviceInfo,
    pub app_state: AppState,
}

#[derive(Default, serde::Serialize)]
pub struct DeviceInfo {
    pub platform: String,
    pub version: String,
    pub model: String,
    pub screen_size: (u32, u32),
}

#[derive(Default)]
pub struct AppState {
    pub is_foreground: bool,
    pub network_status: NetworkStatus,
}

#[derive(Default)]
pub enum NetworkStatus {
    #[default]
    Unknown,
    WiFi,
    Cellular,
    None,
}

// Android-specific initialization
#[cfg(target_os = "android")]
fn init_android_logger() {
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Debug)
            .with_tag("TauriMobileApp")
    );
}

// iOS-specific initialization
#[cfg(target_os = "ios")]
fn init_ios_logger() {
    use std::io::Write;

    env_logger::Builder::from_default_env()
        .format(|buf, record| {
            writeln!(buf, "[{}] {}", record.level(), record.args())
        })
        .init();
}

// Cross-platform mobile commands
#[tauri::command]
pub async fn get_device_info() -> Result<DeviceInfo, String> {
    let mut device_info = DeviceInfo::default();

    #[cfg(target_os = "android")]
    {
        device_info.platform = "Android".to_string();
        device_info = get_android_device_info(device_info);
    }

    #[cfg(target_os = "ios")]
    {
        device_info.platform = "iOS".to_string();
        device_info = get_ios_device_info(device_info);
    }

    Ok(device_info)
}

#[tauri::command]
pub async fn save_data_to_device(data: String) -> Result<String, String> {
    use std::fs;
    use std::path::PathBuf;

    let data_dir = get_app_data_dir().map_err(|e| e.to_string())?;
    let file_path = data_dir.join("app_data.json");

    fs::write(&file_path, data).map_err(|e| e.to_string())?;

    Ok(format!("Data saved to: {}", file_path.display()))
}

#[tauri::command]
pub async fn load_data_from_device() -> Result<String, String> {
    use std::fs;

    let data_dir = get_app_data_dir().map_err(|e| e.to_string())?;
    let file_path = data_dir.join("app_data.json");

    if file_path.exists() {
        fs::read_to_string(&file_path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string()) // Return empty JSON if file doesn't exist
    }
}

#[tauri::command]
pub async fn make_http_request(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body = response.text().await.map_err(|e| e.to_string())?;
    Ok(body)
}

// Platform-specific implementations
#[cfg(target_os = "android")]
fn get_android_device_info(mut info: DeviceInfo) -> DeviceInfo {
    // This would typically use JNI to get Android system information
    // For brevity, we'll use placeholder values
    info.version = "Android 13".to_string();
    info.model = "Android Device".to_string();
    info.screen_size = (1080, 2340);
    info
}

#[cfg(target_os = "ios")]
fn get_ios_device_info(mut info: DeviceInfo) -> DeviceInfo {
    // This would typically use Objective-C bindings
    // For brevity, we'll use placeholder values
    info.version = "iOS 17".to_string();
    info.model = "iPhone".to_string();
    info.screen_size = (1179, 2556);
    info
}

fn get_app_data_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    #[cfg(target_os = "android")]
    {
        // Android app data directory
        let mut path = std::env::var("ANDROID_DATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/data"));
        path.push("data");
        path.push(env!("CARGO_PKG_NAME"));
        Ok(path)
    }

    #[cfg(target_os = "ios")]
    {
        // iOS Documents directory
        use std::ffi::CStr;
        use std::ptr;

        unsafe {
            let home = libc::getenv(b"HOME\0".as_ptr() as *const i8);
            if home.is_null() {
                return Err("Could not get HOME directory".into());
            }

            let home_str = CStr::from_ptr(home).to_str()?;
            let mut path = PathBuf::from(home_str);
            path.push("Documents");
            Ok(path)
        }
    }
}

// Android JNI bindings (if needed for direct Android API access)
#[cfg(target_os = "android")]
#[no_mangle]
pub extern "C" fn Java_com_example_app_MainActivity_rustGreeting(
    env: JNIEnv,
    _class: JClass,
    name: JString,
) -> jstring {
    let name_str: String = env.get_string(name).unwrap().into();
    let greeting = format!("Hello from Rust, {}!", name_str);

    let output = env.new_string(greeting).unwrap();
    output.into_raw()
}
```

### Update Main Rust Application

**src-tauri/src/main.rs:**
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod mobile;

use mobile::*;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust and Tauri!", name)
}

#[tauri::command]
async fn calculate_fibonacci(n: u64) -> Result<u64, String> {
    if n > 100 {
        return Err("Number too large (max 100)".to_string());
    }

    tokio::task::spawn_blocking(move || {
        fn fib(n: u64) -> u64 {
            match n {
                0 => 0,
                1 => 1,
                _ => fib(n - 1) + fib(n - 2),
            }
        }
        fib(n)
    })
    .await
    .map_err(|e| e.to_string())
}

fn main() {
    let mut builder = tauri::Builder::default();

    #[cfg(mobile)]
    {
        builder = builder.setup(|app| {
            mobile::init_mobile_app(app)?;
            Ok(())
        });
    }

    builder
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate_fibonacci,
            get_device_info,
            save_data_to_device,
            load_data_from_device,
            make_http_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Create Mobile-Friendly Frontend

**src/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rust Mobile App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🦀 Rust Mobile App</h1>

        <!-- Device Info Section -->
        <div class="section">
            <h2>Device Information</h2>
            <button id="get-device-info">Get Device Info</button>
            <div id="device-info"></div>
        </div>

        <!-- Greeting Section -->
        <div class="section">
            <h2>Greeting</h2>
            <input id="name-input" type="text" placeholder="Enter your name" />
            <button id="greet-button">Greet Me</button>
            <div id="greeting-result"></div>
        </div>

        <!-- Fibonacci Calculator -->
        <div class="section">
            <h2>Fibonacci Calculator</h2>
            <input id="fib-input" type="number" placeholder="Enter number (max 100)" max="100" />
            <button id="calc-fib">Calculate</button>
            <div id="fib-result"></div>
        </div>

        <!-- Data Storage -->
        <div class="section">
            <h2>Local Storage</h2>
            <textarea id="data-input" placeholder="Enter data to save"></textarea>
            <div class="button-group">
                <button id="save-data">Save Data</button>
                <button id="load-data">Load Data</button>
            </div>
            <div id="storage-result"></div>
        </div>

        <!-- Network Request -->
        <div class="section">
            <h2>Network Request</h2>
            <input id="url-input" type="url" placeholder="https://api.example.com/data" />
            <button id="make-request">Make Request</button>
            <div id="network-result"></div>
        </div>
    </div>

    <script src="main.js"></script>
</body>
</html>
```

**src/styles.css:**
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    min-height: 100vh;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
    color: #764ba2;
    margin-bottom: 30px;
    font-size: 2rem;
}

.section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
    color: #495057;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

input, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 10px;
    transition: border-color 0.3s;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
}

textarea {
    height: 80px;
    resize: vertical;
    font-family: inherit;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
    margin-bottom: 10px;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

button:active {
    transform: translateY(0);
}

.button-group {
    display: flex;
    gap: 10px;
}

.button-group button {
    flex: 1;
    margin-bottom: 10px;
}

#device-info, #greeting-result, #fib-result, #storage-result, #network-result {
    margin-top: 15px;
    padding: 10px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #667eea;
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 20px;
}

.loading {
    opacity: 0.7;
    pointer-events: none;
}

.error {
    color: #dc3545;
    border-left-color: #dc3545;
}

.success {
    color: #28a745;
    border-left-color: #28a745;
}

/* Mobile-specific styles */
@media (max-width: 480px) {
    .container {
        padding: 15px;
    }

    h1 {
        font-size: 1.5rem;
    }

    .section {
        padding: 15px;
    }
}
```

**src/main.js:**
```javascript
const { invoke } = window.__TAURI__.tauri;

// Utility functions
function showResult(elementId, content, type = 'info') {
    const element = document.getElementById(elementId);
    element.textContent = content;
    element.className = type;
}

function showLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Device Info
document.getElementById('get-device-info').addEventListener('click', async () => {
    showLoading('get-device-info', true);
    try {
        const deviceInfo = await invoke('get_device_info');
        showResult('device-info', JSON.stringify(deviceInfo, null, 2), 'success');
    } catch (error) {
        showResult('device-info', `Error: ${error}`, 'error');
    } finally {
        showLoading('get-device-info', false);
    }
});

// Greeting
document.getElementById('greet-button').addEventListener('click', async () => {
    const name = document.getElementById('name-input').value;
    if (!name.trim()) {
        showResult('greeting-result', 'Please enter a name', 'error');
        return;
    }

    showLoading('greet-button', true);
    try {
        const greeting = await invoke('greet', { name });
        showResult('greeting-result', greeting, 'success');
    } catch (error) {
        showResult('greeting-result', `Error: ${error}`, 'error');
    } finally {
        showLoading('greet-button', false);
    }
});

// Fibonacci Calculator
document.getElementById('calc-fib').addEventListener('click', async () => {
    const n = parseInt(document.getElementById('fib-input').value);
    if (isNaN(n) || n < 0) {
        showResult('fib-result', 'Please enter a valid number', 'error');
        return;
    }

    showLoading('calc-fib', true);
    try {
        const result = await invoke('calculate_fibonacci', { n });
        showResult('fib-result', `Fibonacci(${n}) = ${result}`, 'success');
    } catch (error) {
        showResult('fib-result', `Error: ${error}`, 'error');
    } finally {
        showLoading('calc-fib', false);
    }
});

// Data Storage
document.getElementById('save-data').addEventListener('click', async () => {
    const data = document.getElementById('data-input').value;
    if (!data.trim()) {
        showResult('storage-result', 'Please enter data to save', 'error');
        return;
    }

    showLoading('save-data', true);
    try {
        const result = await invoke('save_data_to_device', { data });
        showResult('storage-result', result, 'success');
    } catch (error) {
        showResult('storage-result', `Error: ${error}`, 'error');
    } finally {
        showLoading('save-data', false);
    }
});

document.getElementById('load-data').addEventListener('click', async () => {
    showLoading('load-data', true);
    try {
        const data = await invoke('load_data_from_device');
        document.getElementById('data-input').value = data;
        showResult('storage-result', 'Data loaded successfully', 'success');
    } catch (error) {
        showResult('storage-result', `Error: ${error}`, 'error');
    } finally {
        showLoading('load-data', false);
    }
});

// Network Request
document.getElementById('make-request').addEventListener('click', async () => {
    const url = document.getElementById('url-input').value;
    if (!url.trim()) {
        showResult('network-result', 'Please enter a URL', 'error');
        return;
    }

    showLoading('make-request', true);
    try {
        const response = await invoke('make_http_request', { url });
        showResult('network-result', response.substring(0, 500) + (response.length > 500 ? '...' : ''), 'success');
    } catch (error) {
        showResult('network-result', `Error: ${error}`, 'error');
    } finally {
        showLoading('make-request', false);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Rust Mobile App initialized');
});
```

---

## Step 4: Build and Run

### Development Mode

```bash
# Run in development mode (desktop)
cargo tauri dev

# Run on Android emulator/device
cargo tauri android dev

# Run on iOS simulator (macOS only)
cargo tauri ios dev
```

### Build for Production

```bash
# Build for Android
cargo tauri android build

# Build for iOS (macOS only)
cargo tauri ios build

# Build APK for Android
cargo tauri android build --apk
```

---

## Step 5: Flutter with Rust FFI

### Setup Flutter-Rust Project

```bash
# Create Flutter project
flutter create flutter_rust_app
cd flutter_rust_app

# Add Rust library
mkdir rust
cd rust
cargo init --lib

# Install flutter_rust_bridge
cargo install flutter_rust_bridge_codegen
dart pub global activate ffigen
```

### Configure Rust Library for Flutter

**rust/Cargo.toml:**
```toml
[package]
name = "flutter_rust_app"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "staticlib"]

[dependencies]
flutter_rust_bridge = "2.0"
tokio = { version = "1.0", features = ["rt-multi-thread"] }
anyhow = "1.0"
```

**rust/src/lib.rs:**
```rust
use flutter_rust_bridge::frb;

#[frb(init)]
pub fn init_app() {
    flutter_rust_bridge::setup_default_user_utils();
}

// Simple greeting function
#[frb(sync)]
pub fn greet(name: String) -> String {
    format!("Hello, {}! Greetings from Rust 🦀", name)
}

// Async computation
pub async fn calculate_heavy_task(n: u32) -> anyhow::Result<u64> {
    tokio::task::spawn_blocking(move || {
        let result = (0..n).map(|i| i as u64).sum();
        Ok(result)
    }).await?
}

// Data structure
#[frb]
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
}

#[frb]
impl User {
    #[frb(constructor)]
    pub fn new(id: u32, name: String, email: String) -> User {
        User { id, name, email }
    }

    pub fn get_display_name(&self) -> String {
        format!("{} ({})", self.name, self.email)
    }
}

// Error handling
#[frb]
pub enum CustomError {
    NetworkError(String),
    ValidationError(String),
    UnknownError,
}

pub fn risky_operation(input: String) -> anyhow::Result<String> {
    if input.is_empty() {
        return Err(CustomError::ValidationError("Input cannot be empty".to_string()).into());
    }

    if input.len() > 100 {
        return Err(CustomError::ValidationError("Input too long".to_string()).into());
    }

    Ok(format!("Processed: {}", input.to_uppercase()))
}

// Stream example
pub fn create_number_stream() -> impl Stream<Item = i32> {
    stream! {
        for i in 0..10 {
            yield i;
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        }
    }
}
```

### Generate Flutter Bindings

```bash
# Generate bindings
flutter_rust_bridge_codegen generate
```

### Flutter Integration

**pubspec.yaml:**
```yaml
name: flutter_rust_app
description: Flutter app with Rust backend

dependencies:
  flutter:
    sdk: flutter
  ffi: ^2.0.0
  flutter_rust_bridge: ^2.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  ffigen: ^9.0.0

flutter:
  uses-material-design: true
```

**lib/main.dart:**
```dart
import 'package:flutter/material.dart';
import 'rust_bridge/bridge_definitions.dart';
import 'rust_bridge/bridge_generated.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Rust App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _nameController = TextEditingController();
  String _greeting = '';
  bool _isLoading = false;
  final RustImpl _rust = RustImpl.instance;

  @override
  void initState() {
    super.initState();
    _initializeRust();
  }

  Future<void> _initializeRust() async {
    await _rust.initApp();
  }

  Future<void> _greetUser() async {
    if (_nameController.text.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final greeting = _rust.greet(name: _nameController.text);
      setState(() {
        _greeting = greeting;
      });
    } catch (e) {
      setState(() {
        _greeting = 'Error: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter ❤️ Rust'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Enter your name',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _greetUser,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Greet from Rust'),
            ),
            SizedBox(height: 24),
            if (_greeting.isNotEmpty)
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    _greeting,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }
}
```

---

## Step 6: React Native with Rust

### Setup React Native with Rust

```bash
# Create React Native project
npx react-native init ReactNativeRustApp
cd ReactNativeRustApp

# Create Rust library
mkdir rust-library
cd rust-library
cargo init --lib

# Add to iOS
cd ios
pod init
```

### Configure Rust for React Native

**rust-library/Cargo.toml:**
```toml
[package]
name = "react_native_rust_lib"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "staticlib"]

[dependencies]
jni = "0.21"       # For Android
libc = "0.2"       # For C FFI
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[target.'cfg(target_os = "ios")'.dependencies]
objc = "0.2"
```

**rust-library/src/lib.rs:**
```rust
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int};

// C FFI exports
#[no_mangle]
pub extern "C" fn rust_greet(name: *const c_char) -> *mut c_char {
    let c_str = unsafe { CStr::from_ptr(name) };
    let recipient = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => "Unknown",
    };

    let greeting = format!("Hello from Rust, {}! 🦀", recipient);
    let c_string = CString::new(greeting).unwrap();
    c_string.into_raw()
}

#[no_mangle]
pub extern "C" fn rust_add(a: c_int, b: c_int) -> c_int {
    a + b
}

#[no_mangle]
pub extern "C" fn rust_free_string(ptr: *mut c_char) {
    if ptr.is_null() {
        return;
    }
    unsafe {
        CString::from_raw(ptr);
    }
}

// Android JNI bindings
#[cfg(target_os = "android")]
use jni::objects::{JClass, JString};
#[cfg(target_os = "android")]
use jni::sys::jstring;
#[cfg(target_os = "android")]
use jni::JNIEnv;

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "C" fn Java_com_reactnativerustapp_RustModule_greet(
    env: JNIEnv,
    _class: JClass,
    name: JString,
) -> jstring {
    let name_str: String = env.get_string(name).unwrap().into();
    let greeting = format!("Hello from Rust, {}! 🦀", name_str);
    let output = env.new_string(greeting).unwrap();
    output.into_raw()
}
```

### Android Integration

**android/app/src/main/java/com/reactnativerustapp/RustModule.java:**
```java
package com.reactnativerustapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class RustModule extends ReactContextBaseJavaModule {
    static {
        System.loadLibrary("react_native_rust_lib");
    }

    public RustModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RustModule";
    }

    @ReactMethod
    public void greet(String name, Promise promise) {
        try {
            String greeting = nativeGreet(name);
            promise.resolve(greeting);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    public void add(int a, int b, Promise promise) {
        try {
            int result = nativeAdd(a, b);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    private native String nativeGreet(String name);
    private native int nativeAdd(int a, int b);
}
```

### iOS Integration

**ios/ReactNativeRustApp/RustBridge.h:**
```objc
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RustBridge : NSObject <RCTBridgeModule>
@end
```

**ios/ReactNativeRustApp/RustBridge.m:**
```objc
#import "RustBridge.h"

// Import C functions from Rust
extern char* rust_greet(const char* name);
extern int rust_add(int a, int b);
extern void rust_free_string(char* ptr);

@implementation RustBridge

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(greet:(NSString *)name
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    const char* cName = [name UTF8String];
    char* result = rust_greet(cName);
    NSString* greeting = [NSString stringWithUTF8String:result];
    rust_free_string(result);
    resolve(greeting);
}

RCT_EXPORT_METHOD(add:(int)a
                  b:(int)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    int result = rust_add(a, b);
    resolve(@(result));
}

@end
```

### React Native JavaScript

**App.js:**
```javascript
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { NativeModules } from 'react-native';

const { RustModule } = NativeModules;

const App = () => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [sum, setSum] = useState('');

  const handleGreet = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      const result = await RustModule.greet(name);
      setGreeting(result);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAdd = async () => {
    const a = parseInt(num1);
    const b = parseInt(num2);

    if (isNaN(a) || isNaN(b)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    try {
      const result = await RustModule.add(a, b);
      setSum(result.toString());
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>React Native ❤️ Rust</Text>

          {/* Greeting Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Greeting</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
            <TouchableOpacity style={styles.button} onPress={handleGreet}>
              <Text style={styles.buttonText}>Greet from Rust</Text>
            </TouchableOpacity>
            {greeting ? (
              <Text style={styles.result}>{greeting}</Text>
            ) : null}
          </View>

          {/* Addition Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Addition</Text>
            <TextInput
              style={styles.input}
              value={num1}
              onChangeText={setNum1}
              placeholder="First number"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={num2}
              onChangeText={setNum2}
              placeholder="Second number"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
              <Text style={styles.buttonText}>Add Numbers</Text>
            </TouchableOpacity>
            {sum ? (
              <Text style={styles.result}>Result: {sum}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default App;
```

---

## Step 7: Build and Deploy

### Build Scripts

**build_mobile.sh:**
```bash
#!/bin/bash

set -e

echo "Building Rust Mobile Applications..."

# Build Tauri Mobile
echo "Building Tauri Mobile App..."
cd tauri-mobile-app
cargo tauri android build --apk
cargo tauri ios build

# Build Flutter with Rust
echo "Building Flutter Rust App..."
cd ../flutter-rust-app
flutter_rust_bridge_codegen generate
flutter build apk
flutter build ios

# Build React Native with Rust
echo "Building React Native Rust App..."
cd ../react-native-rust-app

# Android
cd android
./gradlew assembleRelease

# iOS (macOS only)
cd ../ios
xcodebuild -workspace ReactNativeRustApp.xcworkspace -scheme ReactNativeRustApp -configuration Release

echo "All builds completed successfully!"
```

---

## Summary

This tutorial covered:

1. **Mobile Development Approaches**: Different ways to use Rust in mobile apps
2. **Tauri Mobile**: Complete cross-platform solution with web technologies
3. **Flutter Integration**: Using Rust with Flutter via FFI
4. **React Native Integration**: Native modules with Rust backend
5. **Platform-Specific Code**: Android JNI and iOS Objective-C bindings
6. **Build and Deployment**: Scripts and processes for distribution

You now have the knowledge to build high-performance mobile applications with Rust, leveraging the language's safety and performance benefits while using familiar frontend frameworks.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).