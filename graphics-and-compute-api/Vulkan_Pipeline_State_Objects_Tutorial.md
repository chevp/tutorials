
# Vulkan Pipeline State Objects Tutorial

In Vulkan, Pipeline State Objects (PSOs) encapsulate the state needed for rendering, allowing for optimized performance and reduced overhead during draw calls. This tutorial will guide you through the concepts and implementation of Pipeline State Objects in Vulkan.

---

## 1. Introduction to Pipeline State Objects

Pipeline State Objects are a core concept in Vulkan that define the fixed-function state of the graphics pipeline, as well as programmable shader stages. They are created once and can be reused for multiple draw calls, improving performance by minimizing state changes.

### Key Benefits of Pipeline State Objects

- **Reduced Overhead**: By grouping all state settings into a single object, the overhead associated with changing states during rendering is minimized.
- **Optimized Performance**: Vulkan can better optimize pipeline creation and state management, leading to more efficient rendering.
- **Flexibility**: Supports a wide range of rendering techniques through customizable pipeline states.

---

## 2. Creating a Graphics Pipeline

### Step 1: Define the Shader Stages

A pipeline is created using a set of shaders. Define the shader stages for vertex and fragment shaders:

#### Example Vertex Shader (GLSL)

```glsl
#version 450
layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inColor;

layout(location = 0) out vec3 fragColor;

void main() {
    gl_Position = vec4(inPosition, 1.0);
    fragColor = inColor;
}
```

#### Example Fragment Shader (GLSL)

```glsl
#version 450
layout(location = 0) in vec3 fragColor;
layout(location = 0) out vec4 outColor;

void main() {
    outColor = vec4(fragColor, 1.0);
}
```

### Step 2: Create Shader Modules

Compile the shaders and create shader modules in Vulkan:

```c
VkShaderModule createShaderModule(VkDevice device, const std::vector<char>& code) {
    VkShaderModuleCreateInfo createInfo = {};
    createInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
    createInfo.codeSize = code.size();
    createInfo.pCode = reinterpret_cast<const uint32_t*>(code.data());

    VkShaderModule shaderModule;
    if (vkCreateShaderModule(device, &createInfo, nullptr, &shaderModule) != VK_SUCCESS) {
        throw std::runtime_error("failed to create shader module!");
    }

    return shaderModule;
}
```

### Step 3: Create the Pipeline

Create a `VkGraphicsPipelineCreateInfo` structure to define the pipeline states and create the pipeline:

```c
VkPipelineShaderStageCreateInfo shaderStages[2];
shaderStages[0] = {VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO};
shaderStages[0].stage = VK_SHADER_STAGE_VERTEX_BIT;
shaderStages[0].module = vertexShaderModule;
shaderStages[0].pName = "main";

shaderStages[1] = {VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO};
shaderStages[1].stage = VK_SHADER_STAGE_FRAGMENT_BIT;
shaderStages[1].module = fragmentShaderModule;
shaderStages[1].pName = "main";

VkPipelineVertexInputStateCreateInfo vertexInputInfo = {};
vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
// Configure vertex binding and attribute descriptions

VkPipelineInputAssemblyStateCreateInfo inputAssembly = {};
inputAssembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
inputAssembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
inputAssembly.primitiveRestartEnable = VK_FALSE;

VkViewport viewport = {};
viewport.x = 0.0f;
viewport.y = 0.0f;
viewport.width = static_cast<float>(swapChainExtent.width);
viewport.height = static_cast<float>(swapChainExtent.height);
viewport.minDepth = 0.0f;
viewport.maxDepth = 1.0f;

VkRect2D scissor = {};
scissor.offset = {0, 0};
scissor.extent = swapChainExtent;

VkPipelineViewportStateCreateInfo viewportState = {};
viewportState.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
viewportState.viewportCount = 1;
viewportState.pViewports = &viewport;
viewportState.scissorCount = 1;
viewportState.pScissors = &scissor;

VkPipelineRasterizationStateCreateInfo rasterizer = {};
rasterizer.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
rasterizer.depthClampEnable = VK_FALSE;
rasterizer.rasterizerDiscardEnable = VK_FALSE;
rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
rasterizer.lineWidth = 1.0f;
rasterizer.cullMode = VK_CULL_MODE_BACK_BIT;
rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;
rasterizer.depthBiasEnable = VK_FALSE;

VkPipelineMultisampleStateCreateInfo multisampling = {};
multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
multisampling.sampleShadingEnable = VK_FALSE;
multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

VkPipelineColorBlendAttachmentState colorBlendAttachment = {};
colorBlendAttachment.blendEnable = VK_FALSE;
colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;

VkPipelineColorBlendStateCreateInfo colorBlending = {};
colorBlending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
colorBlending.logicOpEnable = VK_FALSE;
colorBlending.attachmentCount = 1;
colorBlending.pAttachments = &colorBlendAttachment;

VkGraphicsPipelineCreateInfo pipelineInfo = {};
pipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
pipelineInfo.stageCount = 2;
pipelineInfo.pStages = shaderStages;
pipelineInfo.pVertexInputState = &vertexInputInfo;
pipelineInfo.pInputAssemblyState = &inputAssembly;
pipelineInfo.pViewportState = &viewportState;
pipelineInfo.pRasterizationState = &rasterizer;
pipelineInfo.pMultisampleState = &multisampling;
pipelineInfo.pColorBlendState = &colorBlending;
pipelineInfo.layout = pipelineLayout;
pipelineInfo.renderPass = renderPass;
pipelineInfo.subpass = 0;

if (vkCreateGraphicsPipelines(device, VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &graphicsPipeline) != VK_SUCCESS) {
    throw std::runtime_error("failed to create graphics pipeline!");
}
```

---

## 4. Using the Pipeline

### Binding the Pipeline

Before drawing, you need to bind the pipeline within a command buffer:

```c
vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, graphicsPipeline);
```

### Drawing with the Pipeline

Once the pipeline is bound, you can issue draw commands:

```c
vkCmdDraw(commandBuffer, vertexCount, 1, 0, 0);
```

---

## 5. Clean Up

### Destroying the Pipeline

When the pipeline is no longer needed, make sure to destroy it:

```c
vkDestroyPipeline(device, graphicsPipeline, nullptr);
```

### Destroying Shader Modules

Don't forget to clean up the shader modules after the pipeline is destroyed:

```c
vkDestroyShaderModule(device, vertexShaderModule, nullptr);
vkDestroyShaderModule(device, fragmentShaderModule, nullptr);
```

---

## 6. Conclusion

Pipeline State Objects are a critical feature of Vulkan that allows developers to optimize graphics rendering efficiently. This tutorial covered the basics of creating a graphics pipeline, binding it, and drawing with it.

### Further Reading

- [Vulkan Documentation](https://www.khronos.org/vulkan/)
- [Vulkan Tutorial](https://vulkan-tutorial.com/)
- [Vulkan Samples](https://github.com/KhronosGroup/Vulkan-Samples)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).