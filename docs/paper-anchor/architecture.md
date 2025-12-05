---
sidebar_position: 2
---

# 架构方案

## **纸锚 (Paper Anchor) \- 架构设计方案 v2.3**

版本 : 2.3  
核心理念 : "专注写作，独立存储"。  
将系统明确划分为两个独立的工作台：“笔记空间” (类似 Obsidian 的纯净写作区) 和 “资源网盘” (类似 Google Drive 的素材管理区)。两者通过引用语法 (\[\[...\]\]) 在逻辑上打通。

## **0\. 技术栈选型 (Tech Stack)**

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| 前端框架 | Next.js 14\+ (App Router) | 负责 `/dashboard/...` 路由、Server Actions 以及与 Supabase 的边缘调用。 |
| UI 组件 | Tailwind CSS \+ shadcn/ui | 构建双栏笔记与卡片网盘，统一主题 Token。 |
| 编辑器 | Tiptap (Headless) | 自定义 `[[` Mention、`ResourceLink` 胶囊组件，序列化为 Markdown/WikiLink。 |
| 状态管理 | TanStack Query | 管理 Supabase 数据的缓存、轮询资源状态、触发重试。 |
| 后端/存储 | Supabase (Postgres + Auth + Storage + Edge Functions) | 提供 `resources`、`knowledge_nodes`、`node_links` 表以及 Storage/Bucket、Webhook、函数运行时。 |
| AI/解析 | LangChain.js | 在 Edge Function 中完成 PDF Loader、文本切片、Embedding（OpenAI）、向量入库。 |

## **1\. 系统导航结构 (Navigation Structure)**

系统主要包含两个顶级路由，互不干扰：

| 路由 | 名称 | 布局模式 | 功能 |
| :---- | :---- | :---- | :---- |
| /dashboard/notes | **笔记空间** | **双栏布局** (列表 \+ 编辑器) | 快速记录、思考、双链写作 |
| /dashboard/resources | **资源网盘** | **网格/列表布局** | 文件上传、状态监控、预览 |

## **2\. 详细页面设计 (UI/UX Design)**

### **2.1. 笔记空间 (/dashboard/notes)**

极致的极简主义设计，专注于 Markdown 文本。

* **布局**:  
  * **左侧栏 (Sidebar)**: 仅展示 **笔记列表**。  
    * 数据源: select \* from knowledge\_nodes where node\_type \= 'markdown\_note'。  
    * 操作: 新建笔记、按时间/标题排序、搜索笔记。  
  * **主区域 (Main)**: **Markdown 编辑器**。  
    * 全屏宽度的 Tiptap 编辑器。  
    * **关键交互**: 当用户想插入图片或引用 PDF 时，输入 / 或 \[\[ 唤起搜索框，后台检索 resources 表，选中后插入链接。
    * **实现要点**:  
      * 使用 `@tiptap/extension-mention` 并设置 `char: '[['`，触发后由 TanStack Query 异步请求 `resources` 表，仅返回 `processing_status = 'indexed'` 的条目。  
      * 自定义 NodeView `<ResourceLink resourceId="..." fileName="..." />` 渲染胶囊组件，点击可打开预览 Modal 或跳转 `/dashboard/resources`。  
      * 序列化策略：编辑器内部保存 ProseMirror JSON，写入数据库时同步 Markdown，引用以 `[[file_name|resource_id]]` 记录，便于再解析与 RAG 映射。

### **2.2. 资源网盘 (/dashboard/resources)**

独立的数字化资产管理界面。

* **布局**: 全屏卡片网格或列表。  
* **功能**:  
  * **上传区域**: 拖拽上传文件 \-\> 写入 resources 表 \-\> 触发异步解析。  
  * **状态展示**: 每个文件卡片上显示 等待中 / 处理中 / 已索引 (Indexed) 的状态标签。  
  * **预览**: 点击文件卡片，弹窗 (Modal) 或新标签页打开 PDF 预览。

## **3\. 数据库模型 (Database Schema)**

为了适配这种分离，我们保持 v2.2 的双表核心，但逻辑更加解耦。

### **3.1. resources 表 (资源网盘数据源)**

create table resources (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid references auth.users(id) not null,  
    
  file\_name text not null,  
  storage\_path text not null,  
  mime\_type text,  
  size\_bytes bigint,  
    
  \-- 核心状态：控制是否能被笔记引用  
  \-- pending \-\> processing \-\> indexed (完成) / failed (失败)  
  processing\_status text default 'pending',   
    
  created\_at timestamptz default now()  
);

### **3.2. knowledge\_nodes 表 (笔记空间数据源)**

create table knowledge\_nodes (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid references auth.users(id) not null,  
    
  \-- 笔记核心  
  title text default '无标题',  
  content text,         \-- Markdown 内容  
    
  \-- 这里的类型现在主要就是 'markdown\_note'  
  \-- 'file\_chunk' 类型的数据依然存在表中，但不直接展示在左侧笔记列表，  
  \-- 而是作为 RAG 搜索的幕后数据。  
  node\_type text default 'markdown\_note',   
    
  \-- 如果是切片数据，关联到 resource  
  resource\_id uuid references resources(id),  
    
  embedding vector(1536),  
    
  created\_at timestamptz default now(),  
  updated\_at timestamptz default now()  
);

### **3.3. node\_links 表 (隐形关联)**

即便 UI 分离，我们依然要在后台记录链接，为了未来可能的图谱功能做储备。

create table node\_links (  
  source\_node\_id uuid, \-- 笔记 ID  
  target\_resource\_id uuid, \-- 资源 ID (如果引用了 PDF)  
  target\_node\_id uuid, \-- 或 另一个笔记 ID  
  created\_at timestamptz default now()  
);

## **4\. 核心工作流 (Workflows)**

### **流程 A：资料入库 (Resource Ingestion)**

1. 用户进入 **“资源网盘”** 页面。  
2. 上传 2024行业报告.pdf。  
3. 前端显示“处理中...”。  
4. 后台 Edge Function 悄悄运行：解析 PDF \-\> 切片 \-\> 存入 knowledge\_nodes (type='file\_chunk')。  
5. 处理完成后，前端网盘页面上的文件状态变为 **“已索引”**。

### **流程 B：引用写作 (Citation Writing)**

1. 用户进入 **“笔记空间”** 页面。  
2. 新建笔记，开始打字。  
3. 想到要引用刚才的报告，输入 \[\[2024。  
4. 编辑器弹窗提示：📄 2024行业报告.pdf (资源)。  
5. 回车确认。  
6. 编辑器中插入一个特殊的胶囊链接组件 \<ResourceLink id="..." title="2024行业报告.pdf" /\>。  
7. (可选) 点击该链接，跳转到 **“资源网盘”** 的预览界面查看原始 PDF。

## **5\. 目录结构更新 (Project Structure)**

/app  
  /dashboard  
    /layout.tsx      \# 包含顶部导航栏 (Tabs: 笔记 | 资源)  
    /notes           \# 笔记空间  
      /page.tsx      \# 左侧列表 \+ 右侧空白/选中态  
      /\[id\]/page.tsx \# 具体的编辑器页面  
    /resources       \# 资源网盘  
      /page.tsx      \# 文件网格列表 \+ 上传组件