
# SonarQube Tutorial

SonarQube is an open-source platform for continuous inspection of code quality. It helps developers manage code quality and security vulnerabilities in their projects. This tutorial will guide you through the basics of setting up and using SonarQube.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed:

- **Java JDK** (11 or later): Download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **SonarQube**: Download the latest version from the [SonarQube Downloads page](https://www.sonarqube.org/downloads/).
- **Maven** (if using Java): Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).

### Verify Installation

To check if Java is installed correctly, run:

```bash
java -version
```

---

## 2. Setting Up SonarQube

### Step 1: Download and Extract SonarQube

1. Download SonarQube from the official website.
2. Extract the downloaded archive to a preferred location:

   ```bash
   unzip sonarqube-<version>.zip
   cd sonarqube-<version>
   ```

### Step 2: Starting SonarQube

1. Navigate to the `bin` directory:

   ```bash
   cd bin/<your-os>  # e.g., cd bin/linux-x86-64 or cd bin/windows-x86-64
   ```

2. Start SonarQube:

   - For Linux/Mac:

   ```bash
   ./sonar.sh start
   ```

   - For Windows:

   ```bash
   StartSonar.bat
   ```

### Step 3: Accessing SonarQube

Once SonarQube is running, you can access the dashboard at:

```
http://localhost:9000
```

The default credentials are:
- Username: `admin`
- Password: `admin`

**Change the default password after the first login.**

---

## 3. Analyzing Your Project

### Step 1: Configure Your Project

You can analyze a project using Maven, Gradle, or any other build tool. Here’s how to do it with Maven:

1. Navigate to your project directory and add the SonarQube plugin to your `pom.xml`:

```xml
<properties>
    <sonar.projectKey>your_project_key</sonar.projectKey>
    <sonar.host.url>http://localhost:9000</sonar.host.url>
    <sonar.login>admin</sonar.login> <!-- Replace with your username -->
    <sonar.password>admin</sonar.password> <!-- Replace with your password -->
</properties>
```

### Step 2: Run the Analysis

Run the following command in your project directory to perform the analysis:

```bash
mvn clean verify sonar:sonar
```

### Step 3: Viewing Results

After the analysis is complete, you can view the results in the SonarQube dashboard by navigating to:

```
http://localhost:9000/projects
```

---

## 4. Configuring Quality Gates

Quality Gates are a set of conditions a project must meet before it can be considered acceptable.

### Step 1: Accessing Quality Gates

In the SonarQube dashboard, go to the **Quality Gates** section in the menu. Here you can define the criteria for your project's quality gates.

### Step 2: Creating a Quality Gate

1. Click on **Create**.
2. Define the conditions (e.g., code coverage, code smells).
3. Assign the quality gate to your project.

--- 

## 5. Conclusion

SonarQube is a powerful tool for monitoring code quality and security vulnerabilities in your projects. This tutorial provided an introduction to setting up SonarQube and analyzing a project.

### Further Reading

- [SonarQube Documentation](https://docs.sonarqube.org/latest/)
- [SonarQube GitHub Repository](https://github.com/SonarSource/sonarqube)
- [Integrating SonarQube with CI/CD](https://docs.sonarqube.org/latest/analysis/scan/)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
