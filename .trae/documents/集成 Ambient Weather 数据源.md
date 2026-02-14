## Ambient Weather 数据源集成计划

### 1. 环境变量修正
- 环境变量需要 `VITE_` 前缀才能在 Vite 中访问
- 修改 `.env.development` 和 `.env.production`：
  - `AMBIENT_API_KEY` → `VITE_AMBIENT_API_KEY`
  - `AMBIENT_APPLICATION_KEY` → `VITE_AMBIENT_APPLICATION_KEY`

### 2. 创建 Ambient Weather API 模块
**新建文件：`src/api/AmbientWeatherApi/`**
- `request.ts` - Axios 实例配置（带拦截器）
- `types.ts` - TypeScript 类型定义
- `index.ts` - 主要 API 方法：
  - `getUserDevices()` - 获取用户设备列表
  - `getDeviceData(macAddress, options)` - 获取设备历史数据
  - `transformToUnifiedFormat()` - 数据格式转换

### 3. 数据格式转换
将 Ambient Weather 数据映射到项目统一格式：
| Ambient Weather 字段 | 项目字段 |
|---------------------|---------|
| tempf → ambientTemperature (°F→°C) |
| humidity → ambientHumidity |
| baromrelin → pressure |
| windspeedmph → windSpeed (mph→m/s) |
| winddir → windDirection |
| hourlyrainin → rainfall |

### 4. 错误处理机制
- 网络请求失败处理（超时、断网）
- API 错误状态码处理（401, 403, 429, 500等）
- 数据格式验证

### 5. 单元测试
- 创建 `src/api/AmbientWeatherApi/__tests__/` 目录
- 测试场景：正常数据获取、无效密钥、网络异常、数据转换

### 6. 集成方式
- 支持多数据源切换（CloudPlatform / AmbientWeather）
- 保持现有 CloudPlatformApi 功能不受影响

### 文件变更清单
```
新建:
├── src/api/AmbientWeatherApi/
│   ├── index.ts
│   ├── request.ts
│   └── types.ts
└── src/api/AmbientWeatherApi/__tests__/
    └── index.test.ts

修改:
├── .env.development (修正变量名前缀)
├── .env.production (修正变量名前缀)
└── vite.config.ts (添加 Ambient Weather API 代理)
```