# Rust Web App Development Tutorial

This comprehensive tutorial covers building modern web applications with Rust, focusing on popular frameworks, backend development, frontend integration, and deployment strategies for full-stack web development.

---

## Prerequisites

- Basic knowledge of Rust programming
- Understanding of web development concepts (HTTP, REST APIs, databases)
- Familiarity with HTML, CSS, and JavaScript
- Basic command line usage

---

## Step 1: Rust Web Framework Overview

### Popular Rust Web Frameworks

**1. Axum (Recommended)**
- Modern, fast, and ergonomic
- Built on tokio and tower ecosystem
- Excellent type safety
- Great for APIs and full-stack apps

**2. Actix Web**
- High performance
- Actor-based architecture
- Mature ecosystem
- Production-ready

**3. Warp**
- Functional approach with filters
- Built on tokio
- Good for APIs

**4. Rocket**
- Rails-like conventions
- Code generation via macros
- Easy to learn

**5. Yew (Frontend)**
- Rust frontend framework
- WebAssembly-based
- React-like component model

---

## Step 2: Setting Up Development Environment

### Install Required Tools

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target for frontend development
rustup target add wasm32-unknown-unknown

# Install additional tools
cargo install cargo-watch      # Auto-reload during development
cargo install wasm-pack       # WebAssembly packaging
cargo install trunk           # Yew build tool
cargo install diesel_cli --no-default-features --features postgres,sqlite
cargo install sea-orm-cli     # SeaORM CLI for database management
```

### Project Structure

```
rust-web-app/
├── backend/
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── database/
├── frontend/
│   ├── Cargo.toml
│   ├── index.html
│   ├── src/
│   │   ├── main.rs
│   │   ├── components/
│   │   └── services/
├── shared/
│   ├── Cargo.toml
│   └── src/
│       └── models.rs
├── docker-compose.yml
└── README.md
```

---

## Step 3: Building Backend with Axum

### Create Backend Project

```bash
# Create workspace
mkdir rust-web-app
cd rust-web-app

# Create backend
mkdir backend
cd backend
cargo init
```

### Configure Backend Dependencies

**backend/Cargo.toml:**
```toml
[package]
name = "rust-web-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
# Web framework
axum = { version = "0.7", features = ["macros", "multipart"] }
tokio = { version = "1.0", features = ["full"] }
tower = { version = "0.4", features = ["util", "timeout", "limit", "load-shed"] }
tower-http = { version = "0.4", features = ["fs", "cors", "trace", "compression-full"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Database
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono", "json"] }

# Authentication & Security
jsonwebtoken = "9.1"
bcrypt = "0.15"
uuid = { version = "1.0", features = ["v4", "serde"] }

# Validation & Error Handling
validator = { version = "0.16", features = ["derive"] }
anyhow = "1.0"
thiserror = "1.0"

# Observability
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Time handling
chrono = { version = "0.4", features = ["serde"] }

# Environment configuration
dotenvy = "0.15"

# Async utilities
futures = "0.3"
```

### Create Database Models

**backend/src/models/mod.rs:**
```rust
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Validate, Deserialize)]
pub struct CreateUser {
    #[validate(length(min = 3, max = 50))]
    pub username: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6, max = 128))]
    pub password: String,
}

#[derive(Debug, Validate, Deserialize)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Post {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub author_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Validate, Deserialize)]
pub struct CreatePost {
    #[validate(length(min = 1, max = 200))]
    pub title: String,
    #[validate(length(min = 1, max = 10000))]
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct PostResponse {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub author: UserResponse,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
        }
    }
}
```

### Database Connection and Migrations

**backend/src/database/mod.rs:**
```rust
use sqlx::{PgPool, Row};
use anyhow::Result;
use tracing::info;

pub async fn create_connection_pool(database_url: &str) -> Result<PgPool> {
    info!("Connecting to database...");

    let pool = PgPool::connect(database_url).await?;

    info!("Running database migrations...");
    sqlx::migrate!("./migrations").run(&pool).await?;

    info!("Database connected and migrated successfully");
    Ok(pool)
}

pub async fn health_check(pool: &PgPool) -> Result<bool> {
    let row = sqlx::query("SELECT 1 as health")
        .fetch_one(pool)
        .await?;

    let health: i32 = row.try_get("health")?;
    Ok(health == 1)
}
```

### Authentication Service

**backend/src/services/auth.rs:**
```rust
use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    middleware::Next,
    response::Response,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::env;
use uuid::Uuid;
use anyhow::Result;
use chrono::{Duration, Utc};

use crate::models::{User, CreateUser, LoginUser};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // Subject (user ID)
    pub exp: usize,  // Expiry time
    pub iat: usize,  // Issued at
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: crate::models::UserResponse,
}

pub struct AuthService {
    pool: PgPool,
    jwt_secret: String,
}

impl AuthService {
    pub fn new(pool: PgPool, jwt_secret: String) -> Self {
        Self { pool, jwt_secret }
    }

    pub async fn register(&self, user_data: CreateUser) -> Result<AuthResponse> {
        // Check if user already exists
        let existing_user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1 OR username = $2"
        )
        .bind(&user_data.email)
        .bind(&user_data.username)
        .fetch_optional(&self.pool)
        .await?;

        if existing_user.is_some() {
            return Err(anyhow::anyhow!("User already exists"));
        }

        // Hash password
        let password_hash = hash(user_data.password.as_bytes(), DEFAULT_COST)?;

        // Create user
        let user_id = Uuid::new_v4();
        let now = Utc::now();

        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            "#
        )
        .bind(user_id)
        .bind(&user_data.username)
        .bind(&user_data.email)
        .bind(&password_hash)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await?;

        // Generate JWT token
        let token = self.generate_token(&user.id)?;

        Ok(AuthResponse {
            token,
            user: user.into(),
        })
    }

    pub async fn login(&self, login_data: LoginUser) -> Result<AuthResponse> {
        // Find user by email
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1"
        )
        .bind(&login_data.email)
        .fetch_optional(&self.pool)
        .await?;

        let user = user.ok_or_else(|| anyhow::anyhow!("Invalid credentials"))?;

        // Verify password
        if !verify(&login_data.password, &user.password_hash)? {
            return Err(anyhow::anyhow!("Invalid credentials"));
        }

        // Generate JWT token
        let token = self.generate_token(&user.id)?;

        Ok(AuthResponse {
            token,
            user: user.into(),
        })
    }

    pub fn generate_token(&self, user_id: &Uuid) -> Result<String> {
        let now = Utc::now();
        let expire = now + Duration::hours(24);

        let claims = Claims {
            sub: user_id.to_string(),
            exp: expire.timestamp() as usize,
            iat: now.timestamp() as usize,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }

    pub async fn get_user_by_id(&self, user_id: &Uuid) -> Result<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }
}

// Middleware for JWT authentication
pub async fn auth_middleware(
    State(auth_service): State<AuthService>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req.headers()
        .get(AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "));

    let token = auth_header.ok_or(StatusCode::UNAUTHORIZED)?;

    let claims = auth_service
        .verify_token(token)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let user = auth_service
        .get_user_by_id(&user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Add user to request extensions
    req.extensions_mut().insert(user);

    Ok(next.run(req).await)
}
```

### API Routes

**backend/src/routes/auth.rs:**
```rust
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use validator::Validate;

use crate::{
    models::{CreateUser, LoginUser, User},
    services::auth::{AuthService, AuthResponse},
};

pub fn auth_routes() -> Router<AuthService> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/me", get(me))
}

async fn register(
    State(auth_service): State<AuthService>,
    Json(user_data): Json<CreateUser>,
) -> Result<Json<AuthResponse>, StatusCode> {
    // Validate input
    user_data.validate().map_err(|_| StatusCode::BAD_REQUEST)?;

    match auth_service.register(user_data).await {
        Ok(response) => Ok(Json(response)),
        Err(_) => Err(StatusCode::CONFLICT),
    }
}

async fn login(
    State(auth_service): State<AuthService>,
    Json(login_data): Json<LoginUser>,
) -> Result<Json<AuthResponse>, StatusCode> {
    match auth_service.login(login_data).await {
        Ok(response) => Ok(Json(response)),
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

async fn me(
    user: User, // Injected by auth middleware
) -> Json<crate::models::UserResponse> {
    Json(user.into())
}
```

**backend/src/routes/posts.rs:**
```rust
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post, put, delete},
    Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;
use chrono::Utc;

use crate::models::{User, Post, CreatePost, PostResponse, UserResponse};

pub fn post_routes() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_posts).post(create_post))
        .route("/:id", get(get_post).put(update_post).delete(delete_post))
}

#[derive(Deserialize)]
struct ListQuery {
    page: Option<u32>,
    limit: Option<u32>,
}

async fn list_posts(
    State(pool): State<PgPool>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<PostResponse>>, StatusCode> {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10).min(100);
    let offset = (page - 1) * limit;

    let posts = sqlx::query!(
        r#"
        SELECT
            p.id, p.title, p.content, p.created_at, p.updated_at,
            u.id as author_id, u.username, u.email, u.created_at as author_created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
        "#,
        limit as i64,
        offset as i64
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let post_responses: Vec<PostResponse> = posts
        .into_iter()
        .map(|row| PostResponse {
            id: row.id,
            title: row.title,
            content: row.content,
            author: UserResponse {
                id: row.author_id,
                username: row.username,
                email: row.email,
                created_at: row.author_created_at,
            },
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
        .collect();

    Ok(Json(post_responses))
}

async fn create_post(
    State(pool): State<PgPool>,
    user: User, // From auth middleware
    Json(post_data): Json<CreatePost>,
) -> Result<Json<PostResponse>, StatusCode> {
    post_data.validate().map_err(|_| StatusCode::BAD_REQUEST)?;

    let post_id = Uuid::new_v4();
    let now = Utc::now();

    let post = sqlx::query_as::<_, Post>(
        r#"
        INSERT INTO posts (id, title, content, author_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#
    )
    .bind(post_id)
    .bind(&post_data.title)
    .bind(&post_data.content)
    .bind(user.id)
    .bind(now)
    .bind(now)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let post_response = PostResponse {
        id: post.id,
        title: post.title,
        content: post.content,
        author: user.into(),
        created_at: post.created_at,
        updated_at: post.updated_at,
    };

    Ok(Json(post_response))
}

async fn get_post(
    State(pool): State<PgPool>,
    Path(post_id): Path<Uuid>,
) -> Result<Json<PostResponse>, StatusCode> {
    let post = sqlx::query!(
        r#"
        SELECT
            p.id, p.title, p.content, p.created_at, p.updated_at,
            u.id as author_id, u.username, u.email, u.created_at as author_created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = $1
        "#,
        post_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let post_response = PostResponse {
        id: post.id,
        title: post.title,
        content: post.content,
        author: UserResponse {
            id: post.author_id,
            username: post.username,
            email: post.email,
            created_at: post.author_created_at,
        },
        created_at: post.created_at,
        updated_at: post.updated_at,
    };

    Ok(Json(post_response))
}

async fn update_post(
    State(pool): State<PgPool>,
    user: User,
    Path(post_id): Path<Uuid>,
    Json(post_data): Json<CreatePost>,
) -> Result<Json<PostResponse>, StatusCode> {
    post_data.validate().map_err(|_| StatusCode::BAD_REQUEST)?;

    // Check if post exists and user owns it
    let existing_post = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE id = $1"
    )
    .bind(post_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    if existing_post.author_id != user.id {
        return Err(StatusCode::FORBIDDEN);
    }

    let updated_post = sqlx::query_as::<_, Post>(
        r#"
        UPDATE posts
        SET title = $1, content = $2, updated_at = $3
        WHERE id = $4
        RETURNING *
        "#
    )
    .bind(&post_data.title)
    .bind(&post_data.content)
    .bind(Utc::now())
    .bind(post_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let post_response = PostResponse {
        id: updated_post.id,
        title: updated_post.title,
        content: updated_post.content,
        author: user.into(),
        created_at: updated_post.created_at,
        updated_at: updated_post.updated_at,
    };

    Ok(Json(post_response))
}

async fn delete_post(
    State(pool): State<PgPool>,
    user: User,
    Path(post_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // Check if post exists and user owns it
    let existing_post = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE id = $1"
    )
    .bind(post_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    if existing_post.author_id != user.id {
        return Err(StatusCode::FORBIDDEN);
    }

    sqlx::query("DELETE FROM posts WHERE id = $1")
        .bind(post_id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}
```

### Main Application

**backend/src/main.rs:**
```rust
mod database;
mod models;
mod routes;
mod services;

use axum::{
    extract::State,
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method, StatusCode,
    },
    middleware,
    response::Json,
    routing::get,
    Router,
};
use serde_json::{json, Value};
use std::env;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};
use tracing::{info, Level};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    database::{create_connection_pool, health_check},
    routes::{auth::auth_routes, posts::post_routes},
    services::auth::{auth_middleware, AuthService},
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_web_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/rust_web_app".to_string());
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| "your-super-secret-jwt-key".to_string());
    let port = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()?;

    // Create database connection pool
    let pool = create_connection_pool(&database_url).await?;

    // Create auth service
    let auth_service = AuthService::new(pool.clone(), jwt_secret);

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:8080".parse::<HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE]);

    // Build application router
    let app = Router::new()
        .route("/health", get(health))
        .nest("/api/auth", auth_routes())
        .nest(
            "/api/posts",
            post_routes().layer(middleware::from_fn_with_state(
                auth_service.clone(),
                auth_middleware,
            )),
        )
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(cors),
        )
        .with_state(auth_service)
        .with_state(pool);

    // Start server
    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{}", port)).await?;
    info!("Server running on http://0.0.0.0:{}", port);

    axum::serve(listener, app).await?;

    Ok(())
}

async fn health(State(pool): State<sqlx::PgPool>) -> Result<Json<Value>, StatusCode> {
    match health_check(&pool).await {
        Ok(true) => Ok(Json(json!({"status": "healthy", "database": "connected"}))),
        _ => Err(StatusCode::SERVICE_UNAVAILABLE),
    }
}
```

---

## Step 4: Frontend with Yew (WebAssembly)

### Create Frontend Project

```bash
# Go back to project root
cd ../..
mkdir frontend
cd frontend
cargo init
```

### Configure Frontend Dependencies

**frontend/Cargo.toml:**
```toml
[package]
name = "rust-web-frontend"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
yew = { version = "0.21", features = ["csr"] }
yew-router = "0.18"
wasm-bindgen = "0.2"
wasm-bindgen-futures = "0.4"
web-sys = "0.3"
js-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
gloo = { version = "0.10", features = ["net", "storage"] }
uuid = { version = "1.0", features = ["v4", "wasm-bindgen"] }
chrono = { version = "0.4", features = ["wasmbind"] }
wasm-logger = "0.2"
log = "0.4"

[dependencies.shared]
path = "../shared"
```

### Create Shared Models

**shared/Cargo.toml:**
```toml
[package]
name = "shared"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
validator = { version = "0.16", features = ["derive"] }
```

**shared/src/lib.rs:**
```rust
pub mod models;
pub use models::*;
```

**shared/src/models.rs:**
```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PostResponse {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub author: UserResponse,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Validate, Serialize, Deserialize, Clone)]
pub struct CreateUser {
    #[validate(length(min = 3, max = 50))]
    pub username: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6, max = 128))]
    pub password: String,
}

#[derive(Debug, Validate, Serialize, Deserialize, Clone)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Validate, Serialize, Deserialize, Clone)]
pub struct CreatePost {
    #[validate(length(min = 1, max = 200))]
    pub title: String,
    #[validate(length(min = 1, max = 10000))]
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}
```

### Frontend Services

**frontend/src/services/api.rs:**
```rust
use gloo::net::http::Request;
use gloo::storage::{LocalStorage, Storage};
use serde::de::DeserializeOwned;
use serde::Serialize;
use shared::*;
use std::collections::HashMap;

const API_BASE: &str = "http://localhost:3000/api";
const TOKEN_KEY: &str = "auth_token";

#[derive(Debug, Clone)]
pub struct ApiClient {
    base_url: String,
}

impl Default for ApiClient {
    fn default() -> Self {
        Self {
            base_url: API_BASE.to_string(),
        }
    }
}

impl ApiClient {
    pub fn new(base_url: String) -> Self {
        Self { base_url }
    }

    async fn request<T: DeserializeOwned>(
        &self,
        method: &str,
        endpoint: &str,
        body: Option<impl Serialize>,
        auth: bool,
    ) -> Result<T, gloo::net::Error> {
        let url = format!("{}/{}", self.base_url, endpoint);
        let mut request = Request::new(&url).method(method);

        if auth {
            if let Ok(token) = LocalStorage::get::<String>(TOKEN_KEY) {
                request = request.header("Authorization", &format!("Bearer {}", token));
            }
        }

        if let Some(body) = body {
            request = request
                .header("Content-Type", "application/json")
                .json(&body)?;
        }

        let response = request.send().await?;

        if response.ok() {
            response.json().await
        } else {
            Err(gloo::net::Error::GlooError(format!(
                "Request failed with status: {}",
                response.status()
            )))
        }
    }

    pub async fn register(&self, user_data: CreateUser) -> Result<AuthResponse, gloo::net::Error> {
        let response: AuthResponse = self
            .request("POST", "auth/register", Some(user_data), false)
            .await?;

        // Store token
        LocalStorage::set(TOKEN_KEY, &response.token).unwrap();

        Ok(response)
    }

    pub async fn login(&self, login_data: LoginUser) -> Result<AuthResponse, gloo::net::Error> {
        let response: AuthResponse = self
            .request("POST", "auth/login", Some(login_data), false)
            .await?;

        // Store token
        LocalStorage::set(TOKEN_KEY, &response.token).unwrap();

        Ok(response)
    }

    pub async fn me(&self) -> Result<UserResponse, gloo::net::Error> {
        self.request("GET", "auth/me", None::<()>, true).await
    }

    pub fn logout(&self) {
        LocalStorage::delete(TOKEN_KEY);
    }

    pub fn is_authenticated(&self) -> bool {
        LocalStorage::get::<String>(TOKEN_KEY).is_ok()
    }

    pub async fn get_posts(&self, page: Option<u32>) -> Result<Vec<PostResponse>, gloo::net::Error> {
        let endpoint = if let Some(page) = page {
            format!("posts?page={}", page)
        } else {
            "posts".to_string()
        };

        self.request("GET", &endpoint, None::<()>, false).await
    }

    pub async fn create_post(&self, post_data: CreatePost) -> Result<PostResponse, gloo::net::Error> {
        self.request("POST", "posts", Some(post_data), true).await
    }

    pub async fn get_post(&self, post_id: uuid::Uuid) -> Result<PostResponse, gloo::net::Error> {
        self.request("GET", &format!("posts/{}", post_id), None::<()>, false).await
    }

    pub async fn update_post(
        &self,
        post_id: uuid::Uuid,
        post_data: CreatePost,
    ) -> Result<PostResponse, gloo::net::Error> {
        self.request("PUT", &format!("posts/{}", post_id), Some(post_data), true).await
    }

    pub async fn delete_post(&self, post_id: uuid::Uuid) -> Result<(), gloo::net::Error> {
        let _: serde_json::Value = self
            .request("DELETE", &format!("posts/{}", post_id), None::<()>, true)
            .await?;
        Ok(())
    }
}
```

### Frontend Components

**frontend/src/components/mod.rs:**
```rust
pub mod header;
pub mod login;
pub mod register;
pub mod post_list;
pub mod post_form;
pub mod post_detail;

pub use header::Header;
pub use login::Login;
pub use register::Register;
pub use post_list::PostList;
pub use post_form::PostForm;
pub use post_detail::PostDetail;
```

**frontend/src/components/header.rs:**
```rust
use yew::prelude::*;
use yew_router::prelude::*;
use crate::routes::Route;
use crate::services::api::ApiClient;
use shared::UserResponse;

#[derive(Properties, PartialEq)]
pub struct HeaderProps {
    pub user: Option<UserResponse>,
    pub on_logout: Callback<()>,
}

#[function_component(Header)]
pub fn header(props: &HeaderProps) -> Html {
    let api = use_context::<ApiClient>().expect("ApiClient not found");
    let navigator = use_navigator().unwrap();

    let logout = {
        let on_logout = props.on_logout.clone();
        let navigator = navigator.clone();

        Callback::from(move |_| {
            api.logout();
            navigator.push(&Route::Home);
            on_logout.emit(());
        })
    };

    html! {
        <nav class="navbar">
            <div class="nav-container">
                <Link<Route> to={Route::Home} classes="nav-brand">
                    {"🦀 Rust Blog"}
                </Link<Route>>

                <div class="nav-menu">
                    <Link<Route> to={Route::Home} classes="nav-link">
                        {"Home"}
                    </Link<Route>>

                    if let Some(user) = &props.user {
                        <Link<Route> to={Route::CreatePost} classes="nav-link">
                            {"Create Post"}
                        </Link<Route>>
                        <span class="nav-user">{format!("Hello, {}!", user.username)}</span>
                        <button class="nav-logout" onclick={logout}>
                            {"Logout"}
                        </button>
                    } else {
                        <Link<Route> to={Route::Login} classes="nav-link">
                            {"Login"}
                        </Link<Route>>
                        <Link<Route> to={Route::Register} classes="nav-link">
                            {"Register"}
                        </Link<Route>>
                    }
                </div>
            </div>
        </nav>
    }
}
```

**frontend/src/components/post_list.rs:**
```rust
use yew::prelude::*;
use yew_router::prelude::*;
use crate::{routes::Route, services::api::ApiClient};
use shared::PostResponse;

#[function_component(PostList)]
pub fn post_list() -> Html {
    let posts = use_state(Vec::<PostResponse>::new);
    let loading = use_state(|| true);
    let error = use_state(|| None::<String>);

    let api = use_context::<ApiClient>().expect("ApiClient not found");

    // Load posts on component mount
    {
        let posts = posts.clone();
        let loading = loading.clone();
        let error = error.clone();
        let api = api.clone();

        use_effect_with((), move |_| {
            wasm_bindgen_futures::spawn_local(async move {
                match api.get_posts(Some(1)).await {
                    Ok(posts_data) => {
                        posts.set(posts_data);
                        loading.set(false);
                    }
                    Err(e) => {
                        error.set(Some(format!("Failed to load posts: {:?}", e)));
                        loading.set(false);
                    }
                }
            });
        });
    }

    if *loading {
        html! {
            <div class="loading">
                {"Loading posts..."}
            </div>
        }
    } else if let Some(error_msg) = error.as_ref() {
        html! {
            <div class="error">
                {error_msg}
            </div>
        }
    } else {
        html! {
            <div class="post-list">
                <h1>{"Latest Posts"}</h1>
                {
                    if posts.is_empty() {
                        html! {
                            <div class="no-posts">
                                {"No posts yet. Be the first to create one!"}
                            </div>
                        }
                    } else {
                        html! {
                            <div class="posts">
                                {for posts.iter().map(|post| {
                                    html! {
                                        <article key={post.id.to_string()} class="post-card">
                                            <h2>
                                                <Link<Route> to={Route::Post { id: post.id }}>
                                                    {&post.title}
                                                </Link<Route>>
                                            </h2>
                                            <div class="post-meta">
                                                {"By "} <strong>{&post.author.username}</strong>
                                                {" on "} {post.created_at.format("%Y-%m-%d %H:%M").to_string()}
                                            </div>
                                            <div class="post-preview">
                                                {post.content.chars().take(200).collect::<String>()}
                                                {if post.content.len() > 200 { "..." } else { "" }}
                                            </div>
                                        </article>
                                    }
                                })}
                            </div>
                        }
                    }
                }
            </div>
        }
    }
}
```

### Main Application and Routing

**frontend/src/routes.rs:**
```rust
use yew::prelude::*;
use yew_router::prelude::*;
use uuid::Uuid;

#[derive(Clone, Routable, PartialEq)]
pub enum Route {
    #[at("/")]
    Home,
    #[at("/login")]
    Login,
    #[at("/register")]
    Register,
    #[at("/posts/:id")]
    Post { id: Uuid },
    #[at("/posts/new")]
    CreatePost,
    #[at("/posts/:id/edit")]
    EditPost { id: Uuid },
    #[not_found]
    #[at("/404")]
    NotFound,
}

pub fn switch(routes: Route) -> Html {
    match routes {
        Route::Home => html! { <crate::components::PostList /> },
        Route::Login => html! { <crate::components::Login /> },
        Route::Register => html! { <crate::components::Register /> },
        Route::Post { id } => html! { <crate::components::PostDetail post_id={id} /> },
        Route::CreatePost => html! { <crate::components::PostForm /> },
        Route::EditPost { id } => html! { <crate::components::PostForm post_id={Some(id)} /> },
        Route::NotFound => html! { <h1>{"404 - Page Not Found"}</h1> },
    }
}
```

**frontend/src/main.rs:**
```rust
mod components;
mod routes;
mod services;

use yew::prelude::*;
use yew_router::prelude::*;

use components::Header;
use routes::{switch, Route};
use services::api::ApiClient;
use shared::UserResponse;

#[function_component(App)]
fn app() -> Html {
    let user = use_state(|| None::<UserResponse>);
    let api = use_memo(|_| ApiClient::default(), ());

    // Check authentication on app load
    {
        let user = user.clone();
        let api = api.clone();

        use_effect_with((), move |_| {
            if api.is_authenticated() {
                let user = user.clone();
                let api = api.clone();

                wasm_bindgen_futures::spawn_local(async move {
                    if let Ok(user_data) = api.me().await {
                        user.set(Some(user_data));
                    }
                });
            }
        });
    }

    let on_login = {
        let user = user.clone();
        Callback::from(move |user_data: UserResponse| {
            user.set(Some(user_data));
        })
    };

    let on_logout = {
        let user = user.clone();
        Callback::from(move |_| {
            user.set(None);
        })
    };

    html! {
        <ContextProvider<ApiClient> context={(*api).clone()}>
            <BrowserRouter>
                <div class="app">
                    <Header user={(*user).clone()} {on_logout} />
                    <main class="main-content">
                        <Switch<Route> render={switch} />
                    </main>
                </div>
            </BrowserRouter>
        </ContextProvider<ApiClient>>
    }
}

fn main() {
    wasm_logger::init(wasm_logger::Config::default());
    yew::Renderer::<App>::new().render();
}
```

### Frontend Styling

**frontend/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rust Web App</title>
    <style>
        /* CSS Variables */
        :root {
            --primary-color: #007bff;
            --secondary-color: #6c757d;
            --success-color: #28a745;
            --danger-color: #dc3545;
            --warning-color: #ffc107;
            --info-color: #17a2b8;
            --light-color: #f8f9fa;
            --dark-color: #343a40;
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --border-radius: 0.375rem;
            --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            --transition: all 0.15s ease-in-out;
        }

        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: var(--dark-color);
            background-color: #ffffff;
        }

        /* Navigation */
        .navbar {
            background-color: var(--primary-color);
            padding: 1rem 0;
            box-shadow: var(--box-shadow);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-brand {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            text-decoration: none;
            transition: var(--transition);
        }

        .nav-brand:hover {
            color: rgba(255, 255, 255, 0.8);
        }

        .nav-menu {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .nav-link {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            transition: var(--transition);
        }

        .nav-link:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .nav-user {
            color: white;
            margin-left: 1rem;
        }

        .nav-logout {
            background-color: var(--danger-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
        }

        .nav-logout:hover {
            background-color: #c82333;
        }

        /* Main content */
        .main-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        /* Forms */
        .form {
            max-width: 400px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--dark-color);
        }

        .form-control {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #dee2e6;
            border-radius: var(--border-radius);
            font-size: 1rem;
            transition: var(--transition);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            margin-bottom: 0;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            text-align: center;
            text-decoration: none;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid transparent;
            border-radius: var(--border-radius);
            transition: var(--transition);
        }

        .btn-primary {
            color: white;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }

        .btn-primary:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }

        .btn-danger {
            color: white;
            background-color: var(--danger-color);
            border-color: var(--danger-color);
        }

        .btn-danger:hover {
            background-color: #c82333;
            border-color: #bd2130;
        }

        /* Posts */
        .post-list h1 {
            margin-bottom: 2rem;
            color: var(--dark-color);
        }

        .post-card {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: var(--transition);
        }

        .post-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .post-card h2 {
            margin-bottom: 0.5rem;
        }

        .post-card h2 a {
            color: var(--dark-color);
            text-decoration: none;
            transition: var(--transition);
        }

        .post-card h2 a:hover {
            color: var(--primary-color);
        }

        .post-meta {
            color: var(--secondary-color);
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }

        .post-preview {
            color: #6c757d;
            line-height: 1.6;
        }

        /* Utility classes */
        .loading, .error, .no-posts {
            text-align: center;
            padding: 3rem;
            font-size: 1.125rem;
        }

        .error {
            color: var(--danger-color);
        }

        .loading {
            color: var(--info-color);
        }

        .no-posts {
            color: var(--secondary-color);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .nav-container {
                flex-direction: column;
                gap: 1rem;
            }

            .nav-menu {
                flex-wrap: wrap;
                justify-content: center;
            }

            .main-content {
                padding: 1rem;
            }

            .form {
                margin: 1rem auto;
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <script type="module">
        import init from './pkg/rust_web_frontend.js';
        init();
    </script>
</body>
</html>
```

---

## Step 5: Database Setup

### Create Migrations

```bash
# Create migrations directory in backend
mkdir -p backend/migrations

# Create initial migration files
touch backend/migrations/001_create_users_table.sql
touch backend/migrations/002_create_posts_table.sql
```

**backend/migrations/001_create_users_table.sql:**
```sql
-- Create users table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**backend/migrations/002_create_posts_table.sql:**
```sql
-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Docker Compose for Development

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rust_web_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  adminer:
    image: adminer
    ports:
      - "8081:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Step 6: Build and Development Scripts

### Development Scripts

**scripts/dev.sh:**
```bash
#!/bin/bash

# Start development services
echo "Starting development services..."

# Start database
docker-compose up -d postgres redis

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Start backend
echo "Starting backend server..."
cd backend
DATABASE_URL="postgres://postgres:postgres@localhost:5432/rust_web_app" \
JWT_SECRET="dev-secret-key" \
RUST_LOG=debug \
cargo watch -x run &

# Start frontend
echo "Starting frontend development server..."
cd ../frontend
trunk serve --open &

# Wait for user input to stop
echo "Development servers started. Press Ctrl+C to stop."
wait
```

**scripts/build.sh:**
```bash
#!/bin/bash

set -e

echo "Building Rust Web Application..."

# Build shared library
echo "Building shared models..."
cd shared
cargo build --release

# Build backend
echo "Building backend..."
cd ../backend
cargo build --release

# Build frontend
echo "Building frontend..."
cd ../frontend
trunk build --release

echo "Build completed successfully!"
```

**scripts/test.sh:**
```bash
#!/bin/bash

set -e

echo "Running tests..."

# Test shared models
cd shared
cargo test

# Test backend
cd ../backend
cargo test

# Test frontend
cd ../frontend
cargo test

echo "All tests passed!"
```

### Environment Configuration

**backend/.env.example:**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rust_web_app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RUST_LOG=info
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

---

## Step 7: Deployment

### Production Dockerfile

**Dockerfile.backend:**
```dockerfile
# Build stage
FROM rust:1.75 as builder

WORKDIR /app

# Copy manifests
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY shared/ ./shared/

# Cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY backend/src ./src
COPY backend/migrations ./migrations

# Build for release
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/rust-web-backend /app/
COPY --from=builder /app/migrations /app/migrations

EXPOSE 3000

CMD ["./rust-web-backend"]
```

**Dockerfile.frontend:**
```dockerfile
FROM rust:1.75 as builder

# Install trunk and wasm target
RUN cargo install trunk
RUN rustup target add wasm32-unknown-unknown

WORKDIR /app

# Copy source
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build frontend
WORKDIR /app/frontend
RUN trunk build --release

# Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Summary

This tutorial covered:

1. **Framework Overview**: Comparison of Rust web frameworks
2. **Backend Development**: Building APIs with Axum, PostgreSQL, JWT authentication
3. **Frontend Development**: Creating SPAs with Yew and WebAssembly
4. **Database Integration**: Migrations, models, and database operations
5. **Authentication & Security**: JWT tokens, password hashing, middleware
6. **Development Workflow**: Scripts, hot reloading, and testing
7. **Production Deployment**: Docker containers and production configurations

You now have the knowledge to build full-stack web applications with Rust, leveraging both backend performance and frontend capabilities through WebAssembly.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).