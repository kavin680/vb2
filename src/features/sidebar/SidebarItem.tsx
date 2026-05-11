interface SidebarItemProps {
  label: string;
  type: string;
  onClick: () => void;
}

export function SidebarItem({ label, onClick }: SidebarItemProps) {
  return (
    <div onClick={onClick} className="draggable-object" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{label}</span>
    </div>
  );
}

