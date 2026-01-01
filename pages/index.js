import { useState } from 'react';
import { Copy, Zap, Key } from 'lucide-react';

// 🚨 在这里填入您的Kimi API Key（注意保密！）
const API_KEY = 'sk-cAHqaYgRW4v8HTU3MXKunluB7c0hUlRifAKHp0OO9ABsLVlt';

export default function Home() {
  const [input, setInput] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI排版（调用Kimi）
  const aiFormat = async () => {
    if (!input.trim()) { alert('请输入文章内容！'); return; }
    if (API_KEY === 'sk-粘贴您的密钥在这里') { 
      alert('请在代码第7行填入您的Kimi API密钥！'); 
      return; 
    }

    setLoading(true);
    try {
      const prompt = `你现在是公众号爆款文案专家，请按以下要求改写：

格式要求：
1. 一级标题：24px，红色(#e74c3c)，居中，加粗
2. 二级标题：17px，#2c3e50，加粗，底部红色边框2px
3. 正文：16px，行高1.8，#333，两端对齐
4. 重要内容：<span style="color:#e74c3c;font-weight:bold;">重要文字</span>
5. 输出完整HTML，不要Markdown

标题要求：符合咪蒙风格，制造冲突、用数字、戳痛点

请改写：${input}`;

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

      const data = await response.json();
      let result = data.choices[0].message.content;
      
      // 清理可能的代码块标记
      result = result.replace(/^```html\n|\n```$/g, '');
      
      setHtml(result);
    } catch (error) {
      alert(`排版失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 复制到公众号
  const copyToClipboard = async () => {
    if (!html) { alert('请先排版！'); return; }

    try {
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
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#e74c3c', marginBottom: '30px' }}>🎯 公众号AI排版工具</h1>

      {API_KEY === 'sk-粘贴您的密钥在这里' && (
        <div style={{ background: '#fff3cd', border: '2px solid #e74c3c', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
          <p style={{ margin: 0 }}>⚠️ 请在代码第7行填入您的Kimi API密钥</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* 左侧输入 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>📝 输入文章</h3>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ width: '100%', height: '60vh', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            placeholder="粘贴您的文章（支持Markdown格式）"
          />
          <div style={{ marginTop: '15px' }}>
            <button onClick={aiFormat} disabled={loading} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
              {loading ? '排版中...' : <><Zap size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> AI一键排版</>}
            </button>
            <button onClick={copyToClipboard} style={{ padding: '10px 20px', background: copied ? '#2ecc71' : '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px' }}>
              <Copy size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              {copied ? '✅ 已复制' : '📋 复制到公众号'}
            </button>
          </div>
        </div>

        {/* 右侧预览 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>👀 预览效果</h3>
          <div style={{ minHeight: '60vh', border: '1px solid #eee', padding: '20px', borderRadius: '4px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '16px', color: '#666' }}>🤖 AI正在为您排版...</div>
                <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>约需5-10秒</div>
              </div>
            ) : html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p style={{ color: '#999', textAlign: 'center', marginTop: '100px' }}>排版效果将在此显示</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
