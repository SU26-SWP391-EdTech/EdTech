const ProgressBar = ({ value, color = '#E11D48', bg = '#F3F4F6' }: { value: number; color?: string; bg?: string }) => {
    return (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: bg }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
    );
}

export default ProgressBar;
