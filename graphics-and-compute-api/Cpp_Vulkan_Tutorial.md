
# C++ Vulkan Tutorial

Vulkan is a low-level, cross-platform API for graphics and compute. It gives developers more control over the GPU and can achieve better performance in complex 3D applications. This tutorial provides a basic guide to setting up Vulkan in a C++ project.

---

## Prerequisites

1. **C++ Compiler**: Ensure you have a modern C++ compiler installed (C++11 or higher).
2. **Vulkan SDK**: Download and install the Vulkan SDK from [LunarG's Vulkan SDK website](https://vulkan.lunarg.com/).

### Setting Up the Development Environment

After installing the Vulkan SDK, set the `VULKAN_SDK` environment variable:

- **Linux**: Add to `.bashrc` or `.zshrc`:
    ```bash
    export VULKAN_SDK=/path/to/vulkan-sdk
    export PATH=$PATH:$VULKAN_SDK/bin
    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$VULKAN_SDK/lib
    ```

- **Windows**: The installer should set the `VULKAN_SDK` environment variable automatically.

Verify the installation by running:

```bash
vulkaninfo
```

---

## 1. Creating a New C++ Project

Create a directory for your project and initialize it:

```bash
mkdir VulkanApp
cd VulkanApp
```

### Create a `main.cpp` File

Create a `main.cpp` file in your project directory:

```cpp
#include <vulkan/vulkan.h>
#include <iostream>

int main() {
    VkInstance instance;
    VkApplicationInfo appInfo{};
    appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    appInfo.pApplicationName = "Vulkan App";
    appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.pEngineName = "No Engine";
    appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.apiVersion = VK_API_VERSION_1_0;

    VkInstanceCreateInfo createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    createInfo.pApplicationInfo = &appInfo;

    if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
        std::cerr << "Failed to create Vulkan instance!" << std::endl;
        return -1;
    }

    std::cout << "Vulkan instance created successfully." << std::endl;

    vkDestroyInstance(instance, nullptr);
    return 0;
}
```

This code sets up a basic Vulkan instance and checks for any initialization errors.

---

## 2. Compiling the Vulkan Project

To compile the project, create a `CMakeLists.txt` file to manage dependencies:

### Example `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.10)
project(VulkanApp)

find_package(Vulkan REQUIRED)

add_executable(VulkanApp main.cpp)
target_link_libraries(VulkanApp Vulkan::Vulkan)
```

### Building the Project

To compile the project using CMake:

```bash
mkdir build
cd build
cmake ..
make
```

This generates an executable named `VulkanApp` in the `build` directory.

---

## 3. Initializing a Vulkan Instance

The Vulkan instance is the connection between your application and the Vulkan library. The `VkApplicationInfo` structure defines application details, while `VkInstanceCreateInfo` is used to create the Vulkan instance.

### Basic Instance Creation

In `main.cpp`, add the following code to create an instance:

```cpp
VkApplicationInfo appInfo{};
appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName = "Vulkan App";
appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.pEngineName = "No Engine";
appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
appInfo.apiVersion = VK_API_VERSION_1_0;

VkInstanceCreateInfo createInfo{};
createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
createInfo.pApplicationInfo = &appInfo;

VkInstance instance;
if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
    throw std::runtime_error("Failed to create instance!");
}
```

### Destroying the Instance

After creating an instance, ensure it is destroyed before exiting:

```cpp
vkDestroyInstance(instance, nullptr);
```

---

## 4. Checking for Extensions

Extensions provide additional functionality to Vulkan. Query available extensions as follows:

```cpp
uint32_t extensionCount = 0;
vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, nullptr);
std::vector<VkExtensionProperties> extensions(extensionCount);
vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, extensions.data());

std::cout << "Available extensions:" << std::endl;
for (const auto& extension : extensions) {
    std::cout << "	" << extension.extensionName << std::endl;
}
```

This code lists all extensions supported by your Vulkan implementation.

---

## 5. Physical Device Selection

Selecting a physical device (GPU) is essential to leverage Vulkan’s capabilities.

```cpp
uint32_t deviceCount = 0;
vkEnumeratePhysicalDevices(instance, &deviceCount, nullptr);
if (deviceCount == 0) {
    throw std::runtime_error("Failed to find GPUs with Vulkan support!");
}

std::vector<VkPhysicalDevice> devices(deviceCount);
vkEnumeratePhysicalDevices(instance, &deviceCount, devices.data());

for (const auto& device : devices) {
    VkPhysicalDeviceProperties deviceProperties;
    vkGetPhysicalDeviceProperties(device, &deviceProperties);
    std::cout << "Device: " << deviceProperties.deviceName << std::endl;
}
```

This code finds all Vulkan-compatible GPUs and displays their names.

---

## 6. Cleanup

Ensure resources are cleaned up properly:

```cpp
vkDestroyInstance(instance, nullptr);
```

---

## Summary

This tutorial introduced the basics of setting up Vulkan in C++:

1. Installing Vulkan SDK and setting up the development environment.
2. Initializing a Vulkan instance.
3. Querying for available extensions.
4. Selecting a physical device.

Vulkan requires meticulous setup but provides extensive control over the GPU, making it ideal for high-performance applications. Explore more Vulkan functions to expand your graphics programming skills.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
