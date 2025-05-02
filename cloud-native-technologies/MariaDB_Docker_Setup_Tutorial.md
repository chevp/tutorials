# Setting Up MariaDB with Docker Desktop

This tutorial will guide you through setting up a MariaDB instance using Docker Desktop.

## Prerequisites

* Docker Desktop installed and running
* Basic command line knowledge

## Step 1: Create a Docker Network (Optional but Recommended)

```bash
docker network create mariadb-network
```

## Step 2: Pull the MariaDB Docker Image

```bash
docker pull mariadb:latest
```

## Step 3: Run a MariaDB Container

Run the following command to start a new MariaDB container:

```bash
docker run -d \
  --name mariadb-container \
  --network mariadb-network \
  -e MARIADB_ROOT_PASSWORD=my-secret-pw \
  -e MARIADB_DATABASE=mydatabase \
  -e MARIADB_USER=myuser \
  -e MARIADB_PASSWORD=mypassword \
  -p 3306:3306 \
  mariadb:latest
```

### Explanation of Parameters

* `--name`: Assigns a name to your container.
* `--network`: Connects the container to the specified Docker network.
* `-e`: Sets environment variables (credentials, DB name, etc.).
* `-p`: Maps container port to host port.

## Step 4: Verify the Container is Running

```bash
docker ps
```

Look for `mariadb-container` in the list.

## Step 5: Connect to the Database

### Option 1: Use Docker Exec

```bash
docker exec -it mariadb-container mariadb -u myuser -p
```

Then enter your password when prompted.

### Option 2: Use a GUI Tool

Use a tool like DBeaver, HeidiSQL, or MySQL Workbench and connect using:

* Host: `localhost`
* Port: `3306`
* Username: `myuser`
* Password: `mypassword`
* Database: `mydatabase`

## Step 6: Stop and Remove the Container (Optional)

To stop:

```bash
docker stop mariadb-container
```

To remove:

```bash
docker rm mariadb-container
```

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
