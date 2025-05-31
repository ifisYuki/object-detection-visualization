# 目标检测可视化系统 (Object Detection Visualization System)

一个用于实时可视化目标检测数据的Web应用，具有科幻风格的用户界面设计。

## 🎯 功能特点

### 📊 实时可视化
- **左侧面板**: Object Tracking System - 显示检测目标的实时坐标和轨迹
- **右侧面板**: Detection Data - 显示详细的目标信息和状态
- **底部状态栏**: 系统状态和帧率信息

### 🎨 视觉设计
- **科幻风格界面**: 黑色背景，白色网格线，扫描线动画
- **颜色编码系统**: 不同类型目标使用不同颜色标识
- **动态效果**: 目标锁定圈、悬停高亮、状态指示灯

### 🎮 交互控制
- **键盘控制**: 
  - `空格键`: 播放/暂停
  - `左右箭头`: 手动导航帧
- **鼠标交互**: 悬停目标查看详细信息
- **自动播放**: 10 FPS自动循环播放

## 🚀 快速开始

### 安装运行
```bash
# 克隆项目
git clone [repository-url]
cd frontend

# 启动本地服务器
python -m http.server 8080

# 在浏览器中打开
http://localhost:8080
```

### 数据格式
项目使用`labels/`文件夹中的数据文件，格式为：
```
类别ID x1 y1 x2 y2 x3 y3 x4 y4 置信度
```

## 📁 项目结构

```
frontend/
├── label_visualization.html    # 主页面
├── styles.css                 # 样式文件
├── config.js                  # 基础配置
├── objectTypes.js             # 对象类型和颜色配置
├── dataManager.js             # 数据管理
├── renderer.js                # Canvas渲染器
├── uiPanel.js                 # UI面板管理
├── visualization.js           # 主控制逻辑
└── labels/                    # 数据文件夹
    ├── Sequence 02_590.txt
    ├── Sequence 02_591.txt
    └── ...
```

## 🔧 配置说明

### 对象类型配置 (`objectTypes.js`)
系统支持灵活的对象类型配置：

```javascript
export const OBJECT_TYPES = {
    0: {
        name: 'AGENT_PIONEER',
        colors: {
            primary: '#ffffff',   // 主色
            secondary: '#FFFB1F'  // 辅色
        },
        prefix: 'AGENT_PIONEER'
    },
    4: {
        name: 'RESOURCE',
        colors: {
            primary: '#ff4444',
            secondary: '#ffffff'
        },
        prefix: 'RESOURCE'
    }
};
```

### 播放配置 (`config.js`)
```javascript
export const FRAME_CONFIG = {
    START_FRAME: 590,    // 起始帧
    END_FRAME: 689,      // 结束帧
    FRAME_RATE: 10       // 播放帧率
};
```

## 🎨 当前对象类型

| ID | 名称 | 主色 | 辅色 | 前缀 |
|----|------|------|------|------|
| 0 | AGENT_PIONEER | 白色 (#ffffff) | 黄色 (#FFFB1F) | AGENT_PIONEER |
| 4 | RESOURCE | 红色 (#ff4444) | 白色 (#ffffff) | RESOURCE |
| 其他 | UNKNOWN | 橙色 (#ffaa00) | 白色 (#ffffff) | UNKNOWN |

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6 Modules)
- **图形**: Canvas API
- **字体**: JetBrains Mono
- **架构**: 模块化设计

## 📈 数据流程

1. **数据加载**: `dataManager.js` 负责从文件加载检测数据
2. **坐标变换**: `renderer.js` 将数据坐标转换为Canvas坐标
3. **视觉渲染**: Canvas绘制目标边界框、锁定圈和标签
4. **UI更新**: `uiPanel.js` 更新右侧数据面板
5. **交互处理**: 处理鼠标悬停和键盘事件

## 🔮 扩展功能

系统设计为可扩展架构，可以轻松添加：
- 新的对象类型和颜色
- 不同的数据源格式
- 更多的可视化效果
- 实时数据流支持

## 📄 许可证

本项目为毕业设计项目。

## 🤝 贡献

欢迎提交问题和改进建议！

---

**注**: 这是一个目标检测可视化系统，专为显示和分析计算机视觉检测结果而设计。 