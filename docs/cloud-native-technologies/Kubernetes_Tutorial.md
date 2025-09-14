
# Kubernetes Tutorial

Kubernetes, often referred to as "K8s," is an open-source container orchestration platform for automating the deployment, scaling, and management of containerized applications. This tutorial provides a basic guide to Kubernetes concepts, components, and common commands.

---

## 1. Key Concepts in Kubernetes

### Cluster
A Kubernetes **cluster** is a set of nodes where containerized applications run. It includes:

- **Master Node**: Manages the cluster, schedules workloads, and handles API requests.
- **Worker Nodes**: Nodes where the application containers run.

### Pods
A **pod** is the smallest deployable unit in Kubernetes, usually running one or more containers.

### Services
A **service** exposes an application running on a set of pods to external or internal traffic.

### Deployments
A **deployment** manages a set of identical pods to ensure they stay running and updated.

---

## 2. Setting Up Kubernetes

To start using Kubernetes, you need access to a Kubernetes cluster.

### Local Setup with Minikube

1. **Install Minikube**: Follow the installation guide at [Minikube](https://minikube.sigs.k8s.io/docs/start/).
2. **Start Minikube**:

    ```bash
    minikube start
    ```

3. **Verify Installation**:

    ```bash
    kubectl get nodes
    ```

This command should show a list of nodes, with Minikube as the single node.

---

## 3. Basic Kubernetes Commands

### kubectl

The `kubectl` command-line tool is used to manage Kubernetes clusters.

### Common Commands

- **Get Nodes**: List all nodes in the cluster.

    ```bash
    kubectl get nodes
    ```

- **Get Pods**: List all pods in the default namespace.

    ```bash
    kubectl get pods
    ```

- **Get Services**: List all services.

    ```bash
    kubectl get services
    ```

---

## 4. Creating a Deployment

A **deployment** describes an application to be deployed, including its container image and desired state.

### Example Deployment YAML

Save the following YAML as `nginx-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### Apply the Deployment

```bash
kubectl apply -f nginx-deployment.yaml
```

### View the Deployment

```bash
kubectl get deployments
```

---

## 5. Exposing a Service

To expose your deployment, create a **service** that routes traffic to the pods.

### Example Service YAML

Save the following YAML as `nginx-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

### Apply the Service

```bash
kubectl apply -f nginx-service.yaml
```

### Get Service Details

```bash
kubectl get services
```

---

## 6. Scaling a Deployment

To scale the number of replicas in a deployment:

```bash
kubectl scale deployment nginx-deployment --replicas=5
```

Verify the scaling with:

```bash
kubectl get pods
```

---

## 7. Updating a Deployment

To update a deployment, edit the container image:

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.0
```

Check the rollout status:

```bash
kubectl rollout status deployment/nginx-deployment
```

---

## 8. Deleting Resources

To delete a resource:

- **Delete Deployment**:

    ```bash
    kubectl delete deployment nginx-deployment
    ```

- **Delete Service**:

    ```bash
    kubectl delete service nginx-service
    ```

---

## Summary

This tutorial covered the basics of Kubernetes:

1. Setting up a cluster with Minikube.
2. Creating, scaling, and updating deployments.
3. Exposing applications with services.

Kubernetes simplifies managing containerized applications, allowing you to scale and orchestrate applications across clusters efficiently.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
