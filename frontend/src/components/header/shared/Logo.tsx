import { Link } from 'react-router-dom';
import { BookOpen, Shield, GraduationCap, Award } from 'lucide-react';

type LogoVariant = 'default' | 'admin' | 'provider' | 'academic';

interface LogoProps {
    variant?: LogoVariant;
}

export function Logo({ variant = 'default' }: LogoProps) {
    const configs = {
        default: {
            mark: '#E11D48',
            text: 'LearningPath',
            suffix: '',
            suffixColor: '#E11D48',
            icon: <BookOpen className="w-4 h-4 text-white" />,
        },
        admin: {
            mark: '#7C3AED',
            text: 'Learning',
            suffix: 'Admin',
            suffixColor: '#7C3AED',
            icon: <Shield className="w-4 h-4 text-white" />,
        },
        provider: {
            mark: '#0EA5E9',
            text: 'Learning',
            suffix: 'Studio',
            suffixColor: '#0EA5E9',
            icon: <GraduationCap className="w-4 h-4 text-white" />,
        },
        academic: {
            mark: '#D97706',
            text: 'Learning',
            suffix: 'Academic',
            suffixColor: '#D97706',
            icon: <Award className="w-4 h-4 text-white" />,
        },
    };

    const c = configs[variant];

    return (
        <Link 
            to="/" 
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{ backgroundColor: c.mark }}
            >
                {c.icon}
            </div>

            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    color: '#111827',
                    lineHeight: 1,
                }}
            >
                {c.text}
                <span style={{ color: c.suffixColor }}>{c.suffix}</span>
            </span>
        </Link>
    );
}