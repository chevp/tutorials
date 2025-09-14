# ELK Stack Tutorial (Elasticsearch, Logstash, Kibana)

## Overview

The ELK Stack is a powerful combination of three open-source tools: Elasticsearch, Logstash, and Kibana. Together, they provide a complete solution for collecting, processing, storing, and visualizing log data from various sources.

## Architecture Overview

```
Data Sources → Logstash → Elasticsearch → Kibana
                 ↓
              Beats (Optional)
```

- **Elasticsearch**: Distributed search and analytics engine
- **Logstash**: Data processing pipeline for ingesting data
- **Kibana**: Visualization and management interface
- **Beats**: Lightweight data shippers (optional)

## Elasticsearch Setup

### Installation and Configuration

**Docker Compose Setup**:

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  elasticsearch_data:
```

**Manual Configuration**:

```yaml
# elasticsearch.yml
cluster.name: my-application
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node

# JVM heap size
bootstrap.memory_lock: true

# Security settings
xpack.security.enabled: false
```

### Basic Elasticsearch Operations

**Index Management**:

```bash
# Create an index
curl -X PUT "localhost:9200/logs" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "service": { "type": "keyword" },
      "host": { "type": "keyword" }
    }
  }
}
'

# Insert a document
curl -X POST "localhost:9200/logs/_doc" -H 'Content-Type: application/json' -d'
{
  "@timestamp": "2023-01-01T12:00:00Z",
  "level": "INFO",
  "message": "Application started successfully",
  "service": "web-app",
  "host": "server-01"
}
'

# Search documents
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "level": "ERROR"
    }
  }
}
'
```

### Index Templates

```json
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "log_level": {
          "type": "keyword"
        },
        "message": {
          "type": "text",
          "analyzer": "standard"
        }
      }
    }
  }
}
```

## Logstash Configuration

### Basic Pipeline Configuration

```ruby
# logstash.conf
input {
  # File input
  file {
    path => "/var/log/application/*.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => "json"
  }

  # Beats input
  beats {
    port => 5044
  }

  # Syslog input
  syslog {
    port => 514
  }
}

filter {
  # Parse timestamp
  date {
    match => [ "timestamp", "ISO8601" ]
  }

  # Grok filter for log parsing
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:message}"
    }
    overwrite => [ "message" ]
  }

  # Add fields based on conditions
  if [level] == "ERROR" {
    mutate {
      add_field => { "alert" => "true" }
      add_tag => [ "error" ]
    }
  }

  # GeoIP enrichment
  if [client_ip] {
    geoip {
      source => "client_ip"
      target => "geoip"
    }
  }

  # Remove unwanted fields
  mutate {
    remove_field => [ "host", "agent" ]
  }
}

output {
  # Elasticsearch output
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
    template_name => "logstash"
  }

  # Conditional output for errors
  if [level] == "ERROR" {
    email {
      to => "admin@example.com"
      subject => "Error in application"
      body => "Error message: %{message}"
    }
  }

  # Debug output
  stdout {
    codec => rubydebug
  }
}
```

### Advanced Filters

**JSON Filter**:

```ruby
filter {
  json {
    source => "message"
    target => "parsed"
  }

  # Extract fields from parsed JSON
  mutate {
    add_field => {
      "user_id" => "%{[parsed][user_id]}"
      "action" => "%{[parsed][action]}"
    }
  }
}
```

**Multiline Filter**:

```ruby
filter {
  multiline {
    pattern => "^%{TIMESTAMP_ISO8601}"
    negate => true
    what => "previous"
  }
}
```

**Ruby Filter**:

```ruby
filter {
  ruby {
    code => '
      if event.get("response_time")
        response_time = event.get("response_time").to_f
        if response_time > 1000
          event.set("performance", "slow")
        elsif response_time > 500
          event.set("performance", "medium")
        else
          event.set("performance", "fast")
        end
      end
    '
  }
}
```

## Kibana Setup and Usage

### Installation

```yaml
# docker-compose.yml (add to existing)
  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
```

### Index Patterns

1. Navigate to **Management > Stack Management > Index Patterns**
2. Create index pattern: `logs-*`
3. Select time field: `@timestamp`

### Visualizations

**Log Volume Over Time**:

```json
{
  "aggs": {
    "logs_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h",
        "min_doc_count": 0
      }
    }
  }
}
```

**Error Rate by Service**:

```json
{
  "aggs": {
    "services": {
      "terms": {
        "field": "service.keyword"
      },
      "aggs": {
        "error_rate": {
          "filters": {
            "filters": {
              "errors": {
                "term": {
                  "level": "ERROR"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Dashboards

**Create Dashboard JSON**:

```json
{
  "version": "8.8.0",
  "objects": [
    {
      "type": "dashboard",
      "id": "application-logs",
      "attributes": {
        "title": "Application Logs Dashboard",
        "type": "dashboard",
        "description": "Overview of application logs and metrics",
        "panelsJSON": "[
          {
            \"version\": \"8.8.0\",
            \"gridData\": {\"x\": 0, \"y\": 0, \"w\": 24, \"h\": 15},
            \"panelIndex\": \"1\",
            \"embeddableConfig\": {},
            \"panelRefName\": \"panel_1\"
          }
        ]",
        "timeRestore": true,
        "timeTo": "now",
        "timeFrom": "now-1h"
      }
    }
  ]
}
```

## Beats Integration

### Filebeat Configuration

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/application/*.log
    - /var/log/nginx/*.log
  fields:
    service: web-app
    environment: production
  fields_under_root: true
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /var/log/database/*.log
  fields:
    service: database
    environment: production

output.logstash:
  hosts: ["logstash:5044"]

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_docker_metadata: ~
- add_kubernetes_metadata: ~

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

### Metricbeat for System Metrics

```yaml
# metricbeat.yml
metricbeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: true

metricbeat.modules:
- module: system
  metricsets:
    - cpu
    - load
    - memory
    - network
    - process
    - process_summary
    - socket_summary
  enabled: true
  period: 10s
  processes: ['.*']

- module: docker
  metricsets:
    - container
    - cpu
    - diskio
    - healthcheck
    - info
    - memory
    - network
  enabled: true
  period: 10s

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "metricbeat-%{+yyyy.MM.dd}"

setup.template.name: "metricbeat"
setup.template.pattern: "metricbeat-*"
```

## Performance Optimization

### Elasticsearch Tuning

```yaml
# elasticsearch.yml optimizations
bootstrap.memory_lock: true
indices.memory.index_buffer_size: 20%
indices.memory.min_index_buffer_size: 96mb

# Thread pool settings
thread_pool.search.queue_size: 1000
thread_pool.write.queue_size: 1000

# Circuit breaker settings
indices.breaker.total.limit: 70%
indices.breaker.request.limit: 40%
indices.breaker.fielddata.limit: 40%
```

### Logstash Performance Tuning

```ruby
# logstash.yml
pipeline.workers: 4
pipeline.batch.size: 1000
pipeline.batch.delay: 50

# JVM settings in jvm.options
-Xms2g
-Xmx2g
```

### Index Lifecycle Management

```json
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d",
            "max_docs": 100000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0
          },
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

## Security Configuration

### X-Pack Security

```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true

# Setup built-in users
elasticsearch-setup-passwords interactive
```

### Role-Based Access Control

```json
{
  "roles": {
    "logs_reader": {
      "indices": [
        {
          "names": ["logs-*"],
          "privileges": ["read", "view_index_metadata"]
        }
      ]
    },
    "logs_writer": {
      "indices": [
        {
          "names": ["logs-*"],
          "privileges": ["create", "index", "write"]
        }
      ]
    }
  }
}
```

## Monitoring and Alerting

### Watcher Alerts

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "search_type": "query_then_fetch",
        "indices": ["logs-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "term": {
                    "level": "ERROR"
                  }
                },
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-5m"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 10
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": ["admin@example.com"],
        "subject": "High Error Rate Alert",
        "body": "{{ctx.payload.hits.total}} errors detected in the last 5 minutes"
      }
    }
  }
}
```

## Troubleshooting Common Issues

### Performance Problems

1. **Slow Queries**: Use the slow log to identify problematic queries
2. **Memory Issues**: Monitor heap usage and adjust JVM settings
3. **Disk Space**: Implement proper index lifecycle management
4. **Network Latency**: Optimize network configuration between nodes

### Data Loss Prevention

```bash
# Backup indices
curl -X PUT "localhost:9200/_snapshot/backup_repository" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/elasticsearch"
  }
}
'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup_repository/snapshot_1?wait_for_completion=true"
```

## Best Practices

### Log Format Standardization

```json
{
  "@timestamp": "2023-01-01T12:00:00.000Z",
  "level": "INFO",
  "service": "user-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "message": "User logged in successfully",
  "user_id": "12345",
  "ip_address": "192.168.1.1",
  "duration_ms": 250
}
```

### Capacity Planning

1. **Estimate daily log volume** in GB
2. **Plan for peak traffic** (3-5x normal volume)
3. **Account for retention requirements**
4. **Monitor cluster health** regularly

The ELK Stack provides powerful log management capabilities. Start with a simple setup and gradually add complexity as your logging needs grow. Focus on proper data modeling, performance optimization, and security configuration for production deployments.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
