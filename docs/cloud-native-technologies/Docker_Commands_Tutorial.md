
# Docker Commands Tutorial

Docker is a powerful platform that enables developers to automate the deployment of applications in lightweight containers. This tutorial covers essential Docker commands, along with explanations and examples to help you get started.

---

## Prerequisites

1. **Install Docker**: Ensure that Docker is installed on your system. You can verify installation by running:
    ```bash
    docker --version
    ```

---

## 1. Basic Docker Commands

### Viewing Docker Version and System Info

- **View Docker Version**:
    ```bash
    docker --version
    ```

- **View System-Wide Information**:
    ```bash
    docker info
    ```

---

## 2. Working with Docker Images

Docker images are templates used to create containers.

### Pulling an Image

To download a Docker image from Docker Hub:
```bash
docker pull <image-name>
```

**Example**:
```bash
docker pull nginx
```

### Listing Images

To see all images on your local system:
```bash
docker images
```

### Removing an Image

To delete an image:
```bash
docker rmi <image-id>
```

**Example**:
```bash
docker rmi nginx
```

---

## 3. Working with Docker Containers

Containers are instances of Docker images that run isolated applications.

### Running a Container

To start a new container:
```bash
docker run <image-name>
```

**Options**:
- `-d`: Runs the container in detached mode (in the background).
- `-p [host-port]:[container-port]`: Maps a host port to a container port.

**Example**:
```bash
docker run -d -p 8080:80 nginx
```

### Listing Running Containers

To see all active containers:
```bash
docker ps
```

To see all containers (including stopped ones):
```bash
docker ps -a
```

### Stopping a Container

To stop a running container:
```bash
docker stop <container-id>
```

### Removing a Container

To delete a stopped container:
```bash
docker rm <container-id>
```

---

## 4. Managing Docker Volumes

Docker volumes are used to persist data.

### Creating a Volume

To create a new volume:
```bash
docker volume create <volume-name>
```

### Listing Volumes

To view all volumes:
```bash
docker volume ls
```

### Removing a Volume

To delete a volume:
```bash
docker volume rm <volume-name>
```

---

## 5. Docker Networks

Docker networks allow containers to communicate with each other.

### Listing Networks

To see all Docker networks:
```bash
docker network ls
```

### Creating a Network

To create a new network:
```bash
docker network create <network-name>
```

### Connecting a Container to a Network

To attach a container to an existing network:
```bash
docker network connect <network-name> <container-id>
```

### Disconnecting a Container from a Network

To detach a container from a network:
```bash
docker network disconnect <network-name> <container-id>
```

---

## 6. Building Docker Images

To create a custom image using a Dockerfile:

```bash
docker build -t <image-name> <path-to-dockerfile>
```

**Example**:
```bash
docker build -t my-app .
```

### Options
- `-t`: Tags the image with a name.

---

## 7. Docker Compose

Docker Compose is used to define and manage multi-container applications.

### Running Docker Compose

To start containers defined in `docker-compose.yml`:
```bash
docker-compose up
```

### Stopping Docker Compose

To stop containers started by Docker Compose:
```bash
docker-compose down
```

---

## Summary of Docker Commands

| Command                     | Description                                      |
|-----------------------------|--------------------------------------------------|
| `docker --version`          | Shows Docker version                             |
| `docker pull <image>`       | Downloads an image                               |
| `docker images`             | Lists all images                                 |
| `docker rmi <image-id>`     | Removes an image                                 |
| `docker run <image>`        | Runs a new container from an image               |
| `docker ps`                 | Lists running containers                         |
| `docker stop <container>`   | Stops a running container                        |
| `docker rm <container>`     | Removes a stopped container                      |
| `docker volume create`      | Creates a new volume                             |
| `docker network create`     | Creates a new network                            |
| `docker build -t <name>`    | Builds an image from a Dockerfile                |
| `docker-compose up`         | Starts services defined in `docker-compose.yml`  |
| `docker-compose down`       | Stops all services                               |

---

By using these commands, you can easily manage Docker images, containers, volumes, networks, and multi-container applications with Docker Compose.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
