# Cross-Platform Development Ecosystem Tutorial

## Introduction

Cross-platform development enables developers to create applications that run on multiple operating systems and devices using a single codebase or shared components. This tutorial explores the comprehensive ecosystem of tools, frameworks, and strategies for building cross-platform applications.

## Overview

Cross-platform development has become essential in modern software development, allowing teams to maximize code reuse, reduce development costs, and reach broader audiences across different platforms and devices.

### Benefits of Cross-Platform Development

1. **Cost Efficiency**: Single codebase reduces development and maintenance costs
2. **Faster Time-to-Market**: Deploy to multiple platforms simultaneously
3. **Consistent User Experience**: Unified design and functionality across platforms
4. **Resource Optimization**: One development team can target multiple platforms
5. **Easier Maintenance**: Updates and bug fixes applied once

## Cross-Platform Technology Stack

### Frontend Technologies
- **React Native**: Mobile apps using React
- **Flutter**: Google's UI toolkit using Dart
- **Ionic**: Web-based mobile apps
- **Xamarin**: Microsoft's .NET-based framework
- **Electron**: Desktop apps using web technologies
- **Progressive Web Apps (PWA)**: Web apps with native features

### Backend Technologies
- **Node.js**: JavaScript runtime for servers
- **Python**: FastAPI, Django, Flask
- **Go**: High-performance concurrent applications
- **Java**: Spring Boot for enterprise applications
- **C#/.NET**: Microsoft's cross-platform framework

### Development Tools
- **Docker**: Containerization for consistent environments
- **GitHub Actions**: CI/CD across platforms
- **Firebase**: Backend-as-a-Service platform
- **MongoDB**: Cross-platform NoSQL database

## React Native Mobile Ecosystem

### Project Setup and Architecture

```bash
# Create new React Native project
npx react-native@latest init CrossPlatformApp --template react-native-template-typescript

# Install essential dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install @reduxjs/toolkit react-redux
```

```typescript
// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
```

### State Management with Redux Toolkit

```typescript
// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { apiService } from '../../services/api';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }) => {
    const response = await apiService.login(credentials);
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: Partial<User>) => {
    const response = await apiService.updateUser(userData);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePreferences: (state, action: PayloadAction<UserPreferences>) => {
      if (state.currentUser) {
        state.currentUser.preferences = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  },
});

export const { logout, clearError, updatePreferences } = userSlice.actions;
export default userSlice.reducer;
```

### Cross-Platform API Service

```typescript
// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

class ApiService {
  private config: ApiConfig;
  private token: string | null = null;

  constructor() {
    this.config = {
      baseURL: Platform.select({
        ios: 'https://api-ios.example.com',
        android: 'https://api-android.example.com',
        web: 'https://api.example.com',
        default: 'https://api.example.com',
      }),
      timeout: 10000,
    };

    this.initializeToken();
  }

  private async initializeToken() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const url = `${this.config.baseURL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data.token) {
      this.token = response.data.token;
      await AsyncStorage.setItem('authToken', this.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      await AsyncStorage.removeItem('authToken');
    }
  }

  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/products${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async updateUser(userData: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // File upload with cross-platform support
  async uploadFile(file: any, endpoint: string = '/upload') {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      formData.append('file', file);
    } else {
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    }

    return fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }
}

export const apiService = new ApiService();
```

### Cross-Platform UI Components

```typescript
// src/components/PlatformButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface PlatformButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        Platform.OS === 'ios' && styles.iosButton,
        Platform.OS === 'android' && styles.androidButton,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  iosButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidButton: {
    elevation: 2,
    borderRadius: 6,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});
```

### Platform-Specific Navigation

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartScreen } from '../screens/CartScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Platform.select({
          ios: '#007AFF',
          android: '#2196F3',
          default: '#007AFF',
        }),
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: Platform.select({
            ios: '#F8F9FA',
            android: '#2196F3',
            default: '#F8F9FA',
          }),
        },
        headerTintColor: Platform.select({
          ios: '#000',
          android: '#FFF',
          default: '#000',
        }),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Flutter Cross-Platform Development

### Project Structure and Setup

```yaml
# pubspec.yaml
name: cross_platform_app
description: A cross-platform Flutter application

publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter

  # State management
  bloc: ^8.1.2
  flutter_bloc: ^8.1.3

  # Navigation
  go_router: ^12.0.0

  # HTTP client
  dio: ^5.3.2

  # Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # UI
  cached_network_image: ^3.3.0
  image_picker: ^1.0.4

  # Platform-specific
  device_info_plus: ^9.1.0
  package_info_plus: ^4.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.7
  hive_generator: ^2.0.1
  json_annotation: ^4.8.1
  json_serializable: ^6.7.1

flutter:
  uses-material-design: true

  assets:
    - assets/images/
    - assets/icons/

  fonts:
    - family: CustomFont
      fonts:
        - asset: assets/fonts/CustomFont-Regular.ttf
        - asset: assets/fonts/CustomFont-Bold.ttf
          weight: 700
```

### Cross-Platform Data Models

```dart
// lib/models/user.dart
import 'package:json_annotation/json_annotation.dart';
import 'package:hive/hive.dart';

part 'user.g.dart';

@JsonSerializable()
@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String? avatar;

  @HiveField(4)
  final UserPreferences preferences;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    required this.preferences,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  User copyWith({
    String? name,
    String? email,
    String? avatar,
    UserPreferences? preferences,
  }) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      preferences: preferences ?? this.preferences,
    );
  }
}

@JsonSerializable()
@HiveType(typeId: 1)
class UserPreferences extends HiveObject {
  @HiveField(0)
  final ThemeMode theme;

  @HiveField(1)
  final String language;

  @HiveField(2)
  final bool notifications;

  UserPreferences({
    required this.theme,
    required this.language,
    required this.notifications,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);
}

enum ThemeMode {
  light,
  dark,
  system
}
```

### State Management with BLoC

```dart
// lib/bloc/user/user_bloc.dart
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/user.dart';
import '../repositories/user_repository.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository _userRepository;

  UserBloc({required UserRepository userRepository})
      : _userRepository = userRepository,
        super(const UserState()) {
    on<UserLoginRequested>(_onLoginRequested);
    on<UserLogoutRequested>(_onLogoutRequested);
    on<UserProfileUpdateRequested>(_onProfileUpdateRequested);
    on<UserPreferencesUpdateRequested>(_onPreferencesUpdateRequested);
  }

  Future<void> _onLoginRequested(
    UserLoginRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(state.copyWith(status: UserStatus.loading));

    try {
      final user = await _userRepository.login(
        email: event.email,
        password: event.password,
      );

      emit(state.copyWith(
        status: UserStatus.authenticated,
        user: user,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: UserStatus.unauthenticated,
        error: error.toString(),
      ));
    }
  }

  Future<void> _onLogoutRequested(
    UserLogoutRequested event,
    Emitter<UserState> emit,
  ) async {
    try {
      await _userRepository.logout();
      emit(const UserState());
    } catch (error) {
      emit(state.copyWith(error: error.toString()));
    }
  }

  Future<void> _onProfileUpdateRequested(
    UserProfileUpdateRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(state.copyWith(status: UserStatus.loading));

    try {
      final updatedUser = await _userRepository.updateProfile(event.userData);

      emit(state.copyWith(
        status: UserStatus.authenticated,
        user: updatedUser,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: UserStatus.authenticated,
        error: error.toString(),
      ));
    }
  }

  Future<void> _onPreferencesUpdateRequested(
    UserPreferencesUpdateRequested event,
    Emitter<UserState> emit,
  ) async {
    if (state.user != null) {
      final updatedUser = state.user!.copyWith(preferences: event.preferences);

      try {
        await _userRepository.updatePreferences(event.preferences);
        emit(state.copyWith(user: updatedUser));
      } catch (error) {
        emit(state.copyWith(error: error.toString()));
      }
    }
  }
}
```

### Cross-Platform Services

```dart
// lib/services/api_service.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  late Dio _dio;
  static const String _baseUrl = 'https://api.example.com';

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');

          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Handle token expiration
            await _refreshToken();
            return handler.resolve(await _dio.fetch(error.requestOptions));
          }

          handler.next(error);
        },
      ),
    );
  }

  Future<Response<T>> request<T>(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? queryParameters,
    dynamic data,
    Options? options,
  }) async {
    try {
      return await _dio.request<T>(
        path,
        queryParameters: queryParameters,
        data: data,
        options: options?.copyWith(method: method) ?? Options(method: method),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Response> uploadFile(
    String path,
    File file, {
    Map<String, dynamic>? data,
    ProgressCallback? onProgress,
  }) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
      ...?data,
    });

    return request(
      path,
      method: 'POST',
      data: formData,
      options: Options(
        onSendProgress: onProgress,
      ),
    );
  }

  Future<void> _refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refresh_token');

    if (refreshToken != null) {
      try {
        final response = await _dio.post('/auth/refresh', data: {
          'refresh_token': refreshToken,
        });

        final newToken = response.data['access_token'];
        await prefs.setString('auth_token', newToken);
      } catch (e) {
        // Redirect to login
        await prefs.clear();
        throw Exception('Session expired');
      }
    }
  }

  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('Connection timeout');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data['message'] ?? 'Unknown error';
          return Exception('HTTP $statusCode: $message');
        default:
          return Exception('Network error');
      }
    }

    return Exception('Unexpected error: $error');
  }
}
```

### Platform-Adaptive UI

```dart
// lib/widgets/platform_adaptive_button.dart
import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PlatformAdaptiveButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonStyle? style;
  final bool isDestructive;

  const PlatformAdaptiveButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.style,
    this.isDestructive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton(
        onPressed: onPressed,
        color: isDestructive ? CupertinoColors.destructiveRed : CupertinoColors.activeBlue,
        child: Text(text),
      );
    }

    return ElevatedButton(
      onPressed: onPressed,
      style: style ?? ElevatedButton.styleFrom(
        backgroundColor: isDestructive ? Colors.red : Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      child: Text(text),
    );
  }
}

// lib/widgets/platform_loading_indicator.dart
class PlatformLoadingIndicator extends StatelessWidget {
  final Color? color;

  const PlatformLoadingIndicator({Key? key, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoActivityIndicator(
        color: color ?? CupertinoColors.activeBlue,
      );
    }

    return CircularProgressIndicator(
      color: color ?? Theme.of(context).primaryColor,
    );
  }
}

// lib/screens/adaptive_scaffold.dart
class AdaptiveScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final Widget? drawer;

  const AdaptiveScaffold({
    Key? key,
    required this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
    this.drawer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoPageScaffold(
        navigationBar: CupertinoNavigationBar(
          middle: Text(title),
          trailing: actions != null ? Row(
            mainAxisSize: MainAxisSize.min,
            children: actions!,
          ) : null,
        ),
        child: SafeArea(child: body),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
      ),
      body: body,
      floatingActionButton: floatingActionButton,
      drawer: drawer,
    );
  }
}
```

## Electron Desktop Application

### Project Setup and Configuration

```json
// package.json
{
  "name": "cross-platform-desktop-app",
  "version": "1.0.0",
  "description": "Cross-platform desktop application built with Electron",
  "main": "dist/electron/main.js",
  "scripts": {
    "start": "concurrently \"npm run start:react\" \"wait-on http://localhost:3000 && npm run start:electron\"",
    "start:react": "react-scripts start",
    "start:electron": "electron .",
    "build": "npm run build:react && npm run build:electron",
    "build:react": "react-scripts build",
    "build:electron": "tsc -p tsconfig.electron.json",
    "pack": "electron-builder --dir",
    "dist": "npm run build && electron-builder",
    "dist:win": "npm run build && electron-builder --win",
    "dist:mac": "npm run build && electron-builder --mac",
    "dist:linux": "npm run build && electron-builder --linux"
  },
  "dependencies": {
    "electron": "^27.0.0",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3"
  },
  "devDependencies": {
    "@types/electron": "^1.6.10",
    "concurrently": "^8.2.2",
    "cross-env": "^7.0.3",
    "electron-builder": "^24.6.4",
    "typescript": "^5.2.2",
    "wait-on": "^7.2.0"
  },
  "build": {
    "appId": "com.example.crossplatformapp",
    "productName": "Cross Platform App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "dist/electron/**/*"
    ],
    "mac": {
      "target": "dmg",
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "category": "Office"
    }
  }
}
```

### Electron Main Process

```typescript
// src/electron/main.ts
import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import * as path from 'path';

interface AppConfig {
  windowBounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  theme: 'light' | 'dark' | 'system';
  autoLaunch: boolean;
}

class MainApplication {
  private mainWindow: BrowserWindow | null = null;
  private store: Store<AppConfig>;

  constructor() {
    this.store = new Store<AppConfig>({
      defaults: {
        windowBounds: { width: 1200, height: 800 },
        theme: 'system',
        autoLaunch: false,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    app.on('ready', this.onReady.bind(this));
    app.on('window-all-closed', this.onWindowAllClosed.bind(this));
    app.on('activate', this.onActivate.bind(this));
    app.on('second-instance', this.onSecondInstance.bind(this));

    // IPC handlers
    ipcMain.handle('app:get-version', () => app.getVersion());
    ipcMain.handle('app:get-platform', () => process.platform);
    ipcMain.handle('store:get', (_, key) => this.store.get(key));
    ipcMain.handle('store:set', (_, key, value) => this.store.set(key, value));
    ipcMain.handle('dialog:show-save', this.showSaveDialog.bind(this));
    ipcMain.handle('dialog:show-open', this.showOpenDialog.bind(this));
  }

  private async onReady() {
    await this.createMainWindow();
    this.setupMenu();
    this.setupAutoUpdater();
  }

  private async createMainWindow() {
    const bounds = this.store.get('windowBounds');

    this.mainWindow = new BrowserWindow({
      ...bounds,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false,
    });

    // Load the app
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`;

    await this.mainWindow.loadURL(url);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Save window bounds on close
    this.mainWindow.on('close', () => {
      if (this.mainWindow) {
        this.store.set('windowBounds', this.mainWindow.getBounds());
      }
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private setupMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.mainWindow?.webContents.send('menu:new'),
          },
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.mainWindow?.webContents.send('menu:open'),
          },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.mainWindow?.webContents.send('menu:save'),
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
          { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
          { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
          { type: 'separator' },
          { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => this.showAboutDialog(),
          },
          {
            label: 'Check for Updates',
            click: () => autoUpdater.checkForUpdatesAndNotify(),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        buttons: ['OK'],
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        buttons: ['Restart Now', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  private async showSaveDialog() {
    if (!this.mainWindow) return null;

    const result = await dialog.showSaveDialog(this.mainWindow, {
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result.canceled ? null : result.filePath;
  }

  private async showOpenDialog() {
    if (!this.mainWindow) return null;

    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result.canceled ? null : result.filePaths[0];
  }

  private showAboutDialog() {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About',
      message: 'Cross Platform App',
      detail: `Version: ${app.getVersion()}\nBuilt with Electron and React`,
      buttons: ['OK'],
    });
  }

  private onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  }

  private onSecondInstance() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  new MainApplication();
}
```

## Docker Containerization

### Multi-Platform Docker Setup

```dockerfile
# Dockerfile
# Multi-stage build for cross-platform deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER appuser

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      platforms:
        - linux/amd64
        - linux/arm64
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    platform: linux/amd64
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    platform: linux/amd64
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## CI/CD Pipeline for Cross-Platform

### GitHub Actions Workflow

```yaml
# .github/workflows/cross-platform-build.yml
name: Cross-Platform Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run linting
      run: npm run lint

  build-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build web application
      run: npm run build:web

    - name: Upload web build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: web-build
        path: build/

  build-mobile:
    needs: test
    strategy:
      matrix:
        platform: [ios, android]
    runs-on: ${{ matrix.platform == 'ios' && 'macos-latest' || 'ubuntu-latest' }}

    steps:
    - uses: actions/checkout@v3

    - name: Setup React Native
      uses: ./.github/actions/setup-react-native

    - name: Build Android
      if: matrix.platform == 'android'
      run: |
        cd android
        ./gradlew assembleRelease

    - name: Build iOS
      if: matrix.platform == 'ios'
      run: |
        cd ios
        xcodebuild -workspace CrossPlatformApp.xcworkspace -scheme CrossPlatformApp -configuration Release

    - name: Upload mobile build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.platform }}-build
        path: ${{ matrix.platform == 'android' && 'android/app/build/outputs/apk/release/' || 'ios/build/' }}

  build-desktop:
    needs: test
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build Electron app
      run: npm run dist
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Upload desktop build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: desktop-${{ matrix.os }}
        path: dist/

  deploy-web:
    needs: build-web
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Download web build artifacts
      uses: actions/download-artifact@v3
      with:
        name: web-build
        path: build/

    - name: Deploy to production
      uses: ./.github/actions/deploy-web
      with:
        build-path: build/
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy-mobile:
    needs: build-mobile
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Deploy to App Store Connect
      if: contains(github.event.head_commit.message, '[deploy-ios]')
      uses: ./.github/actions/deploy-ios

    - name: Deploy to Google Play
      if: contains(github.event.head_commit.message, '[deploy-android]')
      uses: ./.github/actions/deploy-android
```

## Best Practices and Architecture Patterns

### Shared Business Logic

```typescript
// src/core/services/BusinessLogicService.ts
export class BusinessLogicService {
  static calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static calculateShipping(total: number, shippingMethod: string): number {
    const shippingRates = {
      standard: 5.99,
      express: 12.99,
      overnight: 24.99,
    };

    if (total > 100) {
      return 0; // Free shipping over $100
    }

    return shippingRates[shippingMethod] || shippingRates.standard;
  }

  static generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `ORD-${timestamp}-${randomStr}`.toUpperCase();
  }

  static isValidCreditCard(cardNumber: string): boolean {
    // Luhn algorithm implementation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}
```

### Platform Detection Utilities

```typescript
// src/utils/PlatformUtils.ts
export class PlatformUtils {
  static get isWeb(): boolean {
    return typeof window !== 'undefined' && 'document' in window;
  }

  static get isMobile(): boolean {
    return !this.isWeb && (this.isIOS || this.isAndroid);
  }

  static get isDesktop(): boolean {
    return this.isElectron;
  }

  static get isIOS(): boolean {
    return typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static get isAndroid(): boolean {
    return typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  }

  static get isElectron(): boolean {
    return typeof window !== 'undefined' && 'electronAPI' in window;
  }

  static get platform(): 'web' | 'ios' | 'android' | 'electron' {
    if (this.isElectron) return 'electron';
    if (this.isIOS) return 'ios';
    if (this.isAndroid) return 'android';
    return 'web';
  }

  static supportsFeature(feature: string): boolean {
    const features = {
      push_notifications: this.isWeb || this.isMobile,
      file_system: this.isElectron,
      camera: this.isMobile,
      geolocation: this.isWeb || this.isMobile,
      biometric_auth: this.isMobile,
      native_sharing: this.isMobile,
    };

    return features[feature] || false;
  }

  static getStoragePrefix(): string {
    return `crossplatform_${this.platform}_`;
  }

  static async requestPermission(permission: string): Promise<boolean> {
    switch (permission) {
      case 'camera':
        if (this.isMobile) {
          // Implementation would depend on platform-specific APIs
          return true;
        }
        break;
      case 'location':
        if ('geolocation' in navigator) {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          });
        }
        break;
      case 'notifications':
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        break;
    }
    return false;
  }
}
```

## Testing Cross-Platform Applications

### Unified Testing Strategy

```typescript
// __tests__/cross-platform/BusinessLogic.test.ts
import { BusinessLogicService } from '../../src/core/services/BusinessLogicService';
import { CartItem, Product } from '../../src/types';

describe('BusinessLogicService', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    category: 'Electronics',
    images: [],
    inStock: true,
  };

  const mockCartItem: CartItem = {
    product: mockProduct,
    quantity: 2,
  };

  describe('calculateTotal', () => {
    it('should calculate correct total for single item', () => {
      const result = BusinessLogicService.calculateTotal([mockCartItem]);
      expect(result).toBe(59.98);
    });

    it('should calculate correct total for multiple items', () => {
      const items = [
        mockCartItem,
        { ...mockCartItem, quantity: 1 },
      ];
      const result = BusinessLogicService.calculateTotal(items);
      expect(result).toBe(89.97);
    });

    it('should return 0 for empty cart', () => {
      const result = BusinessLogicService.calculateTotal([]);
      expect(result).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(BusinessLogicService.validateEmail('test@example.com')).toBe(true);
      expect(BusinessLogicService.validateEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(BusinessLogicService.validateEmail('invalid-email')).toBe(false);
      expect(BusinessLogicService.validateEmail('@domain.com')).toBe(false);
      expect(BusinessLogicService.validateEmail('test@')).toBe(false);
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      expect(BusinessLogicService.isValidCreditCard('4532015112830366')).toBe(true);
      expect(BusinessLogicService.isValidCreditCard('5425233430109903')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(BusinessLogicService.isValidCreditCard('1234567890123456')).toBe(false);
      expect(BusinessLogicService.isValidCreditCard('invalid')).toBe(false);
    });
  });
});
```

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// src/utils/LazyLoader.ts
export class LazyLoader {
  static async loadComponent(componentPath: string) {
    try {
      const module = await import(componentPath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  }

  static createLazyComponent(importFunction: () => Promise<any>) {
    return React.lazy(() =>
      importFunction().catch(error => {
        console.error('Component loading failed:', error);
        // Return a fallback component
        return { default: () => React.createElement('div', null, 'Component failed to load') };
      })
    );
  }

  static async preloadComponents(componentPaths: string[]) {
    const loadPromises = componentPaths.map(path => this.loadComponent(path));
    return Promise.allSettled(loadPromises);
  }
}

// Usage in React
const LazyProductList = LazyLoader.createLazyComponent(
  () => import('../components/ProductList')
);

const LazyUserProfile = LazyLoader.createLazyComponent(
  () => import('../components/UserProfile')
);
```

## Conclusion

Cross-platform development enables efficient creation of applications that work across multiple platforms while maintaining code reuse and consistency. Key strategies include:

1. **Choose the Right Framework**: Select frameworks that align with your team's expertise and project requirements
2. **Shared Business Logic**: Extract platform-agnostic business logic into shared modules
3. **Platform-Specific Optimizations**: Adapt UI and UX for each platform's conventions
4. **Unified Testing Strategy**: Test business logic once, UI components per platform
5. **CI/CD Integration**: Automate builds and deployments across all target platforms
6. **Performance Monitoring**: Monitor performance across different platforms and devices

The cross-platform approach significantly reduces development time and maintenance overhead while reaching broader audiences across web, mobile, and desktop platforms.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).