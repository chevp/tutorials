# Data Analysis Tutorial

## Introduction

Data analysis is the process of inspecting, cleansing, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making. This tutorial covers the fundamental concepts, tools, and techniques used in modern data analysis workflows.

## What is Data Analysis?

Data analysis involves examining datasets to extract meaningful insights, identify patterns, and inform business decisions. It encompasses descriptive, diagnostic, predictive, and prescriptive analytics to answer questions like "What happened?", "Why did it happen?", "What will happen?", and "What should we do?"

### Types of Data Analysis

1. **Descriptive Analytics**: Summarizes historical data to understand what happened
2. **Diagnostic Analytics**: Examines data to understand why something happened
3. **Predictive Analytics**: Uses statistical models to forecast future outcomes
4. **Prescriptive Analytics**: Recommends actions based on analysis results

## Data Analysis Process

### 1. Define the Problem
- Identify business questions
- Set clear objectives
- Define success metrics

### 2. Collect Data
- Identify data sources
- Gather relevant datasets
- Ensure data quality

### 3. Clean and Prepare Data
- Handle missing values
- Remove duplicates
- Transform data formats
- Create derived features

### 4. Explore Data
- Perform exploratory data analysis (EDA)
- Visualize distributions
- Identify patterns and correlations

### 5. Analyze Data
- Apply statistical methods
- Build models
- Test hypotheses

### 6. Interpret Results
- Draw conclusions
- Validate findings
- Assess limitations

### 7. Communicate Insights
- Create visualizations
- Write reports
- Present recommendations

## Python Data Analysis Stack

### Core Libraries

```python
import pandas as pd          # Data manipulation
import numpy as np          # Numerical computing
import matplotlib.pyplot as plt  # Plotting
import seaborn as sns       # Statistical visualization
import scipy.stats as stats # Statistical functions
import sklearn              # Machine learning
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
```

### Setting Up the Environment

```bash
# Create virtual environment
python -m venv data_analysis_env
source data_analysis_env/bin/activate  # On Windows: data_analysis_env\Scripts\activate

# Install required packages
pip install pandas numpy matplotlib seaborn scipy scikit-learn jupyter
pip install plotly dash streamlit  # Additional visualization tools
```

## Data Loading and Inspection

### Loading Different Data Formats

```python
# CSV files
df_csv = pd.read_csv('data/sales_data.csv')

# Excel files
df_excel = pd.read_excel('data/financial_data.xlsx', sheet_name='Q1_Results')

# JSON files
df_json = pd.read_json('data/api_response.json')

# Database connection
import sqlite3
conn = sqlite3.connect('database.db')
df_db = pd.read_sql_query("SELECT * FROM customers", conn)

# API data
import requests
response = requests.get('https://api.example.com/data')
df_api = pd.DataFrame(response.json())
```

### Initial Data Inspection

```python
# Basic information about the dataset
print("Dataset shape:", df.shape)
print("\nColumn names:")
print(df.columns.tolist())

print("\nData types:")
print(df.dtypes)

print("\nFirst 5 rows:")
print(df.head())

print("\nBasic statistics:")
print(df.describe())

# Check for missing values
print("\nMissing values:")
print(df.isnull().sum())

# Check for duplicates
print(f"\nDuplicate rows: {df.duplicated().sum()}")

# Unique values in categorical columns
for col in df.select_dtypes(include=['object']).columns:
    print(f"\n{col}: {df[col].nunique()} unique values")
    print(df[col].value_counts().head())
```

## Data Cleaning and Preparation

### Handling Missing Values

```python
# Identify missing patterns
import missingno as msno
msno.matrix(df)
plt.show()

# Remove rows with too many missing values
threshold = 0.5  # Remove rows with more than 50% missing
df_cleaned = df.dropna(thresh=len(df.columns) * threshold)

# Remove columns with too many missing values
df_cleaned = df_cleaned.dropna(axis=1, thresh=len(df_cleaned) * threshold)

# Fill missing values
# Numerical columns - fill with median
numerical_cols = df.select_dtypes(include=[np.number]).columns
df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].median())

# Categorical columns - fill with mode
categorical_cols = df.select_dtypes(include=['object']).columns
for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0])

# Forward fill for time series data
df['value'] = df['value'].fillna(method='ffill')

# Interpolate missing values
df['temperature'] = df['temperature'].interpolate(method='linear')
```

### Data Type Conversion

```python
# Convert strings to datetime
df['date'] = pd.to_datetime(df['date'])

# Convert strings to categorical
df['category'] = df['category'].astype('category')

# Convert to numeric, handling errors
df['price'] = pd.to_numeric(df['price'], errors='coerce')

# Create binary variables
df['is_weekend'] = df['day_of_week'].isin(['Saturday', 'Sunday']).astype(int)

# One-hot encoding for categorical variables
df_encoded = pd.get_dummies(df, columns=['category', 'region'], drop_first=True)
```

### Outlier Detection and Treatment

```python
# Statistical methods for outlier detection
def detect_outliers_iqr(data):
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return (data < lower_bound) | (data > upper_bound)

# Z-score method
def detect_outliers_zscore(data, threshold=3):
    z_scores = np.abs(stats.zscore(data))
    return z_scores > threshold

# Apply outlier detection
outliers_iqr = detect_outliers_iqr(df['sales'])
outliers_zscore = detect_outliers_zscore(df['sales'])

print(f"Outliers by IQR: {outliers_iqr.sum()}")
print(f"Outliers by Z-score: {outliers_zscore.sum()}")

# Visualize outliers
plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.boxplot(df['sales'])
plt.title('Box Plot')

plt.subplot(1, 3, 2)
plt.hist(df['sales'], bins=50)
plt.title('Histogram')

plt.subplot(1, 3, 3)
plt.scatter(range(len(df)), df['sales'])
plt.title('Scatter Plot')

plt.tight_layout()
plt.show()

# Remove or cap outliers
# Method 1: Remove outliers
df_no_outliers = df[~outliers_iqr]

# Method 2: Cap outliers
Q1 = df['sales'].quantile(0.25)
Q3 = df['sales'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

df['sales_capped'] = df['sales'].clip(lower=lower_bound, upper=upper_bound)
```

## Exploratory Data Analysis (EDA)

### Univariate Analysis

```python
# Numerical variables
def analyze_numerical_variable(data, column):
    plt.figure(figsize=(15, 5))

    # Histogram
    plt.subplot(1, 3, 1)
    plt.hist(data[column], bins=30, alpha=0.7)
    plt.title(f'Distribution of {column}')
    plt.xlabel(column)
    plt.ylabel('Frequency')

    # Box plot
    plt.subplot(1, 3, 2)
    plt.boxplot(data[column])
    plt.title(f'Box Plot of {column}')
    plt.ylabel(column)

    # Q-Q plot
    plt.subplot(1, 3, 3)
    stats.probplot(data[column], dist="norm", plot=plt)
    plt.title(f'Q-Q Plot of {column}')

    plt.tight_layout()
    plt.show()

    # Statistical summary
    print(f"\nStatistical Summary for {column}:")
    print(f"Mean: {data[column].mean():.2f}")
    print(f"Median: {data[column].median():.2f}")
    print(f"Mode: {data[column].mode().iloc[0]:.2f}")
    print(f"Standard Deviation: {data[column].std():.2f}")
    print(f"Variance: {data[column].var():.2f}")
    print(f"Skewness: {stats.skew(data[column]):.2f}")
    print(f"Kurtosis: {stats.kurtosis(data[column]):.2f}")

# Analyze each numerical column
for col in df.select_dtypes(include=[np.number]).columns:
    analyze_numerical_variable(df, col)
```

```python
# Categorical variables
def analyze_categorical_variable(data, column):
    plt.figure(figsize=(12, 4))

    # Value counts
    value_counts = data[column].value_counts()

    # Bar plot
    plt.subplot(1, 2, 1)
    value_counts.plot(kind='bar')
    plt.title(f'Distribution of {column}')
    plt.xlabel(column)
    plt.ylabel('Count')
    plt.xticks(rotation=45)

    # Pie chart
    plt.subplot(1, 2, 2)
    plt.pie(value_counts.values, labels=value_counts.index, autopct='%1.1f%%')
    plt.title(f'Proportion of {column}')

    plt.tight_layout()
    plt.show()

    print(f"\nValue Counts for {column}:")
    print(value_counts)
    print(f"\nPercentages:")
    print((value_counts / len(data) * 100).round(2))

# Analyze each categorical column
for col in df.select_dtypes(include=['object', 'category']).columns:
    analyze_categorical_variable(df, col)
```

### Bivariate Analysis

```python
# Numerical vs Numerical
def analyze_numerical_relationship(data, x_col, y_col):
    plt.figure(figsize=(15, 5))

    # Scatter plot
    plt.subplot(1, 3, 1)
    plt.scatter(data[x_col], data[y_col], alpha=0.6)
    plt.xlabel(x_col)
    plt.ylabel(y_col)
    plt.title(f'{y_col} vs {x_col}')

    # Add trend line
    z = np.polyfit(data[x_col], data[y_col], 1)
    p = np.poly1d(z)
    plt.plot(data[x_col], p(data[x_col]), "r--", alpha=0.8)

    # Hexbin plot for large datasets
    plt.subplot(1, 3, 2)
    plt.hexbin(data[x_col], data[y_col], gridsize=20)
    plt.xlabel(x_col)
    plt.ylabel(y_col)
    plt.title(f'Density Plot: {y_col} vs {x_col}')
    plt.colorbar()

    # Residual plot
    plt.subplot(1, 3, 3)
    residuals = data[y_col] - p(data[x_col])
    plt.scatter(data[x_col], residuals, alpha=0.6)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.xlabel(x_col)
    plt.ylabel('Residuals')
    plt.title('Residual Plot')

    plt.tight_layout()
    plt.show()

    # Correlation analysis
    correlation = data[x_col].corr(data[y_col])
    print(f"Pearson Correlation: {correlation:.3f}")

    # Statistical significance
    correlation_coef, p_value = stats.pearsonr(data[x_col], data[y_col])
    print(f"P-value: {p_value:.3f}")

    if p_value < 0.05:
        print("Correlation is statistically significant (p < 0.05)")
    else:
        print("Correlation is not statistically significant (p >= 0.05)")

# Example usage
analyze_numerical_relationship(df, 'advertising_spend', 'sales')
```

```python
# Categorical vs Numerical
def analyze_categorical_numerical(data, cat_col, num_col):
    plt.figure(figsize=(15, 5))

    # Box plot
    plt.subplot(1, 3, 1)
    sns.boxplot(x=cat_col, y=num_col, data=data)
    plt.xticks(rotation=45)
    plt.title(f'{num_col} by {cat_col}')

    # Violin plot
    plt.subplot(1, 3, 2)
    sns.violinplot(x=cat_col, y=num_col, data=data)
    plt.xticks(rotation=45)
    plt.title(f'Distribution of {num_col} by {cat_col}')

    # Bar plot (mean values)
    plt.subplot(1, 3, 3)
    mean_values = data.groupby(cat_col)[num_col].mean()
    mean_values.plot(kind='bar')
    plt.title(f'Mean {num_col} by {cat_col}')
    plt.xticks(rotation=45)

    plt.tight_layout()
    plt.show()

    # Statistical analysis
    groups = [data[data[cat_col] == cat][num_col].values for cat in data[cat_col].unique()]

    # ANOVA test
    f_stat, p_value = stats.f_oneway(*groups)
    print(f"ANOVA F-statistic: {f_stat:.3f}")
    print(f"P-value: {p_value:.3f}")

    if p_value < 0.05:
        print("Groups have significantly different means (p < 0.05)")
    else:
        print("No significant difference between group means (p >= 0.05)")

    # Group statistics
    print(f"\nGroup Statistics:")
    print(data.groupby(cat_col)[num_col].agg(['count', 'mean', 'std', 'min', 'max']))

# Example usage
analyze_categorical_numerical(df, 'region', 'sales')
```

### Multivariate Analysis

```python
# Correlation Matrix
def plot_correlation_matrix(data):
    # Calculate correlation matrix
    corr_matrix = data.select_dtypes(include=[np.number]).corr()

    # Create heatmap
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0,
                square=True, linewidths=0.1)
    plt.title('Correlation Matrix')
    plt.tight_layout()
    plt.show()

    # Find highly correlated pairs
    upper_tri = corr_matrix.where(
        np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))

    high_corr = []
    for column in upper_tri.columns:
        for index in upper_tri.index:
            if abs(upper_tri.loc[index, column]) > 0.8:
                high_corr.append((index, column, upper_tri.loc[index, column]))

    if high_corr:
        print("Highly correlated pairs (|correlation| > 0.8):")
        for pair in high_corr:
            print(f"{pair[0]} - {pair[1]}: {pair[2]:.3f}")
    else:
        print("No highly correlated pairs found.")

plot_correlation_matrix(df)
```

```python
# Principal Component Analysis (PCA)
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def perform_pca(data, n_components=None):
    # Select numerical columns
    numerical_data = data.select_dtypes(include=[np.number])

    # Standardize the data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(numerical_data)

    # Apply PCA
    if n_components is None:
        n_components = min(len(numerical_data.columns), len(numerical_data))

    pca = PCA(n_components=n_components)
    pca_result = pca.fit_transform(scaled_data)

    # Explained variance
    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.bar(range(1, len(pca.explained_variance_ratio_) + 1),
            pca.explained_variance_ratio_)
    plt.xlabel('Principal Component')
    plt.ylabel('Explained Variance Ratio')
    plt.title('Explained Variance by Component')

    plt.subplot(1, 2, 2)
    plt.plot(range(1, len(pca.explained_variance_ratio_) + 1),
             np.cumsum(pca.explained_variance_ratio_), marker='o')
    plt.xlabel('Number of Components')
    plt.ylabel('Cumulative Explained Variance')
    plt.title('Cumulative Explained Variance')
    plt.axhline(y=0.8, color='r', linestyle='--', label='80% Variance')
    plt.axhline(y=0.95, color='g', linestyle='--', label='95% Variance')
    plt.legend()

    plt.tight_layout()
    plt.show()

    print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
    print(f"Cumulative explained variance: {np.cumsum(pca.explained_variance_ratio_)}")

    return pca, pca_result

pca, pca_result = perform_pca(df)
```

## Statistical Analysis

### Hypothesis Testing

```python
# T-test for comparing means
def perform_ttest(data, group_col, value_col, group1, group2):
    group1_data = data[data[group_col] == group1][value_col]
    group2_data = data[data[group_col] == group2][value_col]

    # Independent t-test
    t_stat, p_value = stats.ttest_ind(group1_data, group2_data)

    print(f"T-test Results: {group1} vs {group2}")
    print(f"Group 1 mean: {group1_data.mean():.3f}")
    print(f"Group 2 mean: {group2_data.mean():.3f}")
    print(f"T-statistic: {t_stat:.3f}")
    print(f"P-value: {p_value:.3f}")

    if p_value < 0.05:
        print("Reject null hypothesis: Groups have significantly different means")
    else:
        print("Fail to reject null hypothesis: No significant difference")

# Chi-square test for categorical variables
def perform_chi_square(data, col1, col2):
    contingency_table = pd.crosstab(data[col1], data[col2])

    chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)

    print(f"Chi-square Test: {col1} vs {col2}")
    print(f"Chi-square statistic: {chi2:.3f}")
    print(f"P-value: {p_value:.3f}")
    print(f"Degrees of freedom: {dof}")

    if p_value < 0.05:
        print("Reject null hypothesis: Variables are dependent")
    else:
        print("Fail to reject null hypothesis: Variables are independent")

    return contingency_table

# Example usage
perform_ttest(df, 'region', 'sales', 'North', 'South')
contingency_table = perform_chi_square(df, 'region', 'product_category')
```

### Time Series Analysis

```python
# Time series decomposition
def analyze_time_series(data, date_col, value_col):
    # Ensure date column is datetime
    data[date_col] = pd.to_datetime(data[date_col])

    # Set date as index
    ts_data = data.set_index(date_col)[value_col]
    ts_data = ts_data.sort_index()

    # Resample to regular frequency if needed
    ts_data = ts_data.resample('D').mean()  # Daily average

    # Decomposition
    from statsmodels.tsa.seasonal import seasonal_decompose

    decomposition = seasonal_decompose(ts_data, model='additive', period=365)

    plt.figure(figsize=(15, 12))

    plt.subplot(4, 1, 1)
    plt.plot(ts_data)
    plt.title('Original Time Series')

    plt.subplot(4, 1, 2)
    plt.plot(decomposition.trend)
    plt.title('Trend')

    plt.subplot(4, 1, 3)
    plt.plot(decomposition.seasonal)
    plt.title('Seasonal')

    plt.subplot(4, 1, 4)
    plt.plot(decomposition.resid)
    plt.title('Residual')

    plt.tight_layout()
    plt.show()

    # Stationarity test
    from statsmodels.tsa.stattools import adfuller

    result = adfuller(ts_data.dropna())
    print(f"ADF Statistic: {result[0]:.6f}")
    print(f"p-value: {result[1]:.6f}")

    if result[1] <= 0.05:
        print("Time series is stationary")
    else:
        print("Time series is not stationary")

    return ts_data, decomposition

# Example usage (assuming you have time series data)
# ts_data, decomposition = analyze_time_series(df, 'date', 'sales')
```

## Advanced Analysis Techniques

### Regression Analysis

```python
# Multiple Linear Regression
def perform_regression_analysis(data, target_col, feature_cols):
    # Prepare data
    X = data[feature_cols]
    y = data[target_col]

    # Handle missing values
    X = X.fillna(X.mean())
    y = y.fillna(y.mean())

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Fit model
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # Predictions
    y_pred_train = model.predict(X_train_scaled)
    y_pred_test = model.predict(X_test_scaled)

    # Evaluate model
    train_mse = mean_squared_error(y_train, y_pred_train)
    test_mse = mean_squared_error(y_test, y_pred_test)
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)

    print("Regression Analysis Results:")
    print(f"Training MSE: {train_mse:.3f}")
    print(f"Testing MSE: {test_mse:.3f}")
    print(f"Training R²: {train_r2:.3f}")
    print(f"Testing R²: {test_r2:.3f}")

    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'coefficient': model.coef_,
        'abs_coefficient': np.abs(model.coef_)
    }).sort_values('abs_coefficient', ascending=False)

    print("\nFeature Importance (by coefficient magnitude):")
    print(feature_importance)

    # Residual analysis
    plt.figure(figsize=(15, 5))

    plt.subplot(1, 3, 1)
    plt.scatter(y_test, y_pred_test, alpha=0.6)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.title('Actual vs Predicted')

    plt.subplot(1, 3, 2)
    residuals = y_test - y_pred_test
    plt.scatter(y_pred_test, residuals, alpha=0.6)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.xlabel('Predicted')
    plt.ylabel('Residuals')
    plt.title('Residual Plot')

    plt.subplot(1, 3, 3)
    plt.hist(residuals, bins=20, alpha=0.7)
    plt.xlabel('Residuals')
    plt.ylabel('Frequency')
    plt.title('Residual Distribution')

    plt.tight_layout()
    plt.show()

    return model, scaler, feature_importance

# Example usage
feature_cols = ['advertising_spend', 'price', 'competitor_price']
model, scaler, importance = perform_regression_analysis(df, 'sales', feature_cols)
```

### Clustering Analysis

```python
# K-Means Clustering
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

def perform_clustering_analysis(data, feature_cols, max_clusters=10):
    # Prepare data
    X = data[feature_cols].fillna(data[feature_cols].mean())

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Elbow method for optimal number of clusters
    inertias = []
    silhouette_scores = []
    K_range = range(2, max_clusters + 1)

    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(X_scaled)
        inertias.append(kmeans.inertia_)
        silhouette_scores.append(silhouette_score(X_scaled, kmeans.labels_))

    # Plot results
    plt.figure(figsize=(15, 5))

    plt.subplot(1, 3, 1)
    plt.plot(K_range, inertias, marker='o')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Inertia')
    plt.title('Elbow Method')

    plt.subplot(1, 3, 2)
    plt.plot(K_range, silhouette_scores, marker='o')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Silhouette Score')
    plt.title('Silhouette Analysis')

    # Choose optimal number of clusters
    optimal_k = K_range[np.argmax(silhouette_scores)]
    print(f"Optimal number of clusters: {optimal_k}")

    # Final clustering
    final_kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    cluster_labels = final_kmeans.fit_predict(X_scaled)

    # Add cluster labels to original data
    data_clustered = data.copy()
    data_clustered['cluster'] = cluster_labels

    # Visualize clusters (for 2D case)
    if len(feature_cols) >= 2:
        plt.subplot(1, 3, 3)
        scatter = plt.scatter(X_scaled[:, 0], X_scaled[:, 1],
                             c=cluster_labels, cmap='viridis', alpha=0.6)
        plt.scatter(final_kmeans.cluster_centers_[:, 0],
                   final_kmeans.cluster_centers_[:, 1],
                   marker='x', s=200, linewidths=3, color='red')
        plt.xlabel(f'Scaled {feature_cols[0]}')
        plt.ylabel(f'Scaled {feature_cols[1]}')
        plt.title(f'K-Means Clustering (k={optimal_k})')
        plt.colorbar(scatter)

    plt.tight_layout()
    plt.show()

    # Cluster analysis
    print("\nCluster Analysis:")
    cluster_summary = data_clustered.groupby('cluster')[feature_cols].mean()
    print(cluster_summary)

    # Cluster sizes
    print(f"\nCluster sizes:")
    print(data_clustered['cluster'].value_counts().sort_index())

    return data_clustered, final_kmeans, scaler

# Example usage
feature_cols_clustering = ['sales', 'advertising_spend', 'price']
clustered_data, kmeans_model, cluster_scaler = perform_clustering_analysis(
    df, feature_cols_clustering)
```

## Data Visualization Best Practices

### Creating Effective Visualizations

```python
# Custom plotting functions
def create_dashboard_visualization(data):
    fig, axes = plt.subplots(2, 3, figsize=(20, 12))
    fig.suptitle('Sales Data Dashboard', fontsize=16)

    # Sales over time
    axes[0, 0].plot(data.index, data['sales'])
    axes[0, 0].set_title('Sales Trend')
    axes[0, 0].set_ylabel('Sales')
    axes[0, 0].tick_params(axis='x', rotation=45)

    # Sales by region
    region_sales = data.groupby('region')['sales'].sum()
    axes[0, 1].bar(region_sales.index, region_sales.values)
    axes[0, 1].set_title('Sales by Region')
    axes[0, 1].set_ylabel('Total Sales')
    axes[0, 1].tick_params(axis='x', rotation=45)

    # Price vs Sales scatter
    axes[0, 2].scatter(data['price'], data['sales'], alpha=0.6)
    axes[0, 2].set_title('Price vs Sales')
    axes[0, 2].set_xlabel('Price')
    axes[0, 2].set_ylabel('Sales')

    # Sales distribution
    axes[1, 0].hist(data['sales'], bins=30, alpha=0.7)
    axes[1, 0].set_title('Sales Distribution')
    axes[1, 0].set_xlabel('Sales')
    axes[1, 0].set_ylabel('Frequency')

    # Correlation heatmap
    corr_data = data.select_dtypes(include=[np.number]).corr()
    im = axes[1, 1].imshow(corr_data, cmap='coolwarm', aspect='auto')
    axes[1, 1].set_title('Correlation Matrix')
    axes[1, 1].set_xticks(range(len(corr_data.columns)))
    axes[1, 1].set_yticks(range(len(corr_data.columns)))
    axes[1, 1].set_xticklabels(corr_data.columns, rotation=45)
    axes[1, 1].set_yticklabels(corr_data.columns)
    plt.colorbar(im, ax=axes[1, 1])

    # Monthly sales trend
    monthly_sales = data.groupby(data.index.month)['sales'].mean()
    axes[1, 2].plot(monthly_sales.index, monthly_sales.values, marker='o')
    axes[1, 2].set_title('Average Monthly Sales')
    axes[1, 2].set_xlabel('Month')
    axes[1, 2].set_ylabel('Average Sales')

    plt.tight_layout()
    plt.show()

# Example usage
# create_dashboard_visualization(df)
```

### Interactive Visualizations with Plotly

```python
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

# Interactive scatter plot
def create_interactive_scatter(data, x_col, y_col, color_col=None, size_col=None):
    fig = px.scatter(data, x=x_col, y=y_col,
                     color=color_col, size=size_col,
                     hover_data=data.columns,
                     title=f'{y_col} vs {x_col}')

    fig.update_layout(
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='closest'
    )

    fig.show()

# Interactive time series
def create_interactive_timeseries(data, date_col, value_cols):
    fig = go.Figure()

    for col in value_cols:
        fig.add_trace(go.Scatter(x=data[date_col], y=data[col],
                                mode='lines+markers',
                                name=col))

    fig.update_layout(
        title='Time Series Analysis',
        xaxis_title='Date',
        yaxis_title='Value',
        hovermode='x unified'
    )

    fig.show()

# Interactive dashboard
def create_interactive_dashboard(data):
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Sales Trend', 'Sales by Region',
                       'Price vs Sales', 'Sales Distribution'),
        specs=[[{"secondary_y": False}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "histogram"}]]
    )

    # Sales trend
    fig.add_trace(
        go.Scatter(x=data.index, y=data['sales'], name='Sales'),
        row=1, col=1
    )

    # Sales by region
    region_sales = data.groupby('region')['sales'].sum()
    fig.add_trace(
        go.Bar(x=region_sales.index, y=region_sales.values, name='Region Sales'),
        row=1, col=2
    )

    # Price vs Sales
    fig.add_trace(
        go.Scatter(x=data['price'], y=data['sales'],
                  mode='markers', name='Price vs Sales'),
        row=2, col=1
    )

    # Sales distribution
    fig.add_trace(
        go.Histogram(x=data['sales'], name='Sales Distribution'),
        row=2, col=2
    )

    fig.update_layout(height=600, showlegend=True,
                      title_text="Sales Analysis Dashboard")
    fig.show()

# Example usage
# create_interactive_scatter(df, 'advertising_spend', 'sales', color_col='region')
# create_interactive_dashboard(df)
```

## Reporting and Communication

### Automated Report Generation

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
import io

def generate_analysis_report(data, analysis_results, output_file='analysis_report.pdf'):
    """Generate a comprehensive analysis report"""

    # Create PDF document
    doc = SimpleDocTemplate(output_file, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title = Paragraph("Data Analysis Report", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 20))

    # Executive Summary
    summary = f"""
    <b>Executive Summary</b><br/>
    This report presents the analysis of {len(data)} records across {len(data.columns)} variables.
    The analysis includes descriptive statistics, correlation analysis, and predictive modeling.
    """
    story.append(Paragraph(summary, styles['Normal']))
    story.append(Spacer(1, 15))

    # Key Findings
    findings = f"""
    <b>Key Findings:</b><br/>
    • Dataset contains {data.shape[0]} rows and {data.shape[1]} columns<br/>
    • Missing values found in {data.isnull().any().sum()} columns<br/>
    • Average sales: ${data['sales'].mean():.2f}<br/>
    • Highest correlation with sales: {analysis_results.get('top_correlation', 'N/A')}<br/>
    """
    story.append(Paragraph(findings, styles['Normal']))

    # Build PDF
    doc.build(story)
    print(f"Report generated: {output_file}")

# Usage example
analysis_results = {'top_correlation': 'advertising_spend (0.89)'}
# generate_analysis_report(df, analysis_results)
```

### Key Performance Indicators (KPIs)

```python
def calculate_business_kpis(data):
    """Calculate common business KPIs"""

    kpis = {}

    # Revenue metrics
    kpis['total_revenue'] = data['sales'].sum()
    kpis['average_order_value'] = data['sales'].mean()
    kpis['revenue_growth'] = ((data['sales'].iloc[-30:].mean() /
                              data['sales'].iloc[:30].mean()) - 1) * 100

    # Customer metrics
    kpis['total_customers'] = data['customer_id'].nunique()
    kpis['repeat_customers'] = (data['customer_id'].value_counts() > 1).sum()
    kpis['customer_retention_rate'] = (kpis['repeat_customers'] /
                                      kpis['total_customers']) * 100

    # Product metrics
    kpis['total_products'] = data['product_id'].nunique()
    kpis['avg_products_per_order'] = data.groupby('order_id')['product_id'].count().mean()

    # Operational metrics
    kpis['conversion_rate'] = (data['sales'] > 0).mean() * 100
    kpis['return_rate'] = (data['returned'] == True).mean() * 100

    return kpis

def create_kpi_dashboard(kpis):
    """Create a visual KPI dashboard"""

    fig, axes = plt.subplots(2, 4, figsize=(20, 10))
    fig.suptitle('Key Performance Indicators Dashboard', fontsize=16)

    kpi_list = list(kpis.items())

    for i, (kpi_name, kpi_value) in enumerate(kpi_list[:8]):
        row = i // 4
        col = i % 4

        # Create a gauge-like visualization
        axes[row, col].text(0.5, 0.5, f'{kpi_value:.2f}',
                           ha='center', va='center', fontsize=20, fontweight='bold')
        axes[row, col].text(0.5, 0.2, kpi_name.replace('_', ' ').title(),
                           ha='center', va='center', fontsize=12)
        axes[row, col].set_xlim(0, 1)
        axes[row, col].set_ylim(0, 1)
        axes[row, col].axis('off')

        # Add background color based on KPI type
        if 'rate' in kpi_name or 'growth' in kpi_name:
            axes[row, col].add_patch(plt.Rectangle((0, 0), 1, 1,
                                                  alpha=0.3, color='green' if kpi_value > 0 else 'red'))

    plt.tight_layout()
    plt.show()

    return fig

# Example usage
# kpis = calculate_business_kpis(df)
# kpi_fig = create_kpi_dashboard(kpis)
```

## Best Practices and Common Pitfalls

### Data Quality Checklist

```python
def data_quality_assessment(data):
    """Comprehensive data quality assessment"""

    quality_report = {}

    # Completeness
    quality_report['missing_data'] = {
        'total_missing': data.isnull().sum().sum(),
        'missing_by_column': data.isnull().sum().to_dict(),
        'missing_percentage': (data.isnull().sum() / len(data) * 100).to_dict()
    }

    # Consistency
    quality_report['duplicates'] = {
        'total_duplicates': data.duplicated().sum(),
        'duplicate_percentage': data.duplicated().sum() / len(data) * 100
    }

    # Validity
    numerical_cols = data.select_dtypes(include=[np.number]).columns
    quality_report['outliers'] = {}

    for col in numerical_cols:
        Q1 = data[col].quantile(0.25)
        Q3 = data[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = ((data[col] < (Q1 - 1.5 * IQR)) |
                   (data[col] > (Q3 + 1.5 * IQR))).sum()
        quality_report['outliers'][col] = {
            'count': outliers,
            'percentage': outliers / len(data) * 100
        }

    # Uniqueness
    quality_report['uniqueness'] = {}
    for col in data.columns:
        unique_count = data[col].nunique()
        quality_report['uniqueness'][col] = {
            'unique_values': unique_count,
            'uniqueness_ratio': unique_count / len(data)
        }

    return quality_report

# Usage
# quality_report = data_quality_assessment(df)
# print("Data Quality Assessment:")
# for key, value in quality_report.items():
#     print(f"\n{key.upper()}:")
#     print(value)
```

### Common Analysis Mistakes to Avoid

1. **Not understanding your data** - Always start with thorough EDA
2. **Ignoring missing data patterns** - Missing data is rarely random
3. **Correlation vs. causation** - Strong correlation doesn't imply causation
4. **Not validating assumptions** - Check model assumptions before applying
5. **Overfitting** - Always validate on unseen data
6. **Cherry-picking results** - Report all findings, not just favorable ones
7. **Ignoring business context** - Statistical significance ≠ business significance

## Conclusion

Data analysis is a systematic process that transforms raw data into actionable insights. By following the structured approach outlined in this tutorial, you can effectively analyze datasets, identify patterns, and make data-driven decisions.

Remember that data analysis is both an art and a science - it requires technical skills, domain knowledge, and critical thinking. Always question your results, validate your findings, and consider the broader business context when interpreting your analysis.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).