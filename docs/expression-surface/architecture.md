---
sidebar_position: 2
---

# 架构方案

## 表达面 (Expression Surface) - 技术架构设计文档 v2.0

## 1\. 项目概述 (Overview)

**表达面** 是一个基于 AI 的 Web 端图像创作工具，专注于“面部表达”场景（头像、表情包）。
核心设计理念是 **“画布 + 工具箱”** 模式：用户上传或生成图片后，所有的 AI 能力（智能居中、去底、风格化）均作为独立工具，由用户按需触发，而非强制性的线性工作流。

## 2\. 技术选型 (Tech Stack)

| 模块 | 技术方案 | 理由 |
| :--- | :--- | :--- |
| **应用框架** | **Next.js 14 (App Router)** | React 生态标准，Server Actions 简化后端逻辑。 |
| **语言** | **TypeScript** | 强类型约束，保证复杂的 Canvas 逻辑不崩坏。 |
| **画布引擎** | **Fabric.js (v6)** | 强大的 Canvas 对象模型库，支持交互、图层、序列化。 |
| **状态管理** | **Zustand** | 轻量级，适合处理 Canvas 实例与 UI 组件的解耦同步。 |
| **面部识别** | **MediaPipe Tasks Vision** | 谷歌出品，WASM 运行在浏览器端，免费且极快。 |
| **去背景** | **@imgly/background-removal** | 浏览器端运行的 AI 去底，保护用户隐私，节省服务器成本。 |
| **AI 生图** | **Replicate API (Flux/SDXL)** | 通过 Next.js Server Actions 调用，高质量文生图。 |
| **UI 组件库** | **Shadcn/UI + Tailwind** | 快速构建现代化的编辑器界面。 |

-----

## 3\. 系统架构设计 (System Architecture)

系统采用 **分层架构**，强调“视图”与“逻辑”的分离。

```mermaid
graph TD
    User[用户交互层] --> UI[React UI Components]
    UI --> Store[Zustand Store (状态管理)]
    
    subgraph Core[核心逻辑层]
        Store --> CM[Canvas Manager (Fabric.js 封装)]
        Store --> TM[Tool Manager (AI 工具集)]
    end
    
    subgraph LocalAI[浏览器端 AI 引擎]
        TM --> MP[MediaPipe (面部识别)]
        TM --> RB[Imgly (去背景)]
    end
    
    subgraph Server[服务端基础设施]
        TM --> API[Next.js Server Actions]
        API --> Replicate[外部 GenAI 服务]
    end
    
    CM -- 渲染 --> Canvas[HTML5 Canvas]
```

### 3.1 核心模块职责

1.  **Canvas Manager (画布管理器):**
      * 持有 Fabric.js 实例。
      * 负责底层的 CRUD（添加图片、删除对象、图层上移下移）。
      * 负责导出图片（Export to PNG/JPG）。
2.  **Tool Manager (工具管理器):**
      * 实现具体的业务逻辑。
      * 例如：`applySmartCrop()`，`applyRemoveBackground()`。
      * 它不直接操作 DOM，而是调用 Canvas Manager 修改对象属性。
3.  **Editor Store (Zustand):**
      * 连接 UI 和 Canvas。
      * 记录当前选中的对象（例如：用户选中了图片，UI 里的“去底”按钮才变亮）。

-----

## 4\. 核心功能实现逻辑 (Core Features Implementation)

这是本次重构的重点。所有的 AI 功能都设计为**原子化操作 (Atomic Operations)**。

### 4.1 智能居中工具 (Smart Center Tool)

**触发方式：** 用户点击工具栏的“智能居中”按钮。
**逻辑：** 不裁剪原图，而是调整图片在画布中的**位置 (Position)** 和 **缩放 (Scale)**，使面部视觉居中。

**算法流程：**

1.  **获取输入：** 获取当前选中的图片对象 (`Fabric.Image`)。
2.  **快照分析：** 将该图片临时导出为 Base64 或 ImageData。
3.  **识别：** 输入 MediaPipe Face Detector，获取人脸 Bounding Box `(x, y, w, h)`。
4.  **计算变换矩阵：**
      * *目标：* 人脸中心 = 画布中心。
      * *目标：* 人脸宽度 = 画布宽度的 50% (可配置系数)。
      * *计算缩放差(ScaleDelta):* `(CanvasWidth * 0.5) / FaceWidth`。
      * *计算位移(Offset):* 根据缩放后的尺寸，反向计算 Left/Top 坐标。
5.  **应用变换：** 调用 Fabric 对象的 `animate` 方法，平滑过渡到新位置。

### 4.2 智能去底工具 (Remove BG Tool)

**触发方式：** 用户点击“一键抠图”。
**逻辑：** 浏览器端计算，替换对象。

**算法流程：**

1.  **锁定状态：** UI 显示“处理中...”，锁定画布操作。
2.  **推理：** 调用 `@imgly/background-removal` 处理当前图片资源。
3.  **替换：**
      * 生成一张透明背景的 Blob URL。
      * 创建一个新的 `Fabric.Image` 对象。
      * **关键点：** 将新对象继承旧对象的所有属性（位置、旋转、缩放、层级）。
      * 删除旧对象，添加新对象。
4.  **解锁：** 恢复 UI 交互。

### 4.3 AI 生图 (Generative Fill/Create)

**触发方式：** 侧边栏输入 Prompt 点击生成。

**算法流程：**

1.  **服务端调用：** 前端发送 Prompt -\> Next.js Server Action -\> Replicate API。
2.  **接收结果：** 获得图片 URL。
3.  **加入画布：**
      * *模式 A (新建):* 清空画布，将新图作为背景。
      * *模式 B (贴纸):* 将新图作为普通图层添加到中心。

-----

## 5\. 数据结构设计 (Data Structures)

### 5.1 Zustand Store Interface

```typescript
interface EditorState {
  canvas: fabric.Canvas | null; // Fabric 实例引用
  activeObject: fabric.Object | null; // 当前选中的对象
  isProcessing: boolean; // 是否有 AI 任务正在运行
  
  // Actions
  initCanvas: (canvasElement: HTMLCanvasElement) => void;
  setActiveObject: (obj: fabric.Object | null) => void;
  
  // Tools
  triggerSmartCenter: () => Promise<void>;
  triggerRemoveBackground: () => Promise<void>;
  addImageToCanvas: (url: string) => Promise<void>;
}
```

### 5.2 表达面数据模型 (用于保存/加载)

```typescript
interface ProjectData {
  version: string; // "2.0"
  canvasWidth: number;
  canvasHeight: number;
  // 直接复用 Fabric.js 的 JSON 序列化标准
  fabricData: object; 
  // 额外元数据
  metadata: {
    projectName: string;
    createdAt: number;
    thumbnail?: string;
  }
}
```

-----

## 6\. 开发路线图 (Development Roadmap)

### Phase 1: 基础设施 (Infrastructure)

  * [ ] 初始化 Next.js + Tailwind 环境。
  * [ ] 封装 `CanvasStage` 组件，实现 Fabric.js 的初始化与销毁。
  * [ ] 实现基础图片上传与拖拽上画布功能。

### Phase 2: 视觉算法集成 (Vision Integration)

  * [ ] 集成 MediaPipe 库，编写 `FaceDetector` 服务类（单例模式）。
  * [ ] **开发“智能居中”算法**：编写数学逻辑，将 MediaPipe 坐标转换为 Fabric 坐标。
  * [ ] 调试居中效果，增加平滑动画。

### Phase 3: 高级工具与生图 (Advanced Tools)

  * [ ] 集成 `@imgly`，实现前端抠图。
  * [ ] 配置 Next.js API Route，打通 Replicate 接口。
  * [ ] 实现生图后自动添加到画布的逻辑。

### Phase 4: 完善与导出 (Polish)

  * [ ] 添加文字工具（Fabric.IText）。
  * [ ] 实现 `Export` 功能（下载为 PNG）。
  * [ ] UI 细节打磨（Loading 状态、错误处理）。

-----

## 7\. 关键注意事项 (Design Constraints)

1.  **坐标系转换陷阱：**

      * MediaPipe 返回的是**图像内部**的相对坐标 (0.0 - 1.0)。
      * Fabric.js 处理的是**画布坐标系**。
      * 图片可能被旋转或缩放。
      * *解决方案：* 计算时必须基于图片的 `originalWidth` 和 `originalHeight`，然后乘以图片当前的 `scaleX/Y`，并考虑图片的 `angle`。

2.  **性能保护：**

      * AI 模型（MediaPipe/Imgly）在第一次加载时较大。
      * *策略：* 使用 `useEffect` 在页面加载后静默预加载模型。

3.  **CORS (跨域资源共享)：**

      * Canvas `toDataURL` 极其严格，如果图片跨域会“污染”画布。
      * *策略：* 所有外部图片（Replicate生成的、用户上传的）建议都通过 Next.js 的 Image Proxy 中转，或者确保源站开启 `Access-Control-Allow-Origin: *`。

这份文档为你提供了一个清晰的、模块化的开发指引。现在，“智能居中”不再是一个黑盒流程，而是一个你可以精细调节参数的独立工具。