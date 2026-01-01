import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Copy, Download, Zap, Key } from 'lucide-react';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🚨 在这里填入您的Kimi API Key（注意保密！）
  // 格式：const API_KEY = 'sk-xxxxxxxxxxxx';
  const API_KEY = 'sk-cAHqaYgRW4v8HTU3MXKunluB7c0hUlRifAKHp0OO9ABsLVlt';

  // 关键词自动标红
  const highlightKeywords = (text) => {
    const keywords = ['核心', '关键', '重要', '推荐', '警告', '注意', '必看', '绝招', '秘诀', '干货'];
    keywords.forEach(k => {
      const regex = new RegExp(`(${k})`, 'g');
      text = text.replace(regex, `<span style="color:#e74c3c;font-weight:bold;">$1</span>`);
    });
    return text;
  };

  // 调用Kimi API进行AI排版
  const formatWithAI = async () => {
    if (!markdown.trim()) {
      alert('请先输入文章内容！');
      return;
    }

    if (!API_KEY || API_KEY === 'sk-粘贴您的密钥在这里') {
      alert('请先设置您的Kimi API Key！\n\n在代码第15行找到 API_KEY 变量，把密钥粘贴进去。');
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `你现在是公众号爆款文案专家，请按以下要求改写：

1. 标题：咪蒙风格，有冲突/数字/痛点
2. 结构：
   - 一级标题：24px，红色，居中，加粗
   - 二级标题：17px，#2c3e50，加粗，底部红色边框2px
   - 正文：16px，行高1.8，#333，两端对齐
3. 重点内容：**关键词** 自动标红加粗
4. 特殊段落：
   - 引用：> 开头 → 黄底+左边黄条（background:#fff9e6;border-left:4px solid #f1c40f）
   - 警告：! 开头 → 红底+左边红条（background:#ffebee;border-left:4px solid #f44336）
   - 提示：? 开头 → 蓝底+左边蓝条（background:#e3f2fd;border-left:4px solid #2196f3）
5. 输出：完整HTML代码，用marked.js语法，可直接粘贴公众号

请改写以下内容，生成精美排版：
${markdown}`;

      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API调用失败');

      const data = await response.json();
      const aiHtml = data.choices[0].message.content;

      // AI返回的HTML可能有markdown包裹，提取出来
      const match = aiHtml.match(/```html\n([\s\S]*?)\n```/);
      const cleanHtml = match ? match[1] : aiHtml;

      setHtml(cleanHtml);
    } catch (error) {
      alert(`排版失败：${error.message}\n\n请检查：\n1. API Key是否正确\n2. 余额是否充足\n3. 网络连接是否正常`);
    } finally {
      setIsLoading(false);
    }
  };

  // 本地排版（不用AI）
  const formatLocal = () => {
    if (!markdown.trim()) {
      alert('请先输入文章内容！');
      return;
    }

    const renderer = new marked.Renderer();
    
    renderer.heading = (text, level) => {
      if (level === 1) {
        return `<h1 style="font-size:24px;color:#e74c3c;font-weight:bold;text-align:center;margin:30px 0;line-height:1.5;">${text}</h1>`;
      }
      if (level === 2) {
        return `<h2 style="font-size:17px;color:#2c3e50;font-weight:bold;margin:25px 0 15px 0;padding-bottom:8px;border-bottom:2px solid #e74c3c;">${text}</h2>`;
      }
      return `<h3 style="font-size:16px;color:#333;font-weight:bold;margin:20px 0 10px 0;">${text}</h3>`;
    };

    renderer.paragraph = (text) => {
      if (text.startsWith('> ')) {
        const content = text.replace('> ', '');
        return `<blockquote style="background:#fff9e6;border-left:4px solid #f1c40f;padding:15px;margin:20px 0;border-radius:4px;">${highlightKeywords(content)}</blockquote>`;
      }
      if (text.startsWith('! ')) {
        const content = text.replace('! ', '');
        return `<div style="background:#ffebee;border-left:4px solid #f44336;padding:15px;margin:20px 0;border-radius:4px;"><strong style="color:#f44336;">⚠️ 警告：</strong>${highlightKeywords(content)}</div>`;
      }
      if (text.startsWith('? ')) {
        const content = text.replace('? ', '');
        return `<div style="background:#e3f2fd;border-left:4px solid #2196f3;padding:15px;margin:20px 0;border-radius:4px;"><strong style="color:#2196f3;">💡 提示：</strong>${highlightKeywords(content)}</div>`;
      }
      return `<p style="font-size:16px;line-height:1.8;color:#333;margin:15px 0;text-align:justify;">${highlightKeywords(text)}</p>`;
    };

    renderer.list = (body) => {
      return `<ul style="font-size:16px;margin:10px 0;padding-left:20px;">${body}</ul>`;
    };

    renderer.listitem = (text) => {
      return `<li style="margin:8px 0;">${highlightKeywords(text)}</li>`;
    };

    renderer.strong = (text) => {
      return `<strong style="color:#e74c3c;font-weight:bold;">${text}</strong>`;
    };

    renderer.codespan = (code) => {
      return `<code style="background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:14px;border:1px solid #ddd;">${code}</code>`;
    };

    marked.setOptions({ renderer });
    setHtml(marked.parse(markdown));
  };

  // 一键复制到公众号
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
          🎯 公众号自动排版工具（精美版）
        </h1>

        {/* API Key设置警告 */}
        {API_KEY === 'sk-粘贴您的密钥在这里' && (
          <div style={{ background: '#fff3cd', border: '2px solid #e74c3c', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#e74c3c' }}>⚠️ 重要设置</h3>
            <p style={{ margin: '10px 0' }}>请在代码第15行找到 <code>API_KEY</code> 变量，将您的Kimi API密钥粘贴进去。</p>
            <p style={{ margin: '10px 0' }}>如果不想用AI排版，可以直接点下面的"本地排版"按钮。</p>
          </div>
        )}

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
              <button onClick={formatWithAI} disabled={isLoading} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                {isLoading ? '🤖 AI排版中...' : <><Zap size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> AI智能排版</>}
              </button>
              
              <button onClick={formatLocal} style={{ padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                本地排版
              </button>
              
              <button onClick={copyToClipboard} style={{ padding: '10px 20px', background: copied ? '#2ecc71' : '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                <Copy size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                {copied ? '✅ 已复制！' : '复制到公众号'}
              </button>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>👀 预览效果（实时）</h3>
            <div style={{ minHeight: '50vh', border: '1px solid #eee', padding: '20px', borderRadius: '4px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <div style={{ fontSize: '16px', color: '#666' }}>🤖 AI正在为您精心排版...</div>
                  <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>大约需要5-10秒</div>
                </div>
              ) : html ? (
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
