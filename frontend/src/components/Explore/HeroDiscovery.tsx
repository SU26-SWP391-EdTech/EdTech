import { Sparkles, Search } from 'lucide-react';

interface HeroDiscoveryProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export default function HeroDiscovery({
    searchTerm,
    onSearchChange
}: HeroDiscoveryProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#FFF1F2] to-white p-7 mb-8">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#E11D48]/5 blur-3xl pointer-events-none" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#E11D48]" />
                    <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Discover Your Next Skill</span>
                </div>
                <h2 className="text-[26px] text-[#111827] mb-4" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                    What do you want to learn today?
                </h2>

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                        placeholder="Try “Spring Boot”, “Frontend Roadmap”, or “SQL”"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-32 py-4 bg-white border border-[#E5E7EB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] shadow-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                        Search
                    </button>
                </div>
            </div>
        </section>
    );
}
