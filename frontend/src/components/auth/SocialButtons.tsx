function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91C18.62 13.7 17.64 11.38 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26a5.4 5.4 0 01-3.05.85 5.33 5.33 0 01-5-3.68H.96v2.33A9 9 0 009 18z" fill="#34A853" />
      <path d="M4 10.73A5.37 5.37 0 013.72 9c0-.6.1-1.18.28-1.73V4.94H.96A9.01 9.01 0 000 9c0 1.45.35 2.82.96 4.06L4 10.73z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.94L4 7.27A5.33 5.33 0 019 3.58z" fill="#EA4335" />
    </svg>
  );
}

export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-[#F0F2F5]" />
      <span className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>{label}</span>
      <div className="flex-1 h-px bg-[#F0F2F5]" />
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all" style={{ fontWeight: 500 }}>
        <GoogleIcon />
        Google
      </button>
      <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all" style={{ fontWeight: 500 }}>
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </button>
    </div>
  );
}
