
# C++ gRPC Integration Tutorial

gRPC (Google Remote Procedure Call) is a high-performance RPC framework that uses HTTP/2, Protocol Buffers, and provides support for multiple languages, including C++. This tutorial covers setting up a basic gRPC server and client in C++.

---

## Prerequisites

1. **C++ Compiler**: Ensure you have a C++ compiler installed.
2. **gRPC and Protocol Buffers**: Install gRPC and Protocol Buffers.

### Installing gRPC and Protobuf

Follow these steps to install gRPC and Protocol Buffers.

#### Step 1: Clone the gRPC Repository

```bash
git clone --recurse-submodules -b v1.40.0 https://github.com/grpc/grpc
cd grpc
```

#### Step 2: Install Protocol Buffers

```bash
cd third_party/protobuf
mkdir -p cmake/build
cd cmake/build
cmake -Dprotobuf_BUILD_TESTS=OFF ..
make -j 4
sudo make install
```

#### Step 3: Build and Install gRPC

```bash
cd ../../..  # Go back to the gRPC root directory
mkdir -p cmake/build
cd cmake/build
cmake -DgRPC_INSTALL=ON -DgRPC_BUILD_TESTS=OFF ..
make -j 4
sudo make install
```

Once installed, verify by running:

```bash
protoc --version
```

---

## 1. Defining the gRPC Service in `.proto`

Create a new directory for your project, and inside it, create a `protos` folder with a `greet.proto` file:

```proto
syntax = "proto3";

option cpp_namespace = "grpc_example";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

This file defines a `Greeter` service with a `SayHello` RPC method.

---

## 2. Generating C++ Code from the `.proto` File

Run the following command to generate the necessary gRPC and protobuf classes:

```bash
protoc -I=protos --grpc_out=. --plugin=protoc-gen-grpc=`which grpc_cpp_plugin` protos/greet.proto
protoc -I=protos --cpp_out=. protos/greet.proto
```

This generates `greet.pb.h`, `greet.pb.cc`, `greet.grpc.pb.h`, and `greet.grpc.pb.cc` files.

---

## 3. Implementing the gRPC Server

Create a `server.cpp` file to implement the server-side logic:

```cpp
#include <iostream>
#include <memory>
#include <string>

#include <grpcpp/grpcpp.h>
#include "greet.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;
using grpc_example::Greeter;
using grpc_example::HelloReply;
using grpc_example::HelloRequest;

class GreeterServiceImpl final : public Greeter::Service {
    Status SayHello(ServerContext* context, const HelloRequest* request, HelloReply* reply) override {
        std::string prefix("Hello, ");
        reply->set_message(prefix + request->name());
        return Status::OK;
    }
};

void RunServer() {
    std::string server_address("0.0.0.0:50051");
    GreeterServiceImpl service;

    ServerBuilder builder;
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    builder.RegisterService(&service);

    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "Server listening on " << server_address << std::endl;
    server->Wait();
}

int main(int argc, char** argv) {
    RunServer();
    return 0;
}
```

Compile the server:

```bash
g++ -std=c++11 server.cpp greet.pb.cc greet.grpc.pb.cc -o server `pkg-config --cflags --libs grpc++ protobuf`
```

---

## 4. Implementing the gRPC Client

Create a `client.cpp` file to implement the client-side logic:

```cpp
#include <iostream>
#include <memory>
#include <string>

#include <grpcpp/grpcpp.h>
#include "greet.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;
using grpc_example::Greeter;
using grpc_example::HelloReply;
using grpc_example::HelloRequest;

class GreeterClient {
public:
    GreeterClient(std::shared_ptr<Channel> channel)
        : stub_(Greeter::NewStub(channel)) {}

    std::string SayHello(const std::string& user) {
        HelloRequest request;
        request.set_name(user);

        HelloReply reply;
        ClientContext context;

        Status status = stub_->SayHello(&context, request, &reply);

        if (status.ok()) {
            return reply.message();
        } else {
            std::cerr << "gRPC call failed." << std::endl;
            return "RPC failed";
        }
    }

private:
    std::unique_ptr<Greeter::Stub> stub_;
};

int main(int argc, char** argv) {
    GreeterClient client(grpc::CreateChannel("localhost:50051", grpc::InsecureChannelCredentials()));
    std::string user("World");
    std::string reply = client.SayHello(user);
    std::cout << "Greeter received: " << reply << std::endl;

    return 0;
}
```

Compile the client:

```bash
g++ -std=c++11 client.cpp greet.pb.cc greet.grpc.pb.cc -o client `pkg-config --cflags --libs grpc++ protobuf`
```

---

## 5. Running the Server and Client

1. Start the server in one terminal:

    ```bash
    ./server
    ```

2. Run the client in another terminal:

    ```bash
    ./client
    ```

The client should print the response from the server: `"Greeter received: Hello, World"`.

---

## Summary

This tutorial covered the basics of integrating gRPC with C++, including:

1. Defining a gRPC service in a `.proto` file.
2. Generating C++ code from the `.proto` file.
3. Implementing a gRPC server and client.

gRPC provides a powerful, efficient way to handle communication between services. Experiment with additional gRPC methods and client configurations to enhance your setup.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
