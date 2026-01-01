import { useState } from 'react';
import { marked } from 'marked';
import { Copy, Download, Zap, AlertCircle, Info, Quote } from 'lucide-react';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [template, setTemplate] = useState('mimeng');
  const [copied, setCopied] = useState(false);

  // 样式模板（咪蒙风）
  const templates = {
    mimeng: {
      name: '咪蒙爆款风',
      // 一级标题：红色、居中、24px
      title: 'font-size:24px;color:#e74c3c;font-weight:bold;text-align:center;margin:30px 0;line-height:1.5;',
      // 二级标题：17px、标黑、红色底边
      h2: 'font-size:17px;color:#2c3e50;font-weight:bold;margin:25px 0 15px 0;padding-bottom:8px;border-bottom:2px solid #e74c3c;',
      // 正文：16px、行距1.8
      p: 'font-size:16px;line-height:1.8;color:#333;margin:15px 0;text-align:justify;',
      // 引用框：黄色背景
      blockquote: 'background:#fff9e6;border-left:4px solid #f1c40f;padding:15px;margin:20px 0;border-radius:4px;',
      // 提示框：蓝色背景
      info: 'background:#e3f2fd;border-left:4px solid #2196f3;padding:15px;margin:20px 0;border-radius:4px;',
      // 警告框：红色背景
      warning: 'background:#ffebee;border-left:4px solid #f44336;padding:15px;margin:20px 0;border-radius:4px;'
    }
  };

  // 关键词自动标红
  const highlightKeywords = (text) => {
    const keywords = ['核心', '关键', '重要', '推荐', '警告', '注意', '必看', '绝招', '秘诀', '干货', '痛点', '爽点'];
    keywords.forEach(k => {
      const regex = new RegExp(`(${k})`, 'g');
      text = text.replace(regex, `<span style="color:#e74c3c;font-weight:bold;">$1</span>`);
    });
    return text;
  };

  // 格式化文章
  const formatArticle = () => {
    if (!markdown.trim()) {
      alert('请先输入文章内容！');
      return;
    }

    const current = templates[template];
    const renderer = new marked.Renderer();
    
    // 一级标题
    renderer.heading = (text, level) => {
      if (level === 1) {
        return `<h1 style="${current.title}">${text}</h1>`;
      }
      // 二级标题
      if (level === 2) {
        return `<h2 style="${current.h2}">${text}</h2>`;
      }
      return `<h3 style="font-size:16px;color:#333;font-weight:bold;margin:20px 0 10px 0;">${text}</h3>`;
    };

    // 正文段落
    renderer.paragraph = (text) => {
      // 检查是否是特殊块
      if (text.startsWith('> ')) {
        // 引用框
        const content = text.replace('> ', '');
        return `<blockquote style="${current.blockquote}">${highlightKeywords(content)}</blockquote>`;
      }
      if (text.startsWith('! ')) {
        // 警告框
        const content = text.replace('! ', '');
        return `<div style="${current.warning}"><span style="font-weight:bold;">⚠️ 警告：</span>${highlightKeywords(content)}</div>`;
      }
      if (text.startsWith('? ')) {
        // 提示框
        const content = text.replace('? ', '');
        return `<div style="${current.info}"><span style="font-weight:bold;">💡 提示：</span>${highlightKeywords(content)}</div>`;
      }
      return `<p style="${current.p}">${highlightKeywords(text)}</p>`;
    };

    // 列表
    renderer.list = (body) => {
      return `<ul style="font-size:16px;margin:10px 0;padding-left:20px;">${body}</ul>`;
    };

    renderer.listitem = (text) => {
      return `<li style="margin:8px 0;">${highlightKeywords(text)}</li>`;
    };

    // 加粗
    renderer.strong = (text) => {
      return `<strong style="color:#e74c3c;font-weight:bold;">${text}</strong>`;
    };

    // 行内代码
    renderer.codespan = (code) => {
      return `<code style="background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:14px;border:1px solid #ddd;">${code}</code>`;
    };

    marked.setOptions({ renderer });
    setHtml(marked.parse(markdown));
  };

  // 一键复制
  const copyToClipboard = async () => {
    if (!html) {
      alert('请先排版！');
      return;
    }

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>公众号文章</title>
  <style>
    body { margin: 0; padding: 20px; background: #f7f7f7; }
    .container { max-width: 700px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">${html}</div>
</body>
</html>`;

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fullHTML;
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
    } catch (err) {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#e74c3c', marginBottom: '30px' }}>
          🎯 公众号自动排版工具（Kimi级精美）
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 左侧输入区 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>📝 输入区域（支持Markdown）</h3>
            
            {/* 使用提示 */}
            <div style={{ background: '#e3f2fd', borderLeft: '4px solid #2196f3', padding: '12px', marginBottom: '15px', borderRadius: '4px', fontSize: '14px' }}>
              <strong>💡 使用技巧：</strong><br/>
              • 开头加 <code>#</code> 是一级标题（红色居中）<br/>
              • 开头加 <code>##</code> 是二级标题（17px带红边）<br/>
              • 开头加 <code>&gt;</code> 是引用框（黄色背景）<br/>
              • 开头加 <code>!</code> 是警告框（红色背景）<br/>
              • 开头加 <code>?</code> 是提示框（蓝色背景）<br/>
              • <code>**文字**</code> 自动变红加粗
            </div>

            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              style={{
                width: '100%',
                height: '50vh',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder={`试试输入：
# 我是红色大标题
## 我是二级标题（带红边）
**重要内容自动标红**
> 这是引用框（黄色背景）
! 这是警告框（红色背景）
? 这是提示框（蓝色背景）
- 列表项1
- 列表项2
`}
            />
            
            <div style={{ marginTop: '15px' }}>
              <button onClick={formatArticle} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                一键排版
              </button>
              
              <button onClick={copyToClipboard} style={{ padding: '10px 20px', background: copied ? '#2ecc71' : '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                <Copy size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                {copied ? '✅ 已复制！' : '复制到公众号'}
              </button>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>👀 预览效果</h3>
            <div style={{ minHeight: '50vh', border: '1px solid #eee', padding: '20px', borderRadius: '4px' }}>
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p style={{ color: '#999', textAlign: 'center', marginTop: '100px' }}>
                  排版效果将在此显示...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
