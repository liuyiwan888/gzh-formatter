import { useState } from 'react';
import { marked } from 'marked';
import { Copy, Download, Zap } from 'lucide-react';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [template, setTemplate] = useState('mimeng');
  const [copied, setCopied] = useState(false);

  const templates = {
    mimeng: {
      name: '咪蒙风',
      title: 'font-size:24px;color:#e74c3c;font-weight:bold;text-align:center;margin:30px 0;',
      h2: 'font-size:17px;color:#2c3e50;font-weight:bold;margin:25px 0 15px 0;padding-bottom:10px;border-bottom:2px solid #e74c3c;',
      p: 'font-size:16px;line-height:1.8;color:#333;margin:15px 0;text-align:justify;'
    }
  };

  const formatArticle = () => {
    if (!markdown.trim()) return alert('请先输入文章内容！');
    const current = templates[template];
    const renderer = new marked.Renderer();
    
    renderer.heading = (text, level) => {
      if (level === 1) return `<h1 style="${current.title}">${text}</h1>`;
      if (level === 2) return `<h2 style="${current.h2}">${text}</h2>`;
      return `<h3 style="font-size:16px;color:#333;font-weight:bold;margin:20px 0 10px 0;">${text}</h3>`;
    };

    renderer.paragraph = (text) => {
      return `<p style="${current.p}">${text}</p>`;
    };

    marked.setOptions({ renderer });
    setHtml(marked.parse(markdown));
  };

  const copyToClipboard = async () => {
    if (!html) return alert('请先排版！');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(tempDiv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#e74c3c', marginBottom: '30px' }}>🎯 公众号自动排版工具</h1>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <h3>📝 输入区域</h3>
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              style={{ width: '100%', height: '60vh', padding: '10px' }}
              placeholder="# 一级标题\n## 二级标题\n**加粗文字**"
            />
            <button onClick={formatArticle} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
              <Zap size={16} /> 一键排版
            </button>
            <button onClick={copyToClipboard} style={{ padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
              <Copy size={16} /> {copied ? '已复制！' : '复制到公众号'}
            </button>
            <button onClick={() => { const blob = new Blob([`<div style="max-width:700px;margin:0 auto;background:#fff;padding:30px;border-radius:8px">${html}</div>`], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `文章_${Date.now()}.html`; a.click(); }} style={{ padding: '10px 20px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px' }}>
              <Download size={16} /> 导出HTML
            </button>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <h3>👀 预览效果</h3>
            <div style={{ minHeight: '60vh', border: '1px solid #eee', padding: '20px' }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
