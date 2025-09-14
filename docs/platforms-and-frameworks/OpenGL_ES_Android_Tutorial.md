
# OpenGL ES with Java and Android SDK Tutorial

OpenGL ES (Open Graphics Library for Embedded Systems) is a subset of OpenGL, optimized for mobile devices. It is commonly used for rendering 2D and 3D graphics in Android applications. This tutorial covers the basics of setting up an OpenGL ES environment in an Android project, drawing a triangle, and rendering it on the screen.

---

## Prerequisites

1. **Android Studio**: Ensure Android Studio is installed.
2. **Basic Knowledge of Java and Android Development**: Familiarity with Java and Android project structures is recommended.

---

## 1. Setting Up a New Android Project with OpenGL ES

### Step 1: Create a New Android Project

1. Open Android Studio.
2. Select **New Project**.
3. Choose **Empty Activity** and click **Next**.
4. Name your project, choose **Java** as the language, and click **Finish**.

### Step 2: Modify the Activity Layout

In `res/layout/activity_main.xml`, replace the default `ConstraintLayout` with a `GLSurfaceView`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <android.opengl.GLSurfaceView
        android:id="@+id/glSurfaceView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

---

## 2. Setting Up the GLSurfaceView and Renderer

### Step 1: Create a Custom GLSurfaceView

In your `MainActivity.java`, define the custom `GLSurfaceView` and `Renderer`:

```java
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private GLSurfaceView glSurfaceView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        glSurfaceView = new GLSurfaceView(this);
        glSurfaceView.setEGLContextClientVersion(2);  // Use OpenGL ES 2.0
        glSurfaceView.setRenderer(new MyGLRenderer());

        setContentView(glSurfaceView);
    }
}
```

### Step 2: Create the Renderer

Create a new Java class `MyGLRenderer.java` to implement `GLSurfaceView.Renderer`:

```java
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class MyGLRenderer implements GLSurfaceView.Renderer {

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f); // Black background
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int width, int height) {
        GLES20.glViewport(0, 0, width, height);
    }
}
```

This basic renderer sets up a black background and clears the screen each frame.

---

## 3. Drawing a Simple Triangle

To render a triangle, we need to define its vertices, create shaders, and draw it on the screen.

### Step 1: Define the Triangle Vertices

Add a `Triangle.java` class:

```java
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import android.opengl.GLES20;

public class Triangle {

    private FloatBuffer vertexBuffer;

    private final String vertexShaderCode =
            "attribute vec4 vPosition;" +
            "void main() {" +
            "  gl_Position = vPosition;" +
            "}";

    private final String fragmentShaderCode =
            "precision mediump float;" +
            "uniform vec4 vColor;" +
            "void main() {" +
            "  gl_FragColor = vColor;" +
            "}";

    private final int shaderProgram;

    private int positionHandle;
    private int colorHandle;

    private final int vertexCount = 3;
    private final int vertexStride = 4 * 3; // 3 coordinates per vertex, 4 bytes each

    // Coordinates for triangle vertices
    static float triangleCoords[] = {
            0.0f,  0.5f, 0.0f,  // top
           -0.5f, -0.5f, 0.0f,  // bottom left
            0.5f, -0.5f, 0.0f   // bottom right
    };

    // Color (red, green, blue, alpha)
    private final float color[] = { 0.63671875f, 0.76953125f, 0.22265625f, 1.0f };

    public Triangle() {
        ByteBuffer bb = ByteBuffer.allocateDirect(triangleCoords.length * 4);
        bb.order(ByteOrder.nativeOrder());

        vertexBuffer = bb.asFloatBuffer();
        vertexBuffer.put(triangleCoords);
        vertexBuffer.position(0);

        int vertexShader = loadShader(GLES20.GL_VERTEX_SHADER, vertexShaderCode);
        int fragmentShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentShaderCode);

        shaderProgram = GLES20.glCreateProgram();
        GLES20.glAttachShader(shaderProgram, vertexShader);
        GLES20.glAttachShader(shaderProgram, fragmentShader);
        GLES20.glLinkProgram(shaderProgram);
    }

    private int loadShader(int type, String shaderCode) {
        int shader = GLES20.glCreateShader(type);
        GLES20.glShaderSource(shader, shaderCode);
        GLES20.glCompileShader(shader);
        return shader;
    }

    public void draw() {
        GLES20.glUseProgram(shaderProgram);

        positionHandle = GLES20.glGetAttribLocation(shaderProgram, "vPosition");
        GLES20.glEnableVertexAttribArray(positionHandle);
        GLES20.glVertexAttribPointer(positionHandle, 3, GLES20.GL_FLOAT, false, vertexStride, vertexBuffer);

        colorHandle = GLES20.glGetUniformLocation(shaderProgram, "vColor");
        GLES20.glUniform4fv(colorHandle, 1, color, 0);

        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount);
        GLES20.glDisableVertexAttribArray(positionHandle);
    }
}
```

### Step 2: Update the Renderer to Draw the Triangle

In `MyGLRenderer.java`, create a triangle instance and draw it in `onDrawFrame`:

```java
private Triangle triangle;

@Override
public void onSurfaceCreated(GL10 gl, EGLConfig config) {
    GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    triangle = new Triangle();
}

@Override
public void onDrawFrame(GL10 gl) {
    GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
    triangle.draw();
}
```

---

## Summary

This tutorial introduced the basics of using OpenGL ES in an Android app:

1. Setting up a GLSurfaceView and creating a renderer.
2. Defining vertices, shaders, and drawing a basic triangle.
3. Rendering the triangle on the screen.

This setup provides a foundation for creating more complex graphics and interactive elements using OpenGL ES on Android.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
