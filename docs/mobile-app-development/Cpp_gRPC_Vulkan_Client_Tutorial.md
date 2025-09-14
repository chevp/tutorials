# C++ gRPC Vulkan Client Tutorial

This tutorial demonstrates how to create a high-performance C++ client that combines gRPC networking with Vulkan graphics rendering, ideal for real-time applications like games, simulations, or visualization tools.

---

## Prerequisites

- **C++ Compiler** with C++17 support
- **CMake** 3.18+
- **Vulkan SDK** installed
- **gRPC** and **Protocol Buffers** installed
- **GLFW** or similar windowing library
- Completed [C++ gRPC Tutorial](../platforms-and-frameworks/Cpp_gRPC_Tutorial.md)
- Completed [Vulkan Android Setup Tutorial](./Vulkan_Android_Setup_Tutorial.md)

---

## Step 1: Project Setup

### Create Project Structure

```
cpp-grpc-vulkan-client/
├── CMakeLists.txt
├── src/
│   ├── main.cpp
│   ├── grpc_client.h
│   ├── grpc_client.cpp
│   ├── vulkan_renderer.h
│   ├── vulkan_renderer.cpp
│   ├── application.h
│   └── application.cpp
├── protos/
│   └── graphics_service.proto
├── shaders/
│   ├── vertex.vert
│   └── fragment.frag
└── assets/
    └── models/
```

### Configure CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.18)
project(GrpcVulkanClient)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(PkgConfig REQUIRED)
find_package(Vulkan REQUIRED)
find_package(glfw3 REQUIRED)

# gRPC and Protobuf
find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED)

# Include directories
include_directories(
    ${Vulkan_INCLUDE_DIRS}
    ${CMAKE_CURRENT_BINARY_DIR}
    src/
)

# Generate protobuf files
set(PROTO_FILES protos/graphics_service.proto)

protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ${PROTO_FILES})
grpc_generate_cpp(GRPC_SRCS GRPC_HDRS ${CMAKE_CURRENT_BINARY_DIR} ${PROTO_FILES})

# Source files
set(SOURCES
    src/main.cpp
    src/grpc_client.cpp
    src/vulkan_renderer.cpp
    src/application.cpp
    ${PROTO_SRCS}
    ${GRPC_SRCS}
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Link libraries
target_link_libraries(${PROJECT_NAME}
    ${Vulkan_LIBRARIES}
    glfw
    gRPC::grpc++
    protobuf::libprotobuf
    pthread
    dl
)

# Compile shaders
find_program(GLSL_VALIDATOR glslangValidator HINTS ${Vulkan_GLSLANG_VALIDATOR_EXECUTABLE})

set(SHADER_DIR ${CMAKE_CURRENT_SOURCE_DIR}/shaders)
set(SHADER_BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/shaders)

file(MAKE_DIRECTORY ${SHADER_BINARY_DIR})

# Vertex shader
add_custom_command(
    OUTPUT ${SHADER_BINARY_DIR}/vert.spv
    COMMAND ${GLSL_VALIDATOR} -V ${SHADER_DIR}/vertex.vert -o ${SHADER_BINARY_DIR}/vert.spv
    DEPENDS ${SHADER_DIR}/vertex.vert
)

# Fragment shader
add_custom_command(
    OUTPUT ${SHADER_BINARY_DIR}/frag.spv
    COMMAND ${GLSL_VALIDATOR} -V ${SHADER_DIR}/fragment.frag -o ${SHADER_BINARY_DIR}/frag.spv
    DEPENDS ${SHADER_DIR}/fragment.frag
)

add_custom_target(shaders DEPENDS
    ${SHADER_BINARY_DIR}/vert.spv
    ${SHADER_BINARY_DIR}/frag.spv
)

add_dependencies(${PROJECT_NAME} shaders)
```

---

## Step 2: Define gRPC Service

### Create protos/graphics_service.proto

```proto
syntax = "proto3";

package graphics;

option cc_generic_services = false;

// Graphics rendering service
service GraphicsService {
  // Stream mesh data for real-time rendering
  rpc StreamMeshData (StreamRequest) returns (stream MeshData);

  // Get scene updates
  rpc GetSceneUpdate (SceneRequest) returns (SceneUpdate);

  // Send render statistics
  rpc SendRenderStats (RenderStats) returns (StatsResponse);
}

// Stream configuration
message StreamRequest {
  string client_id = 1;
  uint32 quality_level = 2;
  bool enable_textures = 3;
}

// Mesh data for rendering
message MeshData {
  string mesh_id = 1;
  repeated float vertices = 2;
  repeated uint32 indices = 3;
  repeated float normals = 4;
  repeated float tex_coords = 5;
  string texture_path = 6;
  Transform transform = 7;
}

// 3D transformation matrix
message Transform {
  repeated float matrix = 1; // 4x4 matrix in row-major order
}

// Scene update information
message SceneRequest {
  string scene_id = 1;
  uint64 last_update_timestamp = 2;
}

message SceneUpdate {
  repeated MeshData meshes = 1;
  repeated LightData lights = 2;
  CameraData camera = 3;
  uint64 timestamp = 4;
}

// Lighting information
message LightData {
  enum LightType {
    DIRECTIONAL = 0;
    POINT = 1;
    SPOT = 2;
  }

  LightType type = 1;
  repeated float position = 2;
  repeated float direction = 3;
  repeated float color = 4;
  float intensity = 5;
}

// Camera information
message CameraData {
  repeated float position = 1;
  repeated float target = 2;
  repeated float up = 3;
  float fov = 4;
  float near_plane = 5;
  float far_plane = 6;
}

// Performance statistics
message RenderStats {
  string client_id = 1;
  uint32 fps = 2;
  uint32 triangles_rendered = 3;
  uint32 draw_calls = 4;
  float frame_time_ms = 5;
  uint64 memory_usage_bytes = 6;
}

message StatsResponse {
  bool success = 1;
  string message = 2;
}
```

---

## Step 3: Implement gRPC Client

### Create src/grpc_client.h

```cpp
#ifndef GRPC_CLIENT_H
#define GRPC_CLIENT_H

#include <grpcpp/grpcpp.h>
#include <memory>
#include <functional>
#include <thread>
#include <atomic>
#include <queue>
#include <mutex>
#include "graphics_service.grpc.pb.h"

struct MeshDataCallback {
    std::function<void(const graphics::MeshData&)> callback;
};

struct SceneUpdateCallback {
    std::function<void(const graphics::SceneUpdate&)> callback;
};

class GraphicsGrpcClient {
public:
    explicit GraphicsGrpcClient(const std::string& server_address);
    ~GraphicsGrpcClient();

    // Connection management
    bool Connect();
    void Disconnect();
    bool IsConnected() const;

    // Streaming operations
    void StartMeshDataStream(const std::string& client_id,
                            uint32_t quality_level,
                            bool enable_textures,
                            MeshDataCallback callback);
    void StopMeshDataStream();

    // Scene operations
    void RequestSceneUpdate(const std::string& scene_id,
                           uint64_t last_timestamp,
                           SceneUpdateCallback callback);

    // Statistics
    void SendRenderStats(const std::string& client_id,
                        uint32_t fps,
                        uint32_t triangles,
                        uint32_t draw_calls,
                        float frame_time,
                        uint64_t memory_usage);

private:
    std::unique_ptr<graphics::GraphicsService::Stub> stub_;
    std::shared_ptr<grpc::Channel> channel_;
    std::atomic<bool> connected_;
    std::atomic<bool> streaming_;

    std::unique_ptr<std::thread> stream_thread_;
    std::mutex callback_mutex_;

    void StreamMeshDataInternal(const graphics::StreamRequest& request,
                               MeshDataCallback callback);
};

#endif // GRPC_CLIENT_H
```

### Create src/grpc_client.cpp

```cpp
#include "grpc_client.h"
#include <iostream>
#include <chrono>

GraphicsGrpcClient::GraphicsGrpcClient(const std::string& server_address)
    : connected_(false), streaming_(false) {

    grpc::ChannelArguments args;
    args.SetInt(GRPC_ARG_KEEPALIVE_TIME_MS, 30000);
    args.SetInt(GRPC_ARG_KEEPALIVE_TIMEOUT_MS, 5000);
    args.SetInt(GRPC_ARG_HTTP2_MAX_PINGS_WITHOUT_DATA, 0);
    args.SetInt(GRPC_ARG_HTTP2_MIN_RECV_PING_INTERVAL_WITHOUT_DATA_MS, 300000);
    args.SetInt(GRPC_ARG_HTTP2_MIN_SENT_PING_INTERVAL_WITHOUT_DATA_MS, 60000);

    channel_ = grpc::CreateCustomChannel(
        server_address,
        grpc::InsecureChannelCredentials(),
        args
    );

    stub_ = graphics::GraphicsService::NewStub(channel_);
}

GraphicsGrpcClient::~GraphicsGrpcClient() {
    Disconnect();
}

bool GraphicsGrpcClient::Connect() {
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(5);

    if (channel_->WaitForConnected(deadline)) {
        connected_ = true;
        std::cout << "Connected to graphics server" << std::endl;
        return true;
    } else {
        std::cerr << "Failed to connect to graphics server" << std::endl;
        return false;
    }
}

void GraphicsGrpcClient::Disconnect() {
    connected_ = false;
    StopMeshDataStream();
}

bool GraphicsGrpcClient::IsConnected() const {
    return connected_.load() &&
           channel_->GetState(false) == GRPC_CHANNEL_READY;
}

void GraphicsGrpcClient::StartMeshDataStream(
    const std::string& client_id,
    uint32_t quality_level,
    bool enable_textures,
    MeshDataCallback callback) {

    if (!IsConnected()) {
        std::cerr << "Not connected to server" << std::endl;
        return;
    }

    graphics::StreamRequest request;
    request.set_client_id(client_id);
    request.set_quality_level(quality_level);
    request.set_enable_textures(enable_textures);

    streaming_ = true;
    stream_thread_ = std::make_unique<std::thread>(
        &GraphicsGrpcClient::StreamMeshDataInternal,
        this, request, callback
    );
}

void GraphicsGrpcClient::StopMeshDataStream() {
    streaming_ = false;
    if (stream_thread_ && stream_thread_->joinable()) {
        stream_thread_->join();
    }
}

void GraphicsGrpcClient::StreamMeshDataInternal(
    const graphics::StreamRequest& request,
    MeshDataCallback callback) {

    grpc::ClientContext context;

    std::unique_ptr<grpc::ClientReader<graphics::MeshData>> reader(
        stub_->StreamMeshData(&context, request)
    );

    graphics::MeshData mesh_data;
    while (streaming_ && reader->Read(&mesh_data)) {
        std::lock_guard<std::mutex> lock(callback_mutex_);
        callback.callback(mesh_data);
    }

    grpc::Status status = reader->Finish();
    if (!status.ok()) {
        std::cerr << "Mesh data stream error: " << status.error_message() << std::endl;
    }
}

void GraphicsGrpcClient::RequestSceneUpdate(
    const std::string& scene_id,
    uint64_t last_timestamp,
    SceneUpdateCallback callback) {

    if (!IsConnected()) {
        return;
    }

    graphics::SceneRequest request;
    request.set_scene_id(scene_id);
    request.set_last_update_timestamp(last_timestamp);

    graphics::SceneUpdate response;
    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(10);
    context.set_deadline(deadline);

    grpc::Status status = stub_->GetSceneUpdate(&context, request, &response);

    if (status.ok()) {
        callback.callback(response);
    } else {
        std::cerr << "Scene update failed: " << status.error_message() << std::endl;
    }
}

void GraphicsGrpcClient::SendRenderStats(
    const std::string& client_id,
    uint32_t fps,
    uint32_t triangles,
    uint32_t draw_calls,
    float frame_time,
    uint64_t memory_usage) {

    if (!IsConnected()) {
        return;
    }

    graphics::RenderStats stats;
    stats.set_client_id(client_id);
    stats.set_fps(fps);
    stats.set_triangles_rendered(triangles);
    stats.set_draw_calls(draw_calls);
    stats.set_frame_time_ms(frame_time);
    stats.set_memory_usage_bytes(memory_usage);

    graphics::StatsResponse response;
    grpc::ClientContext context;
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(5);
    context.set_deadline(deadline);

    grpc::Status status = stub_->SendRenderStats(&context, stats, &response);

    if (!status.ok()) {
        std::cerr << "Failed to send render stats: " << status.error_message() << std::endl;
    }
}
```

---

## Step 4: Implement Vulkan Renderer

### Create src/vulkan_renderer.h

```cpp
#ifndef VULKAN_RENDERER_H
#define VULKAN_RENDERER_H

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>
#include <vulkan/vulkan.h>

#include <vector>
#include <optional>
#include <memory>
#include <unordered_map>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

struct Vertex {
    glm::vec3 pos;
    glm::vec3 normal;
    glm::vec2 texCoord;
};

struct UniformBufferObject {
    alignas(16) glm::mat4 model;
    alignas(16) glm::mat4 view;
    alignas(16) glm::mat4 proj;
};

struct MeshObject {
    std::string id;
    std::vector<Vertex> vertices;
    std::vector<uint32_t> indices;
    glm::mat4 transform;

    VkBuffer vertex_buffer;
    VkDeviceMemory vertex_buffer_memory;
    VkBuffer index_buffer;
    VkDeviceMemory index_buffer_memory;
};

class VulkanRenderer {
public:
    VulkanRenderer();
    ~VulkanRenderer();

    bool Initialize(GLFWwindow* window);
    void Cleanup();

    bool Render();
    void UpdateMesh(const std::string& mesh_id,
                   const std::vector<float>& vertices,
                   const std::vector<uint32_t>& indices,
                   const std::vector<float>& normals,
                   const std::vector<float>& tex_coords,
                   const glm::mat4& transform);

    void UpdateCamera(const glm::vec3& position,
                     const glm::vec3& target,
                     const glm::vec3& up);

    // Performance metrics
    uint32_t GetFPS() const { return fps_; }
    uint32_t GetTrianglesRendered() const { return triangles_rendered_; }
    uint32_t GetDrawCalls() const { return draw_calls_; }
    float GetFrameTimeMs() const { return frame_time_ms_; }
    uint64_t GetMemoryUsage() const { return memory_usage_; }

private:
    struct QueueFamilyIndices {
        std::optional<uint32_t> graphics_family;
        std::optional<uint32_t> present_family;

        bool IsComplete() {
            return graphics_family.has_value() && present_family.has_value();
        }
    };

    struct SwapChainSupportDetails {
        VkSurfaceCapabilitiesKHR capabilities;
        std::vector<VkSurfaceFormatKHR> formats;
        std::vector<VkPresentModeKHR> present_modes;
    };

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
    VkFormat swapchain_image_format_;
    VkExtent2D swapchain_extent_;
    std::vector<VkFramebuffer> swapchain_framebuffers_;

    VkRenderPass render_pass_;
    VkDescriptorSetLayout descriptor_set_layout_;
    VkPipelineLayout pipeline_layout_;
    VkPipeline graphics_pipeline_;

    VkCommandPool command_pool_;
    std::vector<VkCommandBuffer> command_buffers_;

    std::vector<VkSemaphore> image_available_semaphores_;
    std::vector<VkSemaphore> render_finished_semaphores_;
    std::vector<VkFence> in_flight_fences_;

    VkBuffer uniform_buffer_;
    VkDeviceMemory uniform_buffer_memory_;
    VkDescriptorPool descriptor_pool_;
    VkDescriptorSet descriptor_set_;

    // Mesh storage
    std::unordered_map<std::string, MeshObject> meshes_;

    // Camera
    glm::vec3 camera_pos_;
    glm::vec3 camera_target_;
    glm::vec3 camera_up_;

    // Performance tracking
    uint32_t fps_;
    uint32_t triangles_rendered_;
    uint32_t draw_calls_;
    float frame_time_ms_;
    uint64_t memory_usage_;
    std::chrono::high_resolution_clock::time_point last_frame_time_;

    static const int MAX_FRAMES_IN_FLIGHT = 2;
    size_t current_frame_;

    // Initialization methods
    bool CreateInstance();
    bool SetupDebugCallback();
    bool CreateSurface(GLFWwindow* window);
    bool PickPhysicalDevice();
    bool CreateLogicalDevice();
    bool CreateSwapChain();
    bool CreateImageViews();
    bool CreateRenderPass();
    bool CreateDescriptorSetLayout();
    bool CreateGraphicsPipeline();
    bool CreateFramebuffers();
    bool CreateCommandPool();
    bool CreateUniformBuffer();
    bool CreateDescriptorPool();
    bool CreateDescriptorSet();
    bool CreateCommandBuffers();
    bool CreateSyncObjects();

    // Helper methods
    QueueFamilyIndices FindQueueFamilies(VkPhysicalDevice device);
    SwapChainSupportDetails QuerySwapChainSupport(VkPhysicalDevice device);
    bool IsDeviceSuitable(VkPhysicalDevice device);
    VkSurfaceFormatKHR ChooseSwapSurfaceFormat(const std::vector<VkSurfaceFormatKHR>& formats);
    VkPresentModeKHR ChooseSwapPresentMode(const std::vector<VkPresentModeKHR>& modes);
    VkExtent2D ChooseSwapExtent(const VkSurfaceCapabilitiesKHR& capabilities);

    std::vector<char> ReadFile(const std::string& filename);
    VkShaderModule CreateShaderModule(const std::vector<char>& code);

    bool CreateBuffer(VkDeviceSize size, VkBufferUsageFlags usage,
                     VkMemoryPropertyFlags properties, VkBuffer& buffer,
                     VkDeviceMemory& buffer_memory);
    uint32_t FindMemoryType(uint32_t type_filter, VkMemoryPropertyFlags properties);

    void UpdateUniformBuffer();
    void RecordCommandBuffer(VkCommandBuffer command_buffer, uint32_t image_index);

    void UpdatePerformanceMetrics();
};

#endif // VULKAN_RENDERER_H
```

---

## Step 5: Implement Application Class

### Create src/application.h

```cpp
#ifndef APPLICATION_H
#define APPLICATION_H

#include <GLFW/glfw3.h>
#include <memory>
#include <string>
#include <chrono>

#include "grpc_client.h"
#include "vulkan_renderer.h"
#include "graphics_service.pb.h"

class Application {
public:
    Application();
    ~Application();

    bool Initialize(const std::string& server_address);
    void Run();
    void Shutdown();

private:
    GLFWwindow* window_;
    std::unique_ptr<GraphicsGrpcClient> grpc_client_;
    std::unique_ptr<VulkanRenderer> renderer_;

    bool running_;
    std::string client_id_;
    std::chrono::steady_clock::time_point stats_timer_;

    // Window settings
    static const uint32_t WINDOW_WIDTH = 1280;
    static const uint32_t WINDOW_HEIGHT = 720;

    // Event handlers
    void OnMeshDataReceived(const graphics::MeshData& mesh_data);
    void OnSceneUpdateReceived(const graphics::SceneUpdate& scene_update);

    // Initialization methods
    bool InitializeWindow();
    bool InitializeRenderer();
    bool InitializeGrpcClient(const std::string& server_address);

    // Main loop methods
    void ProcessInput();
    void Update();
    void Render();
    void SendPerformanceStats();

    // Static callbacks for GLFW
    static void FramebufferResizeCallback(GLFWwindow* window, int width, int height);
    static void KeyCallback(GLFWwindow* window, int key, int scancode, int action, int mods);
};

#endif // APPLICATION_H
```

### Create src/application.cpp

```cpp
#include "application.h"
#include <iostream>
#include <random>

Application::Application()
    : window_(nullptr)
    , running_(false) {

    // Generate unique client ID
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1000, 9999);
    client_id_ = "client_" + std::to_string(dis(gen));
}

Application::~Application() {
    Shutdown();
}

bool Application::Initialize(const std::string& server_address) {
    std::cout << "Initializing application..." << std::endl;

    if (!InitializeWindow()) {
        std::cerr << "Failed to initialize window" << std::endl;
        return false;
    }

    if (!InitializeRenderer()) {
        std::cerr << "Failed to initialize renderer" << std::endl;
        return false;
    }

    if (!InitializeGrpcClient(server_address)) {
        std::cerr << "Failed to initialize gRPC client" << std::endl;
        return false;
    }

    running_ = true;
    stats_timer_ = std::chrono::steady_clock::now();

    std::cout << "Application initialized successfully" << std::endl;
    std::cout << "Client ID: " << client_id_ << std::endl;

    return true;
}

bool Application::InitializeWindow() {
    glfwInit();
    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

    window_ = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT,
                               "gRPC Vulkan Client", nullptr, nullptr);

    if (!window_) {
        std::cerr << "Failed to create GLFW window" << std::endl;
        return false;
    }

    glfwSetWindowUserPointer(window_, this);
    glfwSetFramebufferSizeCallback(window_, FramebufferResizeCallback);
    glfwSetKeyCallback(window_, KeyCallback);

    return true;
}

bool Application::InitializeRenderer() {
    renderer_ = std::make_unique<VulkanRenderer>();
    return renderer_->Initialize(window_);
}

bool Application::InitializeGrpcClient(const std::string& server_address) {
    grpc_client_ = std::make_unique<GraphicsGrpcClient>(server_address);

    if (!grpc_client_->Connect()) {
        return false;
    }

    // Start mesh data stream
    MeshDataCallback mesh_callback;
    mesh_callback.callback = [this](const graphics::MeshData& data) {
        OnMeshDataReceived(data);
    };

    grpc_client_->StartMeshDataStream(client_id_, 1, true, mesh_callback);

    return true;
}

void Application::Run() {
    std::cout << "Starting main loop..." << std::endl;

    while (running_ && !glfwWindowShouldClose(window_)) {
        ProcessInput();
        Update();
        Render();

        // Send performance stats every 5 seconds
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(
            now - stats_timer_).count();

        if (elapsed >= 5) {
            SendPerformanceStats();
            stats_timer_ = now;
        }

        glfwPollEvents();
    }
}

void Application::ProcessInput() {
    if (glfwGetKey(window_, GLFW_KEY_ESCAPE) == GLFW_PRESS) {
        running_ = false;
    }

    // Camera controls
    static glm::vec3 camera_pos(2.0f, 2.0f, 2.0f);
    static glm::vec3 camera_target(0.0f, 0.0f, 0.0f);
    static glm::vec3 camera_up(0.0f, 0.0f, 1.0f);

    bool camera_moved = false;
    const float speed = 0.1f;

    if (glfwGetKey(window_, GLFW_KEY_W) == GLFW_PRESS) {
        camera_pos += speed * glm::normalize(camera_target - camera_pos);
        camera_moved = true;
    }
    if (glfwGetKey(window_, GLFW_KEY_S) == GLFW_PRESS) {
        camera_pos -= speed * glm::normalize(camera_target - camera_pos);
        camera_moved = true;
    }
    if (glfwGetKey(window_, GLFW_KEY_A) == GLFW_PRESS) {
        camera_pos -= glm::normalize(glm::cross(camera_target - camera_pos, camera_up)) * speed;
        camera_moved = true;
    }
    if (glfwGetKey(window_, GLFW_KEY_D) == GLFW_PRESS) {
        camera_pos += glm::normalize(glm::cross(camera_target - camera_pos, camera_up)) * speed;
        camera_moved = true;
    }

    if (camera_moved) {
        renderer_->UpdateCamera(camera_pos, camera_target, camera_up);
    }
}

void Application::Update() {
    // Request scene updates periodically
    static auto last_scene_request = std::chrono::steady_clock::now();
    auto now = std::chrono::steady_clock::now();

    if (std::chrono::duration_cast<std::chrono::milliseconds>(
            now - last_scene_request).count() > 100) { // 10 Hz

        SceneUpdateCallback callback;
        callback.callback = [this](const graphics::SceneUpdate& update) {
            OnSceneUpdateReceived(update);
        };

        grpc_client_->RequestSceneUpdate("main_scene", 0, callback);
        last_scene_request = now;
    }
}

void Application::Render() {
    renderer_->Render();
}

void Application::OnMeshDataReceived(const graphics::MeshData& mesh_data) {
    std::cout << "Received mesh data: " << mesh_data.mesh_id() << std::endl;

    // Convert gRPC data to renderer format
    std::vector<float> vertices(mesh_data.vertices().begin(),
                               mesh_data.vertices().end());
    std::vector<uint32_t> indices(mesh_data.indices().begin(),
                                 mesh_data.indices().end());
    std::vector<float> normals(mesh_data.normals().begin(),
                              mesh_data.normals().end());
    std::vector<float> tex_coords(mesh_data.tex_coords().begin(),
                                 mesh_data.tex_coords().end());

    // Convert transform matrix
    glm::mat4 transform(1.0f);
    if (mesh_data.transform().matrix_size() == 16) {
        for (int i = 0; i < 16; i++) {
            transform[i / 4][i % 4] = mesh_data.transform().matrix(i);
        }
    }

    renderer_->UpdateMesh(mesh_data.mesh_id(), vertices, indices,
                         normals, tex_coords, transform);
}

void Application::OnSceneUpdateReceived(const graphics::SceneUpdate& scene_update) {
    // Process meshes
    for (const auto& mesh : scene_update.meshes()) {
        OnMeshDataReceived(mesh);
    }

    // Update camera if provided
    if (scene_update.has_camera()) {
        const auto& camera = scene_update.camera();
        if (camera.position_size() == 3 &&
            camera.target_size() == 3 &&
            camera.up_size() == 3) {

            glm::vec3 pos(camera.position(0), camera.position(1), camera.position(2));
            glm::vec3 target(camera.target(0), camera.target(1), camera.target(2));
            glm::vec3 up(camera.up(0), camera.up(1), camera.up(2));

            renderer_->UpdateCamera(pos, target, up);
        }
    }
}

void Application::SendPerformanceStats() {
    if (!grpc_client_->IsConnected()) {
        return;
    }

    grpc_client_->SendRenderStats(
        client_id_,
        renderer_->GetFPS(),
        renderer_->GetTrianglesRendered(),
        renderer_->GetDrawCalls(),
        renderer_->GetFrameTimeMs(),
        renderer_->GetMemoryUsage()
    );

    std::cout << "Sent performance stats - FPS: " << renderer_->GetFPS()
              << ", Triangles: " << renderer_->GetTrianglesRendered() << std::endl;
}

void Application::Shutdown() {
    running_ = false;

    if (grpc_client_) {
        grpc_client_->Disconnect();
    }

    if (renderer_) {
        renderer_->Cleanup();
    }

    if (window_) {
        glfwDestroyWindow(window_);
        glfwTerminate();
    }

    std::cout << "Application shutdown complete" << std::endl;
}

void Application::FramebufferResizeCallback(GLFWwindow* window, int width, int height) {
    // Handle window resize
}

void Application::KeyCallback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    Application* app = static_cast<Application*>(glfwGetWindowUserPointer(window));

    if (key == GLFW_KEY_R && action == GLFW_PRESS) {
        // Request scene refresh
        std::cout << "Requesting scene refresh..." << std::endl;
    }
}
```

---

## Step 6: Create Main Application

### Create src/main.cpp

```cpp
#include <iostream>
#include <string>
#include "application.h"

int main(int argc, char** argv) {
    std::string server_address = "localhost:50051";

    if (argc > 1) {
        server_address = argv[1];
    }

    std::cout << "gRPC Vulkan Client" << std::endl;
    std::cout << "Connecting to server: " << server_address << std::endl;

    Application app;

    if (!app.Initialize(server_address)) {
        std::cerr << "Failed to initialize application" << std::endl;
        return -1;
    }

    try {
        app.Run();
    } catch (const std::exception& e) {
        std::cerr << "Application error: " << e.what() << std::endl;
        return -1;
    }

    return 0;
}
```

---

## Step 7: Create Shaders

### Create shaders/vertex.vert

```glsl
#version 450

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
} ubo;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inTexCoord;

layout(location = 0) out vec3 fragPos;
layout(location = 1) out vec3 fragNormal;
layout(location = 2) out vec2 fragTexCoord;

void main() {
    vec4 worldPos = ubo.model * vec4(inPosition, 1.0);
    fragPos = worldPos.xyz;
    fragNormal = mat3(transpose(inverse(ubo.model))) * inNormal;
    fragTexCoord = inTexCoord;

    gl_Position = ubo.proj * ubo.view * worldPos;
}
```

### Create shaders/fragment.frag

```glsl
#version 450

layout(location = 0) in vec3 fragPos;
layout(location = 1) in vec3 fragNormal;
layout(location = 2) in vec2 fragTexCoord;

layout(location = 0) out vec4 outColor;

void main() {
    // Simple lighting calculation
    vec3 lightPos = vec3(2.0, 2.0, 2.0);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec3 norm = normalize(fragNormal);
    vec3 lightDir = normalize(lightPos - fragPos);

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    vec3 ambient = 0.1 * lightColor;
    vec3 result = ambient + diffuse;

    // Use texture coordinates for color variation
    vec3 baseColor = vec3(fragTexCoord.x, fragTexCoord.y, 1.0);

    outColor = vec4(result * baseColor, 1.0);
}
```

---

## Step 8: Build and Test

### Build the Project

```bash
mkdir build
cd build
cmake ..
make -j$(nproc)
```

### Run the Client

```bash
# Start the client (assumes gRPC server is running)
./GrpcVulkanClient localhost:50051
```

---

## Summary

This tutorial covered:

1. Setting up C++ project with gRPC and Vulkan integration
2. Defining gRPC service for graphics data streaming
3. Implementing high-performance gRPC client
4. Creating Vulkan renderer with real-time mesh updates
5. Building complete application with networking and graphics
6. Performance monitoring and statistics reporting

The resulting client can receive mesh data, scene updates, and other graphics information from a gRPC server while rendering everything using Vulkan for maximum performance.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).