import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCourse, searchCourses, getCourseById, updateCourse } from '../../services/course/course.service';
import { createLesson, getLessonsByCourse, updateLesson, deleteLesson as apiDeleteLesson } from '../../services/lesson/lesson.service';
import toast from 'react-hot-toast';
import type { CourseBuilderLesson, CourseBuilderLessonType as LessonType } from '../../types/course/create-course.types';
import { buildCourseFormData } from '../../utils/course/courseFormData';
import { clearCourseDraft, hasUsableCourseDraft, readCourseDraft, writeCourseDraft } from '../../utils/course/courseDraftStorage';
import { buildLessonSyncPayload, mapBackendLessonToCourseBuilderLesson } from '../../utils/course/courseMappers';
import {
    ChevronDown, Upload, Plus, Send, AlertTriangle, CheckCircle2,
    Circle, X, GripVertical, Pencil, Trash2, Video, BookOpen, FileText,
    ClipboardList, Lock, Unlock, Link2, Paperclip, FolderPlus, Globe,
    Lock as LockIcon, Building2, Clock
} from 'lucide-react';

export function CreateCoursePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
    const [deletedLessonIds, setDeletedLessonIds] = useState<number[]>([]);
    const [lessons, setLessons] = useState<CourseBuilderLesson[]>([]);
    const [outcomes, setOutcomes] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showUnsaved, setShowUnsaved] = useState(false);

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
    const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);
    const [lessonDragEnabled, setLessonDragEnabled] = useState(false);

    const [availableCourses, setAvailableCourses] = useState<{ id: number; title: string }[]>([]);

    const getCurrentCourseDraft = (currentLessons = lessons) => ({
        title,
        description,
        language,
        durationHours,
        durationMinutes,
        projectUrl,
        outcomes,
        prerequisiteCourseIds,
        thumbnailPreview,
        lessons: currentLessons,
    });

    useEffect(() => {
        if (!editId) return;

        const loadCourseData = async () => {
            setIsSubmitting(true);
            try {
                const course = await getCourseById(editId);
                setTitle(course.title || '');
                setDescription(course.description || '');
                setLanguage(course.language || 'English');
                setProjectUrl(course.projectUrl || '');
                setThumbnailPreview(course.thumbnailUrl || null);

                const totalDuration = course.duration || 0;
                setDurationHours(Math.floor(totalDuration / 60));
                setDurationMinutes(totalDuration % 60);

                const lessonsFromBackend = await getLessonsByCourse(editId);
                const mappedLessons = lessonsFromBackend.map(mapBackendLessonToCourseBuilderLesson);

                setLessons(mappedLessons);
            } catch (err) {
                console.error('Failed to load course details for edit:', err);
                toast.error('Failed to load course details.');
            } finally {
                setIsSubmitting(false);
            }
        };

        loadCourseData();
    }, [editId]);

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
            const formData = await buildCourseFormData({
                status,
                thumbnailFile,
                draft: getCurrentCourseDraft(),
            });

            let courseId = editId;
            if (editId) {
                await updateCourse(editId, formData);
            } else {
                const newCourse = await createCourse(formData);
                courseId = newCourse.courseId;
            }

            // Sync lessons
            for (const lid of deletedLessonIds) {
                try {
                    await apiDeleteLesson(lid);
                } catch (err) {
                    console.error(`Failed to delete lesson ${lid}:`, err);
                }
            }

            let idx = 1;
            for (const l of lessons) {
                try {
                    const payload = buildLessonSyncPayload(l, idx++);
                    const isNew = l.id.startsWith('l-');
                    if (isNew) {
                        await createLesson(courseId!, payload);
                    } else {
                        await updateLesson(courseId!, Number(l.id), payload);
                    }
                } catch (err) {
                    console.error('Failed to sync lesson:', err);
                }
            }

            if (!editId) {
                clearCourseDraft();
            }
            toast.success(editId ? 'Course updated successfully!' : 'Course created successfully!');
            navigate('/provider/courses');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create course.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeOutcome = (i: number) => setOutcomes((o) => o.filter((_, idx) => idx !== i));
    const removeSkill = (s: string) => setSkills((arr) => arr.filter((x) => x !== s));

    const toggleLessonLock = (lessonId: string) => {
        setLessons((prev) => prev.map((lesson) => (
            lesson.id === lessonId
                ? { ...lesson, locked: !lesson.locked }
                : lesson
        )));
    };

    const deleteLesson = async (lid: string) => {
        if (!lid.startsWith('l-') && editId) {
            try {
                await apiDeleteLesson(Number(lid));
                toast.success('Lesson removed.');
            } catch (err) {
                console.error(`Failed to delete lesson ${lid}:`, err);
                toast.error('Failed to remove lesson.');
                return;
            }
        } else if (!lid.startsWith('l-')) {
            setDeletedLessonIds(prev => [...prev, Number(lid)]);
        }

        setLessons((prev) => prev.filter((l) => l.id !== lid));
    };

    const handleLessonDragOver = (draggedIdx: number, targetIdx: number) => {
        const updated = [...lessons];
        const draggedItem = updated[draggedIdx];
        updated.splice(draggedIdx, 1);
        updated.splice(targetIdx, 0, draggedItem);
        setLessons(updated);
    };

    const ensureCourseExistsForLesson = async () => {
        if (editId) return editId;

        if (!title.trim()) {
            toast.error('Course Title is required before creating a lesson.');
            return null;
        }

        setIsSubmitting(true);
        try {
            const formData = await buildCourseFormData({
                status: 'draft',
                thumbnailFile,
                draft: getCurrentCourseDraft(),
            });

            const newCourse = await createCourse(formData);
            clearCourseDraft();
            toast.success('Course draft saved. You can now create lessons.');
            return newCourse.courseId;
        } catch (err: any) {
            console.error('Failed to create course draft before lesson:', err);
            toast.error(err.response?.data?.message || 'Failed to save course draft before creating lesson.');
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLessonEditor = async (lessonId?: string) => {
        const courseId = await ensureCourseExistsForLesson();
        if (!courseId) return;

        const backUrl = encodeURIComponent(`/provider/courses/create?id=${courseId}`);
        const lessonParam = lessonId ? `&lessonId=${lessonId}` : '';
        const courseTitleParam = !editId && title.trim() ? `&courseTitle=${encodeURIComponent(title.trim())}` : '';
        navigate(`/provider/lessons/create?redirectBack=${backUrl}&isCourseBuilder=true&courseId=${courseId}${lessonParam}${courseTitleParam}`);
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-base font-semibold animate-pulse">{editId ? 'Updating course, please wait...' : 'Creating course & uploading image, please wait...'}</p>
                </div>
            )}
            <div className="max-w-[1376px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-end justify-between mb-7">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <h1 className="text-[28px] text-[#111827]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {editId ? 'Edit Course' : 'Create Course'}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFBEB] text-[#B45309] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                Draft
                            </span>
                        </div>
                        <p className="text-[#6B7280] text-sm">
                            {editId ? 'Modify course details, organize lessons, update materials, and submit for review.' : 'Build a new course, organize lessons, upload materials, and submit it for review.'}
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
                        <FormCard step={1} title="Basic Information" description="Tell learners what your course is about.">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Course title" required full>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spring Boot REST API Masterclass" />
                                </Field>
                                <Field label="Description" full>
                                    <Textarea
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe what learners will gain from this course..."
                                    />
                                </Field>
                                <Field label="Language">
                                    <Select value={language} onChange={e => setLanguage(e.target.value)}>
                                        <option value="English">English</option>
                                        <option value="Vietnamese">Vietnamese</option>
                                    </Select>
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

                        {/* Section 2 — Lesson Curriculum */}
                        <FormCard step={2} title="Lesson Curriculum" description="Manage all lessons in this course." action={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        openLessonEditor();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors"
                                    style={{ fontWeight: 500 }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Create Lesson
                                </button>
                            </div>
                        }>
                            {lessons.length === 0 ? (
                                <div className="border border-dashed border-[#E5E7EB] rounded-xl p-10 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center mb-3">
                                        <BookOpen className="w-5 h-5 text-[#E11D48]" />
                                    </div>
                                    <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>No lessons added yet</p>
                                    <p className="text-xs text-[#6B7280] mb-4">Start by adding your first lesson for this course.</p>
                                    <button
                                        onClick={() => {
                                            openLessonEditor(); 
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors"
                                        style={{ fontWeight: 500 }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Create Lesson
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lessons.map((l, lIdx) => (
                                        <div
                                            key={l.id}
                                            draggable
                                            onDragStart={(e) => {
                                                setDraggedLessonIndex(lIdx);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (draggedLessonIndex === null || draggedLessonIndex === lIdx) return;
                                                handleLessonDragOver(draggedLessonIndex, lIdx);
                                                setDraggedLessonIndex(lIdx);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedLessonIndex(null);
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#E11D48]/30 transition-all group ${draggedLessonIndex === lIdx ? 'opacity-40 scale-95 border-[#E11D48]' : ''}`}
                                        >
                                            <GripVertical
                                                className="w-3.5 h-3.5 text-[#9CA3AF] cursor-grab"
                                                onMouseEnter={() => setLessonDragEnabled(true)}
                                                onMouseLeave={() => setLessonDragEnabled(false)}
                                            />
                                            <span className="text-[11px] text-[#9CA3AF] w-6" style={{ fontWeight: 600 }}>{(lIdx + 1).toString().padStart(2, '0')}</span>
                                            <LessonTypeBadge type={l.type} />
                                            <span className="text-sm text-[#111827] flex-1" style={{ fontWeight: 500 }}>{l.title}</span>
                                            <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                                                <Clock className="w-3 h-3" />
                                                {l.duration}
                                            </span>
                                            <button
                                                title={l.locked ? 'Locked - preview disabled' : 'Free preview'}
                                                onClick={() => toggleLessonLock(l.id)}
                                                className={`p-1 rounded ${l.locked ? 'text-[#9CA3AF] hover:bg-[#F8FAFC]' : 'text-[#10B981] hover:bg-[#ECFDF5]'}`}
                                            >
                                                {l.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                            </button>
                                            <IconBtn
                                                title="Edit"
                                                onClick={() => {
                                                    openLessonEditor(l.id);
                                                }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </IconBtn>
                                            <IconBtn title="Delete" danger onClick={() => deleteLesson(l.id)}><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormCard>

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
                </div>
            </div>

            {/* Modals */}
            {showSubmit && (
                <SubmitModal
                    onClose={() => setShowSubmit(false)}
                    onConfirm={() => {
                        setShowSubmit(false);
                        handleSubmit('pending');
                    }}
                    isSubmitting={isSubmitting}
                    hasLessons={lessons.length > 0}
                />
            )}
            {showUnsaved && <UnsavedModal onClose={() => setShowUnsaved(false)} />}
        </div>
    );
}

function FormCard({ step, title, description, children, action }: {
    step: number; title: string; description: string; children: React.ReactNode; action?: React.ReactNode;
}) {
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
    if (type === 'Video & Reading') {
        return (
            <div className="flex gap-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#FEF2F2] text-[#E11D48]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    <Video className="w-3 h-3" />
                    Video
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#EEF2FF] text-[#6366F1]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    <BookOpen className="w-3 h-3" />
                    Reading
                </span>
            </div>
        );
    }
    const map: Record<Exclude<LessonType, 'Video & Reading'>, { Icon: React.ComponentType<{ className?: string }>; tint: string; color: string }> = {
        Video: { Icon: Video, tint: '#FEF2F2', color: '#E11D48' },
        Reading: { Icon: BookOpen, tint: '#EEF2FF', color: '#6366F1' },
        Quiz: { Icon: ClipboardList, tint: '#FFFBEB', color: '#B45309' },
        Assignment: { Icon: FileText, tint: '#ECFDF5', color: '#047857' },
    };
    const m = map[type as Exclude<LessonType, 'Video & Reading'>];
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

function SubmitModal({ onClose, onConfirm, isSubmitting, hasLessons }: { onClose: () => void; onConfirm: () => void; isSubmitting: boolean; hasLessons: boolean }) {
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
                            <ProgressItem label="At least one lesson added" done={hasLessons} />
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
