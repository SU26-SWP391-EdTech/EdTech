import React from 'react';
import { Route, TrendingUp, Sparkles, Award, Map, BookOpen, Trophy } from 'lucide-react';

export const FEATURES = [
    {
        icon: <Route className="w-5 h-5" />,
        title: 'Structured Learning Paths',
        desc: 'Follow expert-curated roadmaps from beginner to job-ready. Never wonder what to learn next.',
        color: '#E11D48', bg: '#FFF1F4',
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Progress Tracking',
        desc: 'Visualize your journey with detailed analytics, streak tracking, and milestone achievements.',
        color: '#3B82F6', bg: '#EFF6FF',
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Smart Recommendations',
        desc: 'AI-powered course suggestions based on your goals, learning style, and progress history.',
        color: '#7C3AED', bg: '#F5F3FF',
    },
    {
        icon: <Award className="w-5 h-5" />,
        title: 'Certificates & Achievements',
        desc: 'Earn industry-recognized certificates and unlock badges as you complete each milestone.',
        color: '#F59E0B', bg: '#FFFBEB',
    },
];

export const PATHS = [
    {
        id: 1, title: 'Frontend Developer',
        desc: 'Master HTML, CSS, JavaScript, React & TypeScript from scratch',
        courses: 12, duration: '48h', difficulty: 'Beginner → Advanced',
        enrolled: 4800, gradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
        tags: ['HTML', 'CSS', 'React', 'TypeScript'], color: '#3B82F6',
    },
    {
        id: 2, title: 'Data Analyst',
        desc: 'Python, SQL, pandas, data visualization & ML fundamentals',
        courses: 10, duration: '40h', difficulty: 'Beginner → Intermediate',
        enrolled: 3200, gradient: 'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
        tags: ['Python', 'SQL', 'pandas', 'Visualization'], color: '#10B981',
    },
    {
        id: 3, title: 'UI/UX Designer',
        desc: 'Design fundamentals, Figma, user research & prototyping',
        courses: 9, duration: '36h', difficulty: 'Beginner → Intermediate',
        enrolled: 2900, gradient: 'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
        tags: ['Figma', 'UX Research', 'Prototyping'], color: '#EC4899',
    },
];

export const STEPS = [
    {
        num: '01', icon: <Map className="w-6 h-6" />, color: '#E11D48', bg: '#FFF1F4',
        title: 'Choose a Learning Path',
        desc: 'Browse curated paths built for real career goals. From frontend to data science and design.',
    },
    {
        num: '02', icon: <BookOpen className="w-6 h-6" />, color: '#3B82F6', bg: '#EFF6FF',
        title: 'Complete Courses Step by Step',
        desc: 'Follow the structured curriculum at your own pace with video lessons, exercises, and quizzes.',
    },
    {
        num: '03', icon: <Trophy className="w-6 h-6" />, color: '#10B981', bg: '#F0FDF4',
        title: 'Earn Certificates',
        desc: 'Track progress with detailed analytics and earn industry-recognized certificates upon completion.',
    },
];

export const TESTIMONIALS = [
    {
        id: 1, name: 'Mark Zuckerberg', role: 'CEO of Meta', av: "https://imageio.forbes.com/specials-images/imageserve/5c76b7d331358e35dd2773a9/0x0.jpg?format=jpg&crop=4401,4401,x0,y0,safe&height=416&width=416&fit=bounds", color: '#7C3AED',
        quote: 'A great learning product is not only useful, but also makes people want to come back every day',
        rating: 5,
    },
    {
        id: 2, name: 'Elon Musk', role: 'CEO of Tesla & SpaceX', av: 'https://assets.weforum.org/sf_account/image/SU7jY2MYK0Qaj6IgY6e0hXgO4LBYNB6qKxy9f-cr8KU.jpg', color: '#0369A1',
        quote: 'I like how LearningPath breaks big goals into small, actionable steps. It makes learning feel faster and more focused',
        rating: 5,
    },
    {
        id: 3, name: 'Bill Gates', role: 'Founder of Microsoft', av: 'https://imageio.forbes.com/specials-images/imageserve/62d599ede3ff49f348f9b9b4/0x0.jpg?format=jpg&crop=821,821,x155,y340,safe&height=416&width=416&fit=bounds', color: '#D97706',
        quote: "    LearningPath turns self-learning into a clear journey. You know where to start, what to learn next, and how far you have progressed.",
        rating: 5,
    },
];

export const ORGS = ['MIT OpenCourseWare', 'Stanford Online', 'Google Career', 'Microsoft Learn', 'AWS Training', 'Figma Education'];
