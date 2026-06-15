import { Copy, Check, AlertCircle } from 'lucide-react';
import type { Lesson } from '../../../types/lesson/lesson.types';

interface LessonTabsProps {
  activeTab: 'content' | 'notes' | 'discussion';
  onTabChange: (tab: 'content' | 'notes' | 'discussion') => void;
  activeLesson: Lesson | undefined;
  mockCodeInfo: { filename: string; code: string };
  copiedCode: boolean;
  onCopyCode: () => void;
  questionsCount: number;
  notesPanel: React.ReactNode;
  discussionPanel: React.ReactNode;
}

export function LessonTabs({
  activeTab,
  onTabChange,
  activeLesson,
  mockCodeInfo,
  copiedCode,
  onCopyCode,
  questionsCount,
  notesPanel,
  discussionPanel
}: LessonTabsProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="flex border-b border-[#F3F4F6]">
        {(['content', 'notes', 'discussion'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-3.5 text-sm transition-colors capitalize relative ${
              activeTab === tab
                ? 'text-[#E11D48]'
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
            style={{ fontWeight: activeTab === tab ? 600 : 400 }}
          >
            {tab === 'content' ? 'Lesson Content' : tab === 'notes' ? 'My Notes' : 'Discussion'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E11D48]" />
            )}
            {tab === 'discussion' && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-xs rounded-full">
                {questionsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* LESSON CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-[#111827] mb-2" style={{ fontSize: 15, fontWeight: 600 }}>Lesson Overview</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                In this lesson, you will learn the core logic of {activeLesson?.title}. We will cover best-practice code layout patterns, response configuration helpers, and proper setup methods.
              </p>
            </div>

            {/* Code snippet */}
            <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
              <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FCA5A5]" />
                    <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
                    <div className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
                  </div>
                  <span className="text-[#9CA3AF] text-xs font-mono ml-2">{mockCodeInfo.filename}</span>
                </div>
                <button
                  onClick={onCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-5 bg-white font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
                {mockCodeInfo.code}
              </div>
            </div>

            {/* Important note callout */}
            <div className="flex gap-3 p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#92400E]" style={{ fontWeight: 600 }}>Important Note</p>
                <p className="text-sm text-[#92400E] mt-0.5">
                  Make sure to test this code output inside your local workspace. Refer to the resources folder above to download database scripts, configuration parameters, and tooling settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && notesPanel}

        {/* DISCUSSION TAB */}
        {activeTab === 'discussion' && discussionPanel}
      </div>
    </div>
  );
}
