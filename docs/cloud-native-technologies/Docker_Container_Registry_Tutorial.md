# Docker Container Registry Tutorial

## Overview

Docker Container Registry is a crucial component in modern DevOps workflows, enabling teams to store, manage, and distribute Docker images. This tutorial covers how to build Docker images, push them to container registries (Docker Hub, GitHub Container Registry), and integrate them with CI/CD pipelines.

Understanding the distinction between Git repositories and container registries is essential: Docker does not pull directly from GitHub repositories. Instead, `docker-compose` and `docker pull` load images from container registries like Docker Hub or GitHub Container Registry (GHCR). You must build your image and push it to a registry for distribution.

This tutorial provides a complete guide with practical examples for deploying a Java Quarkus runtime container, including CI/CD integration, registry pushing, and Docker Compose usage.

---

## Understanding Container Registries

### How Docker Compose Works with Registries

When you define a service in `docker-compose.yml`, you reference image names such as `grafana/grafana:9.x`. Docker pulls these images from a container registry, not directly from GitHub source repositories.

For example, when you specify `image: ghcr.io/org/repo:latest`, Docker performs the following:
- On `docker-compose up` or `docker-compose pull`, the image is fetched from the GitHub Container Registry (GHCR)
- The source comes from a **container registry**, not from the Git repository

This distinction is important because it means you must:
1. Build your Docker image
2. Push it to a registry
3. Reference the registry location in your compose file

---

## Prerequisites for Deploying a Quarkus Runtime Container

To successfully deploy your own Quarkus application as a containerized service, you'll need:

1. **Build artifact**: A runnable JAR file (fat-jar) or native image produced by your build process
2. **Dockerfile**: A multi-stage Dockerfile to efficiently build and package your application
3. **CI/CD Pipeline**: Automated build process (e.g., GitHub Actions) that builds and pushes images to a registry
4. **Container Registry**: Access to Docker Hub or GitHub Container Registry (GHCR)
5. **Docker Compose Configuration**: A `docker-compose.yml` file that references your registry image

---

## Creating a Multi-Stage Dockerfile

A multi-stage Dockerfile separates the build environment from the runtime environment, resulting in smaller, more secure images. Below is an example for a Java Quarkus application using OpenJDK 17.

Create a file named `Dockerfile` in your repository root:

```dockerfile
# --- Build stage (optional local build if you want single Docker build) ---
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src ./src
RUN mvn -DskipTests package

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /deploy
# Quarkus produces runner.jar (adjust if different)
COPY --from=build /app/target/*-runner.jar /deploy/app.jar
EXPOSE 8080
CMD ["java","-jar","/deploy/app.jar"]
```

### Understanding the Dockerfile

This Dockerfile uses two stages:

1. **Build Stage**: Uses Maven and full JDK to compile and package your application
2. **Runtime Stage**: Uses only the JRE with the compiled artifact, reducing image size

**Note:** If you configure Quarkus to produce a "fast-jar" or uber-jar format, adjust the `COPY` command path in the runtime stage accordingly.

---

## Setting Up CI/CD with GitHub Actions

Automating your build and push process ensures consistency and saves time. GitHub Actions provides a powerful, integrated CI/CD solution.

Create `.github/workflows/ci.yml` in your repository:

```yaml
name: CI Build and Push

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: 17

      - name: Build with Maven
        run: mvn -DskipTests package

      - name: Log in to GHCR
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/<ORG_OR_USER>/<REPO>:${{ github.sha }}
            ghcr.io/<ORG_OR_USER>/<REPO>:latest
```

### Configuring the Workflow

1. **Replace placeholders**: Update `<ORG_OR_USER>` with your GitHub username/organization and `<REPO>` with your repository name
2. **Permissions**: The workflow needs `packages: write` permission to push to GHCR
3. **Authentication**: `GITHUB_TOKEN` is automatically provided by GitHub Actions

### Alternative: Using Docker Hub

To push to Docker Hub instead of GHCR, modify the login step:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v2
  with:
    registry: docker.io
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_TOKEN }}
```

You'll need to configure `DOCKER_USERNAME` and `DOCKER_TOKEN` in your repository secrets.

---

## Configuring Docker Compose

Once your image is in the registry, you can reference it in your `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  my-quarkus-app:
    image: ghcr.io/<ORG_OR_USER>/<REPO>:latest
    ports:
      - "8080:8080"
    restart: unless-stopped
    environment:
      - JAVA_OPTS=-Xmx512m
```

### How It Works

When you run `docker-compose up`, Docker automatically:
1. Checks if the image exists locally
2. Pulls the image from the specified registry if not found
3. Creates and starts the container

This makes deployment across different environments seamless.

---

## Local Build and Push Workflow

For local development and testing, you can manually build and push images to the registry.

### Step 1: Build the Image

```bash
docker build -t ghcr.io/<ORG>/<REPO>:v1.0.0 .
```

This creates a Docker image with the specified tag.

### Step 2: Login to the Registry

```bash
echo $GHCR_PAT | docker login ghcr.io -u <USERNAME> --password-stdin
```

Replace `$GHCR_PAT` with your GitHub Personal Access Token. For Docker Hub, use:

```bash
docker login docker.io -u <USERNAME>
```

### Step 3: Push the Image

```bash
docker push ghcr.io/<ORG>/<REPO>:v1.0.0
docker push ghcr.io/<ORG>/<REPO>:latest
```

This uploads your image to the registry, making it available for deployment.

---

## Understanding Image Tags and Auto-Updates

### The `:latest` Tag

The `:latest` tag is simply a conventional tag name — it doesn't automatically update when new commits are pushed to your repository. When you specify `:latest` in your Docker Compose file, Docker pulls whatever image is currently tagged as `latest` in the registry.

### Implementing Auto-Updates

To enable automatic updates in production environments, you have several options:

1. **Manual Update Commands**:
   ```bash
   docker-compose pull && docker-compose up -d
   ```
   This pulls the latest images and recreates containers.

2. **Watchtower**: An automated solution that monitors your registry and updates containers when new images are available.
   ```yaml
   watchtower:
     image: containrrr/watchtower
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
     command: --interval 300
   ```

3. **CI/CD Triggered Deployments**: Configure your CI pipeline to trigger redeployment after successful image builds.

---

## Deployment Checklist

Before deploying your containerized application, verify the following:

### Build Configuration
- ✅ Build process produces a runnable JAR (Quarkus runner or fast-jar format)
- ✅ Dockerfile is properly configured with multi-stage build
- ✅ Runtime stage correctly copies the JAR artifact

### CI/CD Pipeline
- ✅ GitHub Actions workflow is configured and tested
- ✅ Workflow successfully builds and pushes images to GHCR or Docker Hub
- ✅ Image tags include both version-specific and `:latest` tags

### Registry and Authentication
- ✅ Container registry is accessible (GHCR or Docker Hub)
- ✅ Registry credentials are configured (GHCR PAT or Docker Hub token)
- ✅ Repository permissions allow package publishing

### Docker Compose
- ✅ `docker-compose.yml` references correct registry image (`ghcr.io/...` or `docker.io/...`)
- ✅ Service configuration includes appropriate environment variables
- ✅ Port mappings and volume mounts are correct

### Optional Enhancements
- ✅ Watchtower or similar tool configured for automatic updates
- ✅ Monitoring and logging solutions integrated
- ✅ Health checks defined in Dockerfile and compose file

---

## Additional Resources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Hub](https://hub.docker.com/)
- [Quarkus Container Images Guide](https://quarkus.io/guides/container-image)
- [Watchtower Documentation](https://containrrr.dev/watchtower/)

---

## Best Practices

### Image Tagging Strategy

1. **Use semantic versioning**: Tag images with version numbers (e.g., `v1.0.0`, `v1.0.1`)
2. **Maintain `:latest`**: Always push a `:latest` tag for development/testing
3. **Git SHA tags**: Include git commit SHA for traceability (e.g., `${{ github.sha }}`)

### Security Considerations

1. **Use minimal base images**: Prefer JRE over JDK for runtime containers
2. **Multi-stage builds**: Keep build dependencies out of production images
3. **Scan images**: Use tools like Trivy or Snyk to scan for vulnerabilities
4. **Non-root users**: Run containers as non-root when possible

### Performance Optimization

1. **Layer caching**: Order Dockerfile commands from least to most frequently changing
2. **`.dockerignore`**: Exclude unnecessary files from build context
3. **Image size**: Regularly audit and minimize image sizes

---

## Next Steps

Now that you understand container registries and deployment workflows, consider:

1. **Customize your Dockerfile**: Adapt the example to your specific Quarkus configuration (native images, fast-jar, etc.)
2. **Configure CI/CD**: Set up GitHub Actions with your organization and repository details
3. **Integrate monitoring**: Add Prometheus, Grafana, or other monitoring tools to your `docker-compose.yml`
4. **Implement health checks**: Add health check endpoints to your application and Docker configuration
5. **Set up environments**: Create separate workflows for development, staging, and production

**Advanced Topics**: Explore Kubernetes deployments, Helm charts, and container orchestration for more complex deployment scenarios.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).