
# Git Usage Tutorial

Git is a version control system that allows multiple users to manage and track changes in code. It’s essential for collaboration in software projects and helps maintain a history of edits and versions.

---

## Table of Contents

1. [Getting Started with Git](#1-getting-started-with-git)
2. [Basic Git Commands](#2-basic-git-commands)
3. [Branching and Merging](#3-branching-and-merging)
4. [Working with Remote Repositories](#4-working-with-remote-repositories)
5. [Advanced Git Commands](#5-advanced-git-commands)

---

## 1. Getting Started with Git

### Installation

To get started with Git, you’ll need to install it:

- **Linux**: `sudo apt-get install git`
- **macOS**: `brew install git`
- **Windows**: [Download Git](https://git-scm.com/download/win)

Verify the installation by checking the version:
```bash
git --version
```

### Configuring Git

Set up your username and email. This information is attached to your commits.

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

To confirm your configuration settings:
```bash
git config --list
```

## 2. Basic Git Commands

### Initializing a Repository

To create a new Git repository in your project directory:
```bash
git init
```

### Cloning a Repository

To clone an existing Git repository from a remote location:
```bash
git clone https://github.com/username/repository.git
```

### Staging and Committing Changes

1. **Stage Files**: Select files for your next commit.
   ```bash
   git add filename  # Adds specific file
   git add .         # Adds all changes
   ```

2. **Commit Changes**: Commit the staged files to the repository with a message.
   ```bash
   git commit -m "Commit message describing changes"
   ```

### Checking the Status

Check the current status of your repository:
```bash
git status
```

### Viewing Commit History

To view the commit history of the repository:
```bash
git log
```

## 3. Branching and Merging

### Creating and Switching Branches

Branches allow for separate feature development without affecting the main code.

- Create a new branch:
  ```bash
  git branch branch-name
  ```

- Switch to a branch:
  ```bash
  git checkout branch-name
  ```

### Merging Branches

To merge changes from one branch into the current branch:
```bash
git merge branch-name
```

### Deleting Branches

After merging, you may want to delete old branches:

- Locally:
  ```bash
  git branch -d branch-name
  ```

- Remotely:
  ```bash
  git push origin --delete branch-name
  ```

## 4. Working with Remote Repositories

### Adding a Remote

To link your local repository to a remote one:
```bash
git remote add origin https://github.com/username/repository.git
```

### Pushing Changes

To upload commits to the remote repository:
```bash
git push origin branch-name
```

### Pulling Changes

To download updates from the remote repository:
```bash
git pull origin branch-name
```

### Fetching Changes

Retrieve changes from the remote without merging them automatically:
```bash
git fetch origin
```

## 5. Advanced Git Commands

### Resetting Commits

To undo commits:

- **Soft Reset**: Keeps changes staged
  ```bash
  git reset --soft HEAD~1
  ```

- **Hard Reset**: Deletes all changes
  ```bash
  git reset --hard HEAD~1
  ```

### Stashing Changes

To save uncommitted changes temporarily:
```bash
git stash
```

To retrieve stashed changes:
```bash
git stash apply
```

### Reverting a Commit

Undo changes by creating a new commit that reverses a specific commit:
```bash
git revert commit-hash
```

---

## Conclusion

This guide provides an overview of Git's fundamental commands for working with repositories. For more detailed information, refer to the official [Git documentation](https://git-scm.com/doc). Happy coding!

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
