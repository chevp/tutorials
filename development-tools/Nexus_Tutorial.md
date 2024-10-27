
# Nexus Repository Manager Tutorial

Nexus Repository Manager, commonly known as Nexus, is a tool for managing software artifacts and dependencies in a centralized location. Nexus supports a wide range of repository formats, including Maven, npm, PyPI, and Docker, making it a versatile choice for DevOps workflows.

---

## 1. Installing Nexus

### Option 1: Installing with Docker

To run Nexus using Docker:

```bash
docker run -d -p 8081:8081 --name nexus sonatype/nexus3
```

This will start Nexus on `http://localhost:8081`.

### Option 2: Installing Manually

1. Download Nexus Repository Manager OSS from [Sonatype](https://help.sonatype.com/repomanager3/installation).
2. Extract the downloaded file and navigate to the installation directory.
3. Start Nexus by running:

    ```bash
    ./nexus run
    ```

---

## 2. Accessing Nexus

Once Nexus is running, access the web interface at `http://localhost:8081`.

### Default Login Credentials

- **Username**: `admin`
- **Password**: Retrieve the initial password from `nexus-data/admin.password`.

---

## 3. Configuring Repositories in Nexus

Nexus supports several repository types:
- **Hosted Repository**: For artifacts created and managed internally.
- **Proxy Repository**: Proxies and caches artifacts from a remote repository (e.g., Maven Central).
- **Group Repository**: A virtual repository combining multiple hosted or proxy repositories.

### Creating a Hosted Repository

1. Go to **Repositories** in the Nexus dashboard.
2. Click **Create repository** and select the format (e.g., Maven, npm).
3. Set the repository details, such as **Name**, **Version Policy**, and **Deployment Policy**.

---

## 4. Proxying Remote Repositories

Proxy repositories allow Nexus to cache dependencies from external sources.

### Example: Proxying Maven Central

1. Go to **Repositories** and click **Create repository**.
2. Select **maven2 (proxy)**.
3. Set **Remote storage URL** to `https://repo1.maven.org/maven2`.
4. Save the configuration.

---

## 5. Setting Up a Group Repository

Group repositories provide a unified access point for multiple repositories.

1. Go to **Repositories** and click **Create repository**.
2. Select **maven2 (group)** or another format as needed.
3. Add multiple repositories to the group (e.g., hosted and proxy repositories).
4. Save and use the group repository URL for builds.

---

## 6. Uploading Artifacts to Nexus

To upload files or artifacts:

1. Navigate to the **Browse** section in the Nexus dashboard.
2. Choose the target repository.
3. Click **Upload**, select your files, and provide required metadata (e.g., groupId, artifactId for Maven artifacts).

### Using Maven to Deploy Artifacts

In your `pom.xml`, add the Nexus repository details:

```xml
<distributionManagement>
    <repository>
        <id>nexus</id>
        <url>http://localhost:8081/repository/maven-releases/</url>
    </repository>
</distributionManagement>
```

Deploy with:

```bash
mvn deploy
```

---

## 7. Configuring Nexus for Docker Images

Nexus can serve as a Docker registry.

1. Go to **Repositories** and create a **docker (hosted)** repository.
2. Enable HTTP connector on a custom port (e.g., 8082).
3. To log in and push images to Nexus, configure Docker to use Nexus as a registry:

    ```bash
    docker login localhost:8082
    docker tag my-image localhost:8082/my-repo/my-image:latest
    docker push localhost:8082/my-repo/my-image:latest
    ```

---

## 8. Setting Up User Roles and Permissions

Nexus allows role-based access control to manage permissions.

1. Go to **Security** > **Roles** to create custom roles.
2. Define permissions such as read, write, or delete for each repository.
3. Assign roles to users under **Security** > **Users**.

---

## 9. Using Nexus with CI/CD Tools

Nexus integrates with CI/CD tools like Jenkins, GitLab, and GitHub Actions.

### Example: Integrating Jenkins with Nexus

1. Install the **Nexus Artifact Uploader** plugin in Jenkins.
2. In your Jenkins pipeline, use the Nexus plugin to upload artifacts:

    ```groovy
    nexusArtifactUploader artifacts: [[artifactId: 'my-app', file: 'target/my-app.jar']],
                         credentialsId: 'nexus-credentials',
                         groupId: 'com.example',
                         nexusUrl: 'http://localhost:8081',
                         repository: 'maven-releases'
    ```

---

## 10. Backing Up Nexus

Regularly back up your Nexus data stored in the `nexus-data` directory.

1. Stop the Nexus service.
2. Copy the `nexus-data` directory to a backup location.
3. Restart the Nexus service.

---

## Summary

This tutorial covered the basics of Nexus Repository Manager:

1. **Installing and accessing Nexus**.
2. **Setting up repositories** (hosted, proxy, and group).
3. **Uploading and managing artifacts** in Nexus.
4. **Configuring Nexus as a Docker registry** and integrating with CI/CD tools.

Nexus is an essential tool for managing artifacts and dependencies in software development, providing a centralized repository that supports DevOps practices.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
