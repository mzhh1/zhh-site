# 使用案例

export const Icon = ({ name, size = 16 }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    verticalAlign: 'middle',
    margin: '0 2px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    lineHeight: 0,
  }}>
    <img src={`https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${name}.svg`} width={size} style={{ margin: 0 }} />
  </span>
);

export const LimitImg = ({ src, alt, style }) => (
  <img
    src={src}
    alt={alt}
    style={{
      maxWidth: '500px',
      width: '100%',
      height: 'auto',
      display: 'block',
      margin: '10px 0',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      ...style,
    }}
  />
);

这里提供了一些表达面的使用案例。

## 表情编辑

1. 点击**上传**(<Icon name="upload" />)上传原图

<LimitImg src={require("./images/use_cases/1_1.png").default} alt="1_1" />

2. 点击**AI编辑** (<Icon name="sparkles" />)，输入指令“给人物添加圣诞帽”，稍等片刻

<LimitImg src={require("./images/use_cases/1_2.png").default} alt="1_2" />

### 简单版

3. 点击**下载**(<Icon name="download" />)直接下载AI生成图

<LimitImg src={require("./images/use_cases/1_3.png").default} alt="1_3" />

### 精致版

扩散模型生成的图背景通常只是近似纯色，去底后添加纯色背景会有更好的精致度。

3. 点击**适应对象**(<Icon name="crop" />)调整画布大小适应原图。

<LimitImg src={require("./images/use_cases/1_3'.png").default} alt="1_3'" />

4. 点击**去底** (<Icon name="eraser" />)移除背景

<LimitImg src={require("./images/use_cases/1_4.png").default} alt="1_4" />

5. 点击**置顶**(<Icon name="arrow-up-to-line" />)把原图融入画布

6. 点击**背景填色** (<Icon name="paint-bucket" />)选择一个背景色添加

<LimitImg src={require("./images/use_cases/1_5.png").default} alt="1_5" />

7. 点击**下载**(<Icon name="download" />)导出成品

<LimitImg src={require("./images/use_cases/1_6.png").default} alt="1_6" />


## 图标制作

简单的图片裁剪与添加圆角，帮助熟悉流程。

1. 点击**上传**(<Icon name="upload" />)上传原图

<LimitImg src={require("./images/use_cases/2_1.png").default} alt="2_1" />

2. 点击**适应对象**(<Icon name="crop" />)调整画布大小适应原图。

<LimitImg src={require("./images/use_cases/2_2.png").default} alt="2_2" />

3. 点击**置顶**(<Icon name="arrow-up-to-line" />)把原图融入画布

4. 点击**剪切**(<Icon name="scissors"/>)后选择主体

<LimitImg src={require("./images/use_cases/2_4.png").default} alt="2_4" />

5. 点击**圆角化**(<Icon name="square" />)添加圆角后点击完成

<LimitImg src={require("./images/use_cases/2_5.png").default} alt="2_5" />

6. 点击**下载**(<Icon name="download" />)导出为ico格式

<LimitImg src={require("./images/use_cases/2_6.ico").default} alt="2_6" style={{ backgroundColor: '#f5f5f5' }} />
