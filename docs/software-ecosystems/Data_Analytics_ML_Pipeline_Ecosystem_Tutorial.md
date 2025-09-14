# Data Analytics & Machine Learning Pipeline Ecosystem Tutorial

## Overview

This tutorial demonstrates building a complete data analytics and machine learning ecosystem that processes data from ingestion to insights. We'll create a real-time analytics platform for e-commerce that combines streaming data processing, batch analytics, machine learning, and interactive visualizations.

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    Data Sources Layer                            │
├─────────────┬───────────────┬──────────────┬─────────────────────┤
│ Web Events  │ Mobile App    │ IoT Sensors  │ External APIs       │
│ (JavaScript)│ (React Native)│ (MQTT/HTTP)  │ (REST/GraphQL)      │
│             │               │              │                     │
└─────────────┴───────────────┴──────────────┴─────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                Data Ingestion Layer                           │
├──────────────┬──────────────┼──────────────┬─────────────────┤
│ Apache Kafka │ Amazon       │ Apache       │ Apache NiFi     │
│ (Streaming)  │ Kinesis      │ Pulsar       │ (ETL)           │
│              │              │              │                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│              Stream Processing Layer                          │
├──────────────┬──────────────┼──────────────┬─────────────────┤
│ Apache Spark │ Apache Flink │ Apache Storm │ Kafka Streams   │
│ Streaming    │              │              │                 │
│              │              │              │                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                  Storage Layer                                │
├──────────────┬──────────────┼──────────────┬─────────────────┤
│Data Lake     │Data Warehouse│ Feature Store│ Model Registry  │
│(HDFS/S3)     │(Snowflake/   │(Feast/Tecton)│(MLflow)         │
│              │ BigQuery)    │              │                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│              Analytics & ML Layer                             │
├──────────────┬──────────────┼──────────────┬─────────────────┤
│ Batch        │ ML Training  │ ML Inference │ Real-time       │
│ Analytics    │ (PyTorch/    │ (TensorFlow  │ Analytics       │
│ (Spark/Dask) │ TensorFlow)  │ Serving)     │ (Apache Druid)  │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                Visualization Layer                            │
├──────────────┬──────────────┼──────────────┬─────────────────┤
│ Dashboards   │ Business     │ ML Monitoring│ Custom Apps     │
│ (Grafana)    │ Intelligence │ (Weights &   │ (React/D3.js)   │
│              │ (Tableau)    │ Biases)      │                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

## Data Ingestion and Streaming

### Real-time Event Streaming (Kafka + Python)

```python
# data-ingestion/kafka_producer.py
from kafka import KafkaProducer, KafkaConsumer
from kafka.admin import KafkaAdminClient, NewTopic
from kafka.errors import TopicAlreadyExistsError
import json
import logging
import asyncio
import aiohttp
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import uuid

@dataclass
class Event:
    event_id: str
    event_type: str
    timestamp: datetime
    user_id: Optional[str]
    session_id: Optional[str]
    properties: Dict[str, Any]
    context: Dict[str, Any]

class EventProducer:
    def __init__(self, bootstrap_servers: List[str], topic_config: Dict[str, Any]):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v, default=self._json_serializer).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',  # Wait for all replicas
            retries=3,
            batch_size=16384,
            linger_ms=10,
            compression_type='snappy'
        )

        self.topics = topic_config
        self.admin_client = KafkaAdminClient(bootstrap_servers=bootstrap_servers)
        self._create_topics()

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _json_serializer(self, obj):
        """Custom JSON serializer for datetime and other objects"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    def _create_topics(self):
        """Create Kafka topics if they don't exist"""
        topic_list = []
        for topic_name, config in self.topics.items():
            topic_list.append(NewTopic(
                name=topic_name,
                num_partitions=config.get('partitions', 3),
                replication_factor=config.get('replication_factor', 1),
                topic_configs=config.get('config', {})
            ))

        try:
            self.admin_client.create_topics(new_topics=topic_list, validate_only=False)
            self.logger.info(f"Created topics: {list(self.topics.keys())}")
        except TopicAlreadyExistsError:
            self.logger.info("Topics already exist")

    def send_event(self, event: Event, topic: str = None) -> None:
        """Send event to appropriate Kafka topic"""
        topic = topic or self._determine_topic(event)

        # Create partition key based on user_id or session_id for better distribution
        partition_key = event.user_id or event.session_id or str(uuid.uuid4())

        # Convert event to dictionary
        event_data = asdict(event)
        event_data['timestamp'] = event.timestamp.isoformat()

        # Add metadata
        event_data['_metadata'] = {
            'produced_at': datetime.now(timezone.utc).isoformat(),
            'producer_version': '1.0.0',
            'schema_version': '1.0'
        }

        try:
            future = self.producer.send(
                topic=topic,
                key=partition_key,
                value=event_data
            )

            # Optional: wait for confirmation
            record_metadata = future.get(timeout=10)
            self.logger.debug(f"Sent event {event.event_id} to {topic}:{record_metadata.partition}")

        except Exception as e:
            self.logger.error(f"Failed to send event {event.event_id}: {e}")
            raise

    def _determine_topic(self, event: Event) -> str:
        """Determine which topic to send the event to based on event type"""
        topic_mapping = {
            'page_view': 'web_events',
            'click': 'web_events',
            'purchase': 'transaction_events',
            'add_to_cart': 'transaction_events',
            'user_signup': 'user_events',
            'user_login': 'user_events',
            'product_view': 'product_events',
            'search': 'search_events',
            'error': 'error_events',
        }

        return topic_mapping.get(event.event_type, 'general_events')

    def flush_and_close(self):
        """Ensure all messages are sent and close the producer"""
        self.producer.flush()
        self.producer.close()

# Web event tracking client
class WebEventTracker:
    def __init__(self, producer: EventProducer):
        self.producer = producer

    def track_page_view(self, user_id: str, page: str, referrer: str = None, **kwargs):
        """Track page view event"""
        event = Event(
            event_id=str(uuid.uuid4()),
            event_type='page_view',
            timestamp=datetime.now(timezone.utc),
            user_id=user_id,
            session_id=kwargs.get('session_id'),
            properties={
                'page': page,
                'referrer': referrer,
                'user_agent': kwargs.get('user_agent'),
                'ip_address': kwargs.get('ip_address'),
                **kwargs
            },
            context={
                'library': 'web_tracker',
                'version': '1.0.0'
            }
        )

        self.producer.send_event(event)

    def track_purchase(self, user_id: str, order_id: str, items: List[Dict], total: float, **kwargs):
        """Track purchase event"""
        event = Event(
            event_id=str(uuid.uuid4()),
            event_type='purchase',
            timestamp=datetime.now(timezone.utc),
            user_id=user_id,
            session_id=kwargs.get('session_id'),
            properties={
                'order_id': order_id,
                'items': items,
                'total': total,
                'currency': kwargs.get('currency', 'USD'),
                'payment_method': kwargs.get('payment_method'),
                **kwargs
            },
            context={
                'library': 'web_tracker',
                'version': '1.0.0'
            }
        )

        self.producer.send_event(event)

    def track_custom_event(self, event_type: str, properties: Dict[str, Any], **kwargs):
        """Track custom event"""
        event = Event(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            user_id=kwargs.get('user_id'),
            session_id=kwargs.get('session_id'),
            properties=properties,
            context={
                'library': 'web_tracker',
                'version': '1.0.0'
            }
        )

        self.producer.send_event(event)

# Example usage and testing
def main():
    # Kafka configuration
    kafka_config = {
        'bootstrap_servers': ['localhost:9092'],
        'topic_config': {
            'web_events': {'partitions': 6, 'replication_factor': 1},
            'transaction_events': {'partitions': 3, 'replication_factor': 1},
            'user_events': {'partitions': 3, 'replication_factor': 1},
            'product_events': {'partitions': 6, 'replication_factor': 1},
            'search_events': {'partitions': 3, 'replication_factor': 1},
            'error_events': {'partitions': 1, 'replication_factor': 1},
            'general_events': {'partitions': 3, 'replication_factor': 1},
        }
    }

    # Initialize producer and tracker
    producer = EventProducer(
        bootstrap_servers=kafka_config['bootstrap_servers'],
        topic_config=kafka_config['topic_config']
    )

    tracker = WebEventTracker(producer)

    # Simulate events
    user_id = "user_12345"
    session_id = str(uuid.uuid4())

    # Track page view
    tracker.track_page_view(
        user_id=user_id,
        page='/products/electronics',
        referrer='google.com',
        session_id=session_id,
        user_agent='Mozilla/5.0...',
        ip_address='192.168.1.1'
    )

    # Track purchase
    tracker.track_purchase(
        user_id=user_id,
        order_id='order_789',
        items=[
            {'product_id': 'prod_123', 'quantity': 2, 'price': 29.99},
            {'product_id': 'prod_456', 'quantity': 1, 'price': 49.99}
        ],
        total=109.97,
        session_id=session_id,
        currency='USD',
        payment_method='credit_card'
    )

    # Track custom event
    tracker.track_custom_event(
        event_type='video_play',
        properties={
            'video_id': 'vid_789',
            'duration': 120,
            'quality': '1080p'
        },
        user_id=user_id,
        session_id=session_id
    )

    # Ensure all messages are sent
    producer.flush_and_close()
    print("Events sent successfully!")

if __name__ == "__main__":
    main()
```

## Stream Processing with Apache Spark

### Real-time Analytics Engine

```python
# stream-processing/spark_streaming_analytics.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from pyspark.sql.streaming import StreamingQuery
import pyspark.sql.functions as F
from typing import Dict, List
import json
import logging

class RealTimeAnalyticsEngine:
    def __init__(self, app_name: str = "RealTimeAnalytics"):
        self.spark = SparkSession.builder \
            .appName(app_name) \
            .config("spark.sql.adaptive.enabled", "true") \
            .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
            .config("spark.sql.streaming.checkpointLocation", "/tmp/spark_checkpoints") \
            .getOrCreate()

        self.spark.sparkContext.setLogLevel("WARN")
        self.logger = logging.getLogger(__name__)

        # Define schemas
        self.event_schema = self._define_event_schema()

    def _define_event_schema(self) -> StructType:
        """Define the schema for incoming events"""
        return StructType([
            StructField("event_id", StringType(), True),
            StructField("event_type", StringType(), True),
            StructField("timestamp", StringType(), True),
            StructField("user_id", StringType(), True),
            StructField("session_id", StringType(), True),
            StructField("properties", MapType(StringType(), StringType()), True),
            StructField("context", MapType(StringType(), StringType()), True),
            StructField("_metadata", MapType(StringType(), StringType()), True)
        ])

    def create_kafka_stream(self, kafka_servers: str, topics: List[str]) -> DataFrame:
        """Create a streaming DataFrame from Kafka topics"""
        return self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", kafka_servers) \
            .option("subscribe", ",".join(topics)) \
            .option("startingOffsets", "latest") \
            .option("maxOffsetsPerTrigger", 10000) \
            .load()

    def parse_events(self, kafka_df: DataFrame) -> DataFrame:
        """Parse JSON events from Kafka messages"""
        return kafka_df.select(
            col("key").cast("string").alias("partition_key"),
            col("topic"),
            col("partition"),
            col("offset"),
            col("timestamp").alias("kafka_timestamp"),
            from_json(col("value").cast("string"), self.event_schema).alias("event")
        ).select(
            col("partition_key"),
            col("topic"),
            col("kafka_timestamp"),
            col("event.*")
        ).withColumn(
            "event_timestamp",
            to_timestamp(col("timestamp"), "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
        ).withWatermark("event_timestamp", "10 minutes")

    def compute_real_time_metrics(self, events_df: DataFrame) -> Dict[str, StreamingQuery]:
        """Compute various real-time metrics"""
        queries = {}

        # 1. Page views per minute
        page_views = events_df \
            .filter(col("event_type") == "page_view") \
            .groupBy(
                window(col("event_timestamp"), "1 minute"),
                col("properties.page")
            ) \
            .count() \
            .select(
                col("window.start").alias("window_start"),
                col("window.end").alias("window_end"),
                col("page"),
                col("count").alias("page_views")
            )

        queries["page_views"] = page_views.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .queryName("page_views_per_minute") \
            .start()

        # 2. Revenue tracking
        revenue_stream = events_df \
            .filter(col("event_type") == "purchase") \
            .withColumn("revenue", col("properties.total").cast("double")) \
            .groupBy(
                window(col("event_timestamp"), "5 minutes"),
                col("properties.currency")
            ) \
            .agg(
                sum("revenue").alias("total_revenue"),
                count("*").alias("transaction_count"),
                avg("revenue").alias("avg_order_value")
            )

        queries["revenue"] = revenue_stream.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .queryName("revenue_tracking") \
            .start()

        # 3. User activity tracking
        user_activity = events_df \
            .groupBy(
                window(col("event_timestamp"), "10 minutes"),
                col("user_id")
            ) \
            .agg(
                count("*").alias("event_count"),
                countDistinct("session_id").alias("session_count"),
                collect_set("event_type").alias("event_types")
            ) \
            .filter(col("user_id").isNotNull())

        queries["user_activity"] = user_activity.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .queryName("user_activity") \
            .start()

        # 4. Real-time conversion funnel
        funnel_events = events_df \
            .filter(col("event_type").isin(["product_view", "add_to_cart", "checkout", "purchase"])) \
            .groupBy(
                window(col("event_timestamp"), "15 minutes"),
                col("event_type")
            ) \
            .count() \
            .select(
                col("window.start").alias("window_start"),
                col("event_type"),
                col("count")
            )

        queries["funnel"] = funnel_events.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .queryName("conversion_funnel") \
            .start()

        return queries

    def detect_anomalies(self, events_df: DataFrame) -> StreamingQuery:
        """Detect anomalies in real-time data"""

        # Calculate baseline metrics
        baseline_metrics = events_df \
            .groupBy(
                window(col("event_timestamp"), "1 hour", "10 minutes"),
                col("event_type")
            ) \
            .agg(
                count("*").alias("event_count"),
                countDistinct("user_id").alias("unique_users")
            ) \
            .withColumn("events_per_user", col("event_count") / col("unique_users"))

        # Simple anomaly detection using statistical thresholds
        anomalies = baseline_metrics \
            .withColumn("is_anomaly",
                when(col("event_count") > 1000, True)  # Simple threshold
                .when(col("events_per_user") > 100, True)
                .otherwise(False)
            ) \
            .filter(col("is_anomaly") == True)

        return anomalies.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .queryName("anomaly_detection") \
            .start()

    def enrich_events(self, events_df: DataFrame) -> DataFrame:
        """Enrich events with additional context"""

        # Add derived fields
        enriched_df = events_df \
            .withColumn("hour_of_day", hour(col("event_timestamp"))) \
            .withColumn("day_of_week", dayofweek(col("event_timestamp"))) \
            .withColumn("is_weekend",
                when(dayofweek(col("event_timestamp")).isin([1, 7]), True).otherwise(False)
            )

        # Add user segmentation
        enriched_df = enriched_df \
            .withColumn("user_segment",
                when(col("properties.total").cast("double") > 100, "high_value")
                .when(col("properties.total").cast("double") > 50, "medium_value")
                .otherwise("low_value")
            )

        return enriched_df

    def save_to_data_lake(self, df: DataFrame, output_path: str, format: str = "delta") -> StreamingQuery:
        """Save processed data to data lake"""

        if format == "delta":
            return df.writeStream \
                .format("delta") \
                .outputMode("append") \
                .option("path", output_path) \
                .option("checkpointLocation", f"{output_path}/_checkpoints") \
                .partitionBy("event_type", "year", "month", "day") \
                .start()
        else:
            return df.writeStream \
                .format("parquet") \
                .outputMode("append") \
                .option("path", output_path) \
                .option("checkpointLocation", f"{output_path}/_checkpoints") \
                .partitionBy("event_type") \
                .start()

    def create_feature_store_pipeline(self, events_df: DataFrame) -> StreamingQuery:
        """Create features for ML models"""

        # User behavior features (last 24 hours)
        user_features = events_df \
            .groupBy(
                window(col("event_timestamp"), "24 hours", "1 hour"),
                col("user_id")
            ) \
            .agg(
                count("*").alias("total_events"),
                countDistinct("session_id").alias("sessions"),
                countDistinct(col("properties.page")).alias("unique_pages"),
                sum(when(col("event_type") == "purchase", 1).otherwise(0)).alias("purchases"),
                sum(when(col("event_type") == "add_to_cart", 1).otherwise(0)).alias("cart_additions"),
                avg(when(col("event_type") == "purchase",
                    col("properties.total").cast("double")).otherwise(0)).alias("avg_order_value")
            ) \
            .withColumn("conversion_rate",
                col("purchases") / col("sessions") * 100
            ) \
            .withColumn("feature_timestamp", col("window.end"))

        return user_features.writeStream \
            .outputMode("update") \
            .format("delta") \
            .option("path", "/data/feature_store/user_behavior_features") \
            .option("checkpointLocation", "/data/feature_store/user_behavior_features/_checkpoints") \
            .queryName("user_behavior_features") \
            .start()

    def run_analytics_pipeline(self):
        """Run the complete analytics pipeline"""

        # Create Kafka stream
        kafka_df = self.create_kafka_stream(
            kafka_servers="localhost:9092",
            topics=["web_events", "transaction_events", "user_events"]
        )

        # Parse events
        events_df = self.parse_events(kafka_df)

        # Enrich events
        enriched_events = self.enrich_events(events_df)

        # Start real-time metrics computation
        metric_queries = self.compute_real_time_metrics(enriched_events)

        # Start anomaly detection
        anomaly_query = self.detect_anomalies(enriched_events)

        # Save to data lake
        data_lake_query = self.save_to_data_lake(
            enriched_events,
            "/data/lake/events",
            format="delta"
        )

        # Create features for ML
        feature_query = self.create_feature_store_pipeline(enriched_events)

        # Wait for all queries to complete
        try:
            self.spark.streams.awaitAnyTermination()
        except KeyboardInterrupt:
            self.logger.info("Stopping all streaming queries...")
            for query_name, query in metric_queries.items():
                query.stop()
            anomaly_query.stop()
            data_lake_query.stop()
            feature_query.stop()

def main():
    """Main function to run the analytics engine"""
    logging.basicConfig(level=logging.INFO)

    analytics_engine = RealTimeAnalyticsEngine()
    analytics_engine.run_analytics_pipeline()

if __name__ == "__main__":
    main()
```

## Machine Learning Pipeline

### ML Training and Model Management

```python
# ml-pipeline/model_training.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import lightgbm as lgb
import mlflow
import mlflow.sklearn
import mlflow.xgboost
import mlflow.lightgbm
from typing import Dict, Any, Tuple, Optional
import joblib
from datetime import datetime
import logging
import os

class MLPipeline:
    def __init__(self, experiment_name: str = "ecommerce_analytics"):
        # Initialize MLflow
        mlflow.set_experiment(experiment_name)

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Model configurations
        self.models_config = {
            'logistic_regression': {
                'model': LogisticRegression(random_state=42),
                'params': {
                    'C': [0.1, 1.0, 10.0],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear']
                }
            },
            'random_forest': {
                'model': RandomForestClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [10, 20, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            },
            'xgboost': {
                'model': xgb.XGBClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 6, 10],
                    'subsample': [0.8, 0.9, 1.0]
                }
            },
            'lightgbm': {
                'model': lgb.LGBMClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'num_leaves': [31, 50, 100],
                    'feature_fraction': [0.8, 0.9, 1.0]
                }
            }
        }

    def load_and_prepare_data(self, data_path: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Load and prepare data for training"""

        # Load data (this would typically come from your data warehouse/lake)
        df = pd.read_parquet(data_path)

        # Feature engineering for customer churn prediction
        features = self._engineer_features(df)

        # Prepare target variable
        target = self._prepare_target(df)

        return features, target

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features from raw data"""

        features = pd.DataFrame()

        # User behavior features
        user_stats = df.groupby('user_id').agg({
            'event_timestamp': ['count', 'nunique'],  # Total events, unique days
            'session_id': 'nunique',  # Number of sessions
            'total_amount': ['sum', 'mean', 'std'],  # Purchase behavior
            'event_type': lambda x: x.value_counts().to_dict()  # Event type distribution
        }).fillna(0)

        # Flatten column names
        user_stats.columns = ['_'.join(col).strip() for col in user_stats.columns.values]

        # Time-based features
        df['hour'] = pd.to_datetime(df['event_timestamp']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['event_timestamp']).dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6])

        time_features = df.groupby('user_id').agg({
            'hour': ['mean', 'std'],
            'day_of_week': ['mean', 'std'],
            'is_weekend': 'mean'
        })

        time_features.columns = ['_'.join(col).strip() for col in time_features.columns.values]

        # Combine all features
        features = pd.concat([user_stats, time_features], axis=1)

        # Fill missing values
        features = features.fillna(0)

        # Add derived features
        features['events_per_session'] = features['event_timestamp_count'] / features['session_id_nunique']
        features['avg_session_value'] = features['total_amount_sum'] / features['session_id_nunique']
        features['purchase_frequency'] = features['total_amount_sum'] / features['event_timestamp_nunique']

        return features

    def _prepare_target(self, df: pd.DataFrame) -> pd.Series:
        """Prepare target variable (churn prediction)"""

        # Define churn as no activity in last 30 days
        latest_activity = df.groupby('user_id')['event_timestamp'].max()
        latest_date = df['event_timestamp'].max()

        days_since_last_activity = (pd.to_datetime(latest_date) - pd.to_datetime(latest_activity)).dt.days

        # Churn if no activity in last 30 days
        churn = (days_since_last_activity > 30).astype(int)

        return churn

    def train_model(self, model_name: str, X: pd.DataFrame, y: pd.Series,
                   use_grid_search: bool = True) -> Dict[str, Any]:
        """Train a specific model with optional hyperparameter tuning"""

        with mlflow.start_run(run_name=f"{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):

            # Log parameters
            mlflow.log_param("model_type", model_name)
            mlflow.log_param("features_count", X.shape[1])
            mlflow.log_param("samples_count", X.shape[0])

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            # Get model configuration
            model_config = self.models_config[model_name]
            model = model_config['model']

            if use_grid_search:
                # Hyperparameter tuning
                grid_search = GridSearchCV(
                    model,
                    model_config['params'],
                    cv=5,
                    scoring='roc_auc',
                    n_jobs=-1
                )

                grid_search.fit(X_train_scaled, y_train)
                best_model = grid_search.best_estimator_

                mlflow.log_params(grid_search.best_params_)
                mlflow.log_metric("best_cv_score", grid_search.best_score_)

            else:
                best_model = model
                best_model.fit(X_train_scaled, y_train)

            # Make predictions
            y_pred = best_model.predict(X_test_scaled)
            y_pred_proba = best_model.predict_proba(X_test_scaled)[:, 1]

            # Calculate metrics
            accuracy = best_model.score(X_test_scaled, y_test)
            auc_score = roc_auc_score(y_test, y_pred_proba)

            # Log metrics
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("auc_score", auc_score)

            # Log model
            if model_name == 'xgboost':
                mlflow.xgboost.log_model(best_model, "model")
            elif model_name == 'lightgbm':
                mlflow.lightgbm.log_model(best_model, "model")
            else:
                mlflow.sklearn.log_model(best_model, "model")

            # Log scaler
            mlflow.sklearn.log_model(scaler, "scaler")

            # Log classification report
            class_report = classification_report(y_test, y_pred, output_dict=True)

            results = {
                'model': best_model,
                'scaler': scaler,
                'accuracy': accuracy,
                'auc_score': auc_score,
                'classification_report': class_report,
                'feature_names': X.columns.tolist()
            }

            # Log feature importance if available
            if hasattr(best_model, 'feature_importances_'):
                feature_importance = pd.DataFrame({
                    'feature': X.columns,
                    'importance': best_model.feature_importances_
                }).sort_values('importance', ascending=False)

                # Log top 10 features
                mlflow.log_text(feature_importance.head(10).to_string(), "top_features.txt")
                results['feature_importance'] = feature_importance

            self.logger.info(f"Model {model_name} trained. Accuracy: {accuracy:.4f}, AUC: {auc_score:.4f}")

            return results

    def compare_models(self, X: pd.DataFrame, y: pd.Series) -> pd.DataFrame:
        """Compare all models and return results"""

        results = []

        for model_name in self.models_config.keys():
            try:
                result = self.train_model(model_name, X, y)

                results.append({
                    'model': model_name,
                    'accuracy': result['accuracy'],
                    'auc_score': result['auc_score'],
                    'precision': result['classification_report']['1']['precision'],
                    'recall': result['classification_report']['1']['recall'],
                    'f1_score': result['classification_report']['1']['f1-score']
                })

            except Exception as e:
                self.logger.error(f"Error training {model_name}: {e}")

        comparison_df = pd.DataFrame(results).sort_values('auc_score', ascending=False)

        # Log comparison results
        with mlflow.start_run(run_name=f"model_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
            mlflow.log_text(comparison_df.to_string(), "model_comparison.txt")

        return comparison_df

    def create_ensemble_model(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Create an ensemble model from best performing models"""

        from sklearn.ensemble import VotingClassifier

        with mlflow.start_run(run_name=f"ensemble_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            # Create individual models
            models = [
                ('rf', RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)),
                ('xgb', xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=42)),
                ('lgb', lgb.LGBMClassifier(n_estimators=200, learning_rate=0.1, num_leaves=50, random_state=42))
            ]

            # Create ensemble
            ensemble = VotingClassifier(estimators=models, voting='soft')
            ensemble.fit(X_train_scaled, y_train)

            # Evaluate
            y_pred = ensemble.predict(X_test_scaled)
            y_pred_proba = ensemble.predict_proba(X_test_scaled)[:, 1]

            accuracy = ensemble.score(X_test_scaled, y_test)
            auc_score = roc_auc_score(y_test, y_pred_proba)

            # Log metrics
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("auc_score", auc_score)
            mlflow.log_param("model_type", "ensemble")

            # Log model
            mlflow.sklearn.log_model(ensemble, "ensemble_model")
            mlflow.sklearn.log_model(scaler, "scaler")

            return {
                'model': ensemble,
                'scaler': scaler,
                'accuracy': accuracy,
                'auc_score': auc_score
            }

    def deploy_best_model(self, model_registry_name: str) -> str:
        """Deploy the best model to model registry"""

        # Get the best run based on AUC score
        experiment = mlflow.get_experiment_by_name(mlflow.get_experiment(mlflow.active_run().info.experiment_id).name)
        runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
        best_run = runs.loc[runs['metrics.auc_score'].idxmax()]

        # Register model
        model_uri = f"runs:/{best_run.run_id}/model"
        model_details = mlflow.register_model(model_uri, model_registry_name)

        # Transition to production
        client = mlflow.tracking.MlflowClient()
        client.transition_model_version_stage(
            name=model_registry_name,
            version=model_details.version,
            stage="Production"
        )

        self.logger.info(f"Model deployed to production: {model_registry_name} v{model_details.version}")

        return model_details.version

# Feature store integration
class FeatureStore:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def get_features(self, user_ids: list, feature_date: str) -> pd.DataFrame:
        """Retrieve features from feature store"""
        # This would connect to your feature store (Feast, Tecton, etc.)
        pass

    def update_features(self, features_df: pd.DataFrame):
        """Update features in the feature store"""
        pass

# Model serving
class ModelServingAPI:
    def __init__(self, model_name: str, model_version: str = "latest"):
        self.model_name = model_name
        self.model_version = model_version
        self.model = self._load_model()
        self.scaler = self._load_scaler()

    def _load_model(self):
        """Load model from MLflow registry"""
        client = mlflow.tracking.MlflowClient()

        if self.model_version == "latest":
            latest_version = client.get_latest_versions(
                self.model_name, stages=["Production"]
            )[0]
            model_version = latest_version.version
        else:
            model_version = self.model_version

        model_uri = f"models:/{self.model_name}/{model_version}"
        return mlflow.sklearn.load_model(model_uri)

    def _load_scaler(self):
        """Load scaler from MLflow"""
        # Implementation depends on how scaler was logged
        pass

    def predict(self, features: pd.DataFrame) -> Dict[str, Any]:
        """Make predictions"""
        features_scaled = self.scaler.transform(features)
        predictions = self.model.predict_proba(features_scaled)[:, 1]

        return {
            'predictions': predictions.tolist(),
            'model_version': self.model_version,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """Main function to run the ML pipeline"""

    # Initialize pipeline
    ml_pipeline = MLPipeline()

    # Load and prepare data
    features, target = ml_pipeline.load_and_prepare_data("data/processed/user_features.parquet")

    # Compare models
    comparison_results = ml_pipeline.compare_models(features, target)
    print("Model Comparison Results:")
    print(comparison_results)

    # Create ensemble model
    ensemble_results = ml_pipeline.create_ensemble_model(features, target)
    print(f"Ensemble Model AUC: {ensemble_results['auc_score']:.4f}")

    # Deploy best model
    model_version = ml_pipeline.deploy_best_model("churn_prediction_model")
    print(f"Deployed model version: {model_version}")

if __name__ == "__main__":
    main()
```

## Interactive Dashboards and Visualization

### React Dashboard with D3.js

```typescript
// frontend-dashboard/src/components/AnalyticsDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, Row, Col, Select, DatePicker, Spin, Alert } from 'antd';
import { LineChart, BarChart, PieChart, Heatmap } from './charts';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { MetricCard } from './MetricCard';
import { RealTimeMetrics } from './RealTimeMetrics';
import type { DateRange, MetricType, ChartData } from '../types/analytics';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsDashboardProps {
  userId?: string;
  defaultDateRange?: DateRange;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  defaultDateRange = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() }
}) => {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');
  const [granularity, setGranularity] = useState<'hour' | 'day' | 'week'>('day');

  const {
    data: analyticsData,
    loading,
    error,
    refetch
  } = useAnalyticsData({
    dateRange,
    metric: selectedMetric,
    granularity,
    userId
  });

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading analytics data"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  const {
    metrics,
    timeSeriesData,
    conversionFunnel,
    userSegments,
    realTimeMetrics
  } = analyticsData;

  return (
    <div className="analytics-dashboard">
      {/* Dashboard Controls */}
      <Row gutter={[16, 16]} className="dashboard-controls">
        <Col span={8}>
          <RangePicker
            value={[dateRange.start, dateRange.end]}
            onChange={(dates) => {
              if (dates) {
                setDateRange({
                  start: dates[0].toDate(),
                  end: dates[1].toDate()
                });
              }
            }}
          />
        </Col>
        <Col span={8}>
          <Select
            value={selectedMetric}
            onChange={setSelectedMetric}
            style={{ width: '100%' }}
          >
            <Option value="revenue">Revenue</Option>
            <Option value="users">Active Users</Option>
            <Option value="conversions">Conversions</Option>
            <Option value="pageviews">Page Views</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Select
            value={granularity}
            onChange={setGranularity}
            style={{ width: '100%' }}
          >
            <Option value="hour">Hourly</Option>
            <Option value="day">Daily</Option>
            <Option value="week">Weekly</Option>
          </Select>
        </Col>
      </Row>

      {/* Real-time Metrics */}
      <RealTimeMetrics data={realTimeMetrics} />

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} className="metrics-cards">
        <Col span={6}>
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            change={metrics.revenueChange}
            format="currency"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            change={metrics.userChange}
            format="number"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            change={metrics.conversionChange}
            format="percentage"
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="Avg Order Value"
            value={metrics.avgOrderValue}
            change={metrics.aovChange}
            format="currency"
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col span={12}>
          <Card title="Revenue Trend">
            <RevenueTimeSeriesChart
              data={timeSeriesData}
              height={300}
              granularity={granularity}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Conversion Funnel">
            <ConversionFunnelChart
              data={conversionFunnel}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col span={8}>
          <Card title="User Segments">
            <UserSegmentsPieChart
              data={userSegments}
              height={250}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Activity Heatmap">
            <ActivityHeatmap
              data={analyticsData.activityHeatmap}
              height={250}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Tables */}
      <Row gutter={[16, 16]} className="tables-row">
        <Col span={12}>
          <Card title="Top Products">
            <ProductPerformanceTable
              data={analyticsData.topProducts}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="User Cohort Analysis">
            <CohortAnalysisTable
              data={analyticsData.cohortData}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Revenue Time Series Chart Component
interface RevenueTimeSeriesChartProps {
  data: ChartData[];
  height: number;
  granularity: 'hour' | 'day' | 'week';
}

const RevenueTimeSeriesChart: React.FC<RevenueTimeSeriesChartProps> = ({
  data,
  height,
  granularity
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates and set up scales
    const parseTime = d3.timeFormat("%Y-%m-%d");
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Create line generator
    const line = d3.line<ChartData>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format("$,.0f")));

    // Add the line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#1890ff")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(new Date(d.date)))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#1890ff");

    // Add tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px");

    g.selectAll(".dot")
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Date: ${d.date}<br/>Revenue: $${d.value.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

  }, [data, height, granularity]);

  return <svg ref={svgRef}></svg>;
};

// Conversion Funnel Chart Component
interface ConversionFunnelChartProps {
  data: { stage: string; count: number; rate: number }[];
  height: number;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
  data,
  height
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 600 - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate funnel widths
    const maxCount = d3.max(data, d => d.count) || 0;
    const funnelHeight = chartHeight / data.length;

    data.forEach((d, i) => {
      const barWidth = (d.count / maxCount) * width;
      const y = i * funnelHeight;

      // Draw funnel segment
      g.append("rect")
        .attr("x", (width - barWidth) / 2)
        .attr("y", y + 5)
        .attr("width", barWidth)
        .attr("height", funnelHeight - 10)
        .attr("fill", d3.schemeCategory10[i % 10])
        .attr("opacity", 0.7);

      // Add labels
      g.append("text")
        .attr("x", 10)
        .attr("y", y + funnelHeight / 2)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(d.stage);

      g.append("text")
        .attr("x", width - 10)
        .attr("y", y + funnelHeight / 2 - 10)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d.count.toLocaleString());

      g.append("text")
        .attr("x", width - 10)
        .attr("y", y + funnelHeight / 2 + 10)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", "#666")
        .text(`${d.rate.toFixed(1)}%`);
    });

  }, [data, height]);

  return <svg ref={svgRef}></svg>;
};

export default AnalyticsDashboard;
```

This comprehensive Data Analytics & ML Pipeline Ecosystem tutorial demonstrates:

1. **Data Ingestion**: Real-time event streaming with Kafka and Python producers
2. **Stream Processing**: Apache Spark for real-time analytics and feature engineering
3. **Machine Learning**: Complete ML pipeline with training, model comparison, and deployment
4. **Visualization**: Interactive React dashboards with D3.js charts
5. **MLOps**: Model versioning, experiment tracking, and automated deployment
6. **Feature Store**: Feature management and serving for ML models

The ecosystem showcases how to build production-ready data science and analytics platforms that can handle large-scale data processing, real-time insights, and machine learning workflows.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
