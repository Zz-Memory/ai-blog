---
name: AI-Native Minimalism
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#c2c1ff'
  on-secondary: '#1c0b9f'
  secondary-container: '#3834b6'
  on-secondary-container: '#b2b1ff'
  tertiary: '#ffb595'
  on-tertiary: '#571e00'
  tertiary-container: '#ef6719'
  on-tertiary-container: '#4c1a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Inter, PingFang SC
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter, PingFang SC
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter, PingFang SC
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.8'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter, PingFang SC
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 800px
---

## 品牌与风格
本设计系统旨在定义一个以人工智能为核心的个人博客体验。品牌性格融合了人类创作的感性与 AI 处理的理性。

**设计风格：AI 原生极简主义 (AI-Native Minimalism)**
这种风格超越了传统扁平化设计，强调界面作为“智能容器”的角色。设计语言通过大量留白、精确的排版和流动的玻璃质感，营造出一种前卫且深邃的数字空间感。UI 元素应尽可能隐形，仅在需要交互或体现智能干预时通过“智慧蓝”点亮，使用户专注于内容的深度阅读与创作。

## 色彩方案
本设计系统采用深色模式作为默认视觉基础，以减少视觉疲劳并提升前卫感。

- **智慧蓝 (Cyber Blue, #007AFF)**: 作为核心品牌色，用于表示 AI 激活状态、关键操作按钮及焦点状态。
- **背景体系**: 采用极深灰黑色（#050505）作为底层背景，层级较高的容器使用略浅的深色或带有透明度的毛玻璃材质。
- **功能色**: 辅助色用于区分内容类别，但必须保持低饱和度，以确保不干扰智慧蓝的视觉核心地位。

## 字体排印
排版设计的核心在于“长文阅读优化”。针对中文环境，强制要求配合 PingFang SC 使用，以确保字形在深色背景下的清晰度。

- **标题层级**: 采用较大的字号对比，突出信息架构。英文及数字统一使用 Inter，以体现现代精密感。
- **正文体验**: 中文正文设定为 1.8 倍行高，并适当增加字间距，确保在长时间阅读 AI 生成的长文时依然保持舒适。
- **标签与元数据**: 使用全大写或略加宽字距的样式，营造出类似代码编辑器或精密仪器的专业氛围。

## 布局与间距
本设计系统采用固定宽度网格与动态页边距相结合的模式，专注于阅读效率。

- **阅读容器**: 核心内容区限制在 800px 宽度内，这是长文阅读的最佳视觉扫描宽度。
- **8px 节奏**: 所有间距均基于 8px 步进系统。组件内部间距（Padding）通常使用 12px 或 16px，而组件间的堆叠间距则使用 24px 或更广阔的 48px，以营造极简主义的呼吸感。
- **智能对齐**: 侧边栏及功能菜单应采用隐藏式设计或悬浮玻璃卡片，仅在用户触发时以流体动画形式出现。

## 高度与深度
深度感不依赖强烈的投影，而是通过“光感”和“透明度”来体现。

- **毛玻璃效果 (Glassmorphism)**: 顶层容器使用 `backdrop-filter: blur(20px)`，配合极细的（1px）半透明描边（White 10%），模拟磨砂玻璃在暗处的美感。
- **柔和阴影**: 仅在悬浮卡片上使用极弥散的黑色阴影（Blur 30px, Opacity 40%），增加物理堆叠感。
- **层级逻辑**: 背景为 0 层；内容卡片为 1 层；弹出层及 AI 对话浮窗为最高层。

## 形状语言
形状设计追求“理性中的圆润”，避免尖锐边缘带来的侵略性。

- **基础圆角**: 按钮、小部件使用 8px 圆角，体现精准感。
- **容器圆角**: 文章卡片、编辑器容器使用 12px 或 16px 圆角，增加亲和力。
- **一致性**: 严禁出现异形或过大的圆形，除非是头像或特定的 AI 状态指示灯。

## 组件规范
本设计系统中的所有组件均需符合“智能”与“极简”的双重标准。

- **交互按钮 (Buttons)**:
  - **主要按钮**: 填充智慧蓝，使用白色文字，无阴影，悬停时产生轻微的发光效果（Outer Glow）。
  - **次要按钮**: 透明背景，带 1px 深灰色描边，悬停时背景变为深灰。
- **AI 交互卡片 (AI Cards)**: 带有微妙的紫色到蓝色的极细渐变边框，背景使用毛玻璃材质，用于承载 AI 生成的摘要、建议或改写建议。
- **输入字段 (Inputs)**: 背景为深色半透明，聚焦时边框变为智慧蓝，并伴随微小的呼吸动画，暗示 AI 正在后台协同。
- **列表与条目**: 取消传统的分割线，通过背景色的微弱差异或 8px 的留白来区分条目。
- **状态指示器 (Status Indicators)**: 专门设计的“AI 思考中”组件，应为一个具有扩散动效的智慧蓝光点。