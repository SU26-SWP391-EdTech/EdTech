interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  label: string;
}

export function Toggle({ on, onToggle, label }: ToggleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {label && <span style={{ fontSize: 13.5, color: '#374151' }}>{label}</span>}
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: on ? '#16A34A' : '#D1D5DB',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 21 : 3,
            width: 16,
            height: 16,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
