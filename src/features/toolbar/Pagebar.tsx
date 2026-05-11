import { useSelector, useDispatch } from 'react-redux';
import { addPage, renamePage, setActivePage } from '../../app/store/pageSlice';
import { useState } from 'react';
import { selectPages, selectActivePage } from '../../app/store/selectors';

export function Pagebar() {
  const dispatch = useDispatch();
  const pages = useSelector(selectPages);
  const activePage = useSelector(selectActivePage);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <div className="toolbar">
      <button onClick={() => dispatch(addPage())}>
        Add Page
      </button>

      {pages.map((page, index) => (
        <div key={index} style={{ display: 'inline-block' }}>
          {editingIndex === index ? (
            <input
              type="text"
              value={page.name}
              autoFocus
              onChange={(e) =>
                dispatch(renamePage({ index, name: e.target.value }))
              }
              onBlur={() => setEditingIndex(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingIndex(null);
                if (e.key === "Escape") setEditingIndex(null);
              }}
              style={{
                fontWeight: index === activePage ? "bold" : "normal",
                background: index === activePage ? "#2196F3" : "#fff",
                color: index === activePage ? "#fff" : "#000",
                border: index === activePage ? "2px solid #1976D2" : "1px solid #ccc",
                borderRadius: "6px",
                padding: "6px 10px",
                outline: "none",
                minWidth: "120px",
                boxSizing: "border-box",
              }}
            />

          ) : (
            <button
              onClick={() => dispatch(setActivePage(index))}
              onDoubleClick={() => setEditingIndex(index)}
              style={{
                fontWeight: index === activePage ? "bold" : "normal",
                background: index === activePage ? "#2196F3" : "#fff",
                color: index === activePage ? "#fff" : "#000",
              }}
            >
              {page.name}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}