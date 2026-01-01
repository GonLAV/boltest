import React from 'react';

type EditorToolbarProps = {
  // Command functions
  runCommand: (command: string, value?: string) => void;
  applyInlineCode: () => void;
  clearFormatting: () => void;
  applyFontSize: (size: string) => void;
  changeFontSize: (delta: number) => void;
  applyParagraphStyle: (style: string) => void;
  insertSpecialCharacter: () => void;
  insertTaskCheckbox: (completed: boolean) => void;
  insertMathFormula: () => void;
  addCommentToSelection: () => void;
  toggleTrackChanges: () => void;
  findAndReplace: () => void;
  pasteAsPlainText: () => void;
  toggleSpellCheck: () => void;
  insertElement: (node: Node) => void;
  saveSelection: () => void;
  
  // Modal control
  setActiveModal: (modal: 'heading' | 'codeBlock' | 'quote' | 'table' | 'panel' | 'image' | 'mention' | 'shortcuts' | null) => void;
  
  // Picker control
  openPicker: 'text' | 'background' | 'emoji' | null;
  setOpenPicker: (picker: 'text' | 'background' | 'emoji' | null) => void;
  setPickerPos: (pos: { top: number; left: number; placement: 'above' | 'below' } | null) => void;
  computePickerPos: (rect: DOMRect) => { top: number; left: number; placement: 'above' | 'below' };
  
  // Refs for pickers
  textColorBtnRef: React.RefObject<HTMLButtonElement>;
  highlightColorBtnRef: React.RefObject<HTMLButtonElement>;
  emojiBtnRef: React.RefObject<HTMLButtonElement>;
  
  // State
  trackChangesEnabled: boolean;
  spellCheckEnabled: boolean;
  
  // Editor ref for word count
  editorRef: React.RefObject<HTMLDivElement>;
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  runCommand,
  applyInlineCode,
  clearFormatting,
  applyFontSize,
  changeFontSize,
  applyParagraphStyle,
  insertSpecialCharacter,
  insertTaskCheckbox,
  insertMathFormula,
  addCommentToSelection,
  toggleTrackChanges,
  findAndReplace,
  pasteAsPlainText,
  toggleSpellCheck,
  insertElement,
  saveSelection,
  setActiveModal,
  openPicker,
  setOpenPicker,
  setPickerPos,
  computePickerPos,
  textColorBtnRef,
  highlightColorBtnRef,
  emojiBtnRef,
  trackChangesEnabled,
  spellCheckEnabled,
  editorRef
}) => {
  const toolbarButtonProps = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
    },
  };

  return (
    <div className="toolbar">
      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('undo')} title="Undo (Ctrl+Z)" aria-label="Undo last action"><span>⎌</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('redo')} title="Redo (Ctrl+Y)" aria-label="Redo last action"><span>⎌</span></button>
      </div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('bold')} title="Bold (Ctrl+B)" aria-label="Bold text"><span className="re-icon-bold">B</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('italic')} title="Italic (Ctrl+I)" aria-label="Italic text"><span className="re-icon-italic">I</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('underline')} title="Underline (Ctrl+U)" aria-label="Underline text"><span className="re-icon-underline">U</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('strikeThrough')} title="Strikethrough" aria-label="Strikethrough text"><span className="re-icon-strike">S</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={applyInlineCode} title="Inline Code" aria-label="Apply inline code formatting"><span className="re-icon-mono">`Code`</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={clearFormatting} title="Clear Formatting" aria-label="Clear all formatting"><span>✖</span></button>
      </div>

      {/* Font Controls */}
      <div className="toolbar-group">
        <select className="toolbar-select" onChange={(e) => runCommand('fontName', e.target.value)} title="Font Family">
          <option>Segoe UI</option>
          <option>Arial</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
          <option>Georgia</option>
          <option>Verdana</option>
        </select>
        <select className="toolbar-select" defaultValue="16" onChange={(e) => applyFontSize(e.target.value)} title="Font Size">
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
        </select>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => changeFontSize(-2)} title="Decrease Font Size"><span className="re-icon-18">−</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => changeFontSize(+2)} title="Increase Font Size"><span className="re-icon-18">+</span></button>
      </div>

      {/* Text Styles */}
      <div className="toolbar-group">
        <select className="toolbar-select" onChange={(e) => applyParagraphStyle(e.target.value)} title="Paragraph Style" defaultValue="normal">
          <option value="normal">Normal</option>
          <option value="title">Title</option>
          <option value="subtitle">Subtitle</option>
          <option value="quote">Quote</option>
          <option value="code">Code</option>
        </select>
      </div>

      {/* Colors */}
      <div className="toolbar-group">
        <button
          {...toolbarButtonProps}
          ref={textColorBtnRef}
          className="toolbar-btn"
          onClick={() => {
            saveSelection();
            const next = openPicker === 'text' ? null : 'text';
            setOpenPicker(next);
            if (!next) {
              setPickerPos(null);
              return;
            }
            const rect = textColorBtnRef.current?.getBoundingClientRect();
            if (rect) setPickerPos(computePickerPos(rect));
          }}
          title="Text Color"
        >
          <span className="re-icon-16 re-icon-bold re-icon-text-color">A</span>
        </button>

        <button
          {...toolbarButtonProps}
          ref={highlightColorBtnRef}
          className="toolbar-btn"
          onClick={() => {
            saveSelection();
            const next = openPicker === 'background' ? null : 'background';
            setOpenPicker(next);
            if (!next) {
              setPickerPos(null);
              return;
            }
            const rect = highlightColorBtnRef.current?.getBoundingClientRect();
            if (rect) setPickerPos(computePickerPos(rect));
          }}
          title="Highlight Color"
        >
          <span className="re-icon-16 re-icon-bold re-icon-bg-color">A</span>
        </button>
      </div>

      {/* Script & Special */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('superscript')} title="Superscript"><span>x²</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('subscript')} title="Subscript"><span>x₂</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={insertSpecialCharacter} title="Special Characters"><span className="re-icon-18">Ω</span></button>
      </div>

      {/* Alignment */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('justifyLeft')} title="Align Left"><span className="re-icon-18">☰</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('justifyCenter')} title="Align Center"><span className="re-icon-18">☷</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('justifyRight')} title="Align Right"><span className="re-icon-18">☰</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('justifyFull')} title="Justify"><span className="re-icon-18">▭</span></button>
      </div>

      {/* Indentation */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('indent')} title="Indent"><span className="re-icon-18">⇥</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('outdent')} title="Outdent"><span className="re-icon-18">⇤</span></button>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('insertUnorderedList')} title="Bulleted List"><span className="re-icon-20">●</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('insertOrderedList')} title="Numbered List"><span className="re-icon-bold">1.</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => insertTaskCheckbox(false)} title="Task Unchecked"><span>☐</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => insertTaskCheckbox(true)} title="Task Checked"><span>☑️</span></button>
      </div>

      {/* Insert Content */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('insertHorizontalRule')} title="Horizontal Divider"><span className="re-icon-18">―</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('table')} title="Insert Table"><span>⊞</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('image')} title="Insert Image"><span>🖼</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('createLink', 'https://')} title="Insert Link"><span>🔗</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => runCommand('unlink')} title="Remove Link"><span>🔓</span></button>
      </div>

      {/* Media & Embed */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => {
          const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
          if (url) {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = '560';
            iframe.height = '315';
            iframe.style.borderRadius = '8px';
            insertElement(iframe);
          }
        }} title="Embed Video"><span>▶</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(file);
              a.download = file.name;
              a.textContent = '📎 ' + file.name;
              insertElement(a);
            }
          };
          fileInput.click();
        }} title="Attach File"><span>📎</span></button>
        <button
          {...toolbarButtonProps}
          ref={emojiBtnRef}
          className="toolbar-btn"
          onClick={() => {
            saveSelection();
            const next = openPicker === 'emoji' ? null : 'emoji';
            setOpenPicker(next);
            if (!next) {
              setPickerPos(null);
              return;
            }
            const rect = emojiBtnRef.current?.getBoundingClientRect();
            if (rect) setPickerPos(computePickerPos(rect));
          }}
          title="Insert Emoji"
        >
          <span>☺</span>
        </button>
      </div>

      {/* Advanced */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={insertMathFormula} title="Math Formula"><span className="re-icon-18">Σ</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('codeBlock')} title="Code Block"><span className="re-icon-mono re-icon-bold">&lt;/&gt;</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('heading')} title="Heading Styles"><span className="re-icon-16 re-icon-bold">H</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('panel')} title="Info Block"><span className="re-icon-bold">ⓘ</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('quote')} title="Quote Block"><span className="re-icon-20">&quot;</span></button>
      </div>

      {/* Collaboration */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={addCommentToSelection} title="Add Comment"><span>💬</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('mention')} title="Mention User"><span className="re-icon-bold">@</span></button>
        <button
          {...toolbarButtonProps}
          className={`toolbar-btn ${trackChangesEnabled ? 'active' : ''}`}
          onClick={toggleTrackChanges}
          title={trackChangesEnabled ? 'Track Changes (On)' : 'Track Changes (Off)'}
        >
          <span>✎</span>
        </button>
      </div>

      {/* Tools */}
      <div className="toolbar-group">
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={findAndReplace} title="Find &amp; Replace"><span>🔍</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={pasteAsPlainText} title="Paste as Plain Text"><span className="re-icon-mono">📋</span></button>
        <button
          {...toolbarButtonProps}
          className={`toolbar-btn ${spellCheckEnabled ? 'active' : ''}`}
          onClick={toggleSpellCheck}
          title={spellCheckEnabled ? 'Spell Check (On)' : 'Spell Check (Off)'}
        >
          <span className="re-icon-18">✓</span>
        </button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => {
          const text = editorRef.current?.textContent || '';
          const wordCount = text.trim().split(/\s+/).length;
          const charCount = text.length;
          alert(`Word Count: ${wordCount}\nCharacter Count: ${charCount}`);
        }} title="Word Count"><span className="re-icon-mono re-icon-bold">123</span></button>
        <button {...toolbarButtonProps} className="toolbar-btn" onClick={() => setActiveModal('shortcuts')} title="Keyboard Shortcuts"><span className="re-icon-bold">⌨</span></button>
      </div>
    </div>
  );
};
