
# CMake with C++ Tutorial

CMake is an open-source build system generator that helps manage the compilation process of projects that use C and C++. CMake simplifies the process of configuring, compiling, and linking C++ projects, especially across different platforms.

---

## Prerequisites

1. **C++ Compiler**: Ensure a modern C++ compiler (e.g., GCC, Clang, or MSVC) is installed on your system.
2. **CMake**: Verify that CMake is installed.

   ```bash
   cmake --version
   ```

   If not installed, you can download it from the [CMake website](https://cmake.org/download/).

---

## 1. Setting Up a Basic Project

Create a directory for your project and navigate into it:

```bash
mkdir CMakeProject
cd CMakeProject
```

### Step 1: Create a Simple C++ File

Create a main C++ file, `main.cpp`, in the project directory:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, CMake!" << std::endl;
    return 0;
}
```

### Step 2: Create a `CMakeLists.txt` File

Create a `CMakeLists.txt` file in the same directory to configure your build:

```cmake
cmake_minimum_required(VERSION 3.10)
project(CMakeProject)

# Specify C++ standard
set(CMAKE_CXX_STANDARD 11)

# Add executable
add_executable(CMakeProject main.cpp)
```

In this `CMakeLists.txt`:
- `project(CMakeProject)` names the project.
- `set(CMAKE_CXX_STANDARD 11)` specifies the C++ standard.
- `add_executable` creates an executable from `main.cpp`.

---

## 2. Building the Project

To build the project:

1. Create a `build` directory:

    ```bash
    mkdir build
    cd build
    ```

2. Run `cmake` to generate build files:

    ```bash
    cmake ..
    ```

3. Compile the project with:

    ```bash
    make
    ```

4. Run the executable:

    ```bash
    ./CMakeProject
    ```

You should see `Hello, CMake!` printed to the console.

---

## 3. Organizing Code with Multiple Source Files

As your project grows, you can separate code into different files.

### Example: Adding a New Source File

Create an additional file, `hello.cpp`, and its header file, `hello.h`.

#### `hello.h`

```cpp
#ifndef HELLO_H
#define HELLO_H

void sayHello();

#endif
```

#### `hello.cpp`

```cpp
#include <iostream>
#include "hello.h"

void sayHello() {
    std::cout << "Hello from a separate file!" << std::endl;
}
```

#### Update `main.cpp`

Update `main.cpp` to call `sayHello()`:

```cpp
#include "hello.h"

int main() {
    sayHello();
    return 0;
}
```

### Update `CMakeLists.txt`

Modify `CMakeLists.txt` to include the new source file:

```cmake
cmake_minimum_required(VERSION 3.10)
project(CMakeProject)

set(CMAKE_CXX_STANDARD 11)

# Add executable with multiple source files
add_executable(CMakeProject main.cpp hello.cpp)
```

Re-run the build steps in the `build` directory:

```bash
cmake ..
make
./CMakeProject
```

---

## 4. Adding Libraries

You can split complex projects into libraries.

### Step 1: Create a Library

Add a new file `mathlib.cpp` and a header `mathlib.h` to act as a library.

#### `mathlib.h`

```cpp
#ifndef MATHLIB_H
#define MATHLIB_H

int add(int a, int b);

#endif
```

#### `mathlib.cpp`

```cpp
#include "mathlib.h"

int add(int a, int b) {
    return a + b;
}
```

### Step 2: Update `CMakeLists.txt` to Create a Library

Modify `CMakeLists.txt` to build `mathlib` as a library:

```cmake
cmake_minimum_required(VERSION 3.10)
project(CMakeProject)

set(CMAKE_CXX_STANDARD 11)

# Add a library
add_library(mathlib mathlib.cpp)

# Link the library to the executable
add_executable(CMakeProject main.cpp hello.cpp)
target_link_libraries(CMakeProject mathlib)
```

### Step 3: Update `main.cpp` to Use the Library

Update `main.cpp` to use the `add` function:

```cpp
#include "hello.h"
#include "mathlib.h"
#include <iostream>

int main() {
    sayHello();
    int result = add(3, 5);
    std::cout << "3 + 5 = " << result << std::endl;
    return 0;
}
```

Rebuild and run:

```bash
cmake ..
make
./CMakeProject
```

---

## Summary

This tutorial introduced the basics of using CMake with C++:

1. Setting up a basic project with a `CMakeLists.txt` file.
2. Building and running the project.
3. Adding multiple source files to the project.
4. Creating and linking a custom library.

CMake provides powerful tools to organize, build, and manage complex C++ projects across different platforms.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
