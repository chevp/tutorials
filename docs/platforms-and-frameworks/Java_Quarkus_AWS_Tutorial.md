
# Java Quarkus on AWS Tutorial

Quarkus is a Kubernetes-native Java framework tailored for GraalVM and OpenJDK HotSpot, making it a great choice for building cloud-native applications. This tutorial will guide you through deploying a simple Quarkus application on AWS.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed:

- **Java JDK** (11 or later): Download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **Apache Maven**: Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).
- **AWS CLI**: Install the AWS Command Line Interface from [AWS CLI Installation](https://aws.amazon.com/cli/).
- **AWS Account**: Sign up for an AWS account if you don't have one.

### Verify Installation

To check your installations, run the following commands:

```bash
java -version
mvn -version
aws --version
```

---

## 2. Creating a New Quarkus Project

You can create a new Quarkus project using the Quarkus CLI or Maven.

### Using the Quarkus CLI

Run the following command to create a new project:

```bash
quarkus create app org.acme:aws-demo --no-code
cd aws-demo
```

### Using Maven

Alternatively, you can use Maven to generate a new project:

```bash
mvn io.quarkus:quarkus-maven-plugin:2.4.2:create     -DgroupId=org.acme     -DartifactId=aws-demo     -Dextensions="resteasy,resteasy-jackson,quarkus-amazon-lambda"
cd aws-demo
```

### Project Structure

After creating the project, the structure will look like this:

```
aws-demo
├── src
│   ├── main
│   │   ├── java
│   │   │   └── org
│   │   │       └── acme
│   │   │           └── aws
│   │   │               └── GreetingResource.java
│   │   └── resources
│   │       └── application.properties
└── pom.xml
```

---

## 3. Creating a Simple REST Endpoint

Create a new Java class named `GreetingResource.java` in the `src/main/java/org/acme/aws` directory:

```java
package org.acme.aws;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String hello() {
        return "{"message": "Hello, AWS with Quarkus!"}";
    }
}
```

### Explanation

- **@Path**: Defines the URI path for the resource.
- **@GET**: Indicates that this method responds to HTTP GET requests.
- **@Produces**: Specifies the media type returned by the method.

---

## 4. Running Your Application Locally

To run your Quarkus application in development mode, use the following command:

```bash
./mvnw quarkus:dev
```

### Accessing the Endpoint

Once the application is running, open your web browser or a tool like `curl` to access the endpoint:

```
http://localhost:8080/hello
```

You should see the output:

```json
{"message": "Hello, AWS with Quarkus!"}
```

---

## 5. Preparing for AWS Lambda

### Adding AWS Lambda Dependencies

Make sure your `pom.xml` includes the necessary dependencies for AWS Lambda. Add the following dependencies:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-amazon-lambda</artifactId>
</dependency>
```

### Configuring Application Properties

Configure the AWS Lambda function in `src/main/resources/application.properties`:

```properties
quarkus.lambda.handler=org.acme.aws.GreetingResource::hello
```

---

## 6. Building the Application for AWS Lambda

To build your application as a native image for AWS Lambda, run the following command:

```bash
./mvnw package -Pnative -Dquarkus.native.container-build=true
```

This will create a native executable in the `target` directory.

---

## 7. Deploying to AWS Lambda

### Step 1: Create a Lambda Function

Use the AWS CLI to create a new Lambda function:

```bash
aws lambda create-function --function-name quarkus-aws-demo   --runtime provided.al2   --handler org.acme.aws.GreetingResource::hello   --zip-file fileb://target/aws-demo-1.0.0-runner.zip   --role arn:aws:iam::<your-account-id>:role/<your-lambda-role>   --region <your-region>
```

Make sure to replace `<your-account-id>`, `<your-lambda-role>`, and `<your-region>` with your actual AWS account ID, the IAM role for Lambda, and your preferred AWS region.

### Step 2: Testing the Lambda Function

You can test your Lambda function using the following command:

```bash
aws lambda invoke --function-name quarkus-aws-demo output.json
```

Check the contents of `output.json` for the result.

---

## 8. Conclusion

This tutorial provided an introduction to creating a Java Quarkus application that can be deployed on AWS. You learned how to set up a Quarkus project, create a REST endpoint, and prepare your application for deployment on AWS Lambda.

### Further Reading

- [Quarkus Documentation](https://quarkus.io/guides/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Building Serverless Applications with Quarkus](https://quarkus.io/guides/amazon-lambda#overview)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
