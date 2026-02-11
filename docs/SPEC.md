# Brainrot Study Platform — Mini Spec

## 目标
将 PDF/学习资料转换成短视频风格(brainrot)的学习内容和互动小游戏，让学习像刷 TikTok 一样上瘾。

## 核心功能

### 1. 资料上传与解析
- 支持 PDF 上传（最大 10MB）
- 自动提取文本内容
- 智能分割成知识点

### 2. Brainrot 内容生成
- 将知识点转换成短视频风格的脚本
- 添加 Gen-Z 网络用语和 meme 元素
- 支持语音播放（TTS）
- 配合简单动画/表情符号增强视觉效果

### 3. 互动小游戏
- 快问快答（Quiz）
- 填空挑战
- 选择题闯关
- 进度追踪和成就系统

### 4. 学习模式
- "刷一刷"模式：像 TikTok 一样滑动学习卡片
- "挑战"模式：游戏化测验
- 自定义学习节奏

## 技术方案
- 前端：React + Vite (TypeScript)
- 后端：Python FastAPI
- PDF 解析：PyMuPDF (fitz)
- AI 调用：通过 llm-proxy.densematrix.ai
- TTS：Edge TTS (免费)
- 部署：Docker → langsheng

## 端口分配
- Frontend: 30067
- Backend: 30068

## 合规措施（Legal Risk Yellow）
- [ ] 用户上传时确认拥有内容使用权
- [ ] AI 生成内容标注"仅供参考"
- [ ] Privacy Policy 页面
- [ ] 支持用户删除上传内容

## 完成标准
- [ ] 核心功能可用（上传 PDF → 生成 brainrot 内容 → 小游戏）
- [ ] 部署到 brainrot-study.demo.densematrix.ai
- [ ] Health check 通过
- [ ] 7 种语言 i18n 完整
- [ ] 支付集成 (Creem)
- [ ] 测试覆盖率 ≥ 95%
