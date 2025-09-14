
# Maven Tutorial

Apache Maven is a build automation and project management tool primarily for Java projects. It uses an XML file, `pom.xml`, to manage dependencies, configure build parameters, and control project structure.

---

## 1. Installing Maven

### Step 1: Download Maven

1. Go to the [Maven website](https://maven.apache.org/download.cgi) and download the latest Maven release.

2. Unzip the file and add Maven's `bin` directory to your system's PATH.

### Step 2: Verify Installation

Check if Maven is installed by running:

```bash
mvn -version
```

---

## 2. Creating a Maven Project

Maven can create a new project from a standard template.

```bash
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

This creates a basic project structure with the following files:

```
my-app
├── pom.xml
└── src
    ├── main
    │   └── java
    │       └── com/example/App.java
    └── test
        └── java
            └── com/example/AppTest.java
```

---

## 3. Understanding `pom.xml`

The `pom.xml` file (Project Object Model) is the core of a Maven project, describing dependencies, plugins, and settings.

### Example `pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <!-- Define dependencies here -->
    </dependencies>
</project>
```

---

## 4. Adding Dependencies

Add dependencies to `pom.xml` within the `<dependencies>` section.

### Example: Adding JUnit

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Run `mvn install` to download and install dependencies.

---

## 5. Maven Lifecycle

Maven has a lifecycle with specific phases:

- **compile**: Compiles source code.
- **test**: Runs tests.
- **package**: Packages code into a JAR or WAR file.
- **install**: Installs package to local repository.
- **deploy**: Deploys package to a remote repository.

### Example Commands

```bash
mvn compile          # Compile source code
mvn test             # Run tests
mvn package          # Package into JAR/WAR
mvn install          # Install to local repository
mvn deploy           # Deploy to remote repository
```

---

## 6. Plugins in Maven

Plugins extend Maven’s capabilities. Add plugins in the `<build>` section of `pom.xml`.

### Example: Maven Compiler Plugin

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## 7. Multi-Module Projects

Maven supports multi-module projects, where multiple modules are managed under one parent project.

### Example Parent `pom.xml`

In the parent project’s `pom.xml`, add module paths:

```xml
<modules>
    <module>module1</module>
    <module>module2</module>
</modules>
```

Each module should have its own `pom.xml` but inherit from the parent project.

---

## 8. Building and Running a Maven Project

- **Build**: Run `mvn package` to create a JAR/WAR file in `target/` directory.
- **Run**: Execute the JAR file with:

    ```bash
    java -jar target/my-app-1.0-SNAPSHOT.jar
    ```

---

## Summary

This tutorial covered the basics of Maven:

1. **Setting up Maven** and creating a project.
2. **Understanding `pom.xml`** structure.
3. **Adding dependencies and plugins**.
4. **Using Maven commands** for building, testing, and deploying.

Maven simplifies Java project management, automating dependency management and providing a structured approach to build and deployment.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
