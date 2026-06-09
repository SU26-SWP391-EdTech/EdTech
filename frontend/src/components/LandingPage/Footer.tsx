import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
    const navigate = useNavigate();
    const cols = [
        {
            label: 'Product',
            links: ['Features', 'Learning Paths', 'Courses', 'Certificates', 'Progress Tracking', 'Analytics'],
        },
        {
            label: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Partners', 'Contact'],
        },
        {
            label: 'For Organizations',
            links: ['Teams', 'Enterprise', 'Course Providers', 'Case Studies', 'Integrations', 'API'],
        },
        {
            label: 'Resources',
            links: ['Documentation', 'Community', 'Help Center', 'Changelog', 'Status', 'Privacy'],
        },
    ];

    const handleLinkClick = (e: React.MouseEvent, link: string) => {
        e.preventDefault();
        const exploreLinks = [
            'Features', 'Learning Paths', 'Courses', 'Certificates', 'Progress Tracking', 'Analytics',
            'Teams', 'Enterprise', 'Course Providers', 'Case Studies', 'Integrations', 'API',
            'Documentation', 'Community', 'Help Center', 'Changelog', 'Status', 'Privacy'
        ];
        if (exploreLinks.includes(link)) {
            navigate('/explore');
        } else {
            navigate('/register');
        }
    };

    return (
        <footer className="bg-[#111827] pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-5 gap-10 mb-14">
                    {/* Brand col */}
                    <div className="col-span-1">
                        <div
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2.5 mb-4 cursor-pointer"
                        >
                            <div className="w-7 h-7 rounded-lg bg-[#E11D48] flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-white" style={{ fontWeight: 700, fontSize: 16 }}>LearningPath</span>
                        </div>
                        <p className="text-[#6B7280] mb-5" style={{ fontSize: 14, lineHeight: 1.65 }}>
                            The modern platform for structured learning and real career growth.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, href: '#' },
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" /></svg>, href: '#' },
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>, href: '#' },
                            ].map((s, i) => (
                                <a key={i} href={s.href} className="w-8 h-8 rounded-lg bg-[#1F2937] hover:bg-[#374151] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link cols */}
                    {cols.map(col => (
                        <div key={col.label}>
                            <p className="text-white mb-4" style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</p>
                            <ul className="space-y-2.5">
                                {col.links.map(link => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            onClick={(e) => handleLinkClick(e, link)}
                                            className="text-[#6B7280] hover:text-[#D1D5DB] transition-colors"
                                            style={{ fontSize: 14 }}
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-[#1F2937] flex items-center justify-between">
                    <p className="text-[#6B7280]" style={{ fontSize: 13 }}>
                        © 2026 LearningPath, Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                            <a
                                key={link}
                                href="#"
                                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                                className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                                style={{ fontSize: 13 }}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
