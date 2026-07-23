import { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { getAllTags, type Tag } from '../../../services/tag/tag.service';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  disabled?: boolean;
}

export function TagSelector({
  selectedTags,
  onChange,
  maxTags = 10,
  disabled = false,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags || []);
      } catch (err) {
        console.warn('Failed to load existing tags:', err);
      }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (selectedTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      setShowDropdown(false);
      return;
    }
    if (selectedTags.length >= maxTags) return;

    onChange([...selectedTags, trimmed]);
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(selectedTags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags.length - 1);
    }
  };

  const filteredSuggestions = availableTags.filter(
    (t) =>
      t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some((st) => st.toLowerCase() === t.name.toLowerCase()),
  );

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
        Course Tags ({selectedTags.length}/{maxTags})
      </label>

      {/* Selected Tag Chips & Input Container */}
      <div
        className={`min-h-[44px] p-2 bg-[#F8FAFC] border rounded-xl flex flex-wrap gap-1.5 items-center transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-[#E2E8F0]'
            : 'border-[#E2E8F0] focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/20'
        }`}
      >
        {selectedTags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#CBD5E1] text-[#334155] text-xs font-medium rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-150"
          >
            <TagIcon className="w-3 h-3 text-[#3B82F6]" />
            #{tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="text-[#94A3B8] hover:text-[#EF4444] transition-colors p-0.5 rounded-full hover:bg-[#F1F5F9]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && selectedTags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? 'Type tag or select (e.g. React, Python)...' : 'Add tag...'}
            className="flex-1 min-w-[140px] bg-transparent text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none px-1 py-1"
          />
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && !disabled && (inputValue.trim() || filteredSuggestions.length > 0) && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 text-xs divide-y divide-[#F1F5F9]">
          {inputValue.trim() &&
            !availableTags.some((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleAddTag(inputValue)}
                className="w-full text-left px-3 py-2 text-[#3B82F6] hover:bg-[#EFF6FF] font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create tag <span className="font-bold">"{inputValue.trim()}"</span>
              </button>
            )}

          {filteredSuggestions.map((tag) => (
            <button
              key={tag.tagId}
              type="button"
              onClick={() => handleAddTag(tag.name)}
              className="w-full text-left px-3 py-2 text-[#334155] hover:bg-[#F8FAFC] flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <TagIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
                {tag.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
