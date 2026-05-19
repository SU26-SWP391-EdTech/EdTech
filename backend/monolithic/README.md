# Cấu trúc thư mục
src/
│
├── main.ts
├── app.module.ts
│
├── common/                  # Shared reusable stuff
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   ├── enums/
│   ├── constants/
│   └── utils/
│
├── config/                  # Environment & configs
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── data-source.ts
│
├── modules/
│   │
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── auth.repository.ts
│   │
│   ├── users/
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       │
│       ├── entities/
│       │   └── user.entity.ts
│       │
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.module.ts
│       └── user.repository.ts
│   
│
├── shared/                  # Shared modules/services
│   ├── mail/
│   ├── redis/
│   └── upload/
│
└── types/

