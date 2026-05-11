interface PathLabelProps {
    projectName?: string;
    pageName?: string;
}

export function PathLabel({ projectName, pageName }: PathLabelProps) {
    return (
        <>
            <div className="toolbar">
                <i className="fa fa-bars toolbar-icon" />

                <span className="toolbar-project">
                    {projectName || "Untitled Project"}
                </span>

                <span className="toolbar-separator">
                    &gt; {pageName || "Page"}
                </span>

                <div className="toolbar-actions" />
            </div>

            {/* Inline styles for this component */}
            <style>
                {`
          .toolbar {
            display: flex;
            align-items: center;
            gap: 10px;
            height: 48px;
            padding: 0 16px;
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .toolbar-icon {
            font-size: 18px;
            cursor: pointer;
            color: #374151;
          }

          .toolbar-project {
            font-size: 16px;
            font-weight: 500;
            color: #111827;
          }

          .toolbar-separator {
            font-size: 14px;
            color: #6b7280;
          }

          .toolbar-actions {
            margin-left: auto;
            display: flex;
            gap: 8px;
          }
        `}
            </style>
        </>
    );
}
