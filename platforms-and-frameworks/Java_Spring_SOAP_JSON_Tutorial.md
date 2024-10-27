
# Java Spring SOAP and JSON Tutorial

Spring Framework provides powerful support for building web services with both SOAP and JSON. This tutorial will guide you through creating a simple web service that supports both SOAP and JSON formats.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed:

- **Java JDK** (8 or later): Download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **Apache Maven**: Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).

### Verify Installation

To check your installations, run the following commands:

```bash
java -version
mvn -version
```

---

## 2. Creating a New Spring Boot Project

You can create a new Spring Boot project using Spring Initializr.

### Using Spring Initializr

1. Go to [Spring Initializr](https://start.spring.io/).
2. Select your preferred project metadata:
   - Project: Maven Project
   - Language: Java
   - Spring Boot: (latest stable version)
3. Add dependencies such as **Spring Web**, **Spring Web Services**, and **Spring Boot Starter SOAP**.
4. Click **Generate**, which will download a ZIP file containing your project.

### Project Structure

After creating the project, the structure will look like this:

```
spring-soap-json-demo
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── soapjson
│   │   │               ├── SoapJsonApplication.java
│   │   │               └── webservice
│   │   │                   ├── HelloWorldEndpoint.java
│   │   │                   └── SoapJsonConfig.java
│   │   └── resources
│   │       └── application.properties
└── pom.xml
```

---

## 3. Creating a Simple SOAP Web Service

### Step 1: Define the Web Service Endpoint

Create a new Java class named `HelloWorldEndpoint.java` in the `webservice` package:

```java
package com.example.soapjson.webservice;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.example.soapjson.schemas.HelloWorldRequest;
import com.example.soapjson.schemas.HelloWorldResponse;

@Endpoint
public class HelloWorldEndpoint {
    private static final String NAMESPACE_URI = "http://example.com/soapjson/schemas";

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "HelloWorldRequest")
    @ResponsePayload
    public HelloWorldResponse sayHello(@RequestPayload HelloWorldRequest request) {
        HelloWorldResponse response = new HelloWorldResponse();
        response.setMessage("Hello, " + request.getName() + "!");
        return response;
    }
}
```

### Step 2: Configure the Web Service

Create a new Java class named `SoapJsonConfig.java` in the `webservice` package:

```java
package com.example.soapjson.webservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;

@EnableWs
@Configuration
public class SoapJsonConfig extends WsConfigurerAdapter {
    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet() {
        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/ws/*");
    }
}
```

### Step 3: Create XML Schema

Create an XML schema file named `schema.xsd` in `src/main/resources`:

```xml
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://example.com/soapjson/schemas"
           xmlns="http://example.com/soapjson/schemas"
           elementFormDefault="qualified">

    <xs:element name="HelloWorldRequest">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="name" type="xs:string"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>

    <xs:element name="HelloWorldResponse">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="message" type="xs:string"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
```

### Step 4: Add the Dependency

Update your `pom.xml` to include the necessary dependencies for Spring Web Services and JAXB for XML binding:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web-services</artifactId>
    </dependency>
    <dependency>
        <groupId>javax.xml.bind</groupId>
        <artifactId>jaxb-api</artifactId>
        <version>2.3.1</version>
    </dependency>
    <dependency>
        <groupId>org.glassfish.jaxb</groupId>
        <artifactId>jaxb-runtime</artifactId>
        <version>2.3.1</version>
    </dependency>
</dependencies>
```

---

## 4. Creating a JSON Endpoint

You can also create a simple REST endpoint that returns JSON. Create a new Java class named `JsonController.java` in the same package:

```java
package com.example.soapjson.webservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JsonController {

    @GetMapping("/jsonHello")
    public String jsonHello(@RequestParam(value = "name", defaultValue = "World") String name) {
        return "{"message": "Hello, " + name + "!"}";
    }
}
```

### Accessing the JSON Endpoint

Once your application is running, you can access the JSON endpoint at:

```
http://localhost:8080/jsonHello?name=Alice
```

You should see the output:

```json
{"message": "Hello, Alice!"}
```

---

## 5. Running Your Application

To run your Spring Boot application, use the following command:

```bash
./mvnw spring-boot:run
```

You can then test your SOAP service by accessing the WSDL at:

```
http://localhost:8080/ws/helloWorld.wsdl
```

And for the JSON endpoint, access:

```
http://localhost:8080/jsonHello?name=Alice
```

---

## 6. Conclusion

This tutorial provided a simple introduction to creating a Spring Boot application that supports both SOAP and JSON web services. You learned how to set up a project, create a SOAP web service, and expose a JSON endpoint.

### Further Reading

- [Spring Web Services Documentation](https://docs.spring.io/spring-ws/docs/current/reference/html/)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Building SOAP Web Services with Spring](https://spring.io/guides/gs/producing-web-service/)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
