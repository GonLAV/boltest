import React from 'react';
import { RichEditor } from '../features/testCases/components/RichEditor';

export const EditorDemo: React.FC = () => {
  const [content, setContent] = React.useState<string>('');

  return (
    <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #001122 0%, #002244 25%, #003366 50%, #002244 75%, #001122 100%)' }}>
      <RichEditor
        initialHtml={content}
        onChange={setContent}
        placeholder="Start typing to test all the new features..."
        variant="full"
      />
    </div>
  );
};
