export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                height: '40px',
                background: '#000000ff',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                fontSize: '12px',
                borderTop: '1px solid #334155',
                zIndex: 1000,
            }}
        >
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>Product of Hirush Automation Pvt Ltd</span>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>HirushCore - SCADA</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>v1.3.6</span>
            </div>
        </footer>
    );
}
