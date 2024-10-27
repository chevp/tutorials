
# Google Cloud Storage with Java Quarkus Tutorial

Google Cloud Storage (GCS) is a scalable, fully-managed object storage service for storing and accessing data on Google Cloud. This tutorial will cover the essentials of using GCS with Java Quarkus, including setup, dependencies, configuration, and sample code for integrating GCS with Quarkus applications.

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

3. **Java and Quarkus**: Ensure that Java and Quarkus CLI are installed.

---

## 1. Google Cloud Storage Basics

GCS uses *buckets* to store *objects* (files). Before using GCS with Quarkus, familiarize yourself with basic GCS commands.

### Creating a Bucket

To create a new bucket:
```bash
gsutil mb gs://<bucket-name>
```

**Example**:
```bash
gsutil mb gs://my-quarkus-app-bucket
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

## 2. Setting up Google Cloud Storage for Java Quarkus

### Adding Dependencies

To integrate GCS with Quarkus, add the following dependencies in your `pom.xml` file:

```xml
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-storage</artifactId>
    <version>2.1.5</version>
</dependency>

<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-arc</artifactId>
</dependency>
```

---

## 3. Configuring Google Cloud Credentials

1. **Service Account Key**: In the Google Cloud Console, create a service account with permissions for GCS (e.g., "Storage Admin" role). Download the JSON key file.

2. **Setting Environment Variable**: Set the environment variable for authentication in your development environment.
    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
    ```

---

## 4. Integrating Google Cloud Storage with Quarkus

### Creating a GCS Service in Quarkus

In your Quarkus project, create a new class `CloudStorageService` for interacting with GCS.

```java
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

import javax.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@ApplicationScoped
public class CloudStorageService {

    private final Storage storage = StorageOptions.getDefaultInstance().getService();
    private final String bucketName = "my-quarkus-app-bucket";

    public String uploadFile(String fileName, Path filePath) throws IOException {
        Bucket bucket = storage.get(bucketName);
        Blob blob = bucket.create(fileName, Files.readAllBytes(filePath));
        return blob.getSelfLink();
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

### Sample REST Endpoints for GCS Operations

Create a REST controller in your Quarkus project to handle HTTP requests for file uploads, downloads, and deletions.

```java
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.nio.file.Path;

@Path("/gcs")
public class GCSResource {

    @Inject
    CloudStorageService cloudStorageService;

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(@FormParam("filePath") String filePath) {
        try {
            String fileName = Path.of(filePath).getFileName().toString();
            String link = cloudStorageService.uploadFile(fileName, Path.of(filePath));
            return Response.ok("File uploaded: " + link).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Upload failed").build();
        }
    }

    @GET
    @Path("/download/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadFile(@PathParam("fileName") String fileName) {
        byte[] content = cloudStorageService.downloadFile(fileName);
        return Response.ok(content).header("Content-Disposition", "attachment; filename="" + fileName + """).build();
    }

    @DELETE
    @Path("/delete/{fileName}")
    public Response deleteFile(@PathParam("fileName") String fileName) {
        boolean deleted = cloudStorageService.deleteFile(fileName);
        if (deleted) {
            return Response.ok("File deleted").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).entity("File not found").build();
        }
    }
}
```

---

## 5. Testing the Application

### Upload a File

Use a REST client (e.g., Postman) to send a `POST` request to `http://localhost:8080/gcs/upload` with the file path as a parameter to upload it to GCS.

### Download a File

Send a `GET` request to `http://localhost:8080/gcs/download/{fileName}` to download a file from GCS.

### Delete a File

Send a `DELETE` request to `http://localhost:8080/gcs/delete/{fileName}` to delete a file from GCS.

---

## Summary

This tutorial covered the basics of setting up Google Cloud Storage and integrating it with Java Quarkus. You learned to:

1. Set up GCS and create buckets for file storage.
2. Configure authentication with a Google Cloud service account.
3. Implement file upload, download, and deletion features using Quarkus and GCS.

By following these steps, you can use Google Cloud Storage for secure and scalable file management in your Quarkus applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
