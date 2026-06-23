import type { DragEvent, RefObject } from 'react';

import { Field, FormCard, Input, Select, Textarea, ThumbnailUploader } from './fields';

interface BasicInfoSectionProps {
  description: string;
  dragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  language: string;
  thumbnailPreview: string | null;
  title: string;
  onClearThumbnail: () => void;
  onDescriptionChange: (value: string) => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onFileChange: (file: File) => void;
  onLanguageChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}

export function BasicInfoSection({
  description,
  dragOver,
  fileInputRef,
  language,
  thumbnailPreview,
  title,
  onClearThumbnail,
  onDescriptionChange,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onLanguageChange,
  onTitleChange,
}: BasicInfoSectionProps) {
  return (
    <FormCard step={1} title="Basic Information" description="Tell learners what your course is about.">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Course title" required full>
          <Input value={title} onChange={event => onTitleChange(event.target.value)} placeholder="e.g. Spring Boot REST API Masterclass" />
        </Field>
        <Field label="Description" full>
          <Textarea
            rows={4}
            value={description}
            onChange={event => onDescriptionChange(event.target.value)}
            placeholder="Describe what learners will gain from this course..."
          />
        </Field>
        <Field label="Language">
          <Select value={language} onChange={event => onLanguageChange(event.target.value)}>
            <option value="English">English</option>
            <option value="Vietnamese">Vietnamese</option>
          </Select>
        </Field>
        <Field label="Course thumbnail" full>
          <ThumbnailUploader
            dragOver={dragOver}
            fileInputRef={fileInputRef}
            thumbnailPreview={thumbnailPreview}
            onClear={onClearThumbnail}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileChange={onFileChange}
          />
        </Field>
      </div>
    </FormCard>
  );
}
