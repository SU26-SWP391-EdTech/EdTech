import { useState, useRef } from 'react';
import { X, Image, AlertCircle, BookOpen, ChevronDown } from 'lucide-react';
import { createCourse, updateCourse } from '../../services/course.service';
import type { Course, CourseStatus, Category } from './types';
import toast from 'react-hot-toast';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Marketing', 'Business', 'DevOps'];
const STATUSES = ['Published', 'Draft', 'Pending Review', 'Rejected'];

interface CourseModalProps {
  course?: Course;
  onClose: () => void;
  onSuccess: () => void;
  isViewOnly?: boolean;
  mockCoursesList?: Course[];
}

export function CourseModal({ course, onClose, onSuccess, isViewOnly = false, mockCoursesList }: CourseModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState<Category>(course?.category || 'Web Development');
  const [status, setStatus] = useState<CourseStatus>(course?.status || 'Draft');
  const [duration, setDuration] = useState(course?.duration || '');
  const [language, setLanguage] = useState(course?.language || 'English');
  const [projectUrl, setProjectUrl] = useState(course?.projectUrl || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course?.thumbnailUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File is too large. Max size is 2MB.');
      return;
    }
    setErrorMsg('');
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const parseDurationToMinutes = (durationStr: string): number => {
    if (!durationStr) return 0;
    const num = parseInt(durationStr, 10);
    if (isNaN(num)) return 0;

    if (durationStr.toLowerCase().includes('h')) {
      const hoursPart = durationStr.toLowerCase().split('h')[0];
      const hours = parseInt(hoursPart, 10) || 0;

      let minutes = 0;
      if (durationStr.toLowerCase().includes('m')) {
        const minutesPart = durationStr.toLowerCase().split('h')[1].split('m')[0];
        minutes = parseInt(minutesPart, 10) || 0;
      }
      return (hours * 60) + minutes;
    }

    return num;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Course Title is required.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      let statusVal = 'draft';
      if (status === 'Published') statusVal = 'approved';
      else if (status === 'Pending Review') statusVal = 'pending';
      else if (status === 'Rejected') statusVal = 'rejected';

      formData.append('status', statusVal);
      formData.append('language', language);
      formData.append('duration', String(parseDurationToMinutes(duration)));
      formData.append('projectUrl', projectUrl);
      if (thumbnailFile) {
        formData.append('thumbnailUrl', thumbnailFile);
      }

      if (course) {
        const targetList = mockCoursesList;
        const mockIndex = targetList ? targetList.findIndex(c => c.id === course.id) : -1;
        if (mockIndex !== -1 && targetList) {
          targetList[mockIndex] = {
            ...targetList[mockIndex],
            title,
            description,
            category: category as Category,
            status: status as CourseStatus,
            duration: duration,
            language: language,
            projectUrl: projectUrl,
            thumbnailUrl: thumbnailFile ? URL.createObjectURL(thumbnailFile) : course.thumbnailUrl,
            updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          toast.success('Course updated successfully');
        } else {
          await updateCourse(course.id, formData);
        }
      } else {
        await createCourse(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] mx-4 max-h-[90vh] overflow-y-auto z-10">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
              {isViewOnly ? 'Course Details' : course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {isViewOnly ? 'View course details.' : course ? 'Modify details for this course.' : 'Fill in the details to publish your course on the platform.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Course Title <span className="text-[#E11D48]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. React & TypeScript Mastery"
              disabled={isViewOnly}
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors disabled:bg-gray-50 disabled:text-[#6B7280]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what learners will gain from this course..."
              disabled={isViewOnly}
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 resize-none transition-colors disabled:bg-gray-50 disabled:text-[#6B7280]"
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Category <span className="text-[#E11D48]">*</span></label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  disabled={isViewOnly}
                  className="appearance-none w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 cursor-pointer disabled:bg-gray-50 disabled:text-[#6B7280] disabled:cursor-not-allowed"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Status <span className="text-[#E11D48]">*</span></label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as CourseStatus)}
                  disabled={isViewOnly}
                  className="appearance-none w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 cursor-pointer disabled:bg-gray-50 disabled:text-[#6B7280] disabled:cursor-not-allowed"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Thumbnail upload */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Course Cover Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {thumbnailPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] aspect-[21/9] bg-[#F8FAFC]">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-[#111827]/70 text-white rounded-lg hover:bg-[#111827]/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onDragOver={e => { !isViewOnly && e.preventDefault(); !isViewOnly && setDragOver(true); }}
                onDragLeave={() => !isViewOnly && setDragOver(false)}
                onDrop={e => { !isViewOnly && e.preventDefault(); !isViewOnly && setDragOver(false); !isViewOnly && e.dataTransfer.files?.[0] && handleFileChange(e.dataTransfer.files[0]); }}
                onClick={() => !isViewOnly && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl aspect-[21/9] flex flex-col items-center justify-center gap-2 transition-colors ${isViewOnly ? 'border-[#E5E7EB] bg-[#F8FAFC] cursor-not-allowed' : dragOver ? 'border-[#E11D48] bg-[#FFF8F9] cursor-pointer' : 'border-[#E5E7EB] bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer'}`}
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#E5E7EB]">
                  <Image className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{isViewOnly ? 'No cover image' : 'Click to upload cover'}</p>
                  {!isViewOnly && <p className="text-[10px] text-[#6B7280] mt-0.5">Drag and drop or browse files (Max 2MB)</p>}
                </div>
              </div>
            )}
          </div>

          {/* Duration + Language row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Duration</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 14h 20m or 120 (mins)"
                disabled={isViewOnly}
                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors disabled:bg-gray-50 disabled:text-[#6B7280]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Language</label>
              <input
                type="text"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                placeholder="e.g. English, Vietnamese"
                disabled={isViewOnly}
                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors disabled:bg-gray-50 disabled:text-[#6B7280]"
              />
            </div>
          </div>

          {/* Project URL */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Project URL</label>
            <input
              type="text"
              value={projectUrl}
              onChange={e => setProjectUrl(e.target.value)}
              placeholder="e.g. https://github.com/your-repo"
              disabled={isViewOnly}
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors disabled:bg-gray-50 disabled:text-[#6B7280]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA] sticky bottom-0">
          <p className="text-xs text-[#9CA3AF]">
            {isViewOnly ? (
              <span className="text-[#3B82F6]" style={{ fontWeight: 500 }}>View Mode</span>
            ) : (
              <>Fields marked <span className="text-[#E11D48]">*</span> are required</>
            )}
          </p>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors" style={{ fontWeight: 500 }} disabled={isSubmitting}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors disabled:opacity-50"
                style={{ fontWeight: 500 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Loading...</>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" /> {course ? 'Save Changes' : 'Create Course'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
