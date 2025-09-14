/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Cloud Native Technologies',
      collapsed: true,
      items: [
        'cloud-native-technologies/Kubernetes_Tutorial',
        'cloud-native-technologies/Docker_Commands_Tutorial',
        'cloud-native-technologies/Microservices_Tutorial',
        'cloud-native-technologies/MariaDB_Docker_Setup_Tutorial',
        'cloud-native-technologies/Angular_Firebase_Hosting_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Frontend Technologies',
      collapsed: true,
      items: [
        'frontend-technologies/Angular_CLI_Tutorial',
        'frontend-technologies/ReactJS_Tutorial',
        'frontend-technologies/NextJS_Tutorial',
        'frontend-technologies/Angular_RxJS_Tutorial',
        'frontend-technologies/Angular_Structural_Directives_Tutorial',
        'frontend-technologies/Angular_Electron_Tutorial',
        'frontend-technologies/Angular_NativeScript_Tutorial',
        'frontend-technologies/NativeScript_gRPC_Angular_Tutorial',
        'frontend-technologies/Flutter_Dart_Tutorial',
        'frontend-technologies/HTML_Tutorial',
        'frontend-technologies/CSS_Tutorial',
        'frontend-technologies/SCSS_Tutorial',
        'frontend-technologies/Bootstrap_4_Tutorial',
        'frontend-technologies/Bootstrap_5_Tutorial',
        'frontend-technologies/WebGL_Tutorial',
        'frontend-technologies/Electron_Tutorial',
        'frontend-technologies/Thymeleaf_Tutorial',
        'frontend-technologies/Node_Module_Library_Tutorial',
        {
          type: 'category',
          label: 'Three.js',
          items: [
            'frontend-technologies/ThreeJS_Tutorial',
            'frontend-technologies/ThreeJS_3D_Rendering_Tutorial',
            'frontend-technologies/ThreeJS_Animation_Tutorial',
            'frontend-technologies/ThreeJS_Cameras_Tutorial',
            'frontend-technologies/ThreeJS_Cross_Platform_Tutorial',
            'frontend-technologies/ThreeJS_Embed_Use_Scene_Tutorial',
            'frontend-technologies/ThreeJS_Geometries_and_Materials_Tutorial',
            'frontend-technologies/ThreeJS_Import_Export_Models_Tutorial',
            'frontend-technologies/ThreeJS_Interactivity_Tutorial',
            'frontend-technologies/ThreeJS_Lighting_Tutorial',
            'frontend-technologies/ThreeJS_Particle_Systems_Tutorial',
            'frontend-technologies/ThreeJS_Physics_Integration_Tutorial',
            'frontend-technologies/ThreeJS_Post_Processing_Tutorial',
            'frontend-technologies/ThreeJS_VR_AR_Tutorial',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Platforms & Frameworks',
      collapsed: true,
      items: [
        'platforms-and-frameworks/Java_Spring_Boot_Tutorial',
        'platforms-and-frameworks/Java_Spring_Tutorial',
        'platforms-and-frameworks/Java_Spring_REST_JSON_Tutorial',
        'platforms-and-frameworks/Java_Spring_SOAP_JSON_Tutorial',
        'platforms-and-frameworks/Spring_Security_Tutorial',
        'platforms-and-frameworks/Spring_JPA_Tutorial',
        'platforms-and-frameworks/Java_Quarkus_Tutorial',
        'platforms-and-frameworks/Java_Quarkus_AWS_Tutorial',
        'platforms-and-frameworks/Java_Akka_Tutorial',
        'platforms-and-frameworks/Java_Android_SDK_Tutorial',
        'platforms-and-frameworks/JavaServer_Faces_Tutorial',
        'platforms-and-frameworks/NestJS_Tutorial',
        'platforms-and-frameworks/Nodejs_Tutorial',
        'platforms-and-frameworks/Laravel_Tutorial',
        'platforms-and-frameworks/OpenGL_ES_Android_Tutorial',
        'platforms-and-frameworks/Firebase_Auth_Functions_Tutorial',
        'platforms-and-frameworks/Google_Cloud_Storage_with_Java_Spring_Tutorial',
        'platforms-and-frameworks/Google_Cloud_Storage_with_Java_Quarkus_Tutorial',
        {
          type: 'category',
          label: 'gRPC',
          items: [
            'platforms-and-frameworks/gRPC_Protobuf_Message_Tutorial',
            'platforms-and-frameworks/Java_gRPC_Tutorial',
            'platforms-and-frameworks/CSharp_gRPC_Tutorial',
            'platforms-and-frameworks/Cpp_gRPC_Tutorial',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Database Technologies',
      collapsed: true,
      items: [
        'database-technologies/MySQL_Tutorial',
        'database-technologies/PostgreSQL_Tutorial',
        'database-technologies/PostgreSQL_WAL_Tutorial',
        'database-technologies/MariaDB_Tutorial',
        'database-technologies/SQL-Server_Tutorial',
        'database-technologies/T-SQL_Tutorial',
        'database-technologies/SQLite_Tutorial',
        'database-technologies/MongoDB_Tutorial',
        'database-technologies/Neo4j_Tutorial',
        'database-technologies/Entity_Framework_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Development Tools',
      collapsed: true,
      items: [
        'development-tools/NodeJS_Tutorial',
        'development-tools/Playwright_Tutorial',
        'development-tools/Maven_Tutorial',
        'development-tools/Gradle_Tutorial',
        'development-tools/JSON_Server_Tutorial',
        'development-tools/Bootstrap_5_Tutorial',
        'development-tools/SonarQube_Tutorial',
        'development-tools/Nexus_Tutorial',
        'development-tools/Grafana_Prometheus_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'CI/CD',
      collapsed: true,
      items: [
        'continuous-integration-and-continuous-delivery/CI_CD_Tutorial',
        'continuous-integration-and-continuous-delivery/GitHub_Actions_Tutorial',
        'continuous-integration-and-continuous-delivery/Jenkins_Tutorial',
        'continuous-integration-and-continuous-delivery/Firebase_with_Github_Actions',
      ],
    },
    {
      type: 'category',
      label: 'Graphics & Compute API',
      collapsed: true,
      items: [
        'graphics-and-compute-api/Cpp_Vulkan_Tutorial',
        'graphics-and-compute-api/Vulkan_Cross_Platform_Tutorial',
        'graphics-and-compute-api/Vulkan_Extensible_Modular_Tutorial',
        'graphics-and-compute-api/Vulkan_Low_Level_Control_Tutorial',
        'graphics-and-compute-api/Vulkan_Memory_Management_Tutorial',
        'graphics-and-compute-api/Vulkan_Modern_Rendering_Techniques_Tutorial',
        'graphics-and-compute-api/Vulkan_Multi_Threading_Tutorial',
        'graphics-and-compute-api/Vulkan_Pipeline_State_Objects_Tutorial',
        'graphics-and-compute-api/Vulkan_SPIRV_Shader_Language_Tutorial',
        'graphics-and-compute-api/Vulkan_Synchronization_Command_Queues_Tutorial',
        'graphics-and-compute-api/Vulkan_Unified_Graphics_Compute_Tutorial',
        'graphics-and-compute-api/Vulkan_Validation_Layers_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Mobile App Development',
      collapsed: true,
      items: [
        'mobile-app-development/Android_SDK_Studio_Setup_Tutorial',
        'mobile-app-development/Cpp_gRPC_Android_Integration_Tutorial',
        'mobile-app-development/Vulkan_Android_Setup_Tutorial',
        'mobile-app-development/Cpp_gRPC_Vulkan_Client_Tutorial',
        'mobile-app-development/Android_Cpp_gRPC_Vulkan_Integration_Tutorial',
        'mobile-app-development/Rust_Mobile_Development_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Programming Languages',
      collapsed: true,
      items: [
        'programming-languages/Java_Tutorial',
        'programming-languages/Advanced_Java_Tutorial',
        'programming-languages/JavaScript_Tutorial',
        'programming-languages/TypeScript_Tutorial',
        'programming-languages/Key_Differences_JavaScript_TypeScript_Tutorial',
        'programming-languages/Python_Tutorial',
        'programming-languages/Go_Programming_Language_Tutorial',
        'programming-languages/Kotlin_Tutorial',
        'programming-languages/Dart_Tutorial',
        'programming-languages/PHP_8_Tutorial',
        'programming-languages/CMake_CPP_Tutorial',
        'programming-languages/Ling_Tutorial',
        {
          type: 'category',
          label: 'Rust',
          items: [
            'programming-languages/Rust_Desktop_Development_Tutorial',
            'programming-languages/Rust_Web_App_Development_Tutorial',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Programming Guides',
      collapsed: true,
      items: [
        'programming-guides/Clean_Code_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Markup & Data Formats',
      collapsed: true,
      items: [
        'markup-language-and-data-serialization-formats/JSON_Tutorial',
        'markup-language-and-data-serialization-formats/XML_Tutorial',
        'markup-language-and-data-serialization-formats/YAML_Tutorial',
        'markup-language-and-data-serialization-formats/Markdown_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Orchestration',
      collapsed: true,
      items: [
        'orchestration-and-business-process-technologies/Orchestration_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Runtime & Container',
      collapsed: true,
      items: [
        'runtime-container/Apache_Tomcat_Tutorial',
        'runtime-container/JBoss_Tutorial',
        'runtime-container/Spring_Boot_Tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Source Code Repository',
      collapsed: true,
      items: [
        'source-code-repository/Git_Usage_Tutorial',
        'source-code-repository/Git_Workflow_Tutorial',
        'source-code-repository/Git_Branches_Tutorial',
        'source-code-repository/Git_Move_Submodule_to_Subfolder_Tutorial',
        'source-code-repository/SVN_Tutorial',
      ],
    },
  ],
};

module.exports = sidebars;