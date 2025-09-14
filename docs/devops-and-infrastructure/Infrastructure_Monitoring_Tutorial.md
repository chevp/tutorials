# Infrastructure Monitoring Tutorial

## Overview

Infrastructure monitoring is essential for maintaining system reliability, performance, and availability. This tutorial covers modern monitoring strategies, tools, and best practices for comprehensive infrastructure observability.

## Core Monitoring Concepts

### Metrics, Logs, and Traces

**Metrics** are numerical measurements collected over time intervals:
- System metrics: CPU usage, memory consumption, disk I/O
- Application metrics: request rates, response times, error counts
- Business metrics: user signups, revenue, conversion rates

**Logs** provide detailed event records:
- Application logs: debug, info, warn, error messages
- System logs: kernel messages, security events
- Access logs: web server requests, API calls

**Traces** track requests across distributed systems:
- Request flow through microservices
- Performance bottleneck identification
- Error propagation analysis

### The Four Golden Signals

1. **Latency**: Response time for requests
2. **Traffic**: Demand on your system (requests per second)
3. **Errors**: Rate of failed requests
4. **Saturation**: Resource utilization levels

## Monitoring Tools and Platforms

### Prometheus and Grafana

**Prometheus** is a time-series database and monitoring system:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'application'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /metrics
```

**Grafana** provides visualization and dashboards:

```json
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
          }
        ]
      }
    ]
  }
}
```

### Application Performance Monitoring (APM)

**New Relic Agent Setup**:

```javascript
// newrelic.js
'use strict';

exports.config = {
  app_name: ['My Application'],
  license_key: 'your_license_key',
  logging: {
    level: 'info'
  }
};
```

**Datadog Integration**:

```python
from datadog import initialize, statsd

initialize(api_key='your_api_key', app_key='your_app_key')

# Custom metrics
statsd.increment('web.requests', tags=['status:200'])
statsd.histogram('web.response_time', 0.25, tags=['endpoint:api'])
```

## Infrastructure as Code Monitoring

### Terraform State Monitoring

```hcl
# monitoring.tf
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "high-cpu-usage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"

  dimensions = {
    InstanceId = aws_instance.web.id
  }
}
```

### Kubernetes Monitoring

```yaml
# kube-state-metrics.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-state-metrics
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kube-state-metrics
  template:
    metadata:
      labels:
        app: kube-state-metrics
    spec:
      containers:
      - name: kube-state-metrics
        image: k8s.gcr.io/kube-state-metrics/kube-state-metrics:v2.6.0
        ports:
        - containerPort: 8080
          name: http-metrics
        - containerPort: 8081
          name: telemetry
```

## Alerting Strategies

### Alert Rules in Prometheus

```yaml
# alerts.yml
groups:
- name: system_alerts
  rules:
  - alert: HighMemoryUsage
    expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 90% for more than 5 minutes"

  - alert: DiskSpaceRunningLow
    expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.2
    for: 10m
    labels:
      severity: critical
    annotations:
      summary: "Disk space running low"
      description: "Less than 20% disk space remaining"
```

### PagerDuty Integration

```python
import pypd

pypd.api_key = "your_api_key"

# Create incident
incident = pypd.Incident.create(
    type='incident',
    title='High CPU Usage Alert',
    service=pypd.Service.find_one(name='Web Service'),
    urgency='high',
    body={
        'type': 'incident_body',
        'details': 'CPU usage exceeded 90% threshold'
    }
)
```

## Log Aggregation and Analysis

### ELK Stack Setup

**Elasticsearch Configuration**:

```yaml
# elasticsearch.yml
cluster.name: logging-cluster
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
```

**Logstash Pipeline**:

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "web" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

**Kibana Dashboard**:

```json
{
  "version": "7.15.0",
  "objects": [
    {
      "type": "dashboard",
      "attributes": {
        "title": "Application Logs",
        "panelsJSON": "[{\"type\":\"search\",\"query\":{\"match\":{\"level\":\"ERROR\"}}}]"
      }
    }
  ]
}
```

### Fluentd for Log Collection

```ruby
# fluent.conf
<source>
  @type tail
  path /var/log/app/*.log
  pos_file /var/log/fluentd/app.log.pos
  tag app.logs
  format json
</source>

<match app.logs>
  @type elasticsearch
  host elasticsearch.local
  port 9200
  index_name app-logs
  type_name logs
</match>
```

## Synthetic Monitoring

### Uptime Monitoring

```javascript
// synthetic-monitor.js
const puppeteer = require('puppeteer');

async function checkWebsite() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto('https://example.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    console.log(`Status: ${response.status()}, Load Time: ${loadTime}ms`);

  } catch (error) {
    console.error('Website check failed:', error);
  } finally {
    await browser.close();
  }
}

setInterval(checkWebsite, 60000); // Check every minute
```

### API Health Checks

```python
import requests
import time
import json

def health_check():
    endpoints = [
        'https://api.example.com/health',
        'https://api.example.com/status',
        'https://api.example.com/metrics'
    ]

    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=10)
            response_time = (time.time() - start_time) * 1000

            metrics = {
                'endpoint': endpoint,
                'status_code': response.status_code,
                'response_time_ms': response_time,
                'timestamp': time.time()
            }

            print(json.dumps(metrics))

        except requests.exceptions.RequestException as e:
            print(f"Error checking {endpoint}: {e}")

if __name__ == "__main__":
    while True:
        health_check()
        time.sleep(30)
```

## Monitoring Best Practices

### Baseline Establishment

1. **Collect baseline metrics** for normal operation periods
2. **Identify seasonal patterns** in your application usage
3. **Set appropriate thresholds** based on historical data
4. **Review and adjust** baselines regularly

### Alert Fatigue Prevention

```yaml
# Alert grouping and suppression
groups:
- name: grouped_alerts
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Service {{ $labels.instance }} is down"

  # Suppress dependent alerts
  - alert: HighLatency
    expr: http_request_duration_seconds_p99 > 1
    for: 5m
    labels:
      severity: warning
      depends_on: ServiceDown
```

### Monitoring as Code

```python
# monitoring_config.py
import yaml

def generate_prometheus_config():
    config = {
        'global': {
            'scrape_interval': '15s',
            'evaluation_interval': '15s'
        },
        'scrape_configs': []
    }

    services = [
        {'name': 'web-app', 'port': 8080, 'path': '/metrics'},
        {'name': 'database', 'port': 9090, 'path': '/db_metrics'},
        {'name': 'cache', 'port': 9091, 'path': '/cache_metrics'}
    ]

    for service in services:
        scrape_config = {
            'job_name': service['name'],
            'static_configs': [{'targets': [f"localhost:{service['port']}"]}],
            'metrics_path': service['path']
        }
        config['scrape_configs'].append(scrape_config)

    return yaml.dump(config, default_flow_style=False)
```

## Troubleshooting and Optimization

### Performance Bottleneck Identification

1. **Monitor resource utilization** trends
2. **Analyze request patterns** and traffic spikes
3. **Review error logs** for common failure modes
4. **Use distributed tracing** for complex request flows

### Capacity Planning

```python
# capacity_planning.py
import numpy as np
from sklearn.linear_model import LinearRegression

def predict_capacity_needs(historical_data):
    # Prepare time series data
    X = np.array(range(len(historical_data))).reshape(-1, 1)
    y = np.array(historical_data)

    # Train linear regression model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next 30 days
    future_days = np.array(range(len(historical_data), len(historical_data) + 30)).reshape(-1, 1)
    predictions = model.predict(future_days)

    return predictions

# Usage example
cpu_utilization = [45, 47, 52, 48, 51, 55, 58, 62, 59, 61]  # Historical data
future_usage = predict_capacity_needs(cpu_utilization)
print(f"Predicted peak usage in 30 days: {max(future_usage):.1f}%")
```

Infrastructure monitoring is crucial for maintaining reliable systems. Start with basic metrics collection, gradually implement advanced monitoring patterns, and always focus on actionable alerts that help you respond to issues quickly and effectively.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
