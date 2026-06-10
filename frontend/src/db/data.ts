import type { Course } from '../services/course/course.service';
import type { LearningPath } from '../services/learning-path/learning-path.service';
import type { Enrollment } from '../services/enrollment/enrollment.service';

const MOCK_USER = {
  userId: 1,
  fullName: 'Dr. John Doe',
  email: 'john.doe@edtech.com',
  avatar: null,
};

export const MOCK_PROVIDER_PROFILES = [
  {
    userId: 2,
    fullName: 'Tráº§n Thá»‹ Provider',
    email: 'provider@edtech.com',
    avatar: null,
    expertise: 'Frontend Engineering, React, TypeScript',
    experienceYears: 8,
    bio: 'Professional educator focused on practical frontend engineering, reusable UI architecture, and production-ready React applications.',
    rating: 4.9,
  },
  {
    userId: 5,
    fullName: 'Tech Mentors',
    email: 'mentors@edtech.com',
    avatar: null,
    expertise: 'Backend Engineering, APIs, Cloud Infrastructure',
    experienceYears: 10,
    bio: 'A team of senior backend engineers from leading tech companies, focused on shipping practical, production-grade backend curriculums.',
    rating: 4.8,
  },
  {
    userId: 6,
    fullName: 'Design Lab Academy',
    email: 'designlab@edtech.com',
    avatar: null,
    expertise: 'UI/UX Design, Product Design, Figma',
    experienceYears: 6,
    bio: 'Design educators helping learners build strong product thinking, interface craft, and portfolio-ready design case studies.',
    rating: 4.7,
  },
  {
    userId: 7,
    fullName: 'DataCraft Institute',
    email: 'datacraft@edtech.com',
    avatar: null,
    expertise: 'Data Science, Python, SQL, Machine Learning',
    experienceYears: 9,
    bio: 'Data practitioners teaching analytics, machine learning foundations, and applied database skills through hands-on projects.',
    rating: 4.8,
  },
];

function getMockProviderForCourse(courseId: number, title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('figma') || normalizedTitle.includes('ui/ux')) {
    return MOCK_PROVIDER_PROFILES[2];
  }

  if (
    normalizedTitle.includes('python') ||
    normalizedTitle.includes('data') ||
    normalizedTitle.includes('sql') ||
    normalizedTitle.includes('trÃ­ tuá»‡') ||
    normalizedTitle.includes('ai')
  ) {
    return MOCK_PROVIDER_PROFILES[3];
  }

  if (
    normalizedTitle.includes('spring') ||
    normalizedTitle.includes('node') ||
    normalizedTitle.includes('nestjs') ||
    normalizedTitle.includes('docker') ||
    normalizedTitle.includes('kubernetes') ||
    normalizedTitle.includes('system design') ||
    normalizedTitle.includes('owasp') ||
    normalizedTitle.includes('graphql') ||
    normalizedTitle.includes('devops')
  ) {
    return MOCK_PROVIDER_PROFILES[1];
  }

  return courseId % 2 === 0 ? MOCK_PROVIDER_PROFILES[1] : MOCK_PROVIDER_PROFILES[0];
}

function getCourseMetadata(title: string) {
  const t = title.toLowerCase();

  if (t.includes('react') || t.includes('vue') || t.includes('tailwind') || t.includes('frontend') || t.includes('css')) {
    return {
      outcomes: [
        'Build and deploy responsive user interfaces',
        'Master core component patterns and Hook structures',
        'Optimize client-side performance and page load speeds',
        'Implement production-ready State Management flows',
        'Structure reusable, standard layouts with modern CSS utilities',
        'Integrate client-side apps with REST APIs seamlessly'
      ],
      prerequisites: [
        'HTML, CSS, and Modern JavaScript (ES6+)',
        'Basic familiarity with command line interface',
        'Node.js installed locally on your machine'
      ],
      audience: [
        'Web designers transitioning to JavaScript frameworks',
        'Frontend developers seeking layout/styling mastery',
        'Learners desiring to build high-performance Single Page Apps'
      ],
      skills: ['ReactJS', 'Tailwind CSS', 'CSS Grid', 'JavaScript ES6', 'State Management'],
      curriculum: [
        {
          id: 'm1',
          title: 'Module 1 — Essentials & Environment Setup',
          description: 'Set up your project workspace and explore core architecture concept details.',
          progress: 0,
          lessons: [
            { id: 'l1', title: 'Course Overview & Roadmap', type: 'Video', duration: '05:30', status: 'not-started', preview: true },
            { id: 'l2', title: 'Local Tooling & Boilerplate config', type: 'Reading', duration: '12 min', status: 'not-started' },
            { id: 'l3', title: 'Building Your First Interactive Component', type: 'Video', duration: '10:45', status: 'not-started' },
            { id: 'l4', title: 'Environment Knowledge Check', type: 'Quiz', duration: '5 min', status: 'not-started' }
          ]
        },
        {
          id: 'm2',
          title: 'Module 2 — Advanced Features & Layout Structures',
          description: 'Dive deep into responsive layout utilities and advanced hook controls.',
          progress: 0,
          lessons: [
            { id: 'l5', title: 'Responsive Design Best Practices', type: 'Video', duration: '15:20', status: 'not-started' },
            { id: 'l6', title: 'State Lifecycle & Custom Hook Patterns', type: 'Reading', duration: '15 min', status: 'not-started' },
            { id: 'l7', title: 'Building a Complex Data-driven View', type: 'Video', duration: '20:15', status: 'not-started' },
            { id: 'l8', title: 'Module 2 Practice Review', type: 'Quiz', duration: '8 min', status: 'not-started' }
          ]
        },
        {
          id: 'm3',
          title: 'Module 3 — Final Capstone Deployment',
          description: 'Compile your frontend bundle and configure production deployments.',
          progress: 0,
          lessons: [
            { id: 'l9', title: 'Optimizing Build Bundles', type: 'Video', duration: '12:30', status: 'not-started' },
            { id: 'l10', title: 'Hosting Services Config & Edge Routing', type: 'Reading', duration: '10 min', status: 'not-started' },
            { id: 'l11', title: 'Full Frontend Capstone Submission', type: 'Assignment', duration: '2 hours', status: 'not-started' }
          ]
        }
      ]
    };
  }

  if (t.includes('sql') || t.includes('cơ sở dữ liệu') || t.includes('database') || t.includes('db')) {
    return {
      outcomes: [
        'Design efficient relational database schemas from scratch',
        'Write complex query structures utilizing multi-table JOINs',
        'Speed up database response times using indexes and keys',
        'Learn transactions and atomic operation concepts (ACID)',
        'Ensure database safety and backup strategies',
        'Handle migrations and schema updates in production code'
      ],
      prerequisites: [
        'Basic computer literacy',
        'No programming experience required',
        'Willingness to learn data structures'
      ],
      audience: [
        'Aspiring data analysts and business analysts',
        'Backend engineers needing query optimization skills',
        'System administrators overseeing production databases'
      ],
      skills: ['SQL', 'Relational Database', 'MySQL / PostgreSQL', 'Query Tuning', 'Database Schema Design'],
      curriculum: [
        {
          id: 'm1',
          title: 'Module 1 — Relational Theory & Basic Queries',
          description: 'Learn relational database paradigms and execute your very first SELECT queries.',
          progress: 0,
          lessons: [
            { id: 'l1', title: 'Introduction to Relational Databases', type: 'Video', duration: '08:15', status: 'not-started', preview: true },
            { id: 'l2', title: 'Installing SQL Workbench / DBeaver', type: 'Reading', duration: '15 min', status: 'not-started' },
            { id: 'l3', title: 'Understanding tables, keys, and values', type: 'Video', duration: '14:20', status: 'not-started' },
            { id: 'l4', title: 'Basic Queries Quiz', type: 'Quiz', duration: '8 min', status: 'not-started' }
          ]
        },
        {
          id: 'm2',
          title: 'Module 2 — Advanced Joins & Aggregations',
          description: 'Combine datasets from separate tables and summarize data details.',
          progress: 0,
          lessons: [
            { id: 'l5', title: 'INNER, LEFT, RIGHT JOINs Explained', type: 'Video', duration: '18:40', status: 'not-started' },
            { id: 'l6', title: 'Grouping Results (GROUP BY & HAVING)', type: 'Reading', duration: '15 min', status: 'not-started' },
            { id: 'l7', title: 'Writing CTEs & Subqueries', type: 'Video', duration: '22:10', status: 'not-started' },
            { id: 'l8', title: 'Joins and Aggregations Challenge', type: 'Quiz', duration: '10 min', status: 'not-started' }
          ]
        },
        {
          id: 'm3',
          title: 'Module 3 — Schema Architecture & Capstone Project',
          description: 'Create database designs and execute performance optimizations.',
          progress: 0,
          lessons: [
            { id: 'l9', title: 'Normalizing Schemas (1NF, 2NF, 3NF)', type: 'Video', duration: '20:15', status: 'not-started' },
            { id: 'l10', title: 'Database Indexing Strategies', type: 'Reading', duration: '12 min', status: 'not-started' },
            { id: 'l11', title: 'E-commerce Schema Capstone submission', type: 'Assignment', duration: '3 hours', status: 'not-started' }
          ]
        }
      ]
    };
  }

  if (t.includes('python') || t.includes('ai') || t.includes('data science') || t.includes('trí tuệ') || t.includes('agent')) {
    return {
      outcomes: [
        'Write clean, readable, object-oriented Python scripts',
        'Manipulate big datasets using Pandas and NumPy libraries',
        'Plot statistics using Matplotlib and Seaborn charts',
        'Build prediction models with Scikit-learn algorithms',
        'Design intelligent automation agents using LLM APIs',
        'Structure robust RAG pipeline tools'
      ],
      prerequisites: [
        'Basic algebra and math fundamentals',
        'Familiarity with standard computer files and directories',
        'No prior programming background required'
      ],
      audience: [
        'Data analysts looking to automate complex workflows',
        'Developers aiming to pivot into Machine Learning and AI',
        'Innovators building AI-powered web applications'
      ],
      skills: ['Python Programming', 'Data Analysis', 'Machine Learning', 'LLMs & AI Agents', 'Data Visualization'],
      curriculum: [
        {
          id: 'm1',
          title: 'Module 1 — Python Basics & Ecosystem',
          description: 'Set up Python, Jupyter notebooks, and learn core coding syntax structures.',
          progress: 0,
          lessons: [
            { id: 'l1', title: 'Why Python is the language of AI', type: 'Video', duration: '07:50', status: 'not-started', preview: true },
            { id: 'l2', title: 'Setting up Anaconda & JupyterLab', type: 'Reading', duration: '15 min', status: 'not-started' },
            { id: 'l3', title: 'Variables, loops, and lists in Python', type: 'Video', duration: '16:30', status: 'not-started' },
            { id: 'l4', title: 'Basic Syntax Quiz', type: 'Quiz', duration: '6 min', status: 'not-started' }
          ]
        },
        {
          id: 'm2',
          title: 'Module 2 — Data Analytics with Pandas & NumPy',
          description: 'Load, filter, transform, and clean real-world dataset files.',
          progress: 0,
          lessons: [
            { id: 'l5', title: 'Pandas DataFrames Essentials', type: 'Video', duration: '20:10', status: 'not-started' },
            { id: 'l6', title: 'Vectorized Operations with NumPy', type: 'Reading', duration: '12 min', status: 'not-started' },
            { id: 'l7', title: 'Plotting Insights & Visualizations', type: 'Video', duration: '18:45', status: 'not-started' },
            { id: 'l8', title: 'Data Wrangling Challenge', type: 'Quiz', duration: '10 min', status: 'not-started' }
          ]
        },
        {
          id: 'm3',
          title: 'Module 3 — AI Agents & Capstone Model',
          description: 'Build predictive AI and interface with large language model APIs.',
          progress: 0,
          lessons: [
            { id: 'l9', title: 'Supervised Learning with Scikit-learn', type: 'Video', duration: '24:15', status: 'not-started' },
            { id: 'l10', title: 'Building a RAG Agent with OpenAI API', type: 'Reading', duration: '20 min', status: 'not-started' },
            { id: 'l11', title: 'Predictive Model Capstone submission', type: 'Assignment', duration: '4 hours', status: 'not-started' }
          ]
        }
      ]
    };
  }

  // DEFAULT (Spring Boot / Java / General Backend)
  return {
    outcomes: [
      'Build REST APIs using Spring Boot frameworks',
      'Structure controllers, services, and repositories cleanly',
      'Connect backend services with MySQL databases',
      'Implement JWT token-based authentication workflows',
      'Handle validation, exceptions, and API error responses',
      'Test backend server endpoints using Postman / REST Clients'
    ],
    prerequisites: [
      'Basic Java syntax and object-oriented programming concepts',
      'Familiarity with command line terminal commands',
      'Maven or Gradle build tool basics (a plus)'
    ],
    audience: [
      'Backend developers looking to master Java / Spring Boot',
      'Computer Science students building portfolio project projects',
      'Software engineers transitioning from other languages to Java'
    ],
    skills: ['Java', 'Spring Boot', 'REST API Design', 'MySQL Database', 'JWT Security'],
    curriculum: [
      {
        id: 'm1',
        title: 'Module 1 — Introduction to Spring Boot',
        description: 'Set up your environment and understand Spring Boot fundamentals.',
        progress: 0,
        lessons: [
          { id: 'l1', title: 'Why Spring Boot?', type: 'Video', duration: '08:24', status: 'not-started', preview: true },
          { id: 'l2', title: 'Setting up IntelliJ & Maven', type: 'Reading', duration: '10 min', status: 'not-started' },
          { id: 'l3', title: 'Hello World Application', type: 'Video', duration: '12:10', status: 'not-started' },
          { id: 'l4', title: 'Module Quiz', type: 'Quiz', duration: '5 min', status: 'not-started' }
        ]
      },
      {
        id: 'm2',
        title: 'Module 2 — REST API Fundamentals',
        description: 'Understand REST architecture, HTTP verbs, and status codes.',
        progress: 0,
        lessons: [
          { id: 'l5', title: 'REST Architecture Explained', type: 'Video', duration: '14:32', status: 'not-started' },
          { id: 'l6', title: 'HTTP Methods Deep Dive', type: 'Reading', duration: '15 min', status: 'not-started' },
          { id: 'l7', title: 'Building Your First Controller', type: 'Video', duration: '18:45', status: 'not-started' },
          { id: 'l8', title: 'Knowledge Check', type: 'Quiz', duration: '8 min', status: 'not-started' }
        ]
      },
      {
        id: 'm3',
        title: 'Module 3 — Database & Authentication Integration',
        description: 'Connect Spring Boot to MySQL and secure it using JWT.',
        progress: 0,
        lessons: [
          { id: 'l9', title: 'JPA Fundamentals & Hibernate', type: 'Video', duration: '20:00', status: 'not-started' },
          { id: 'l10', title: 'JWT Token Authentication Flow', type: 'Reading', duration: '18 min', status: 'not-started' },
          { id: 'l11', title: 'Bookstore REST API Capstone Submission', type: 'Assignment', duration: '4 hours', status: 'not-started' }
        ]
      }
    ]
  };
}

const MOCK_COURSES_RAW: Course[] = [
  {
    courseId: 1,
    title: 'ReactJS Cơ Bản đến Nâng Cao',
    status: 'approved',
    description: 'Làm chủ React hook, Custom Hooks, Redux Toolkit, Context API và tối ưu hiệu năng ứng dụng.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 12,
    totalLessons: 24,
    enrollmentCount: 1540,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 2,
    title: 'Xây Dựng REST APIs với Node.js & Express',
    status: 'approved',
    description: 'Tự tay thiết kế hệ thống RESTful API chuẩn REST, bảo mật với JWT, kết nối MongoDB/PostgreSQL.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 16,
    totalLessons: 30,
    enrollmentCount: 980,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 3,
    title: 'Thiết Kế Giao Diện UI/UX cơ bản Figma',
    status: 'approved',
    description: 'Học cách thiết kế Wireframe, Prototype và tạo UI Components chuẩn Figma từ chuyên gia thiết kế.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 8,
    totalLessons: 15,
    enrollmentCount: 2200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 4,
    title: 'Làm chủ TypeScript cho React',
    status: 'approved',
    description: 'Đi từ cơ bản đến nâng cao TS: Generics, Mapped Types, tsconfig và áp dụng thực tế vào React.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 10,
    totalLessons: 20,
    enrollmentCount: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 5,
    title: 'Docker cho Lập Trình Viên',
    status: 'approved',
    description: 'Container hóa ứng dụng Node/React, thiết lập Docker Compose cho môi trường phát triển và production.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 10,
    totalLessons: 18,
    enrollmentCount: 890,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 6,
    title: 'GraphQL API Design',
    status: 'approved',
    description: 'Thiết lập Schema, Query, Mutation và Apollo Client để tối ưu hóa truyền tải dữ liệu.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 8,
    totalLessons: 14,
    enrollmentCount: 650,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 7,
    title: 'Kiểm Thử Ứng Dụng với Vitest',
    status: 'approved',
    description: 'Viết Unit Test, Integration Test và Component Test cho React cực kỳ nhanh chóng bằng Vitest.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 5,
    totalLessons: 10,
    enrollmentCount: 420,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 8,
    title: 'Lập trình Java Web với Spring Boot',
    status: 'approved',
    description: 'Xây dựng ứng dụng Enterprise hoàn chỉnh với Spring Boot, Spring Security, JPA/Hibernate.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 20,
    totalLessons: 35,
    enrollmentCount: 1820,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 9,
    title: 'Next.js 14 - Production-Grade Applications',
    status: 'approved',
    description: 'Deep dive into App Router, Server Actions, SSR, ISR, and layout optimizations for web apps.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 14,
    totalLessons: 28,
    enrollmentCount: 2100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 10,
    title: 'Xây dựng microservices với NestJS & RabbitMQ',
    status: 'approved',
    description: 'Thiết kế hệ thống phân tán chịu tải cao sử dụng NestJS, RabbitMQ, Redis và PostgreSQL.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 18,
    totalLessons: 32,
    enrollmentCount: 950,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 11,
    title: 'Clean Code & Refactoring cho Developer',
    status: 'approved',
    description: 'Học cách viết code sạch, dễ bảo trì, áp dụng SOLID design principles và các kỹ thuật refactoring.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 6,
    totalLessons: 12,
    enrollmentCount: 1430,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 12,
    title: 'Cấu trúc dữ liệu và Giải thuật cơ bản',
    status: 'approved',
    description: 'Làm chủ các cấu trúc dữ liệu quan trọng như Array, LinkedList, Tree, Graph và các thuật toán tìm kiếm, sắp xếp.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 15,
    totalLessons: 30,
    enrollmentCount: 3200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 13,
    title: 'DevOps & CI/CD Pipelines with GitHub Actions',
    status: 'approved',
    description: 'Build robust automation pipelines for testing, building, and deploying applications directly on GitHub.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 12,
    totalLessons: 22,
    enrollmentCount: 1120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 14,
    title: 'Cơ sở dữ liệu SQL từ số 0',
    status: 'approved',
    description: 'Học cách thiết kế cơ sở dữ liệu quan hệ, viết các câu lệnh truy vấn phức tạp từ đơn giản đến nâng cao.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 10,
    totalLessons: 20,
    enrollmentCount: 2500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 15,
    title: 'Tailwind CSS - Modern & Responsive Layouts',
    status: 'approved',
    description: 'Create gorgeous, highly responsive layouts in minutes using Tailwind utility-first CSS framework.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 6,
    totalLessons: 12,
    enrollmentCount: 1670,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 16,
    title: 'Vue.js 3 & Pinia State Management',
    status: 'approved',
    description: 'Làm quen với Composition API, SFCs, Router và quản lý state tập trung hiệu quả bằng Pinia.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 12,
    totalLessons: 24,
    enrollmentCount: 810,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 17,
    title: 'Python cho Khoa học Dữ liệu (Data Science)',
    status: 'approved',
    description: 'Sử dụng NumPy, Pandas, Matplotlib và Scikit-Learn để phân tích, trực quan hóa và xây dựng mô hình dự báo.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 18,
    totalLessons: 36,
    enrollmentCount: 2900,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 18,
    title: 'Thiết kế hệ thống System Design cơ bản',
    status: 'approved',
    description: 'Hiểu các khái niệm Load Balancing, Caching, Databases Sharding, CAP Theorem cho hệ thống triệu người dùng.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 14,
    totalLessons: 26,
    enrollmentCount: 1750,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 19,
    title: 'Xây dựng Ứng dụng Di động với React Native',
    status: 'approved',
    description: 'Phát triển ứng dụng Android/iOS đa nền tảng sử dụng component bản địa, Navigation và Redux.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 16,
    totalLessons: 30,
    enrollmentCount: 1200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 20,
    title: 'Bảo mật Web OWASP Top 10 cơ bản',
    status: 'approved',
    description: 'Phòng chống SQL Injection, XSS, CSRF và các lỗ hổng phổ biến bảo vệ ứng dụng web.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 8,
    totalLessons: 16,
    enrollmentCount: 680,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 21,
    title: 'Kubernetes in Practice for DevOps',
    status: 'approved',
    description: 'Deploy, scale, and manage containerized applications with Kubernetes pods, services, and deployments.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'English',
    duration: 15,
    totalLessons: 26,
    enrollmentCount: 920,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    courseId: 22,
    title: 'Trí tuệ nhân tạo & Lập trình AI Agent cơ bản',
    status: 'approved',
    description: 'Tích hợp OpenAI API, thiết kế Prompt Engineering và xây dựng RAG Agent ứng dụng thực tế.',
    thumbnailUrl: null,
    projectUrl: null,
    language: 'Vietnamese',
    duration: 12,
    totalLessons: 22,
    enrollmentCount: 2050,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER,
  }
];

export const MOCK_COURSES: Course[] = MOCK_COURSES_RAW.map(course => ({
  ...course,
  user: getMockProviderForCourse(course.courseId, course.title),
  ...getCourseMetadata(course.title)
}));

export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    learningPathId: 1,
    title: 'Frontend Mastery Path',
    description: 'Trở thành Frontend Engineer chuyên nghiệp từ thiết kế UI đến lập trình React/TS.',
    slug: 'frontend-mastery',
    bannerUrl: null,
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 1, courseId: 3, position: 1, course: MOCK_COURSES[2] },
      { learningPathId: 1, courseId: 1, position: 2, course: MOCK_COURSES[0] },
      { learningPathId: 1, courseId: 4, position: 3, course: MOCK_COURSES[3] }
    ]
  },
  {
    learningPathId: 2,
    title: 'Full-Stack Developer Path',
    description: 'Lộ trình kết hợp tối ưu ReactJS, Node.js API và công cụ containerization Docker.',
    slug: 'full-stack-engineering',
    bannerUrl: null,
    level: 'advanced',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 2, courseId: 1, position: 1, course: MOCK_COURSES[0] },
      { learningPathId: 2, courseId: 2, position: 2, course: MOCK_COURSES[1] },
      { learningPathId: 2, courseId: 5, position: 3, course: MOCK_COURSES[4] }
    ]
  },
  {
    learningPathId: 3,
    title: 'UI/UX Product Design Path',
    description: 'Lộ trình cơ bản làm quen thiết kế giao diện ứng dụng và trải nghiệm người dùng.',
    slug: 'product-design',
    bannerUrl: null,
    level: 'beginner',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 3, courseId: 3, position: 1, course: MOCK_COURSES[2] }
    ]
  },
  {
    learningPathId: 4,
    title: 'Backend Mastery Path',
    description: 'Học cách thiết kế REST API, quản lý cơ sở dữ liệu và tối ưu hệ thống backend vững chắc.',
    slug: 'backend-mastery',
    bannerUrl: null,
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 4, courseId: 14, position: 1, course: MOCK_COURSES[13] },
      { learningPathId: 4, courseId: 2, position: 2, course: MOCK_COURSES[1] },
      { learningPathId: 4, courseId: 8, position: 3, course: MOCK_COURSES[7] }
    ]
  },
  {
    learningPathId: 5,
    title: 'DevOps Engineer Career Path',
    description: 'Lộ trình làm chủ Docker, Kubernetes, CI/CD và kiến trúc hạ tầng hiện đại.',
    slug: 'devops-engineer',
    bannerUrl: null,
    level: 'advanced',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 5, courseId: 5, position: 1, course: MOCK_COURSES[4] },
      { learningPathId: 5, courseId: 13, position: 2, course: MOCK_COURSES[12] },
      { learningPathId: 5, courseId: 21, position: 3, course: MOCK_COURSES[20] }
    ]
  },
  {
    learningPathId: 6,
    title: 'Mobile Developer Path',
    description: 'Từ giao diện UI/UX Figma đến việc hoàn thiện ứng dụng di động đa nền tảng bằng React Native.',
    slug: 'mobile-developer',
    bannerUrl: null,
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 6, courseId: 3, position: 1, course: MOCK_COURSES[2] },
      { learningPathId: 6, courseId: 1, position: 2, course: MOCK_COURSES[0] },
      { learningPathId: 6, courseId: 19, position: 3, course: MOCK_COURSES[18] }
    ]
  },
  {
    learningPathId: 7,
    title: 'Data Science & AI Foundations',
    description: 'Tìm hiểu ngôn ngữ Python, xử lý dữ liệu và tiếp cận thế giới Trí Tuệ Nhân Tạo cơ bản.',
    slug: 'data-science-ai',
    bannerUrl: null,
    level: 'beginner',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 7, courseId: 17, position: 1, course: MOCK_COURSES[16] },
      { learningPathId: 7, courseId: 22, position: 2, course: MOCK_COURSES[21] }
    ]
  },
  {
    learningPathId: 8,
    title: 'Software Architecture & System Design',
    description: 'Làm chủ thiết kế hệ thống lớn, NestJS Microservices và các nguyên lý Clean Code.',
    slug: 'software-architect',
    bannerUrl: null,
    level: 'advanced',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 8, courseId: 11, position: 1, course: MOCK_COURSES[10] },
      { learningPathId: 8, courseId: 10, position: 2, course: MOCK_COURSES[9] },
      { learningPathId: 8, courseId: 18, position: 3, course: MOCK_COURSES[17] }
    ]
  },
  {
    learningPathId: 9,
    title: 'Full-Stack Vue.js Developer',
    description: 'Kết hợp Vue.js 3 hiện đại phía Frontend và Node.js Express phía Backend.',
    slug: 'vue-fullstack',
    bannerUrl: null,
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    learningPathCourses: [
      { learningPathId: 9, courseId: 16, position: 1, course: MOCK_COURSES[15] },
      { learningPathId: 9, courseId: 2, position: 2, course: MOCK_COURSES[1] }
    ]
  }
];

export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    enrollmentId: 101,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    progress: 52,
    lastAccessedAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: null,
    course: MOCK_COURSES[0],
  },
  {
    enrollmentId: 102,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    progress: 31,
    lastAccessedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null,
    expiresAt: null,
    course: MOCK_COURSES[1],
  },
  {
    enrollmentId: 103,
    enrolledAt: new Date().toISOString(),
    status: 'completed',
    progress: 100,
    lastAccessedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: null,
    course: MOCK_COURSES[2],
  }
];

export const MOCK_PROFILE = {
  fullName: 'Nguyễn Văn Learner',
  email: 'learner@edtech.com',
  streakCount: 12,
  completedCourses: 1,
  learningHours: 124,
  enrolledPaths: 2,
};

export const MOCK_LEARNER_PROFILE_FULL = {
  fullName: 'Nguyễn Văn Learner',
  email: 'learner@edtech.com',
  avatarUrl: null,
  learningGoal: 'Master React and Node.js for Fullstack',
  level: 'Intermediate',
  createdAt: '2026-06-01T08:00:00Z',
  bio: 'Học viên năng nổ học hỏi công nghệ mới.',
};

export const MOCK_ACADEMIC_PROFILE = {
  fullName: 'Trần Thị Provider',
  email: 'provider@edtech.com',
  avatarUrl: null,
  expertise: 'Software Architecture & React',
  experienceYears: 8,
  createdAt: '2026-05-15T10:00:00Z',
  bio: 'Dạy học với cả trái tim và kinh nghiệm thực chiến.',
};

export const MOCK_USERS_BACKEND = [
  {
    userId: 1,
    fullName: 'Nguyễn Văn Learner',
    email: 'learner@edtech.com',
    role: { roleName: 'learner' },
    isEmailVerified: true,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-07T12:00:00Z',
    avatar: null
  },
  {
    userId: 2,
    fullName: 'Trần Thị Provider',
    email: 'provider@edtech.com',
    role: { roleName: 'course provider' },
    isEmailVerified: true,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-06-05T09:30:00Z',
    avatar: null
  },
  {
    userId: 3,
    fullName: 'Lê Văn Manager',
    email: 'manager@edtech.com',
    role: { roleName: 'academic manager' },
    isEmailVerified: true,
    createdAt: '2026-04-20T14:00:00Z',
    updatedAt: '2026-06-01T11:15:00Z',
    avatar: null
  },
  {
    userId: 4,
    fullName: 'Phạm Hồng Admin',
    email: 'admin@edtech.com',
    role: { roleName: 'admin' },
    isEmailVerified: true,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-06-07T18:00:00Z',
    avatar: null
  },
  {
    userId: 5,
    fullName: 'Nguyễn Thị Hoa',
    email: 'hoa.nt@example.com',
    role: { roleName: 'learner' },
    isEmailVerified: false,
    createdAt: '2026-06-06T15:45:00Z',
    updatedAt: '2026-06-06T15:45:00Z',
    avatar: null
  }
];
