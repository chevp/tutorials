
# Akka Framework Tutorial for Java

Akka is a powerful toolkit for building concurrent, distributed, and resilient message-driven applications. It simplifies the development of applications that require high scalability and responsiveness.

---

## 1. Prerequisites

Before getting started with Akka, make sure you have the following installed:

- **Java JDK** (8 or later): Download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **Apache Maven**: Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).

### Verify Installation

To check your installations, run the following commands:

```bash
java -version
mvn -version
```

---

## 2. Creating a New Akka Project

You can create a new Akka project using Maven.

### Using Maven

1. Create a new Maven project using the following command:

   ```bash
   mvn archetype:generate -DgroupId=com.example -DartifactId=akka-demo -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
   cd akka-demo
   ```

2. Update your `pom.xml` file to include Akka dependencies:

   ```xml
   <dependencies>
       <dependency>
           <groupId>com.typesafe.akka</groupId>
           <artifactId>akka-actor_2.13</artifactId> <!-- Change to your Scala version if needed -->
           <version>2.6.17</version>
       </dependency>
       <dependency>
           <groupId>com.typesafe.akka</groupId>
           <artifactId>akka-stream_2.13</artifactId>
           <version>2.6.17</version>
       </dependency>
   </dependencies>
   ```

---

## 3. Creating an Actor

In Akka, an actor is a fundamental unit of computation that encapsulates state and behavior. Here's how to create a simple actor.

### Step 1: Create an Actor Class

Create a new Java class named `HelloActor.java` in the `src/main/java/com/example` directory:

```java
package com.example;

import akka.actor.AbstractActor;
import akka.actor.Props;

public class HelloActor extends AbstractActor {

    public static Props props() {
        return Props.create(HelloActor.class);
    }

    @Override
    public Receive createReceive() {
        return receiveBuilder()
                .match(String.class, message -> {
                    System.out.println("Received message: " + message);
                })
                .build();
    }
}
```

### Step 2: Create the Actor System

Now, create a main class to set up the actor system and send messages to the actor.

Create a new Java class named `Main.java`:

```java
package com.example;

import akka.actor.ActorRef;
import akka.actor.ActorSystem;

public class Main {
    public static void main(String[] args) {
        // Create the Actor System
        ActorSystem system = ActorSystem.create("HelloSystem");

        // Create the HelloActor
        ActorRef helloActor = system.actorOf(HelloActor.props(), "helloActor");

        // Send a message to the actor
        helloActor.tell("Hello, Akka!", ActorRef.noSender());

        // Shutdown the actor system
        system.terminate();
    }
}
```

### Explanation

- **ActorRef**: A reference to the actor that allows you to send messages to it.
- **tell**: A method to send a message to the actor.

---

## 4. Running Your Akka Application

To run your Akka application, use the following Maven command:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.Main"
```

You should see the output:

```
Received message: Hello, Akka!
```

---

## 5. Using Akka Streams

Akka Streams is a module that allows you to process and handle streams of data.

### Adding Akka Streams Dependency

Ensure that you have the Akka Streams dependency in your `pom.xml`:

```xml
<dependency>
    <groupId>com.typesafe.akka</groupId>
    <artifactId>akka-stream_2.13</artifactId>
    <version>2.6.17</version>
</dependency>
```

### Example of Using Akka Streams

Here's a simple example to create a stream that prints numbers:

```java
import akka.actor.ActorSystem;
import akka.stream.ActorMaterializer;
import akka.stream.javadsl.Source;

public class StreamExample {
    public static void main(String[] args) {
        final ActorSystem system = ActorSystem.create("StreamSystem");
        final ActorMaterializer materializer = ActorMaterializer.create(system);

        Source.range(1, 10)
                .map(i -> i * 2)
                .runForeach(System.out::println, materializer);

        system.terminate();
    }
}
```

---

## 6. Conclusion

Akka is a powerful framework for building concurrent, distributed, and resilient applications. This tutorial covered the basics of setting up an Akka project, creating an actor, and using Akka Streams.

### Further Reading

- [Akka Documentation](https://doc.akka.io/docs/akka/current/index.html)
- [Akka Actors](https://doc.akka.io/docs/akka/current/actors.html)
- [Akka Streams](https://doc.akka.io/docs/akka/current/stream/index.html)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
