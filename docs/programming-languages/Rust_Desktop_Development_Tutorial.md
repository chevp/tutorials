# Rust Desktop Development Tutorial

This tutorial covers building desktop applications with Rust, focusing on modern GUI frameworks, cross-platform development, and best practices for creating performant native desktop applications.

---

## Prerequisites

- Basic knowledge of programming concepts
- Familiarity with command line interfaces
- No prior Rust experience required (we'll cover the basics)

---

## Step 1: Install Rust and Development Environment

### Install Rust

**Windows:**
```powershell
# Download and run rustup-init.exe from https://rustup.rs/
# Or use Windows Subsystem for Linux (WSL)

# Verify installation
rustc --version
cargo --version
```

**macOS:**
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal or source the environment
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

**Linux:**
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install development dependencies
sudo apt update
sudo apt install build-essential pkg-config libssl-dev

# Verify installation
rustc --version
cargo --version
```

### Set Up Development Environment

**VS Code with Rust Extension:**
```bash
# Install rust-analyzer extension
code --install-extension rust-lang.rust-analyzer
```

**Optional Tools:**
```bash
# Install additional tools
cargo install cargo-edit      # Easier dependency management
cargo install cargo-watch     # Auto-reload during development
cargo install cargo-expand    # View macro expansions
```

---

## Step 2: Rust Basics for Desktop Development

### Create Your First Rust Project

```bash
# Create new binary project
cargo new rust_desktop_app
cd rust_desktop_app

# Project structure
# rust_desktop_app/
# ├── Cargo.toml
# ├── src/
# │   └── main.rs
# └── target/
```

### Basic Rust Concepts

**Variables and Data Types:**
```rust
// src/main.rs
fn main() {
    // Immutable by default
    let name = "Desktop App";

    // Mutable variables
    let mut counter = 0;
    counter += 1;

    // Data types
    let integer: i32 = 42;
    let float: f64 = 3.14;
    let boolean: bool = true;
    let text: String = String::from("Hello, Rust!");

    println!("{} - Counter: {}", name, counter);
}
```

**Structs and Methods:**
```rust
// Define a struct
struct Application {
    name: String,
    version: String,
    is_running: bool,
}

impl Application {
    // Associated function (constructor)
    fn new(name: String, version: String) -> Self {
        Application {
            name,
            version,
            is_running: false,
        }
    }

    // Method
    fn start(&mut self) {
        self.is_running = true;
        println!("{} v{} is now running", self.name, self.version);
    }

    fn stop(&mut self) {
        self.is_running = false;
        println!("{} has stopped", self.name);
    }
}

fn main() {
    let mut app = Application::new(
        "My Desktop App".to_string(),
        "1.0.0".to_string()
    );

    app.start();
    app.stop();
}
```

---

## Step 3: GUI Framework Comparison

### Popular Rust GUI Frameworks

**1. egui (Immediate Mode):**
- Easy to learn and use
- Good for tools and utilities
- Cross-platform
- Single-threaded by design

**2. iced (Elm Architecture):**
- Reactive programming model
- Type-safe and functional
- Good performance
- Modern architecture

**3. Tauri (Web Technologies):**
- Uses HTML/CSS/JS for UI
- Rust for backend
- Small bundle size
- Web developer friendly

**4. Slint (Declarative):**
- Declarative UI language
- Good performance
- Professional licensing available
- Modern design

**5. Native Options:**
- **winit + wgpu**: Low-level, maximum control
- **gtk-rs**: GTK bindings for Linux/Windows
- **native-windows-gui**: Windows-specific

---

## Step 4: Building with egui

### Setup egui Project

**Update Cargo.toml:**
```toml
[package]
name = "rust_desktop_egui"
version = "0.1.0"
edition = "2021"

[dependencies]
egui = "0.23"
eframe = "0.23"  # egui framework for native apps
serde = { version = "1.0", features = ["derive"] }

[target.'cfg(not(target_arch = "wasm32"))'.dependencies]
env_logger = "0.10"
tokio = { version = "1.0", features = ["full"] }
```

**Create egui Application:**
```rust
// src/main.rs
use eframe::egui;
use std::collections::HashMap;

fn main() -> Result<(), eframe::Error> {
    env_logger::init(); // Log to stderr (if you want to see it in the terminal)

    let options = eframe::NativeOptions {
        initial_window_size: Some(egui::vec2(800.0, 600.0)),
        ..Default::default()
    };

    eframe::run_native(
        "Rust Desktop App",
        options,
        Box::new(|_cc| Box::new(MyApp::default())),
    )
}

struct MyApp {
    name: String,
    counter: i32,
    todos: Vec<Todo>,
    new_todo: String,
    show_settings: bool,
    theme: Theme,
}

#[derive(Default)]
struct Todo {
    text: String,
    done: bool,
}

#[derive(Default, PartialEq)]
enum Theme {
    #[default]
    Dark,
    Light,
}

impl Default for MyApp {
    fn default() -> Self {
        Self {
            name: "Rust User".to_owned(),
            counter: 0,
            todos: vec![
                Todo { text: "Learn Rust".to_owned(), done: true },
                Todo { text: "Build desktop app".to_owned(), done: false },
                Todo { text: "Deploy to production".to_owned(), done: false },
            ],
            new_todo: String::new(),
            show_settings: false,
            theme: Theme::default(),
        }
    }
}

impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Set theme
        match self.theme {
            Theme::Dark => ctx.set_visuals(egui::Visuals::dark()),
            Theme::Light => ctx.set_visuals(egui::Visuals::light()),
        }

        // Top menu bar
        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            egui::menu::bar(ui, |ui| {
                ui.menu_button("File", |ui| {
                    if ui.button("Settings").clicked() {
                        self.show_settings = true;
                        ui.close_menu();
                    }
                    if ui.button("Exit").clicked() {
                        std::process::exit(0);
                    }
                });
                ui.menu_button("Help", |ui| {
                    if ui.button("About").clicked() {
                        // Show about dialog
                        ui.close_menu();
                    }
                });
            });
        });

        // Settings window
        if self.show_settings {
            egui::Window::new("Settings")
                .open(&mut self.show_settings)
                .show(ctx, |ui| {
                    ui.horizontal(|ui| {
                        ui.label("Theme:");
                        ui.radio_value(&mut self.theme, Theme::Dark, "Dark");
                        ui.radio_value(&mut self.theme, Theme::Light, "Light");
                    });

                    ui.separator();

                    ui.horizontal(|ui| {
                        ui.label("Name:");
                        ui.text_edit_singleline(&mut self.name);
                    });
                });
        }

        // Main content area
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Rust Desktop Application");

            ui.horizontal(|ui| {
                ui.label(format!("Hello, {}!", self.name));
                if ui.button("Reset Name").clicked() {
                    self.name = "Rust User".to_owned();
                }
            });

            ui.separator();

            // Counter section
            ui.horizontal(|ui| {
                if ui.button("-").clicked() {
                    self.counter -= 1;
                }
                ui.label(format!("Counter: {}", self.counter));
                if ui.button("+").clicked() {
                    self.counter += 1;
                }
                if ui.button("Reset").clicked() {
                    self.counter = 0;
                }
            });

            ui.separator();

            // Todo section
            ui.heading("Todo List");

            ui.horizontal(|ui| {
                ui.label("New todo:");
                ui.text_edit_singleline(&mut self.new_todo);
                if ui.button("Add").clicked() && !self.new_todo.trim().is_empty() {
                    self.todos.push(Todo {
                        text: self.new_todo.clone(),
                        done: false,
                    });
                    self.new_todo.clear();
                }
            });

            ui.separator();

            // Display todos
            let mut todos_to_remove = Vec::new();
            for (i, todo) in self.todos.iter_mut().enumerate() {
                ui.horizontal(|ui| {
                    ui.checkbox(&mut todo.done, "");

                    if todo.done {
                        ui.colored_label(egui::Color32::GRAY, &todo.text);
                    } else {
                        ui.label(&todo.text);
                    }

                    if ui.button("Delete").clicked() {
                        todos_to_remove.push(i);
                    }
                });
            }

            // Remove deleted todos (in reverse order to maintain indices)
            for &i in todos_to_remove.iter().rev() {
                self.todos.remove(i);
            }

            ui.separator();

            // Statistics
            let total = self.todos.len();
            let completed = self.todos.iter().filter(|t| t.done).count();
            ui.label(format!("Progress: {}/{} tasks completed", completed, total));

            if total > 0 {
                let progress = completed as f32 / total as f32;
                ui.add(egui::ProgressBar::new(progress).show_percentage());
            }
        });
    }
}
```

**Run the Application:**
```bash
cargo run
```

---

## Step 5: Building with iced

### Setup iced Project

```bash
# Create new project
cargo new rust_desktop_iced
cd rust_desktop_iced
```

**Update Cargo.toml:**
```toml
[package]
name = "rust_desktop_iced"
version = "0.1.0"
edition = "2021"

[dependencies]
iced = "0.10"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

**Create iced Application:**
```rust
// src/main.rs
use iced::widget::{button, column, container, row, text, text_input, checkbox, scrollable};
use iced::{Alignment, Application, Command, Element, Length, Settings, Theme};
use serde::{Deserialize, Serialize};

pub fn main() -> iced::Result {
    TodoApp::run(Settings::default())
}

#[derive(Debug, Default)]
struct TodoApp {
    input_value: String,
    todos: Vec<Task>,
    filter: Filter,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Task {
    description: String,
    completed: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Filter {
    All,
    Active,
    Completed,
}

impl Default for Filter {
    fn default() -> Self {
        Filter::All
    }
}

#[derive(Debug, Clone)]
pub enum Message {
    InputChanged(String),
    CreateTask,
    TaskMessage(usize, TaskMessage),
    FilterChanged(Filter),
    ClearCompleted,
    ToggleAll,
}

#[derive(Debug, Clone)]
pub enum TaskMessage {
    Delete,
    Toggle,
    Edit(String),
}

impl Application for TodoApp {
    type Message = Message;
    type Executor = iced::executor::Default;
    type Flags = ();
    type Theme = Theme;

    fn new(_flags: ()) -> (Self, Command<Message>) {
        (
            TodoApp {
                input_value: String::new(),
                todos: vec![
                    Task {
                        description: "Learn Rust".to_string(),
                        completed: true,
                    },
                    Task {
                        description: "Build iced app".to_string(),
                        completed: false,
                    },
                    Task {
                        description: "Deploy to users".to_string(),
                        completed: false,
                    },
                ],
                filter: Filter::All,
            },
            Command::none(),
        )
    }

    fn title(&self) -> String {
        String::from("Rust Desktop App - iced")
    }

    fn update(&mut self, message: Message) -> Command<Message> {
        match message {
            Message::InputChanged(value) => {
                self.input_value = value;
            }
            Message::CreateTask => {
                if !self.input_value.trim().is_empty() {
                    self.todos.push(Task {
                        description: self.input_value.trim().to_string(),
                        completed: false,
                    });
                    self.input_value.clear();
                }
            }
            Message::TaskMessage(index, task_message) => {
                if let Some(task) = self.todos.get_mut(index) {
                    match task_message {
                        TaskMessage::Delete => {
                            self.todos.remove(index);
                        }
                        TaskMessage::Toggle => {
                            task.completed = !task.completed;
                        }
                        TaskMessage::Edit(new_description) => {
                            task.description = new_description;
                        }
                    }
                }
            }
            Message::FilterChanged(filter) => {
                self.filter = filter;
            }
            Message::ClearCompleted => {
                self.todos.retain(|task| !task.completed);
            }
            Message::ToggleAll => {
                let all_completed = self.todos.iter().all(|task| task.completed);
                for task in &mut self.todos {
                    task.completed = !all_completed;
                }
            }
        }

        Command::none()
    }

    fn view(&self) -> Element<Message> {
        let title = text("Todo List")
            .size(40)
            .style(iced::theme::Text::Color(iced::Color::from_rgb(0.5, 0.5, 0.8)));

        let input = text_input("What needs to be done?", &self.input_value)
            .on_input(Message::InputChanged)
            .on_submit(Message::CreateTask)
            .padding(10);

        let create_button = button("Add Task")
            .on_press(Message::CreateTask)
            .padding(10);

        let input_row = row![input, create_button].spacing(10);

        let tasks = self.todos
            .iter()
            .enumerate()
            .filter(|(_, task)| match self.filter {
                Filter::All => true,
                Filter::Active => !task.completed,
                Filter::Completed => task.completed,
            })
            .fold(column![].spacing(5), |column, (index, task)| {
                let task_text = if task.completed {
                    text(&task.description)
                        .style(iced::theme::Text::Color(iced::Color::from_rgb(0.5, 0.5, 0.5)))
                } else {
                    text(&task.description)
                };

                let task_checkbox = checkbox("", task.completed)
                    .on_toggle(move |_| Message::TaskMessage(index, TaskMessage::Toggle));

                let delete_button = button("Delete")
                    .on_press(Message::TaskMessage(index, TaskMessage::Delete))
                    .style(iced::theme::Button::Destructive);

                let task_row = row![task_checkbox, task_text, delete_button]
                    .spacing(10)
                    .align_items(Alignment::Center);

                column.push(task_row)
            });

        let tasks_scrollable = scrollable(tasks).height(Length::Fill);

        let filter_buttons = row![
            button("All")
                .on_press(Message::FilterChanged(Filter::All))
                .style(if self.filter == Filter::All {
                    iced::theme::Button::Primary
                } else {
                    iced::theme::Button::Secondary
                }),
            button("Active")
                .on_press(Message::FilterChanged(Filter::Active))
                .style(if self.filter == Filter::Active {
                    iced::theme::Button::Primary
                } else {
                    iced::theme::Button::Secondary
                }),
            button("Completed")
                .on_press(Message::FilterChanged(Filter::Completed))
                .style(if self.filter == Filter::Completed {
                    iced::theme::Button::Primary
                } else {
                    iced::theme::Button::Secondary
                }),
        ]
        .spacing(10);

        let controls = row![
            button("Toggle All").on_press(Message::ToggleAll),
            button("Clear Completed")
                .on_press(Message::ClearCompleted)
                .style(iced::theme::Button::Destructive),
        ]
        .spacing(10);

        let stats = {
            let total = self.todos.len();
            let completed = self.todos.iter().filter(|task| task.completed).count();
            let active = total - completed;

            text(format!("Total: {}, Active: {}, Completed: {}", total, active, completed))
        };

        let content = column![
            title,
            input_row,
            tasks_scrollable,
            filter_buttons,
            controls,
            stats,
        ]
        .spacing(20)
        .padding(20);

        container(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x()
            .center_y()
            .into()
    }

    fn theme(&self) -> Theme {
        Theme::Dark
    }
}
```

---

## Step 6: File I/O and Persistence

### Add File Operations

**Update Cargo.toml:**
```toml
[dependencies]
# ... existing dependencies
dirs = "5.0"  # For getting user directories
```

**Create persistence module:**
```rust
// src/persistence.rs
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppData {
    pub todos: Vec<Task>,
    pub settings: AppSettings,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Task {
    pub description: String,
    pub completed: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub theme: String,
    pub auto_save: bool,
    pub window_size: (u32, u32),
}

impl Default for AppData {
    fn default() -> Self {
        Self {
            todos: Vec::new(),
            settings: AppSettings::default(),
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            auto_save: true,
            window_size: (800, 600),
        }
    }
}

pub fn get_data_directory() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let mut path = dirs::data_local_dir()
        .ok_or("Could not find data directory")?;
    path.push("rust_desktop_app");

    if !path.exists() {
        fs::create_dir_all(&path)?;
    }

    Ok(path)
}

pub fn save_app_data(data: &AppData) -> Result<(), Box<dyn std::error::Error>> {
    let data_dir = get_data_directory()?;
    let file_path = data_dir.join("app_data.json");

    let json = serde_json::to_string_pretty(data)?;
    fs::write(file_path, json)?;

    Ok(())
}

pub fn load_app_data() -> Result<AppData, Box<dyn std::error::Error>> {
    let data_dir = get_data_directory()?;
    let file_path = data_dir.join("app_data.json");

    if file_path.exists() {
        let json = fs::read_to_string(file_path)?;
        let data: AppData = serde_json::from_str(&json)?;
        Ok(data)
    } else {
        Ok(AppData::default())
    }
}
```

---

## Step 7: System Integration

### System Tray Integration

**Add system tray support:**
```toml
[dependencies]
tray-icon = "0.8"
winit = "0.28"
image = "0.24"
```

**Create system tray:**
```rust
// src/system_tray.rs
use tray_icon::{TrayIcon, TrayIconBuilder, menu::{Menu, MenuItem}};

pub struct SystemTray {
    _tray_icon: TrayIcon,
}

impl SystemTray {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let menu = Menu::new();

        let show_item = MenuItem::new("Show", true, None);
        let quit_item = MenuItem::new("Quit", true, None);

        menu.append_items(&[&show_item, &quit_item])?;

        let tray_icon = TrayIconBuilder::new()
            .with_menu(Box::new(menu))
            .with_tooltip("Rust Desktop App")
            .build()?;

        Ok(SystemTray {
            _tray_icon: tray_icon,
        })
    }
}
```

### Cross-platform File Handling

```rust
// src/file_operations.rs
use std::fs;
use std::path::Path;

pub fn open_file_dialog() -> Option<std::path::PathBuf> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        // Use Windows file dialog
        // Implementation would use windows-rs or similar
    }

    #[cfg(target_os = "macos")]
    {
        // Use macOS NSOpenPanel
        // Implementation would use cocoa or similar
    }

    #[cfg(target_os = "linux")]
    {
        // Use GTK file chooser or zenity
        let output = Command::new("zenity")
            .args(&["--file-selection"])
            .output()
            .ok()?;

        if output.status.success() {
            let path_str = String::from_utf8(output.stdout).ok()?;
            let path = path_str.trim();
            return Some(std::path::PathBuf::from(path));
        }
    }

    None
}

pub fn export_data(data: &str, filename: &str) -> Result<(), std::io::Error> {
    let path = Path::new(filename);
    fs::write(path, data)?;
    Ok(())
}
```

---

## Step 8: Build and Distribution

### Build Optimization

**Update Cargo.toml for release:**
```toml
[profile.release]
lto = true                # Link-time optimization
codegen-units = 1         # Better optimization
panic = "abort"           # Smaller binary size
strip = true              # Remove debug symbols
```

### Cross-compilation Setup

```bash
# Install cross-compilation targets
rustup target add x86_64-pc-windows-gnu    # Windows
rustup target add x86_64-apple-darwin      # macOS Intel
rustup target add aarch64-apple-darwin     # macOS Apple Silicon
rustup target add x86_64-unknown-linux-gnu # Linux

# Build for different targets
cargo build --release --target x86_64-pc-windows-gnu
cargo build --release --target x86_64-unknown-linux-gnu
```

### Packaging Script

```bash
#!/bin/bash
# build_all.sh

set -e

APP_NAME="rust_desktop_app"
VERSION="1.0.0"

# Clean previous builds
cargo clean

# Build for all targets
echo "Building for Windows..."
cargo build --release --target x86_64-pc-windows-gnu

echo "Building for Linux..."
cargo build --release --target x86_64-unknown-linux-gnu

echo "Building for macOS..."
cargo build --release --target x86_64-apple-darwin

# Create distribution packages
mkdir -p dist

# Windows
cp target/x86_64-pc-windows-gnu/release/${APP_NAME}.exe dist/
zip -r dist/${APP_NAME}-${VERSION}-windows.zip dist/${APP_NAME}.exe

# Linux
cp target/x86_64-unknown-linux-gnu/release/${APP_NAME} dist/${APP_NAME}-linux
tar -czf dist/${APP_NAME}-${VERSION}-linux.tar.gz -C dist ${APP_NAME}-linux

# macOS
cp target/x86_64-apple-darwin/release/${APP_NAME} dist/${APP_NAME}-macos
tar -czf dist/${APP_NAME}-${VERSION}-macos.tar.gz -C dist ${APP_NAME}-macos

echo "Build complete! Check the dist/ directory."
```

---

## Step 9: Testing and Quality Assurance

### Unit Testing

```rust
// src/lib.rs
pub mod todo;
pub mod persistence;

// src/todo.rs
#[derive(Debug, Clone, PartialEq)]
pub struct Todo {
    pub id: usize,
    pub text: String,
    pub completed: bool,
}

impl Todo {
    pub fn new(id: usize, text: String) -> Self {
        Self {
            id,
            text,
            completed: false,
        }
    }

    pub fn toggle(&mut self) {
        self.completed = !self.completed;
    }
}

pub struct TodoList {
    todos: Vec<Todo>,
    next_id: usize,
}

impl TodoList {
    pub fn new() -> Self {
        Self {
            todos: Vec::new(),
            next_id: 1,
        }
    }

    pub fn add(&mut self, text: String) -> usize {
        let id = self.next_id;
        self.todos.push(Todo::new(id, text));
        self.next_id += 1;
        id
    }

    pub fn remove(&mut self, id: usize) -> bool {
        if let Some(pos) = self.todos.iter().position(|todo| todo.id == id) {
            self.todos.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn toggle(&mut self, id: usize) -> bool {
        if let Some(todo) = self.todos.iter_mut().find(|todo| todo.id == id) {
            todo.toggle();
            true
        } else {
            false
        }
    }

    pub fn get_all(&self) -> &[Todo] {
        &self.todos
    }

    pub fn get_active(&self) -> Vec<&Todo> {
        self.todos.iter().filter(|todo| !todo.completed).collect()
    }

    pub fn get_completed(&self) -> Vec<&Todo> {
        self.todos.iter().filter(|todo| todo.completed).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_todo_creation() {
        let todo = Todo::new(1, "Test todo".to_string());
        assert_eq!(todo.id, 1);
        assert_eq!(todo.text, "Test todo");
        assert!(!todo.completed);
    }

    #[test]
    fn test_todo_toggle() {
        let mut todo = Todo::new(1, "Test todo".to_string());
        assert!(!todo.completed);

        todo.toggle();
        assert!(todo.completed);

        todo.toggle();
        assert!(!todo.completed);
    }

    #[test]
    fn test_todo_list_operations() {
        let mut list = TodoList::new();

        // Test adding
        let id1 = list.add("First todo".to_string());
        let id2 = list.add("Second todo".to_string());

        assert_eq!(list.get_all().len(), 2);
        assert_eq!(list.get_active().len(), 2);
        assert_eq!(list.get_completed().len(), 0);

        // Test toggling
        assert!(list.toggle(id1));
        assert_eq!(list.get_active().len(), 1);
        assert_eq!(list.get_completed().len(), 1);

        // Test removing
        assert!(list.remove(id2));
        assert_eq!(list.get_all().len(), 1);

        // Test invalid operations
        assert!(!list.toggle(999));
        assert!(!list.remove(999));
    }
}
```

**Run tests:**
```bash
cargo test
```

### Integration Testing

```rust
// tests/integration_test.rs
use rust_desktop_app::todo::TodoList;
use rust_desktop_app::persistence::{save_app_data, load_app_data, AppData};

#[test]
fn test_persistence_round_trip() {
    let mut original_data = AppData::default();

    // Add some test data
    // ... populate original_data

    // Save and load
    save_app_data(&original_data).expect("Failed to save data");
    let loaded_data = load_app_data().expect("Failed to load data");

    // Verify data integrity
    assert_eq!(original_data.todos.len(), loaded_data.todos.len());
    // ... more assertions
}
```

---

## Step 10: Performance and Best Practices

### Performance Optimization

**Profiling:**
```bash
# Install profiling tools
cargo install flamegraph
cargo install cargo-profdata

# Generate performance profiles
cargo flamegraph --bin rust_desktop_app
```

**Memory Management:**
```rust
// Use Arc and Rc for shared ownership
use std::rc::Rc;
use std::sync::Arc;

// Avoid unnecessary clones
fn process_todos(todos: &[Todo]) -> usize {
    todos.iter().filter(|todo| !todo.completed).count()
}

// Use string references when possible
fn display_todo(todo: &Todo) -> String {
    format!("{}: {}", todo.id, &todo.text)
}
```

**Async Operations:**
```rust
// For I/O operations
async fn save_data_async(data: &AppData) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(data)?;
    tokio::fs::write("app_data.json", json).await?;
    Ok(())
}

// Background tasks
async fn background_sync() {
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
        // Perform background sync
        println!("Background sync completed");
    }
}
```

---

## Summary

This tutorial covered:

1. **Rust Setup**: Installing Rust and development environment
2. **Language Basics**: Core Rust concepts for desktop development
3. **GUI Frameworks**: Comparison and implementation with egui and iced
4. **File Operations**: Persistence and data management
5. **System Integration**: System tray and cross-platform features
6. **Build and Distribution**: Optimization and cross-compilation
7. **Testing**: Unit tests and integration tests
8. **Performance**: Optimization techniques and best practices

You now have the knowledge to build robust, cross-platform desktop applications with Rust, from simple utilities to complex applications with modern UI frameworks.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).