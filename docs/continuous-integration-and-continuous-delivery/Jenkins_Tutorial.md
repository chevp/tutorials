
# Jenkins Tutorial

Jenkins is an open-source automation server used to build, test, and deploy software. It supports Continuous Integration (CI) and Continuous Deployment (CD), making it a popular tool in DevOps.

---

## 1. Installing Jenkins

### Step 1: Install Java

Jenkins requires Java (Java Development Kit, JDK) to run.

#### On Ubuntu

```bash
sudo apt update
sudo apt install openjdk-11-jdk
```

### Step 2: Install Jenkins

Follow the instructions from the [Jenkins website](https://www.jenkins.io/download/) for your operating system.

#### On Ubuntu

```bash
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins
```

Start Jenkins with:

```bash
sudo systemctl start jenkins
```

### Access Jenkins

Visit `http://localhost:8080` in your browser to access Jenkins.

---

## 2. Setting Up Jenkins

### Unlocking Jenkins

1. When you first access Jenkins, you’ll be asked for an admin password.
2. Locate the password in `/var/lib/jenkins/secrets/initialAdminPassword`:

    ```bash
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    ```

3. Enter this password to unlock Jenkins.

### Installing Suggested Plugins

After unlocking, Jenkins will prompt you to install suggested plugins. This will include commonly used plugins.

---

## 3. Creating Your First Job

1. Click on **New Item** on the Jenkins dashboard.
2. Enter a name for your project and select **Freestyle project**.
3. Configure the job with various build steps, triggers, and post-build actions.

### Example Build Step

In **Build** > **Execute Shell**, you can add a shell command:

```bash
echo "Hello, Jenkins!"
```

Save the job and click **Build Now** to run it.

---

## 4. Configuring Source Control with Git

Jenkins integrates with source control systems like Git.

1. In your job configuration, scroll to **Source Code Management**.
2. Select **Git** and enter the repository URL.
3. You may need to provide credentials for private repositories.

---

## 5. Adding Build Triggers

Build triggers allow Jenkins to automatically start jobs based on events.

### Common Triggers

- **Poll SCM**: Checks for code changes at specified intervals.
- **Build Periodically**: Runs jobs at scheduled times.
- **GitHub Hook Trigger**: Starts a build when there are commits to a GitHub repository.

---

## 6. Pipeline as Code

Jenkins Pipelines allow you to define CI/CD workflows using code, usually stored in a `Jenkinsfile`.

### Creating a Pipeline

1. Click **New Item** > **Pipeline**.
2. Define the pipeline in the **Pipeline** section using Scripted or Declarative syntax.

### Example Declarative Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }
}
```

---

## 7. Jenkinsfile Example for Git Integration

Place a `Jenkinsfile` in the root of your Git repository to use it with Jenkins.

```groovy
pipeline {
    agent any
    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/your-repo/example.git'
            }
        }
        stage('Build') {
            steps {
                echo 'Building the project...'
            }
        }
    }
}
```

Configure the job to pull the `Jenkinsfile` from the repository.

---

## 8. Installing Plugins

Jenkins has an extensive plugin ecosystem.

1. Go to **Manage Jenkins** > **Manage Plugins**.
2. Search for plugins like **Git**, **GitHub Integration**, **Slack Notifications**, etc.
3. Click **Install** and restart Jenkins if prompted.

---

## 9. Setting Up Notifications

### Email Notifications

1. Go to **Manage Jenkins** > **Configure System**.
2. Set up an SMTP server and email configuration.

### Slack Notifications

1. Install the **Slack Notification** plugin.
2. Go to your job configuration, scroll to **Post-build Actions** and add **Slack Notifications**.

---

## 10. Backing Up Jenkins

Jenkins stores its configuration and job data in `/var/lib/jenkins` (or similar).

- **Backing up**: Regularly back up the `JENKINS_HOME` directory.
- **Restoring**: Replace `JENKINS_HOME` with your backup and restart Jenkins.

---

## Summary

This tutorial covered Jenkins basics:

1. **Installing Jenkins** and setting up the server.
2. **Creating jobs** and configuring source control with Git.
3. **Setting up pipelines** and using the `Jenkinsfile`.
4. **Installing plugins** and configuring notifications.

Jenkins is a powerful tool for automating CI/CD workflows, supporting many integrations to streamline software development.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
