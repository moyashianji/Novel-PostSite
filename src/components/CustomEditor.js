import React, { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import 'quill-table-ui/dist/index.css'; // quill-table-ui のスタイルをインポート
import TableUI from 'quill-table-ui';

Quill.register('modules/tableUI', TableUI);

const CustomEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null); // ツールバー用の参照
  const quillInstance = useRef(null); // Quill インスタンスを保持

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quillInstance.current) {
      // Quill エディタの初期化
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          table: true,
          tableUI: true, // Table UI を有効化
          toolbar: toolbarRef.current, // 手動でツールバーを指定
        },
      });

      // イベントリスナーを設定して、変更を親コンポーネントに通知
      quillInstance.current.on('text-change', () => {
        if (onChange) {
          onChange(quillInstance.current.root.innerHTML);
        }
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div>
      {/* ツールバーの DOM を手動で指定 */}
      <div id="custom-toolbar" ref={toolbarRef} style={{ marginBottom: '16px' }}>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <select className="ql-header">
            <option value="1" />
            <option value="2" />
            <option defaultValue />
          </select>
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
        </span>
        <span className="ql-formats">
          <select className="ql-align" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <select className="ql-size">
            <option value="small" />
            <option defaultValue />
            <option value="large" />
            <option value="huge" />
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-clean" />
        </span>
        <span className="ql-formats">
          <button className="ql-table" />
        </span>
      </div>

      {/* エディタ */}
      <div
        ref={editorRef}
        style={{
          height: '500px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '16px',
        }}
      />
    </div>
  );
};

export default CustomEditor;
