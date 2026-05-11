interface PropertyItemProps {
  label: string;
  // type: string;
  // onClick: () => void;
}

export function PropertyItem({ label }: PropertyItemProps) {
  return (
    <div className="property-object">
      <span className="property-label">{label}</span>
    </div>
  );
}

