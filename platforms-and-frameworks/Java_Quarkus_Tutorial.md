
# Java Quarkus Tutorial

Quarkus is a Kubernetes-native Java framework tailored for GraalVM and OpenJDK HotSpot. It is designed for building Java applications that are optimized for cloud environments and microservices architecture.

---

## 1. Prerequisites

Before getting started with Quarkus, make sure you have the following installed:

- **Java JDK** (11 or later): You can download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **Maven**: Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).
- **Quarkus CLI** (optional): You can install it via SDKMAN! or download it directly from the [Quarkus website](https://quarkus.io/download/).

### Verify Installation

To check your installations, run the following commands:

```bash
java -version
mvn -version
```
If you installed the Quarkus CLI:
```bash
quarkus version
```

---

## 2. Creating a New Quarkus Project

You can create a new Quarkus project using the Quarkus CLI or Maven.

### Using the Quarkus CLI

Run the following command to create a new project:

```bash
quarkus create app org.acme:getting-started --no-code
cd getting-started
```

### Using Maven

Alternatively, you can use Maven to generate a new project:

```bash
mvn io.quarkus:quarkus-maven-plugin:2.4.2:create     -DgroupId=org.acme     -DartifactId=getting-started     -Dextensions="resteasy,resteasy-jackson"
cd getting-started
```

### Project Structure

After creating the project, the structure will look like this:

```
getting-started
├── src
│   ├── main
│   │   ├── java
│   │   └── resources
│   └── test
└── pom.xml
```

---

## 3. Developing Your First REST Endpoint

### Create a Resource Class

Create a new Java class named `GreetingResource.java` in the `src/main/java/org/acme` directory:

```java
package org.acme;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello, Quarkus!";
    }
}
```

### Explanation

- **@Path**: Defines the URI path for the resource.
- **@GET**: Indicates that this method responds to HTTP GET requests.
- **@Produces**: Specifies the media type returned by the method.

---

## 4. Running Your Application

You can run your Quarkus application in development mode using the following command:

```bash
./mvnw quarkus:dev
```

### Accessing the Endpoint

Once the application is running, open your web browser or a tool like `curl` to access the endpoint:

```
http://localhost:8080/hello
```

You should see the output:

```
Hello, Quarkus!
```

---

## 5. Adding Dependencies

You can easily add extensions (dependencies) to your Quarkus project. For example, to add Hibernate ORM with Panache:

```bash
./mvnw quarkus:add-extension -Dextensions="hibernate-orm-panache"
```

### Check Available Extensions

You can see all available extensions by running:

```bash
./mvnw quarkus:list-extensions
```

---

## 6. Building the Application

To build a production-ready package of your application, run:

```bash
./mvnw package
```

This will create a `jar` file in the `target` directory.

---

## 7. Deploying to Kubernetes

Quarkus simplifies deployment to Kubernetes. You can build a Docker image with:

```bash
./mvnw clean package -Dquarkus.container-image.build=true
```

### Deploying to Kubernetes

You can use the Kubernetes CLI to deploy the generated Docker image:

```bash
kubectl apply -f src/main/kubernetes/kubernetes.yml
```

Ensure your `kubernetes.yml` file is configured correctly for your application.

---

## 8. Conclusion

Quarkus is a powerful framework for building cloud-native Java applications. This tutorial covered the basics of setting up a Quarkus project, creating a simple REST endpoint, running the application, adding dependencies, and deploying it to Kubernetes.

### Further Reading

- [Quarkus Documentation](https://quarkus.io/guides/)
- [Quarkus GitHub Repository](https://github.com/quarkusio/quarkus)
- [Quarkus Extensions](https://quarkus.io/extensions/)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
