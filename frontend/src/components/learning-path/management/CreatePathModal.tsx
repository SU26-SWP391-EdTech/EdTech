import React, { useState, useRef, useEffect } from 'react';
import { X, Monitor, Image, BookOpen, Target, Search, Plus } from 'lucide-react';
import type { Course } from '../../../services/course/course.service';
import type { LearningPath } from '../../../utils/learning-path/learningPathHelpers';

interface CreatePathModalProps {
  onClose: () => void;
  initialPath?: LearningPath;
  onSave: (data: { title: string; description: string; courses: Course[]; thumbnailUrl?: string }) => void;
  readOnly?: boolean;
  allCourses?: Course[];
}

export function CreatePathModal({
  onClose,
  initialPath,
  onSave,
  readOnly = false,
  allCourses = []
}: CreatePathModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState(initialPath ? initialPath.title : '');
  const [description, setDescription] = useState(initialPath ? initialPath.description : '');
  const [addedCourses, setAddedCourses] = useState<Course[]>(() => {
    if (initialPath) {
      return initialPath.nodes.map(n => {
        const found = allCourses.find(c => c.courseId === n.id);
        if (found) return found;
        return {
          courseId: n.id,
          title: n.title,
          description: n.description,
          duration: parseInt(n.duration) || 8,
          status: 'approved',
          thumbnailUrl: null,
          projectUrl: null,
          language: null,
          totalLessons: 0,
          enrollmentCount: 0,
          createdAt: '',
          updatedAt: null,
          user: { userId: 0, fullName: '', email: '', avatar: null }
        } as Course;
      });
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const courseSearchRef = useRef<HTMLDivElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialPath?.thumbnailUrl || null);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Close course dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (courseSearchRef.current && !courseSearchRef.current.contains(e.target as Node)) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCourses = allCourses.filter(c =>
    c.status === 'approved' &&
    !addedCourses.some(ac => ac.courseId === c.courseId) &&
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleFileChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max size is 2MB.');
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] mx-4 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[#111827] text-base font-bold">
              {readOnly ? 'Learning Path Details' : (initialPath ? 'Edit Learning Path' : 'Create Learning Path')}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {readOnly ? 'View the configuration and course sequence of this learning path.' : 'Define a structured journey and chain courses into a learning path.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Title */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5 font-medium">Path Title <span className="text-[#E11D48]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 disabled:bg-[#F8FAFC] disabled:text-[#6B7280] disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5 font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={readOnly}
              placeholder="What will learners achieve by completing this path?"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 disabled:bg-[#F8FAFC] disabled:text-[#6B7280] disabled:cursor-not-allowed resize-none transition-colors"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5 font-medium">Thumbnail</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {readOnly ? (
              <div className="flex items-center gap-4 p-4 border border-[#E5E7EB] rounded-xl bg-[#F8FAFC]">
                <div
                  className="w-16 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden"
                  style={{ background: thumbnailPreview ? 'transparent' : (initialPath?.thumbBg || 'linear-gradient(135deg,#1E40AF,#3B82F6)') }}
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Path Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    initialPath?.thumbIcon || <Monitor className="w-6 h-6 text-white/90" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#374151] font-semibold">Path Icon & Gradient Cover</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Visually identifies this path across the platform.</p>
                </div>
              </div>
            ) : thumbnailPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB] aspect-[21/9] bg-[#F8FAFC]">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-[#111827]/70 text-white rounded-lg hover:bg-[#111827]/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); e.dataTransfer.files?.[0] && handleFileChange(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${dragOver ? 'border-[#E11D48] bg-[#FFF1F3]' : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#D1D5DB]'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragOver ? 'bg-[#FECDD3]' : 'bg-white border border-[#E5E7EB]'}`}>
                  <Image className={`w-5 h-5 ${dragOver ? 'text-[#E11D48]' : 'text-[#9CA3AF]'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#374151] font-medium">
                    <span className="text-[#E11D48]">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">PNG, JPG, WEBP — max 2MB, 1280×720</p>
                </div>
              </div>
            )}
          </div>

          {/* Add Courses */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5 font-medium">
              {readOnly ? 'Courses Included in Path' : 'Add Courses'}
            </label>

            {!readOnly && (
              /* Search input for courses */
              <div className="relative mb-2.5" ref={courseSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={e => { setCourseSearch(e.target.value); setShowCourseDropdown(true); }}
                    onFocus={() => setShowCourseDropdown(true)}
                    placeholder="Search courses to add..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                  />
                </div>

                {showCourseDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-[#9CA3AF] text-center">
                        {courseSearch ? 'No courses found matching your search.' : 'All available courses have been added.'}
                      </div>
                    ) : (
                      filteredCourses.map(course => (
                        <button
                          key={course.courseId}
                          type="button"
                          onClick={() => {
                            setAddedCourses(prev => [...prev, course]);
                            setCourseSearch('');
                            setShowCourseDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#FFF1F3] transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0 overflow-hidden">
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#111827] truncate">{course.title}</p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{course.duration ? `${course.duration}h` : 'N/A'}</p>
                          </div>
                          <Plus className="w-4 h-4 text-[#E11D48] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}


            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
              {readOnly ? (
                <div className="flex flex-col divide-y divide-[#F3F4F6]">
                  {addedCourses.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC]">
                      <span className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[11px] font-bold text-[#E11D48]">
                        {i + 1}
                      </span>
                      <BookOpen className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span className="text-xs text-[#374151] font-semibold flex-1 truncate">{c.title}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium shrink-0">{c.duration || 8} hours</span>
                    </div>
                  ))}
                  {addedCourses.length === 0 && (
                    <div className="text-xs text-[#9CA3AF] p-4 text-center">No courses in this path.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2.5 min-h-[44px] bg-white">
                  {addedCourses.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF1F3] text-[#E11D48] border border-[#FECDD3] rounded-lg text-xs font-medium">
                      <BookOpen className="w-3 h-3" />{c.title}
                      <button onClick={() => setAddedCourses(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {addedCourses.length === 0 && (
                    <span className="text-xs text-[#9CA3AF] p-1">No courses added yet. Search for courses above to add them.</span>
                  )}
                </div>
              )}
            </div>
            {!readOnly && (
              <p className="text-xs text-[#9CA3AF] mt-1">Drag to reorder after adding courses.</p>
            )}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
            <span className="text-xs text-[#6B7280]">Preview:</span>
            <span className="text-xs text-[#374151] font-semibold">{addedCourses.length} courses</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-end bg-[#FAFAFA] sticky bottom-0">
          {readOnly ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
            >
              Close
            </button>
          ) : (
            <>
              <p className="text-xs text-[#9CA3AF] mr-auto">Fields marked <span className="text-[#E11D48]">*</span> are required</p>
              <div className="flex items-center gap-2.5">
                <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors font-medium">Cancel</button>
                <button
                  onClick={() => {
                    if (!title.trim()) {
                      alert('Please fill out Path Title.');
                      return;
                    }
                    onSave({ title, description: description.trim(), courses: addedCourses, thumbnailUrl: thumbnailPreview || undefined });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
                >
                  <Target className="w-4 h-4" /> {initialPath ? 'Save Changes' : 'Create Path'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
