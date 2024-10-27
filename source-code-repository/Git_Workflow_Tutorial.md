
# Git Workflow Tutorial

Git is a popular version control system used to manage and collaborate on projects. This tutorial covers a typical Git workflow, including creating branches, making commits, merging changes, and handling pull requests. This workflow can be used for both solo and team projects.

---

## Prerequisites

1. **Git**: Ensure Git is installed on your system.
    ```bash
    git --version
    ```

2. **GitHub or GitLab Account**: Optional but recommended for remote collaboration.

---

## 1. Setting Up a New Git Repository

Initialize a new Git repository in your project directory:

```bash
git init
```

To connect your local repository to a remote repository on GitHub or GitLab:

```bash
git remote add origin <repository-url>
```

---

## 2. Basic Workflow for Making Changes

### Step 1: Checking the Status

Check the current status of your repository and see any changes:

```bash
git status
```

### Step 2: Adding Files to Staging

To stage specific files, use:

```bash
git add <file-name>
```

To stage all changes:

```bash
git add .
```

### Step 3: Committing Changes

Commit the staged changes with a message:

```bash
git commit -m "Describe your changes here"
```

### Step 4: Pushing Changes to Remote

To push changes to the remote repository:

```bash
git push origin <branch-name>
```

---

## 3. Branching in Git

Branches allow you to work on features or bug fixes without affecting the main codebase.

### Creating a New Branch

Create a new branch:

```bash
git branch <branch-name>
```

Switch to the new branch:

```bash
git checkout <branch-name>
```

Or create and switch to a new branch in one command:

```bash
git checkout -b <branch-name>
```

### Viewing Branches

List all branches in the repository:

```bash
git branch
```

---

## 4. Merging Branches

### Merging a Branch into Main

Switch to the main branch first:

```bash
git checkout main
```

Then, merge the feature branch into main:

```bash
git merge <branch-name>
```

### Resolving Merge Conflicts

If there are conflicts during the merge, Git will notify you. Open the conflicting files, make the necessary changes, and then add and commit the resolved files:

```bash
git add <file-name>
git commit -m "Resolve merge conflicts"
```

---

## 5. Pulling Changes from Remote

Before starting new work, it’s a good practice to pull the latest changes from the remote repository:

```bash
git pull origin <branch-name>
```

---

## 6. Using Pull Requests (PR)

A pull request allows you to review and discuss code changes before they are merged into the main branch. In GitHub or GitLab:

1. Push your feature branch to the remote repository:

    ```bash
    git push origin <branch-name>
    ```

2. Open a pull request on GitHub or GitLab.

3. Team members can review the PR, suggest changes, and approve it.

4. Once approved, the branch can be merged into the main branch.

---

## 7. Rebasing

Rebasing is used to keep your feature branch updated with the main branch.

### Example: Rebase a Feature Branch

Switch to your feature branch:

```bash
git checkout <feature-branch>
```

Rebase with the main branch:

```bash
git rebase main
```

If there are conflicts, resolve them, then continue the rebase:

```bash
git add <file-name>
git rebase --continue
```

---

## 8. Summary of Git Commands

| Command                             | Description                                   |
|-------------------------------------|-----------------------------------------------|
| `git init`                          | Initialize a new Git repository               |
| `git add <file>`                    | Add file to staging                           |
| `git commit -m "<message>"`         | Commit changes with a message                 |
| `git push origin <branch>`          | Push changes to remote repository             |
| `git branch <branch-name>`          | Create a new branch                           |
| `git checkout <branch-name>`        | Switch to a branch                            |
| `git merge <branch-name>`           | Merge a branch into the current branch        |
| `git pull origin <branch-name>`     | Pull changes from remote                      |
| `git rebase <branch>`               | Rebase with another branch                    |
| `git status`                        | Check the status of your repository           |
| `git log`                           | View commit history                           |

---

## Summary

This tutorial introduced the basics of a Git workflow, including:

1. Setting up a Git repository and connecting it to a remote.
2. Creating and merging branches.
3. Using pull requests for collaborative code reviews.
4. Keeping feature branches up-to-date with rebase.

By following this workflow, you can effectively manage version control for both solo and team projects.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
