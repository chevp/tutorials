
# Google Cloud Storage with Java Spring Tutorial

Google Cloud Storage (GCS) is a scalable, fully-managed object storage service for storing and accessing data on Google Cloud. This tutorial will cover the essentials of using GCS with Java Spring, including setup, dependencies, configuration, and sample code for integrating GCS with Spring applications.

---

## Prerequisites

1. **Google Cloud SDK**: Ensure that the Google Cloud SDK (gcloud) is installed and authenticated.
    ```bash
    gcloud auth login
    ```

2. **Project Configuration**: Set up your Google Cloud project.
    ```bash
    gcloud config set project <your-project-id>
    ```

3. **Java and Spring Boot**: Ensure that Java and Spring Boot are installed.

---

## 1. Google Cloud Storage Basics

GCS uses *buckets* to store *objects* (files). Before using GCS with Spring, familiarize yourself with basic GCS commands.

### Creating a Bucket

To create a new bucket:
```bash
gsutil mb gs://<bucket-name>
```

**Example**:
```bash
gsutil mb gs://my-spring-app-bucket
```

### Listing Buckets

To list all buckets in the current project:
```bash
gsutil ls
```

### Deleting a Bucket

To delete a bucket (must be empty):
```bash
gsutil rb gs://<bucket-name>
```

---

## 2. Setting up Google Cloud Storage for Java Spring

### Adding Dependencies

To integrate GCS with Spring, add the following dependencies in your `pom.xml` file:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-gcp-starter-storage</artifactId>
</dependency>
```

Also, add the Spring Cloud GCP BOM (Bill of Materials) for dependency management:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2020.0.3</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 3. Configuring Google Cloud Credentials

1. **Service Account Key**: In the Google Cloud Console, create a service account with permissions for GCS (e.g., "Storage Admin" role). Download the JSON key file.

2. **Setting Environment Variable**: Set the environment variable for authentication in your development environment.
    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
    ```

---

## 4. Integrating Google Cloud Storage with Spring Boot

### Creating a GCS Service in Spring

In your Spring project, create a new service `GcsService` for interacting with GCS.

```java
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class GcsService {

    private final Storage storage = StorageOptions.getDefaultInstance().getService();

    @Value("${gcs.bucket.name}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws IOException {
        Bucket bucket = storage.get(bucketName);
        Blob blob = bucket.create(file.getOriginalFilename(), file.getBytes(), file.getContentType());
        return blob.getMediaLink();
    }

    public byte[] downloadFile(String fileName) {
        Blob blob = storage.get(bucketName, fileName);
        return blob.getContent();
    }

    public boolean deleteFile(String fileName) {
        Blob blob = storage.get(bucketName, fileName);
        return blob != null && blob.delete();
    }
}
```

### Configuration in `application.properties`

Add your bucket name to `src/main/resources/application.properties`:

```properties
gcs.bucket.name=my-spring-app-bucket
```

### Sample REST Endpoints for GCS Operations

Create a REST controller in your Spring project to handle HTTP requests for file uploads, downloads, and deletions.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/gcs")
public class GcsController {

    @Autowired
    private GcsService gcsService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String link = gcsService.uploadFile(file);
            return ResponseEntity.ok("File uploaded: " + link);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        byte[] content = gcsService.downloadFile(fileName);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="" + fileName + """)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
        boolean deleted = gcsService.deleteFile(fileName);
        if (deleted) {
            return ResponseEntity.ok("File deleted");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }
    }
}
```

---

## 5. Testing the Application

### Upload a File

Use a REST client (e.g., Postman) to send a `POST` request to `http://localhost:8080/gcs/upload` with a file parameter to upload it to GCS.

### Download a File

Send a `GET` request to `http://localhost:8080/gcs/download/{fileName}` to download a file from GCS.

### Delete a File

Send a `DELETE` request to `http://localhost:8080/gcs/delete/{fileName}` to delete a file from GCS.

---

## Summary

This tutorial covered the basics of setting up Google Cloud Storage and integrating it with Java Spring. You learned to:

1. Set up GCS and create buckets for file storage.
2. Configure authentication with a Google Cloud service account.
3. Implement file upload, download, and deletion features using Spring Boot and GCS.

By following these steps, you can use Google Cloud Storage for secure and scalable file management in your Spring applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
