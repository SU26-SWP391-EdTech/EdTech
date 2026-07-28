interface DashboardHeaderProps {
  fullName?: string;
}

export default function DashboardHeader({
  fullName = 'Learner',
}: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-[34px] text-[#111827] mb-5" style={{ fontWeight: 700, lineHeight: 1.15 }}>
          Welcome back, {fullName} 👋
        </h1>
      </div>
    </div>
  );
}
