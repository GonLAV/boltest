import React, { useEffect, useRef, useState } from 'react';
import './rich-editor.css';

type Props = {
  initialHtml?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

const defaultFontSize = 16;
const defaultFontFamily = 'Segoe UI';

const textColorClassByValue: Record<string, string> = {
  '#000000': 're-swatch-black',
  '#ef4444': 're-swatch-red',
  '#f59e0b': 're-swatch-amber',
  '#10b981': 're-swatch-emerald',
  '#3b82f6': 're-swatch-blue',
  '#0078d4': 're-swatch-azure',
  '#8b5cf6': 're-swatch-violet',
  '#ec4899': 're-swatch-pink',
  '#64748b': 're-swatch-slate',
  '#ffffff': 're-swatch-white',
};

const highlightClassByValue: Record<string, string> = {
  transparent: 're-hl-transparent',
  '#fef3c7': 're-hl-amber-100',
  '#dbeafe': 're-hl-blue-100',
  '#d1fae5': 're-hl-emerald-100',
  '#fce7f3': 're-hl-pink-100',
  '#e0e7ff': 're-hl-indigo-100',
  '#fef2f2': 're-hl-red-50',
  '#f3f4f6': 're-hl-gray-100',
  '#fffbeb': 're-hl-amber-50',
  '#fdf2f8': 're-hl-pink-50',
};

/**
 * Azure-inspired rich text editor with color pickers, modals, and selection persistence.
 */
export const RichEditor: React.FC<Props> = ({ initialHtml = '', onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [openPicker, setOpenPicker] = useState<'text' | 'background' | null>(null);
  const [activeModal, setActiveModal] = useState<'heading' | 'codeBlock' | 'quote' | 'table' | 'panel' | null>(null);
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [fontFamily, setFontFamily] = useState<string>(defaultFontFamily);

  const [headingText, setHeadingText] = useState('');
  const [codeBlockText, setCodeBlockText] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [panelTitle, setPanelTitle] = useState('');
  const [panelContent, setPanelContent] = useState('');

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange?.(html);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const getRange = (): Range | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    if (!editorRef.current?.contains(r.commonAncestorContainer)) return null;
    return r;
  };

  const saveSelection = () => {
    const r = getRange();
    if (r) savedRangeRef.current = r.cloneRange();
  };

  const restoreSelection = () => {
    const r = savedRangeRef.current;
    if (!r) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(r);
  };

  const runCommand = (cmd: string, value?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, value ?? undefined);
    emitChange();
    saveSelection();
    focusEditor();
  };

  const applyFontSize = (size: number) => {
    restoreSelection();
    document.execCommand('fontSize', false, '7');
    const fontElements = editorRef.current?.querySelectorAll('font[size="7"]') || [];
    fontElements.forEach((el) => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${size}px`;
      (el as HTMLElement).style.lineHeight = '1.6';
    });
    emitChange();
    saveSelection();
    focusEditor();
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    runCommand('fontName', family);
  };

  const insertElement = (node: Node) => {
    restoreSelection();
    const range = getRange();
    if (!range) return;
    range.deleteContents();
    range.insertNode(node);

    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(after);
    emitChange();
    saveSelection();
    focusEditor();
  };

  const insertHeading = () => {
    if (!headingText.trim()) return;
    const div = document.createElement('div');
    div.className = 'azure-heading';
    div.textContent = headingText.trim();
    insertElement(div);
    setHeadingText('');
    setActiveModal(null);
  };

  const insertInlineCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const selectedText = sel.toString();
    const code = document.createElement('code');
    code.className = 'azure-code-inline';
    code.textContent = selectedText;
    range.deleteContents();
    range.insertNode(code);
    sel.removeAllRanges();
    const after = document.createRange();
    after.setStartAfter(code);
    after.collapse(true);
    sel.addRange(after);
    emitChange();
    saveSelection();
    focusEditor();
  };

  const insertCodeBlock = () => {
    if (!codeBlockText.trim()) return;
    const pre = document.createElement('pre');
    pre.className = 'azure-code-block';
    pre.textContent = codeBlockText;
    insertElement(pre);
    setCodeBlockText('');
    setActiveModal(null);
  };

  const insertQuote = () => {
    if (!quoteText.trim()) return;
    const div = document.createElement('div');
    div.className = 'azure-quote';
    div.textContent = quoteText;
    insertElement(div);
    setQuoteText('');
    setActiveModal(null);
  };

  const insertTask = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'azure-task';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label = document.createElement('span');
    label.contentEditable = 'true';
    label.textContent = 'Task item';
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    insertElement(wrapper);
  };

  const insertTable = () => {
    if (tableRows < 2 || tableCols < 2) return;
    const table = document.createElement('table');
    table.className = 'azure-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let c = 0; c < tableCols; c += 1) {
      const th = document.createElement('th');
      th.textContent = `Header ${c + 1}`;
      th.contentEditable = 'true';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let r = 0; r < tableRows - 1; r += 1) {
      const row = document.createElement('tr');
      for (let c = 0; c < tableCols; c += 1) {
        const td = document.createElement('td');
        td.textContent = 'Cell';
        td.contentEditable = 'true';
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);

    insertElement(table);
    setActiveModal(null);
  };

  const insertPanel = () => {
    if (!panelTitle.trim() || !panelContent.trim()) return;
    const panel = document.createElement('div');
    panel.className = 'azure-panel';
    const pt = document.createElement('div');
    pt.className = 'azure-panel-title';
    pt.textContent = panelTitle.trim();
    const pc = document.createElement('div');
    pc.textContent = panelContent.trim();
    panel.appendChild(pt);
    panel.appendChild(pc);
    insertElement(panel);
    setPanelTitle('');
    setPanelContent('');
    setActiveModal(null);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml || '';
    }
  }, [initialHtml]);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) {
        savedRangeRef.current = null;
        return;
      }
      const r = sel.getRangeAt(0);
      if (!editorRef.current?.contains(r.commonAncestorContainer)) {
        savedRangeRef.current = null;
        return;
      }
      savedRangeRef.current = r.cloneRange();
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!editorRef.current) return;
      if (!editorRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toolbarButtonProps = {
    onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
  } as const;

  return (
    <div className="re-pro-root">
      <div className="re-pro-header">
        <div className="re-pro-title">BOLTEST toolbar</div>
        <div className="re-pro-subtitle">Azure-styled toolbar</div>
      </div>

      <div className="re-pro-toolbar" role="toolbar" aria-label="Formatting toolbar">
        <div className="re-pro-section">
          <button type="button" aria-label="Bold" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('bold')}>𝐁</button>
          <button type="button" aria-label="Italic" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('italic')}>𝑰</button>
          <button type="button" aria-label="Underline" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('underline')}><u>U</u></button>
          <button type="button" aria-label="Strikethrough" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('strikeThrough')}>S̶</button>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <select
            aria-label="Font family"
            value={fontFamily}
            onChange={(e) => applyFontFamily(e.target.value)}
            className="re-select"
          >
            {['Segoe UI', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="re-font-size">
            <button type="button" className="re-btn" {...toolbarButtonProps} onClick={() => { const next = Math.max(8, fontSize - 2); setFontSize(next); applyFontSize(next); }}>−</button>
            <input
              type="number"
              value={fontSize}
              min={8}
              max={72}
              className="re-font-input"
              aria-label="Font size"
              title="Font size"
              onChange={(e) => {
                const val = Number(e.target.value) || defaultFontSize;
                const clamped = Math.min(72, Math.max(8, val));
                setFontSize(clamped);
                applyFontSize(clamped);
              }}
            />
            <button type="button" className="re-btn" {...toolbarButtonProps} onClick={() => { const next = Math.min(72, fontSize + 2); setFontSize(next); applyFontSize(next); }}>+</button>
          </div>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <div className="re-picker-wrapper">
            <button type="button" aria-label="Text color" className="re-btn" {...toolbarButtonProps} onClick={() => setOpenPicker(openPicker === 'text' ? null : 'text')}>
              🎨
            </button>
            {openPicker === 'text' && (
              <div className="re-picker">
                <div className="re-picker-title">Text Color</div>
                <div className="re-picker-grid">
                  {['#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#0078d4', '#8b5cf6', '#ec4899', '#64748b', '#ffffff'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`re-swatch ${textColorClassByValue[c] || ''}`}
                      aria-label={`Set text color ${c}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { runCommand('foreColor', c); setOpenPicker(null); }}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="re-picker-wrapper">
            <button type="button" aria-label="Highlight color" className="re-btn" {...toolbarButtonProps} onClick={() => setOpenPicker(openPicker === 'background' ? null : 'background')}>
              ✺
            </button>
            {openPicker === 'background' && (
              <div className="re-picker">
                <div className="re-picker-title">Highlight</div>
                <div className="re-picker-grid">
                  {['transparent', '#fef3c7', '#dbeafe', '#d1fae5', '#fce7f3', '#e0e7ff', '#fef2f2', '#f3f4f6', '#fffbeb', '#fdf2f8'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`re-swatch re-hl-swatch ${highlightClassByValue[c] || ''}`}
                      aria-label={`Set highlight ${c}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { runCommand('hiliteColor', c === 'transparent' ? 'transparent' : c); setOpenPicker(null); }}
                    >
                      {c === 'transparent' ? '✕' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <button type="button" aria-label="Align left" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('justifyLeft')}>≡</button>
          <button type="button" aria-label="Align center" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('justifyCenter')}>≣</button>
          <button type="button" aria-label="Align right" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('justifyRight')}>⫷</button>
          <button type="button" aria-label="Justify" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('justifyFull')}>☰</button>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <button type="button" aria-label="Bulleted list" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('insertUnorderedList')}>•</button>
          <button type="button" aria-label="Numbered list" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('insertOrderedList')}>1.</button>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <button type="button" aria-label="Heading" className="re-btn azure" {...toolbarButtonProps} onClick={() => setActiveModal('heading')}>H</button>
          <button type="button" aria-label="Inline code" className="re-btn azure" {...toolbarButtonProps} onClick={insertInlineCode}>{'</>'}</button>
          <button type="button" aria-label="Code block" className="re-btn azure" {...toolbarButtonProps} onClick={() => setActiveModal('codeBlock')}>❐</button>
          <button type="button" aria-label="Quote" className="re-btn azure" {...toolbarButtonProps} onClick={() => setActiveModal('quote')}>❝</button>
          <button type="button" aria-label="Task" className="re-btn azure" {...toolbarButtonProps} onClick={insertTask}>☑</button>
          <button type="button" aria-label="Table" className="re-btn azure" {...toolbarButtonProps} onClick={() => setActiveModal('table')}>⌗</button>
          <button type="button" aria-label="Info panel" className="re-btn azure" {...toolbarButtonProps} onClick={() => setActiveModal('panel')}>ℹ</button>
        </div>

        <span className="re-pro-divider" />

        <div className="re-pro-section">
          <button type="button" aria-label="Undo" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('undo')}>↺</button>
          <button type="button" aria-label="Redo" className="re-btn" {...toolbarButtonProps} onClick={() => runCommand('redo')}>↻</button>
          <button type="button" aria-label="Clear formatting" className="re-btn" {...toolbarButtonProps} onClick={() => { runCommand('removeFormat'); runCommand('unlink'); }}>⌫</button>
        </div>
      </div>

      <div className="re-pro-editor" ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder ? `Rich text editor: ${placeholder}` : 'Rich text editor'}
        data-placeholder={placeholder || 'Start typing here...'}
        onInput={emitChange}
        onBlur={emitChange}
        onKeyDown={(e) => { if (e.key === 'Escape') { setOpenPicker(null); setActiveModal(null); } }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData?.getData('text/plain');
          if (text) document.execCommand('insertText', false, text);
        }}
      />

      {activeModal && (
        <div className="re-modal" onClick={() => setActiveModal(null)}>
          <div className="re-modal-card" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'heading' && (
              <>
                <div className="re-modal-title">Insert Azure Heading</div>
                <input className="re-modal-input" placeholder="Heading text" value={headingText} onChange={(e) => setHeadingText(e.target.value)} />
                <div className="re-modal-actions">
                  <button type="button" className="re-btn ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="re-btn azure" onClick={insertHeading}>Insert</button>
                </div>
              </>
            )}

            {activeModal === 'codeBlock' && (
              <>
                <div className="re-modal-title">Insert Code Block</div>
                <textarea className="re-modal-textarea" placeholder="Enter code" value={codeBlockText} onChange={(e) => setCodeBlockText(e.target.value)} />
                <div className="re-modal-actions">
                  <button type="button" className="re-btn ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="re-btn azure" onClick={insertCodeBlock}>Insert</button>
                </div>
              </>
            )}

            {activeModal === 'quote' && (
              <>
                <div className="re-modal-title">Insert Quote</div>
                <textarea className="re-modal-textarea" placeholder="Quote text" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} />
                <div className="re-modal-actions">
                  <button type="button" className="re-btn ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="re-btn azure" onClick={insertQuote}>Insert</button>
                </div>
              </>
            )}

            {activeModal === 'table' && (
              <>
                <div className="re-modal-title">Insert Table</div>
                <div className="re-modal-grid">
                  <label className="re-modal-label">Rows</label>
                  <input aria-label="Rows" type="number" min={2} max={20} className="re-modal-input" value={tableRows} onChange={(e) => setTableRows(Number(e.target.value) || 3)} />
                  <label className="re-modal-label">Columns</label>
                  <input aria-label="Columns" type="number" min={2} max={10} className="re-modal-input" value={tableCols} onChange={(e) => setTableCols(Number(e.target.value) || 3)} />
                </div>
                <div className="re-modal-actions">
                  <button type="button" className="re-btn ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="re-btn azure" onClick={insertTable}>Insert</button>
                </div>
              </>
            )}

            {activeModal === 'panel' && (
              <>
                <div className="re-modal-title">Insert Info Panel</div>
                <input className="re-modal-input" placeholder="Panel title" value={panelTitle} onChange={(e) => setPanelTitle(e.target.value)} />
                <textarea className="re-modal-textarea" placeholder="Panel content" value={panelContent} onChange={(e) => setPanelContent(e.target.value)} />
                <div className="re-modal-actions">
                  <button type="button" className="re-btn ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="button" className="re-btn azure" onClick={insertPanel}>Insert</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichEditor;
