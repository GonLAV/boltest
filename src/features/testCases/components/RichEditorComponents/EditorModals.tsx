import React from 'react';

type ModalType = 'heading' | 'codeBlock' | 'quote' | 'table' | 'panel' | 'image' | 'mention' | 'shortcuts';

type EditorModalsProps = {
  activeModal: ModalType | null;
  onClose: () => void;
  // Heading modal props
  headingText: string;
  setHeadingText: (text: string) => void;
  onInsertHeading: () => void;
  // Code block modal props
  codeBlockText: string;
  setCodeBlockText: (text: string) => void;
  onInsertCodeBlock: () => void;
  // Quote modal props
  quoteText: string;
  setQuoteText: (text: string) => void;
  onInsertQuote: () => void;
  // Table modal props
  tableRows: number;
  setTableRows: (rows: number) => void;
  tableCols: number;
  setTableCols: (cols: number) => void;
  onInsertTable: () => void;
  // Panel modal props
  panelTitle: string;
  setPanelTitle: (title: string) => void;
  panelContent: string;
  setPanelContent: (content: string) => void;
  onInsertPanel: () => void;
  // Image modal props
  imageUrl: string;
  setImageUrl: (url: string) => void;
  imageAlt: string;
  setImageAlt: (alt: string) => void;
  onInsertImage: () => void;
  // Mention modal props
  mentionHandle: string;
  setMentionHandle: (handle: string) => void;
  onInsertMention: () => void;
};

export const EditorModals: React.FC<EditorModalsProps> = ({
  activeModal,
  onClose,
  headingText,
  setHeadingText,
  onInsertHeading,
  codeBlockText,
  setCodeBlockText,
  onInsertCodeBlock,
  quoteText,
  setQuoteText,
  onInsertQuote,
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
  onInsertTable,
  panelTitle,
  setPanelTitle,
  panelContent,
  setPanelContent,
  onInsertPanel,
  imageUrl,
  setImageUrl,
  imageAlt,
  setImageAlt,
  onInsertImage,
  mentionHandle,
  setMentionHandle,
  onInsertMention
}) => {
  if (!activeModal) return null;

  return (
    <div className="re-modal" onClick={onClose}>
      <div className="re-modal-card" onClick={(e) => e.stopPropagation()}>
        {activeModal === 'heading' && (
          <>
            <div className="re-modal-title">Insert Heading</div>
            <input
              className="re-modal-input"
              placeholder="Heading text"
              value={headingText}
              onChange={(e) => setHeadingText(e.target.value)}
              autoFocus
            />
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertHeading}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'codeBlock' && (
          <>
            <div className="re-modal-title">Insert Code Block</div>
            <textarea
              className="re-modal-textarea code"
              placeholder="Enter your code here"
              value={codeBlockText}
              onChange={(e) => setCodeBlockText(e.target.value)}
              autoFocus
            />
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertCodeBlock}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'quote' && (
          <>
            <div className="re-modal-title">Insert Quote</div>
            <textarea
              className="re-modal-textarea"
              placeholder="Enter your quote here"
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              autoFocus
            />
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertQuote}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'table' && (
          <>
            <div className="re-modal-title">Insert Table</div>
            <div className="re-modal-grid-row">
              <div className="re-modal-grid-col">
                <label className="re-modal-label" htmlFor="table-rows">Rows:</label>
                <input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="re-modal-input-number"
                />
              </div>
              <div className="re-modal-grid-col">
                <label className="re-modal-label" htmlFor="table-cols">Columns:</label>
                <input
                  id="table-cols"
                  type="number"
                  min="1"
                  max="20"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="re-modal-input-number"
                />
              </div>
            </div>
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertTable}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'panel' && (
          <>
            <div className="re-modal-title">Insert Info Panel</div>
            <input
              className="re-modal-input"
              placeholder="Title"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              autoFocus
            />
            <textarea
              className="re-modal-textarea"
              placeholder="Content"
              value={panelContent}
              onChange={(e) => setPanelContent(e.target.value)}
            />
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertPanel}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'image' && (
          <>
            <div className="re-modal-title">Insert Image</div>
            <input
              className="re-modal-input"
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              autoFocus
            />
            <input
              className="re-modal-input"
              placeholder="Alt text (for accessibility)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
            {imageUrl && (
              <div className="re-modal-preview">
                <img
                  src={imageUrl}
                  alt={imageAlt || 'Preview'}
                  onError={() => {}}
                  className="re-modal-preview-img"
                />
              </div>
            )}
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertImage}>Insert</button>
            </div>
          </>
        )}

        {activeModal === 'mention' && (
          <>
            <div className="re-modal-title">Mention Team Member</div>
            <input
              className="re-modal-input"
              placeholder="Enter username (e.g., john.smith)"
              value={mentionHandle}
              onChange={(e) => setMentionHandle(e.target.value)}
              autoFocus
            />
            <div className="re-modal-info">
              Enter the username of the team member you want to mention
            </div>
            <div className="re-modal-actions">
              <button className="re-btn ghost" onClick={onClose}>Cancel</button>
              <button className="re-btn azure" onClick={onInsertMention}>Mention @User</button>
            </div>
          </>
        )}

        {activeModal === 'shortcuts' && (
          <>
            <div className="re-modal-title">⌨️ Keyboard Shortcuts</div>
            <div className="re-shortcuts-container">
              <div className="re-shortcuts-section">
                <div className="re-shortcuts-section-title">Text Formatting</div>
                <div className="re-shortcuts-grid">
                  <div><kbd className="re-kbd">Ctrl+B</kbd> Bold</div>
                  <div><kbd className="re-kbd">Ctrl+I</kbd> Italic</div>
                  <div><kbd className="re-kbd">Ctrl+U</kbd> Underline</div>
                </div>
              </div>
              <div className="re-shortcuts-section">
                <div className="re-shortcuts-section-title">Undo/Redo</div>
                <div className="re-shortcuts-grid">
                  <div><kbd className="re-kbd">Ctrl+Z</kbd> Undo</div>
                  <div><kbd className="re-kbd">Ctrl+Y</kbd> Redo</div>
                </div>
              </div>
              <div className="re-modal-info">
                💡 Tip: All formatting buttons have tooltips - hover to see their functions!
              </div>
            </div>
            <div className="re-modal-actions">
              <button className="re-btn azure" onClick={onClose}>Got it!</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
