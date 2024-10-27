
# GitHub Actions Tutorial

GitHub Actions is a powerful CI/CD (Continuous Integration and Continuous Deployment) feature that allows you to automate tasks directly from your GitHub repository. You can build, test, package, release, and deploy your code automatically.

---

## 1. Getting Started with GitHub Actions

### Creating Your First Workflow

1. **Create a new repository** or navigate to an existing repository on GitHub.
2. Go to the **Actions** tab.
3. GitHub will suggest some workflow templates. You can start with one of these or set up a new workflow.

### Example Workflow File

Create a new file in the `.github/workflows` directory of your repository, named `ci.yml`:

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Set up JDK
        uses: actions/setup-java@v2
        with:
          java-version: '11'

      - name: Build with Maven
        run: mvn clean install
```

### Explanation of the Workflow File

- **name**: The name of the workflow.
- **on**: The events that trigger the workflow. In this example, it runs on `push` and `pull_request` events on the `main` branch.
- **jobs**: Defines the jobs that will run as part of the workflow.
- **runs-on**: Specifies the operating system for the job.
- **steps**: A sequence of tasks that will be executed. Here, we check out the code, set up the JDK, and build the project with Maven.

---

## 2. Common Triggers

GitHub Actions can be triggered by a variety of events:

- **push**: Triggered on a push to a branch.
- **pull_request**: Triggered when a pull request is opened, synchronized, or reopened.
- **schedule**: Allows you to run workflows on a defined schedule using cron syntax.
- **workflow_dispatch**: Enables you to manually trigger the workflow from the GitHub UI.

### Example with Multiple Triggers

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: '0 0 * * *'  # Runs every day at midnight
  workflow_dispatch:      # Allows manual triggering
```

---

## 3. Using Secrets

GitHub Actions allows you to store sensitive information, like API keys, in **Secrets**. To use them in your workflow:

1. Go to your repository on GitHub.
2. Click on **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** to add a secret.

### Accessing Secrets in Workflow

```yaml
steps:
  - name: Deploy
    run: ./deploy.sh
    env:
      API_KEY: ${{ secrets.API_KEY }}
```

---

## 4. Caching Dependencies

Caching can speed up your workflows by storing dependencies. Here’s how to cache Maven dependencies:

```yaml
steps:
  - name: Cache Maven packages
    uses: actions/cache@v2
    with:
      path: ~/.m2/repository
      key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
      restore-keys: |
        ${{ runner.os }}-maven-
```

---

## 5. Matrix Builds

Matrix builds allow you to run tests in parallel across different environments. Here’s an example:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        java-version: [8, 11, 17]

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Set up JDK
        uses: actions/setup-java@v2
        with:
          java-version: ${{ matrix.java-version }}

      - name: Build with Maven
        run: mvn clean install
```

This setup will run the build job for each version of Java specified in the matrix.

---

## 6. Notifications

You can set up notifications for your workflow using third-party actions like Slack or email notifications.

### Example: Sending a Slack Notification

```yaml
steps:
  - name: Notify Slack
    uses: slackapi/slack-github-action@v1.19.0
    with:
      slack-token: ${{ secrets.SLACK_TOKEN }}
      channel: '#general'
      text: 'Build completed successfully!'
```

---

## 7. Conclusion

GitHub Actions provides a powerful and flexible way to automate your software development workflows. From continuous integration to deployment and notifications, it allows you to create efficient processes that can significantly enhance productivity.

### Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Marketplace for Actions](https://github.com/marketplace?type=actions)
