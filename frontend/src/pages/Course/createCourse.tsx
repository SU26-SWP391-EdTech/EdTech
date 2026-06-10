import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, searchCourses } from '../../services/course.service';
import toast from 'react-hot-toast';
import {
    ChevronDown, Upload, Plus, Send, AlertTriangle, CheckCircle2,
    Circle, X, GripVertical, Pencil, Trash2, Video, BookOpen, FileText,
    ClipboardList, Lock, Unlock, Link2, Paperclip, FolderPlus, Globe,
    Lock as LockIcon, Building2, Clock
} from 'lucide-react';

type LessonType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    duration: string;
    locked: boolean;
}

interface Module {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

const initialModules: Module[] = [
    {
        id: 'm1',
        title: 'Module 1 — Getting Started with Spring Boot',
        description: 'Set up your environment, understand Spring Boot fundamentals, and build your first app.',
        lessons: [
            { id: 'l1', title: 'Introduction to Spring Boot', type: 'Video', duration: '08:24', locked: false },
            { id: 'l2', title: 'Setting up IntelliJ & Maven', type: 'Reading', duration: '10 min', locked: false },
            { id: 'l3', title: 'Hello World Application', type: 'Video', duration: '12:10', locked: false },
            { id: 'l4', title: 'Module Quiz', type: 'Quiz', duration: '5 min', locked: true },
        ],
    },
    {
        id: 'm2',
        title: 'Module 2 — Building REST Controllers',
        description: 'Learn to design and implement REST endpoints with Spring MVC.',
        lessons: [
            { id: 'l5', title: 'Your First REST Controller', type: 'Video', duration: '14:32', locked: false },
            { id: 'l6', title: 'Request Mapping Deep Dive', type: 'Reading', duration: '15 min', locked: true },
            { id: 'l7', title: 'Build a Bookstore API', type: 'Assignment', duration: '45 min', locked: true },
        ],
    },
];

export function CreateCoursePage() {
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [outcomes, setOutcomes] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [showAddModule, setShowAddModule] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showUnsaved, setShowUnsaved] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('English');
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [projectUrl, setProjectUrl] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prerequisiteCourseIds, setPrerequisiteCourseIds] = useState<number[]>([]);
    const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
    const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ mIdx: number; lIdx: number } | null>(null);
    const [dragEnabled, setDragEnabled] = useState(false);
    const [lessonDragEnabled, setLessonDragEnabled] = useState(false);

    const [availableCourses, setAvailableCourses] = useState<{ id: number; title: string }[]>([]);

    useEffect(() => {
        const fetchAvailableCourses = async () => {
            try {
                const res = await searchCourses();
                const items = res.data?.items || [];
                setAvailableCourses(items.map((item: any) => ({
                    id: item.courseId,
                    title: item.title,
                })));
            } catch (err) {
                console.error('Failed to fetch available courses:', err);
            }
        };
        fetchAvailableCourses();
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File) => {
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File is too large. Max size is 2MB.');
            return;
        }
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };
    const onDragLeave = () => {
        setDragOver(false);
    };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (status: 'draft' | 'pending') => {
        if (!title.trim()) {
            toast.error('Course Title is required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('language', language);
            const totalDuration = (Number(durationHours) * 60) + Number(durationMinutes);
            formData.append('duration', String(totalDuration));
            if (projectUrl) {
                formData.append('projectUrl', projectUrl);
            }
            if (thumbnailFile) {
                formData.append('thumbnailUrl', thumbnailFile);
            }

            await createCourse(formData);
            toast.success('Course created successfully!');
            navigate('/provider/courses');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create course.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddModule = (title: string, description: string) => {
        if (!title.trim()) {
            toast.error('Module title is required.');
            return;
        }
        const newModule: Module = {
            id: `m-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            lessons: [],
        };
        setModules((prev) => [...prev, newModule]);
        setShowAddModule(false);
        toast.success('Module added successfully!');
    };

    const handleEditModule = (id: string, title: string, description: string) => {
        if (!title.trim()) {
            toast.error('Module title is required.');
            return;
        }
        setModules((prev) =>
            prev.map((m) =>
                m.id === id
                    ? { ...m, title: title.trim(), description: description.trim() }
                    : m
            )
        );
        setEditingModule(null);
        toast.success('Module updated successfully!');
    };

    const removeOutcome = (i: number) => setOutcomes((o) => o.filter((_, idx) => idx !== i));
    const removeSkill = (s: string) => setSkills((arr) => arr.filter((x) => x !== s));
    const deleteModule = (id: string) => {
        setModules((prev) => {
            const filtered = prev.filter((x) => x.id !== id);
            return filtered.map((mod, idx) => {
                const match = mod.title.match(/^(Module \d+)\s*—\s*(.*)$/);
                if (match) {
                    return { ...mod, title: `Module ${idx + 1} — ${match[2]}` };
                }
                return { ...mod, title: `Module ${idx + 1} — ${mod.title}` };
            });
        });
        toast.success('Module deleted successfully!');
    };
    const deleteLesson = (mid: string, lid: string) => setModules((m) => m.map((x) => x.id === mid ? { ...x, lessons: x.lessons.filter((l) => l.id !== lid) } : x));

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-base font-semibold animate-pulse">Creating course & uploading image, please wait...</p>
                </div>
            )}
            <div className="max-w-[1376px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-end justify-between mb-7">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <h1 className="text-[28px] text-[#111827]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                Create Course
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFBEB] text-[#B45309] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                Draft
                            </span>
                        </div>
                        <p className="text-[#6B7280] text-sm">
                            Build a new course, organize lessons, upload materials, and submit it for review.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSubmit('draft')}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
                            style={{ fontWeight: 500 }}
                            disabled={isSubmitting}
                        >
                            Save Draft
                        </button>
                        <button onClick={() => setShowSubmit(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }} disabled={isSubmitting}>
                            <Send className="w-4 h-4" />
                            Submit for Review
                        </button>
                    </div>
                </div>

                {/* Left Form */}
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 space-y-5">
                        {/* Section 1 — Basic Info */}
                        <FormCard step={1} title="Basic Information" status="valid" description="Tell learners what your course is about.">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Course title" required full>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spring Boot REST API Masterclass" />
                                </Field>
                                <Field label="Short description" hint="Shown on course cards" full required>
                                    <Input defaultValue="Build production-grade REST APIs with Spring Boot from scratch." />
                                </Field>
                                <Field label="Full description" full required>
                                    <Textarea
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Full description of the course..."
                                    />
                                </Field>
                                <Field label="Language" required>
                                    <Select value={language} onChange={e => setLanguage(e.target.value)}>
                                        <option value="English">English</option>
                                        <option value="Vietnamese">Vietnamese</option>
                                    </Select>
                                </Field>
                                <Field label="Estimated duration" required>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <input type="number" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))} className="w-full px-3 py-2 pr-12 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]" style={{ fontWeight: 500 }}>hours</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="w-full px-3 py-2 pr-12 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]" style={{ fontWeight: 500 }}>min</span>
                                        </div>
                                    </div>
                                </Field>
                                <Field label="Course thumbnail" full>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="grid grid-cols-[160px_1fr] gap-4">
                                        {thumbnailPreview ? (
                                            <div className="relative rounded-lg overflow-hidden border border-[#E5E7EB] aspect-video bg-[#F8FAFC]">
                                                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                                                    className="absolute top-1 right-1 p-1 bg-[#111827]/70 text-white rounded hover:bg-[#111827]/80 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-lg bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center">
                                                <BookOpen className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                        <div
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragOver ? 'border-[#E11D48] bg-[#FEF2F2]' : 'border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}
                                        >
                                            <Upload className="w-5 h-5 text-[#6B7280] mb-1.5" />
                                            <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>Drop image here or click to upload</p>
                                            <p className="text-xs text-[#6B7280] mt-0.5">PNG, JPG up to 2MB · 16:9 recommended</p>
                                        </div>
                                    </div>
                                </Field>
                            </div>
                        </FormCard>

                        {/* Section 2 — Course Structure */}
                        <FormCard step={2} title="Course Structure" status="warning" description="Organize your course into modules and lessons." action={
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowAddModule(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-white rounded-lg text-xs hover:bg-black transition-colors" style={{ fontWeight: 500 }}>
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Module
                                </button>
                            </div>
                        }>
                            {modules.length === 0 ? (
                                <div className="border border-dashed border-[#E5E7EB] rounded-xl p-10 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center mb-3">
                                        <FolderPlus className="w-5 h-5 text-[#E11D48]" />
                                    </div>
                                    <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>No modules added yet</p>
                                    <p className="text-xs text-[#6B7280] mb-4">Start by creating your first module for this course.</p>
                                    <button onClick={() => setShowAddModule(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Module
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modules.map((m, mIdx) => (
                                        <div
                                            key={m.id}
                                            draggable={dragEnabled}
                                            onDragStart={(e) => {
                                                setDraggedModuleIndex(mIdx);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (draggedModuleIndex === null || draggedModuleIndex === mIdx) return;
                                                const updated = [...modules];
                                                const draggedItem = updated[draggedModuleIndex];
                                                updated.splice(draggedModuleIndex, 1);
                                                updated.splice(mIdx, 0, draggedItem);

                                                const renamed = updated.map((mod, idx) => {
                                                    const match = mod.title.match(/^(Module \d+)\s*—\s*(.*)$/);
                                                    if (match) {
                                                        return { ...mod, title: `Module ${idx + 1} — ${match[2]}` };
                                                    }
                                                    return { ...mod, title: `Module ${idx + 1} — ${mod.title}` };
                                                });

                                                setDraggedModuleIndex(mIdx);
                                                setModules(renamed);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedModuleIndex(null);
                                            }}
                                            className={`border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#FAFAFA] transition-all ${draggedModuleIndex === mIdx ? 'opacity-40 scale-95 border-[#E11D48]' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E7EB]">
                                                <GripVertical
                                                    className="w-4 h-4 text-[#9CA3AF] cursor-grab"
                                                    onMouseEnter={() => setDragEnabled(true)}
                                                    onMouseLeave={() => setDragEnabled(false)}
                                                />
                                                <span className="text-xs text-[#9CA3AF]" style={{ fontWeight: 600 }}>M{mIdx + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{m.title}</p>
                                                    <p className="text-xs text-[#6B7280] truncate">{m.description}</p>
                                                </div>
                                                <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded text-[10px]" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.lessons.length} lessons</span>
                                                <IconBtn title="Edit" onClick={() => setEditingModule(m)}><Pencil className="w-4 h-4" /></IconBtn>
                                                <IconBtn title="Delete" danger onClick={() => setDeletingModuleId(m.id)}><Trash2 className="w-4 h-4" /></IconBtn>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {m.lessons.map((l, lIdx) => (
                                                    <div
                                                        key={l.id}
                                                        draggable={lessonDragEnabled}
                                                        onDragStart={(e) => {
                                                            setDraggedLessonInfo({ mIdx, lIdx });
                                                            e.dataTransfer.effectAllowed = 'move';
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            if (!draggedLessonInfo) return;
                                                            if (draggedLessonInfo.mIdx !== mIdx) return; // Only allow sorting within same module
                                                            if (draggedLessonInfo.lIdx === lIdx) return;

                                                            const updated = [...modules];
                                                            const lessons = [...updated[mIdx].lessons];
                                                            const draggedLesson = lessons[draggedLessonInfo.lIdx];
                                                            lessons.splice(draggedLessonInfo.lIdx, 1);
                                                            lessons.splice(lIdx, 0, draggedLesson);
                                                            updated[mIdx] = {
                                                                ...updated[mIdx],
                                                                lessons
                                                            };
                                                            setDraggedLessonInfo({ mIdx, lIdx });
                                                            setModules(updated);
                                                        }}
                                                        onDragEnd={() => {
                                                            setDraggedLessonInfo(null);
                                                        }}
                                                        className={`flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#E11D48]/30 transition-all group ${draggedLessonInfo?.mIdx === mIdx && draggedLessonInfo?.lIdx === lIdx ? 'opacity-40 scale-95 border-[#E11D48]' : ''}`}
                                                    >
                                                        <GripVertical
                                                            className="w-3.5 h-3.5 text-[#9CA3AF] cursor-grab"
                                                            onMouseEnter={() => setLessonDragEnabled(true)}
                                                            onMouseLeave={() => setLessonDragEnabled(false)}
                                                        />
                                                        <span className="text-[11px] text-[#9CA3AF] w-6" style={{ fontWeight: 600 }}>{mIdx + 1}.{lIdx + 1}</span>
                                                        <LessonTypeBadge type={l.type} />
                                                        <span className="text-sm text-[#111827] flex-1" style={{ fontWeight: 500 }}>{l.title}</span>
                                                        <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                                                            <Clock className="w-3 h-3" />
                                                            {l.duration}
                                                        </span>
                                                        <button title={l.locked ? 'Locked — preview disabled' : 'Free preview'} className={`p-1 rounded ${l.locked ? 'text-[#9CA3AF]' : 'text-[#10B981]'}`}>
                                                            {l.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <IconBtn title="Edit"><Pencil className="w-3.5 h-3.5" /></IconBtn>
                                                        <IconBtn title="Delete" danger onClick={() => deleteLesson(m.id, l.id)}><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                                                    </div>
                                                ))}
                                                <button onClick={() => setShowAddLesson(true)} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[#E11D48] hover:bg-[#FEF2F2] rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Lesson
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormCard>

                        {/* Section 3 — Learning Outcomes */}
                        <FormCard step={3} title="Learning Outcomes" status="valid" description="Define what learners will achieve from this course.">
                            <div className="space-y-5">
                                <Field label="What learners will learn" required full>
                                    <div className="space-y-2">
                                        {outcomes.map((o, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg group">
                                                <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                                                <input
                                                    defaultValue={o}
                                                    className="flex-1 text-sm text-[#111827] bg-transparent focus:outline-none"
                                                />
                                                <button onClick={() => removeOutcome(i)} className="opacity-0 group-hover:opacity-100 p-1 text-[#6B7280] hover:text-[#E11D48] transition-all">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => setOutcomes((o) => [...o, ''])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E11D48] hover:bg-[#FEF2F2] rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                                            <Plus className="w-3.5 h-3.5" />
                                            Add outcome
                                        </button>
                                    </div>
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Prerequisites" hint="Select recommended prerequisite courses">
                                        <div className="space-y-2">
                                            {prerequisiteCourseIds.map(id => {
                                                const pc = availableCourses.find(c => c.id === id);
                                                if (!pc) return null;
                                                return (
                                                    <div key={id} className="flex items-center justify-between px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg">
                                                        <span className="text-xs text-[#E11D48] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
                                                            {pc.title}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrerequisiteCourseIds(prev => prev.filter(x => x !== id))}
                                                            className="text-[#9CA3AF] hover:text-[#E11D48] transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <select
                                                value=""
                                                onChange={e => {
                                                    const id = Number(e.target.value);
                                                    if (id && !prerequisiteCourseIds.includes(id)) {
                                                        setPrerequisiteCourseIds(prev => [...prev, id]);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48]"
                                            >
                                                <option value="">+ Add prerequisite course...</option>
                                                {availableCourses.map(c => (
                                                    <option key={c.id} value={c.id} disabled={prerequisiteCourseIds.includes(c.id)}>
                                                        {c.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </Field>
                                    <Field label="Target learners">
                                        <Textarea rows={3} defaultValue="Backend developers, CS students, and engineers transitioning into REST API development." />
                                    </Field>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB] mt-5">
                                    <button
                                        onClick={() => handleSubmit('draft')}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
                                        style={{ fontWeight: 500 }}
                                        disabled={isSubmitting}
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        onClick={() => setShowSubmit(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
                                        style={{ fontWeight: 500 }}
                                        disabled={isSubmitting}
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit for Review
                                    </button>
                                </div>
                            </div>
                        </FormCard>

                    </div>
                </div>
            </div>

            {/* Modals */}
            {(showAddModule || editingModule) && (
                <AddModuleModal
                    initialData={
                        editingModule
                            ? { title: editingModule.title, description: editingModule.description }
                            : undefined
                    }
                    modulesCount={modules.length}
                    onClose={() => {
                        setShowAddModule(false);
                        setEditingModule(null);
                    }}
                    onSave={(title, description) => {
                        if (editingModule) {
                            handleEditModule(editingModule.id, title, description);
                        } else {
                            handleAddModule(title, description);
                        }
                    }}
                />
            )}
            {showAddLesson && <AddLessonModal onClose={() => setShowAddLesson(false)} />}
            {
                showSubmit && (
                    <SubmitModal
                        onClose={() => setShowSubmit(false)}
                        onConfirm={() => {
                            setShowSubmit(false);
                            handleSubmit('pending');
                        }}
                        isSubmitting={isSubmitting}
                    />
                )
            }
            {showUnsaved && <UnsavedModal onClose={() => setShowUnsaved(false)} />}
            {deletingModuleId && (
                <DeleteModuleModal
                    onClose={() => setDeletingModuleId(null)}
                    onConfirm={() => {
                        deleteModule(deletingModuleId);
                        setDeletingModuleId(null);
                    }}
                />
            )}
        </div>
    );
}

function FormCard({ step, title, status, description, children, action }: {
    step: number; title: string; status: 'valid' | 'warning' | 'incomplete' | 'error'; description: string; children: React.ReactNode; action?: React.ReactNode;
}) {
    const statusMap = {
        valid: { tint: '#ECFDF5', color: '#10B981', label: 'Complete' },
        warning: { tint: '#FFFBEB', color: '#F59E0B', label: 'Needs attention' },
        incomplete: { tint: '#F1F5F9', color: '#6B7280', label: 'Incomplete' },
        error: { tint: '#FEF2F2', color: '#E11D48', label: 'Errors' },
    } as const;
    const s = statusMap[status];
    return (
        <section className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
                <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#E11D48] flex items-center justify-center text-xs" style={{ fontWeight: 700 }}>
                        {step}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>{title}</h2>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: s.tint, color: s.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                                <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                                {s.label}
                            </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>
                    </div>
                </div>
                {action}
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Field({ label, hint, required, full, children }: { label: string; hint?: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-[#374151]" style={{ fontWeight: 500 }}>
                    {label}{required && <span className="text-[#E11D48] ml-0.5">*</span>}
                </label>
                {hint && <span className="text-[11px] text-[#9CA3AF]">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }
function Input(props: InputProps) {
    return (
        <input
            {...props}
            className={`w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] ${props.className || ''}`}
        />
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }
function Textarea(props: TextareaProps) {
    return (
        <textarea
            {...props}
            className={`w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] resize-none ${props.className || ''}`}
        />
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}
function Select({ children, ...props }: SelectProps) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`w-full appearance-none px-3 py-2 pr-9 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] ${props.className || ''}`}
            >
                {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
        </div>
    );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick?: () => void; title?: string; danger?: boolean }) {
    return (
        <button onClick={onClick} title={title} className={`p-1.5 rounded-md transition-colors ${danger ? 'text-[#6B7280] hover:text-[#E11D48] hover:bg-[#FEF2F2]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'}`}>
            {children}
        </button>
    );
}

function LessonTypeBadge({ type }: { type: LessonType }) {
    const map: Record<LessonType, { Icon: React.ComponentType<{ className?: string }>; tint: string; color: string }> = {
        Video: { Icon: Video, tint: '#FEF2F2', color: '#E11D48' },
        Reading: { Icon: BookOpen, tint: '#EEF2FF', color: '#6366F1' },
        Quiz: { Icon: ClipboardList, tint: '#FFFBEB', color: '#B45309' },
        Assignment: { Icon: FileText, tint: '#ECFDF5', color: '#047857' },
    };
    const m = map[type];
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: m.tint, color: m.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            <m.Icon className="w-3 h-3" />
            {type}
        </span>
    );
}

function UploadArea({ Icon, title, hint, accept }: { Icon: React.ComponentType<{ className?: string }>; title: string; hint: string; accept?: string }) {
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile);
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            className="col-span-1 border border-dashed border-[#E5E7EB] rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-[#E11D48]/40 hover:bg-[#FFF1F2]/30 transition-colors cursor-pointer relative"
        >
            <input
                type="file"
                ref={inputRef}
                accept={accept}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
            />
            {file ? (
                <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <p className="text-sm text-[#111827] font-medium truncate max-w-full px-2">{file.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-2 px-2.5 py-1 bg-white border border-[#E5E7EB] text-[#E11D48] rounded text-xs hover:bg-red-50"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <>
                    <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center mb-2">
                        <Icon className="w-4 h-4 text-[#6B7280]" />
                    </div>
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{hint}</p>
                    <button className="mt-2 px-3 py-1 bg-white border border-[#E5E7EB] rounded text-xs text-[#111827] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>
                        Choose file
                    </button>
                </>
            )}
        </div>
    );
}

function VisibilityOption({ Icon, title, desc, selected }: { Icon: React.ComponentType<{ className?: string }>; title: string; desc: string; selected?: boolean }) {
    return (
        <label className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selected ? 'border-[#E11D48] bg-[#FEF2F2]/50' : 'border-[#E5E7EB] hover:bg-[#FAFAFA]'}`}>
            <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? 'bg-[#E11D48] text-white' : 'bg-[#F8FAFC] text-[#6B7280]'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <input type="radio" name="visibility" defaultChecked={selected} className="accent-[#E11D48]" />
            </div>
            <div>
                <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{title}</p>
                <p className="text-xs text-[#6B7280]">{desc}</p>
            </div>
        </label>
    );
}

function Toggle({ label, enabled }: { label: string; enabled?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg">
            <span className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{label}</span>
            <button className={`w-9 h-5 rounded-full relative transition-colors ${enabled ? 'bg-[#E11D48]' : 'bg-[#E5E7EB]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
        </div>
    );
}

export function ValidationCard({ tone, Icon, title, desc }: { tone: 'error' | 'success' | 'warning'; Icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
    const map = {
        error: { tint: '#FEF2F2', border: '#FECACA', color: '#B91C1C' },
        success: { tint: '#ECFDF5', border: '#A7F3D0', color: '#047857' },
        warning: { tint: '#FFFBEB', border: '#FDE68A', color: '#B45309' },
    } as const;
    const m = map[tone];
    return (
        <div className="rounded-lg p-3 border" style={{ background: m.tint, borderColor: m.border }}>
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E11D48]" />
                <div>
                    <p className="text-xs" style={{ color: m.color, fontWeight: 600 }}>{title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: m.color, opacity: 0.85 }}>{desc}</p>
                </div>
            </div>
        </div>
    );
}

function ProgressItem({ label, done, warning }: { label: string; done?: boolean; warning?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            ) : warning ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
                <Circle className="w-3.5 h-3.5 text-[#D1D5DB]" />
            )}
            <span className={`text-xs ${done ? 'text-[#111827]' : warning ? 'text-[#92400E]' : 'text-[#6B7280]'}`} style={{ fontWeight: done ? 500 : 400 }}>{label}</span>
        </div>
    );
}

export function QuickBtn({ Icon, label, primary, danger, onClick }: { Icon: React.ComponentType<{ className?: string }>; label: string; primary?: boolean; danger?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${primary
                ? 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                : danger
                    ? 'text-[#B91C1C] hover:bg-[#FEF2F2]'
                    : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC]'
                }`}
            style={{ fontWeight: 500 }}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div onClick={onClose} className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-sm flex items-center justify-center p-6">
            {children}
        </div>
    );
}

interface AddModuleModalProps {
    onClose: () => void;
    onSave: (title: string, description: string) => void;
    initialData?: { title: string; description: string };
    modulesCount: number;
}

function AddModuleModal({ onClose, onSave, initialData, modulesCount }: AddModuleModalProps) {
    const isEdit = !!initialData;

    const parseTitle = () => {
        if (!initialData) return { prefix: `Module ${modulesCount + 1}`, subtitle: '' };
        const match = initialData.title.match(/^(Module \d+)\s*—\s*(.*)$/);
        if (match) {
            return { prefix: match[1], subtitle: match[2] };
        }
        return { prefix: 'Module', subtitle: initialData.title };
    };

    const { prefix, subtitle: initialSubtitle } = parseTitle();
    const [subtitle, setSubtitle] = useState(initialSubtitle);
    const [description, setDescription] = useState(initialData?.description || '');

    const handleSave = () => {
        const finalTitle = subtitle.trim() ? `${prefix} — ${subtitle.trim()}` : prefix;
        onSave(finalTitle, description);
    };

    return (
        <Overlay onClose={onClose}>
            <div className="w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                    <h3 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>
                        {isEdit ? 'Edit Module' : 'Add Module'}
                    </h3>
                    <button onClick={onClose} className="p-2 -m-2 text-[#6B7280] hover:text-[#111827]"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <Field label="Module title" required full>
                        <div className="flex items-stretch bg-white border border-[#E5E7EB] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E11D48]/20 focus-within:border-[#E11D48]">
                            <span className="bg-[#F8FAFC] border-r border-[#E5E7EB] px-3.5 py-2 text-sm text-[#6B7280] shrink-0 flex items-center justify-center font-semibold select-none">
                                {prefix}
                            </span>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-[#111827] focus:outline-none"
                                placeholder="e.g. Getting Started"
                            />
                        </div>
                    </Field>
                    <Field label="Module description" full>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What learners will cover in this module..."
                        />
                    </Field>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>
                        {isEdit ? 'Save Changes' : 'Add Module'}
                    </button>
                </div>
            </div>
        </Overlay>
    );
}

function AddLessonModal({ onClose }: { onClose: () => void }) {
    const [type, setType] = useState<LessonType>('Video');
    return (
        <Overlay onClose={onClose}>
            <div className="w-[640px] max-h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                    <h3 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>Add Lesson</h3>
                    <button onClick={onClose} className="p-2 -m-2 text-[#6B7280] hover:text-[#111827]"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <Field label="Lesson title" required full>
                        <Input placeholder="e.g. Building Your First REST Controller" />
                    </Field>
                    <Field label="Lesson description" full>
                        <Textarea rows={2} placeholder="Brief summary shown to learners..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Lesson type" required>
                            <div className="grid grid-cols-4 gap-1.5">
                                {(['Video', 'Reading', 'Quiz', 'Assignment'] as LessonType[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`px-2 py-2 rounded-lg text-[11px] border transition-colors ${type === t ? 'border-[#E11D48] bg-[#FEF2F2] text-[#E11D48]' : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'}`}
                                        style={{ fontWeight: 600 }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Duration" required>
                            <Input placeholder="e.g. 12:30 or 15 min" />
                        </Field>
                    </div>
                    {type === 'Video' && (
                        <Field label="Video upload / content URL" full>
                            <div className="border border-dashed border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3">
                                <Video className="w-5 h-5 text-[#6B7280]" />
                                <div className="flex-1">
                                    <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>Upload video file</p>
                                    <p className="text-xs text-[#6B7280]">MP4 up to 500MB · or paste a video URL</p>
                                </div>
                                <button className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#111827] rounded text-xs" style={{ fontWeight: 500 }}>Browse</button>
                            </div>
                        </Field>
                    )}
                    {type === 'Reading' && (
                        <Field label="Reading content" full>
                            <Textarea rows={5} placeholder="Write or paste the reading material..." />
                        </Field>
                    )}
                    {type === 'Quiz' && (
                        <Field label="Quiz selection" full>
                            <Select>
                                <option>Create new quiz</option>
                                <option>Module knowledge check</option>
                                <option>End-of-course assessment</option>
                            </Select>
                        </Field>
                    )}
                    {type === 'Assignment' && (
                        <Field label="Assignment file" full>
                            <div className="border border-dashed border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3">
                                <Paperclip className="w-5 h-5 text-[#6B7280]" />
                                <div className="flex-1">
                                    <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>Upload assignment</p>
                                    <p className="text-xs text-[#6B7280]">PDF, DOCX, ZIP up to 100MB</p>
                                </div>
                                <button className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#111827] rounded text-xs" style={{ fontWeight: 500 }}>Browse</button>
                            </div>
                        </Field>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-white" style={{ fontWeight: 500 }}>Cancel</button>
                    <button onClick={onClose} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>Add Lesson</button>
                </div>
            </div>
        </Overlay>
    );
}

function SubmitModal({ onClose, onConfirm, isSubmitting }: { onClose: () => void; onConfirm: () => void; isSubmitting: boolean }) {
    return (
        <Overlay onClose={onClose}>
            <div className="w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
                        <Send className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <h3 className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>Submit course for review?</h3>
                    <p className="text-sm text-[#6B7280] mb-4">
                        Academic Managers will review your course before publishing. You'll be notified when the review is complete.
                    </p>
                    <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 mb-2">
                        <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Checklist summary</p>
                        <div className="space-y-1.5">
                            <ProgressItem label="Basic information completed" done />
                            <ProgressItem label="At least one module added" done />
                            <ProgressItem label="Learning outcomes defined" done />
                            <ProgressItem label="Content policy checked" warning />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm" style={{ fontWeight: 500 }} disabled={isSubmitting}>Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] disabled:opacity-50" style={{ fontWeight: 500 }} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </div>
            </div>
        </Overlay>
    );
}

function UnsavedModal({ onClose }: { onClose: () => void }) {
    return (
        <Overlay onClose={onClose}>
            <div className="w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#FFFBEB] flex items-center justify-center mb-4">
                        <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>You have unsaved changes</h3>
                    <p className="text-sm text-[#6B7280]">
                        If you leave now, your latest edits won't be saved. Save a draft to keep your progress.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
                    <button onClick={onClose} className="px-4 py-2 text-[#6B7280] hover:text-[#111827] text-sm" style={{ fontWeight: 500 }}>Leave without saving</button>
                    <button onClick={onClose} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>Save Draft</button>
                </div>
            </div>
        </Overlay>
    );
}

function DeleteModuleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
    return (
        <Overlay onClose={onClose}>
            <div className="w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
                        <Trash2 className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <h3 className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>Delete Module</h3>
                    <p className="text-sm text-[#6B7280]">
                        Are you sure you want to delete this module? This action cannot be undone and all lessons inside will be removed.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>Delete</button>
                </div>
            </div>
        </Overlay>
    );
}
