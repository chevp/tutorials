
# Grafana and Prometheus Tutorial

Grafana and Prometheus are widely used tools in DevOps for monitoring, alerting, and visualization. Prometheus serves as a time-series database and monitoring system, while Grafana is a data visualization tool that integrates with Prometheus to display metrics in customizable dashboards.

---

## 1. Installing Prometheus

### Step 1: Download Prometheus

1. Go to the [Prometheus download page](https://prometheus.io/download/) and download the latest release.
2. Extract the downloaded file:

    ```bash
    tar xvfz prometheus-*.tar.gz
    cd prometheus-*
    ```

### Step 2: Start Prometheus

Run Prometheus using:

```bash
./prometheus --config.file=prometheus.yml
```

This starts Prometheus on `http://localhost:9090`.

---

## 2. Configuring Prometheus

Prometheus collects data from *targets* defined in its configuration file (`prometheus.yml`).

### Example `prometheus.yml`

In `prometheus.yml`, configure scrape intervals and target endpoints:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
```

- **scrape_interval**: Frequency of data scraping.
- **targets**: The endpoints from which Prometheus scrapes metrics.

### Example Targets

- **Node Exporter**: Collects server metrics. Install it on your server and set it up as a target.
- **Application Metrics**: Configure your applications to expose metrics in Prometheus format.

---

## 3. Installing Grafana

### Step 1: Download and Install Grafana

1. Download Grafana from the [Grafana website](https://grafana.com/grafana/download).
2. Install Grafana based on your operating system.

#### Starting Grafana

Run Grafana with:

```bash
sudo systemctl start grafana-server
```

Access Grafana at `http://localhost:3000`.

### Default Login

- **Username**: `admin`
- **Password**: `admin` (you’ll be prompted to change this after the first login).

---

## 4. Adding Prometheus as a Data Source in Grafana

1. Log in to Grafana and go to **Configuration > Data Sources**.
2. Click **Add data source** and select **Prometheus**.
3. Enter the Prometheus URL (e.g., `http://localhost:9090`).
4. Click **Save & Test** to verify the connection.

---

## 5. Creating Dashboards in Grafana

Dashboards allow you to visualize metrics collected by Prometheus.

### Step 1: Create a New Dashboard

1. Go to **Dashboards > New Dashboard**.
2. Click **Add a new panel** to start creating visualizations.

### Step 2: Configure Panels with PromQL

In the query editor, use **PromQL** to query Prometheus metrics.

### Example PromQL Queries

- **CPU Usage**: `rate(node_cpu_seconds_total{mode="system"}[5m])`
- **Memory Usage**: `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100`

### Step 3: Customize Panels

Select visualization types such as Graph, Gauge, or Bar Gauge. Adjust time ranges, set thresholds, and configure other settings.

---

## 6. Setting Up Alerts

Grafana can send notifications based on thresholds set in dashboards.

### Step 1: Create an Alert

1. In a dashboard panel, go to **Alert** > **Create Alert**.
2. Set conditions (e.g., **CPU Usage > 80%**).
3. Define alert frequency and conditions.

### Step 2: Configure Notification Channels

1. Go to **Alerting > Notification channels** in Grafana.
2. Set up notification channels like Email, Slack, or PagerDuty.

---

## 7. Advanced Prometheus Configuration

### Recording Rules

Prometheus recording rules precompute queries to save resources.

```yaml
rule_files:
  - "rules.yml"

# In rules.yml
groups:
  - name: example
    rules:
      - record: job:http_inprogress_requests:sum
        expr: sum by (job) (http_inprogress_requests)
```

### Alerting Rules

Define alerts in `prometheus.yml`:

```yaml
alerting:
  alertmanagers:
    - static_configs:
      - targets:
          - "localhost:9093" # Alertmanager instance

rule_files:
  - "alert_rules.yml"

# In alert_rules.yml
groups:
  - name: alert_rules
    rules:
      - alert: HighMemoryUsage
        expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected on instance {{ $labels.instance }}"
```

---

## 8. Installing and Configuring Node Exporter

**Node Exporter** provides hardware and OS metrics for *Linux* servers.

1. Download and extract Node Exporter from the [Prometheus Node Exporter page](https://prometheus.io/download/#node_exporter).
2. Start Node Exporter:

    ```bash
    ./node_exporter
    ```

3. Configure Node Exporter as a target in `prometheus.yml`:

    ```yaml
    - job_name: 'node_exporter'
      static_configs:
        - targets: ['localhost:9100']
    ```

---

## Summary

This tutorial covered:

1. **Installing Prometheus and Grafana** for monitoring.
2. **Configuring Prometheus** to scrape metrics.
3. **Adding Prometheus as a data source** in Grafana.
4. **Creating dashboards** with PromQL queries.
5. **Setting up alerts and notifications**.

Together, Prometheus and Grafana provide a robust solution for monitoring and visualizing infrastructure and application metrics in real-time.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
