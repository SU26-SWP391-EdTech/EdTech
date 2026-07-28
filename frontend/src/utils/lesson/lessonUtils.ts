import type { Note, Question } from '../../types/lesson/lesson.types';

// ─── DOMAIN MOCK CODE GENERATORS ──────────────────────────────────────────────

function getReactMockCode() {
  return {
    filename: 'UserCard.tsx',
    code: `import React, { useState } from 'react';

export function UserCard({ name, role }) {
  const [active, setActive] = useState(false);

  return (
    <div className={\`p-4 rounded-xl border \${active ? 'border-rose-500' : 'border-slate-200'}\`}>
      <h3 className="text-base font-semibold">{name}</h3>
      <p className="text-sm text-slate-500">{role}</p>
      <button 
        onClick={() => setActive(!active)}
        className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg"
      >
        Toggle Active
      </button>
    </div>
  );
}`
  };
}

function getDatabaseMockCode() {
  return {
    filename: 'queries.sql',
    code: `-- Get top active learners with their enrollments count
SELECT 
  u.user_id,
  u.full_name,
  COUNT(e.enrollment_id) as total_enrollments
FROM users u
LEFT JOIN enrollments e ON u.user_id = e.user_id
WHERE e.status = 'active'
GROUP BY u.user_id, u.full_name
HAVING COUNT(e.enrollment_id) > 1
ORDER BY total_enrollments DESC
LIMIT 5;`
  };
}

function getPythonMockCode() {
  return {
    filename: 'rag_agent.py',
    code: `import os
import openai
import pandas as pd

class RAGAgent:
    def __init__(self, index_path):
        self.df = pd.read_csv(index_path)
        openai.api_key = os.getenv("OPENAI_API_KEY")

    def retrieve(self, query, top_k=3):
        # Mock simple semantic search retrieval
        return self.df.head(top_k)["content"].tolist()

    def query(self, user_prompt):
        contexts = self.retrieve(user_prompt)
        prompt = f"Contexts: {contexts}\\nQuery: {user_prompt}"
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content`
  };
}

function getSpringMockCode() {
  return {
    filename: 'UserController.java',
    code: `@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest req) {
        UserDTO created = userService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}`
  };
}

export const getMockCode = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('react') || t.includes('next.js') || t.includes('tailwind') || t.includes('vue')) {
    return getReactMockCode();
  }
  if (t.includes('sql') || t.includes('database') || t.includes('cơ sở dữ liệu')) {
    return getDatabaseMockCode();
  }
  if (t.includes('python') || t.includes('ai') || t.includes('trí tuệ')) {
    return getPythonMockCode();
  }
  return getSpringMockCode();
};

// ─── DOMAIN QUIZ QUESTION GENERATORS ──────────────────────────────────────────

function getReactQuizQuestions() {
  return [
    {
      question: 'What Hook is used to handle side effects in React functional components?',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      answer: 'useEffect',
    },
    {
      question: 'Which function is used to change state in a useState Hook?',
      options: ['setState', 'The dispatch function', 'The second element returned by useState', 'useState.update()'],
      answer: 'The second element returned by useState',
    },
    {
      question: 'What is the purpose of React.memo?',
      options: ['To cache variables', 'To skip rendering a component if its props have not changed', 'To manage global state', 'To write inline styles'],
      answer: 'To skip rendering a component if its props have not changed',
    },
  ];
}

function getDatabaseQuizQuestions() {
  return [
    {
      question: 'Which SQL clause is used to filter records in a group?',
      options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
      answer: 'HAVING',
    },
    {
      question: 'What key uniquely identifies a record in a table?',
      options: ['Foreign Key', 'Primary Key', 'Unique Key', 'Candidate Key'],
      answer: 'Primary Key',
    },
    {
      question: 'What type of join returns all rows from the left table and matched rows from the right table?',
      options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
      answer: 'LEFT JOIN',
    },
  ];
}

function getPythonQuizQuestions() {
  return [
    {
      question: 'Which Python library is widely used for data manipulation and analysis?',
      options: ['Pandas', 'Matplotlib', 'NumPy', 'Scikit-learn'],
      answer: 'Pandas',
    },
    {
      question: 'What does RAG stand for in the context of Large Language Models?',
      options: ['Random Adversarial Generation', 'Retrieval-Augmented Generation', 'Recurrent Attention Gradient', 'Recursive Analysis Gateway'],
      answer: 'Retrieval-Augmented Generation',
    },
    {
      question: 'Which machine learning algorithm is commonly used for supervised classification?',
      options: ['K-Means Clustering', 'Logistic Regression', 'Linear Regression', 'Principal Component Analysis'],
      answer: 'Logistic Regression',
    },
  ];
}

function getSpringQuizQuestions() {
  return [
    {
      question: 'What annotation marks a class as a REST controller in Spring Boot?',
      options: ['@Controller', '@RestController', '@ResponseBody', '@Component'],
      answer: '@RestController',
    },
    {
      question: 'Which HTTP method is used for creating a new resource in REST conventions?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      answer: 'POST',
    },
    {
      question: 'What does ResponseEntity allow you to control in a REST response?',
      options: ['HTTP status code only', 'Response body and headers only', 'HTTP status code, body, and headers', 'Database connection timeouts'],
      answer: 'HTTP status code, body, and headers',
    },
  ];
}

export const getQuizQuestionsForCourse = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('react') || t.includes('next.js') || t.includes('tailwind') || t.includes('vue')) {
    return getReactQuizQuestions();
  }
  if (t.includes('sql') || t.includes('database') || t.includes('cơ sở dữ liệu')) {
    return getDatabaseQuizQuestions();
  }
  if (t.includes('python') || t.includes('ai') || t.includes('trí tuệ')) {
    return getPythonQuizQuestions();
  }
  return getSpringQuizQuestions();
};

// ─── YOUTUBE HELPERS ──────────────────────────────────────────────────────────

export function parseYoutubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);

  return watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || null;
}

export function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const id = parseYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// ─── MOCK DATABASES ───────────────────────────────────────────────────────────

export const SAVED_NOTES: Note[] = [
  {
    id: 1,
    timestamp: '3:24',
    content: 'Understand core component layout and basic hooks lifecycle.',
    color: '#FEF3C7',
  },
  {
    id: 2,
    timestamp: '7:11',
    content: 'Ensure inputs are properly bound and sanitized.',
    color: '#DCFCE7',
  },
  {
    id: 3,
    timestamp: '12:48',
    content: 'Double-check response error structures to catch unhandled boundary exceptions.',
    color: '#EDE9FE',
  },
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    author: 'Jamie Liu',
    avatar: 'JL',
    text: 'How can I optimize this specific component to avoid redundant parent re-renders?',
    answers: 4,
    upvotes: 12,
    time: '2h ago',
  },
  {
    id: 2,
    author: 'Sam Patel',
    avatar: 'SP',
    text: 'Is there an alternative middleware strategy recommended for large file transmissions?',
    answers: 7,
    upvotes: 23,
    time: '5h ago',
  },
];

export function getContinueLessonUrl(courseId: number, enrollments: any[]): string {
  const enrollment = enrollments.find(e => e.course?.courseId === courseId);
  const matchedCourse = enrollment?.course || { courseId, title: 'Course Detail', curriculum: [] };
  const rawModules = matchedCourse?.curriculum || [];
  const completedLessonIds = new Set<string>(enrollment?.completedLessonIds || []);
  const progressVal = enrollment?.progress ?? 0;

  const flatLessons: any[] = [];
  rawModules.forEach((mod: any) => {
    if (mod.lessons) {
      flatLessons.push(...mod.lessons);
    }
  });

  if (flatLessons.length === 0) {
    return `/learner/lesson?courseId=${courseId}`;
  }

  const hasTrackedLessonProgress = completedLessonIds.size > 0;
  const completedFromProgressCount = !hasTrackedLessonProgress
    ? Math.round((progressVal / 100) * flatLessons.length)
    : 0;

  // Find the first uncompleted lesson
  let activeLesson = flatLessons[0];
  for (let i = 0; i < flatLessons.length; i++) {
    const lesson = flatLessons[i];
    const lessonKey = String(lesson.id);
    const isCompleted = (i < completedFromProgressCount) || completedLessonIds.has(lessonKey);
    if (!isCompleted) {
      activeLesson = lesson;
      break;
    }
  }

  return `/learner/lesson?courseId=${courseId}&lessonId=${activeLesson.id}`;
}

