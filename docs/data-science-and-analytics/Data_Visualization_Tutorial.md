# Data Visualization Tutorial

## Introduction

Data visualization is the graphical representation of information and data. By using visual elements like charts, graphs, and maps, data visualization tools provide an accessible way to see and understand trends, outliers, and patterns in data.

## Why Data Visualization Matters

1. **Quick Comprehension**: Visual data is processed faster than text
2. **Pattern Recognition**: Easier to spot trends and correlations
3. **Communication**: Effective way to share insights with stakeholders
4. **Decision Making**: Visual insights support better business decisions
5. **Engagement**: Interactive visualizations keep audiences engaged

## Python Visualization Libraries

```python
# Core libraries
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Data manipulation
import pandas as pd
import numpy as np

# Additional libraries
import bokeh
from bokeh.plotting import figure, show
import altair as alt
```

## Matplotlib Fundamentals

```python
# Basic plotting with matplotlib
fig, ax = plt.subplots(figsize=(10, 6))

# Sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
ax.plot(x, y, label='sin(x)', linewidth=2)
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.set_title('Basic Line Plot')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

## Seaborn for Statistical Visualization

```python
# Load sample dataset
tips = sns.load_dataset('tips')

# Create various plot types
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Scatter plot
sns.scatterplot(data=tips, x='total_bill', y='tip', hue='day', ax=axes[0,0])
axes[0,0].set_title('Tips vs Total Bill by Day')

# Box plot
sns.boxplot(data=tips, x='day', y='total_bill', ax=axes[0,1])
axes[0,1].set_title('Total Bill Distribution by Day')

# Histogram
sns.histplot(data=tips, x='total_bill', hue='time', ax=axes[1,0])
axes[1,0].set_title('Total Bill Distribution by Time')

# Heatmap
correlation_matrix = tips[['total_bill', 'tip', 'size']].corr()
sns.heatmap(correlation_matrix, annot=True, ax=axes[1,1])
axes[1,1].set_title('Correlation Matrix')

plt.tight_layout()
plt.show()
```

## Interactive Visualizations with Plotly

```python
# Interactive scatter plot
fig = px.scatter(tips, x='total_bill', y='tip',
                 color='day', size='size',
                 hover_data=['time'],
                 title='Interactive Tips Visualization')
fig.show()

# Interactive time series
dates = pd.date_range('2023-01-01', periods=100, freq='D')
values = np.cumsum(np.random.randn(100))
ts_data = pd.DataFrame({'date': dates, 'value': values})

fig = px.line(ts_data, x='date', y='value',
              title='Interactive Time Series')
fig.show()
```

## Advanced Visualization Techniques

### Dashboard Creation

```python
def create_sales_dashboard():
    """Create a comprehensive sales dashboard"""

    # Sample sales data
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=365, freq='D')

    sales_data = pd.DataFrame({
        'date': dates,
        'sales': np.random.normal(1000, 200, 365) +
                np.sin(np.arange(365) * 2 * np.pi / 30) * 100,  # Monthly seasonality
        'region': np.random.choice(['North', 'South', 'East', 'West'], 365),
        'product': np.random.choice(['Product A', 'Product B', 'Product C'], 365)
    })

    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Daily Sales Trend', 'Sales by Region',
                       'Product Performance', 'Monthly Summary'),
        specs=[[{"secondary_y": True}, {"type": "bar"}],
               [{"type": "pie"}, {"type": "table"}]]
    )

    # Daily sales trend
    fig.add_trace(
        go.Scatter(x=sales_data['date'], y=sales_data['sales'],
                  mode='lines', name='Daily Sales'),
        row=1, col=1
    )

    # Sales by region
    region_sales = sales_data.groupby('region')['sales'].sum()
    fig.add_trace(
        go.Bar(x=region_sales.index, y=region_sales.values,
               name='Region Sales'),
        row=1, col=2
    )

    # Product pie chart
    product_sales = sales_data.groupby('product')['sales'].sum()
    fig.add_trace(
        go.Pie(labels=product_sales.index, values=product_sales.values,
               name='Product Distribution'),
        row=2, col=1
    )

    # Monthly summary table
    monthly_summary = sales_data.groupby(sales_data['date'].dt.month).agg({
        'sales': ['sum', 'mean', 'count']
    }).round(2)

    fig.update_layout(height=800, showlegend=True,
                      title_text="Sales Dashboard")

    return fig

# dashboard = create_sales_dashboard()
# dashboard.show()
```

## Best Practices for Data Visualization

### Color and Design Principles

```python
def demonstrate_color_principles():
    """Show good vs bad color usage"""

    # Sample data
    categories = ['A', 'B', 'C', 'D', 'E']
    values = [23, 45, 56, 78, 32]

    fig, axes = plt.subplots(1, 2, figsize=(15, 6))

    # Bad: Too many bright colors
    colors_bad = ['red', 'lime', 'blue', 'yellow', 'magenta']
    axes[0].bar(categories, values, color=colors_bad)
    axes[0].set_title('Poor Color Choice', fontsize=14)
    axes[0].set_ylabel('Values')

    # Good: Subtle, coordinated colors
    colors_good = sns.color_palette("viridis", len(categories))
    axes[1].bar(categories, values, color=colors_good)
    axes[1].set_title('Better Color Choice', fontsize=14)
    axes[1].set_ylabel('Values')

    plt.tight_layout()
    plt.show()

# demonstrate_color_principles()
```

### Chart Type Selection Guide

```python
def chart_selection_guide():
    """Guide for selecting appropriate chart types"""

    guide = {
        'Comparison': {
            'Few categories': 'Bar chart, Column chart',
            'Many categories': 'Horizontal bar chart',
            'Over time': 'Line chart, Area chart'
        },
        'Distribution': {
            'Single variable': 'Histogram, Box plot, Violin plot',
            'Multiple variables': 'Multiple histograms, Strip plots'
        },
        'Relationship': {
            'Two variables': 'Scatter plot',
            'Multiple variables': 'Bubble chart, Correlation matrix'
        },
        'Composition': {
            'Static': 'Pie chart, Stacked bar chart',
            'Over time': 'Stacked area chart'
        },
        'Geographic': {
            'Regions': 'Choropleth map',
            'Points': 'Scatter map, Heat map'
        }
    }

    for category, types in guide.items():
        print(f"\n{category.upper()}:")
        for situation, chart_types in types.items():
            print(f"  {situation}: {chart_types}")

# chart_selection_guide()
```

## Specialized Visualizations

### Statistical Plots

```python
def create_statistical_visualizations():
    """Create various statistical visualization types"""

    # Generate sample data
    np.random.seed(42)
    normal_data = np.random.normal(100, 15, 1000)
    exponential_data = np.random.exponential(2, 1000)

    fig, axes = plt.subplots(2, 3, figsize=(18, 12))

    # Q-Q plots
    from scipy import stats
    stats.probplot(normal_data, dist="norm", plot=axes[0,0])
    axes[0,0].set_title('Q-Q Plot: Normal Data')

    stats.probplot(exponential_data, dist="norm", plot=axes[0,1])
    axes[0,1].set_title('Q-Q Plot: Exponential Data')

    # Violin plots
    data_combined = pd.DataFrame({
        'values': np.concatenate([normal_data, exponential_data]),
        'type': ['Normal'] * len(normal_data) + ['Exponential'] * len(exponential_data)
    })

    sns.violinplot(data=data_combined, x='type', y='values', ax=axes[0,2])
    axes[0,2].set_title('Violin Plot Comparison')

    # Distribution plots
    axes[1,0].hist(normal_data, bins=50, alpha=0.7, label='Normal')
    axes[1,0].hist(exponential_data, bins=50, alpha=0.7, label='Exponential')
    axes[1,0].legend()
    axes[1,0].set_title('Distribution Comparison')

    # Box plots
    axes[1,1].boxplot([normal_data, exponential_data],
                      labels=['Normal', 'Exponential'])
    axes[1,1].set_title('Box Plot Comparison')

    # Kernel density estimation
    sns.kdeplot(normal_data, ax=axes[1,2], label='Normal')
    sns.kdeplot(exponential_data, ax=axes[1,2], label='Exponential')
    axes[1,2].legend()
    axes[1,2].set_title('Kernel Density Estimation')

    plt.tight_layout()
    plt.show()

# create_statistical_visualizations()
```

### Geographic Visualizations

```python
def create_geographic_visualizations():
    """Create geographic visualizations"""

    # Sample geographic data
    cities_data = {
        'city': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
        'lat': [40.7128, 34.0522, 41.8781, 29.7604, 33.4484],
        'lon': [-74.0060, -118.2437, -87.6298, -95.3698, -112.0740],
        'population': [8419000, 3980000, 2716000, 2320000, 1681000]
    }

    cities_df = pd.DataFrame(cities_data)

    # Create scatter map
    fig = px.scatter_mapbox(
        cities_df,
        lat='lat',
        lon='lon',
        size='population',
        hover_name='city',
        hover_data={'population': True},
        color='population',
        color_continuous_scale='Viridis',
        title='US Cities by Population'
    )

    fig.update_layout(
        mapbox_style="open-street-map",
        height=600,
        margin={"r": 0, "t": 50, "l": 0, "b": 0}
    )

    return fig

# geo_fig = create_geographic_visualizations()
# geo_fig.show()
```

## Animation and Interactive Features

```python
def create_animated_visualization():
    """Create animated visualization showing data over time"""

    # Sample time series data for multiple categories
    dates = pd.date_range('2020-01-01', '2023-12-31', freq='M')
    categories = ['Category A', 'Category B', 'Category C']

    data = []
    for date in dates:
        for category in categories:
            value = np.random.normal(100, 20) + np.sin((date.month - 1) * 2 * np.pi / 12) * 20
            data.append({
                'date': date,
                'category': category,
                'value': value,
                'year': date.year
            })

    df_animated = pd.DataFrame(data)

    # Create animated bar chart
    fig = px.bar(
        df_animated,
        x='category',
        y='value',
        color='category',
        animation_frame='year',
        animation_group='category',
        title='Animated Bar Chart by Year',
        range_y=[0, 150]
    )

    fig.update_layout(
        xaxis_title='Category',
        yaxis_title='Value',
        showlegend=False
    )

    return fig

# animated_fig = create_animated_visualization()
# animated_fig.show()
```

## Dashboard and Reporting

### Executive Dashboard Example

```python
def create_executive_dashboard():
    """Create an executive-level dashboard"""

    # Sample business metrics
    metrics = {
        'Revenue': 1250000,
        'Customers': 15420,
        'Conversion Rate': 3.2,
        'Avg Order Value': 85.50
    }

    # Time series data
    months = pd.date_range('2023-01-01', periods=12, freq='M')
    revenue_trend = np.random.normal(1000000, 100000, 12).cumsum()

    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Key Metrics', 'Revenue Trend',
                       'Customer Segments', 'Performance Indicators'),
        specs=[[{"type": "indicator"}, {"secondary_y": True}],
               [{"type": "pie"}, {"type": "bar"}]]
    )

    # Key metrics indicators
    fig.add_trace(
        go.Indicator(
            mode="number+delta",
            value=metrics['Revenue'],
            delta={'reference': 1000000, 'relative': True},
            title="Revenue ($)",
            number={'prefix': "$"},
            domain={'x': [0, 1], 'y': [0, 1]}
        ),
        row=1, col=1
    )

    # Revenue trend
    fig.add_trace(
        go.Scatter(x=months, y=revenue_trend,
                  mode='lines+markers', name='Revenue'),
        row=1, col=2
    )

    # Customer segments pie chart
    segments = ['New', 'Returning', 'VIP']
    segment_values = [45, 35, 20]
    fig.add_trace(
        go.Pie(labels=segments, values=segment_values, name="Segments"),
        row=2, col=1
    )

    # Performance indicators
    kpis = ['Conversion', 'Retention', 'Satisfaction', 'NPS']
    kpi_values = [85, 72, 88, 65]
    fig.add_trace(
        go.Bar(x=kpis, y=kpi_values, name="KPIs"),
        row=2, col=2
    )

    fig.update_layout(
        height=800,
        showlegend=False,
        title_text="Executive Dashboard"
    )

    return fig

# exec_dashboard = create_executive_dashboard()
# exec_dashboard.show()
```

## Visualization Tools Comparison

| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| Matplotlib | Basic plots, Publication-quality | Highly customizable, Mature | Verbose syntax, Static |
| Seaborn | Statistical visualizations | Beautiful defaults, Easy syntax | Limited interactivity |
| Plotly | Interactive dashboards | Interactive, Web-ready | Learning curve, File sizes |
| Bokeh | Web applications | Interactive, Scalable | Complex for simple plots |
| Altair | Grammar of graphics | Declarative syntax, Clean | Limited customization |

## Best Practices Summary

### Do's
1. **Choose appropriate chart types** for your data
2. **Use consistent color schemes** throughout dashboards
3. **Include clear titles and labels**
4. **Start y-axis at zero** for bar charts
5. **Use whitespace effectively**
6. **Make visualizations accessible** (color-blind friendly)

### Don'ts
1. **Don't use 3D charts** unless necessary
2. **Avoid pie charts** with too many slices
3. **Don't use rainbow color schemes**
4. **Don't clutter with unnecessary elements**
5. **Don't mislead** with inappropriate scales

## Conclusion

Effective data visualization is both an art and a science. It requires understanding your audience, choosing appropriate visual encodings, and following design principles to create clear, compelling, and actionable insights from your data.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).