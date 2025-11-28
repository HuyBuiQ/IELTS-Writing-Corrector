import { useState } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import * as Diff from 'diff';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!topic || !essay) {
      alert("⚠️ Vui lòng nhập đủ đề bài và bài làm!");
      return;
    }
    setLoading(true);
    setResult(null);
    // http://localhost:5000/api/essay/check 
    try {
      const response = await axios.post('https://ielts-writing-corrector.onrender.com/api/essay/check', {
        topic, essay
      });
      setResult(response.data);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM TẠO DIFF VIEW ---
  const renderDiffView = () => {
    if (!result) return null;
    const diff = Diff.diffWords(essay, result.correctedEssay);

    const findExplanation = (text, type) => {
      const mapping = result.explanationMapping || result.mistakes;
      if (!mapping) return "Cải thiện văn phong tự nhiên hơn.";

      // tìm kiếm tương đối (chứa từ khóa)
      const found = mapping.find(m =>
        (type === 'removed' && m.original.includes(text.trim())) ||
        (type === 'added' && m.correction.includes(text.trim()))
      );
      // không thấy thì trả về giải thích chung chung
      return found ? found.explanation : "Cải thiện từ vựng/ngữ pháp.";
    };

    return (
      <div className="diff-container">
        {/* cột trái: bài gốc */}
        <div className="diff-column original-col">
          <h3 className="col-title">Bài gốc</h3>
          <div className="diff-content">
            {diff.map((part, index) => {
              if (part.added) return null;
              if (part.removed) {
                const tooltipId = `del-${index}`;
                return (
                  <span key={index} className="diff-word diff-del" data-tooltip-id={tooltipId}
                    data-tooltip-html={`<strong>💡 Giải thích lỗi:</strong><br/>${findExplanation(part.value, 'removed')}`}>
                    {part.value}
                    <Tooltip id={tooltipId} className="custom-tooltip" place="top" clickable />
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>

        {/* cột phải: bài sửa */}
        <div className="diff-column corrected-col">
          <h3 className="col-title">Bài sửa</h3>
          <div className="diff-content">
            {diff.map((part, index) => {
              if (part.removed) return null;
              if (part.added) {
                const tooltipId = `add-${index}`;
                return (
                  <span key={index} className="diff-word diff-add" data-tooltip-id={tooltipId}
                    data-tooltip-html={`${findExplanation(part.value, 'added')}`}>
                    {part.value}
                    <Tooltip id={tooltipId} className="custom-tooltip" place="top" clickable />
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1>IELTS Writing Corrector</h1>
        <p>So sánh & Giải thích chi tiết bài viết IELTS Part 2</p>
      </div>

      {/* input */}
      <div className="input-card">
        <div className="form-group">
          <label className="label">Chủ đề:</label>
          <input className="input-field" value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Bài làm:</label>
          <textarea className="textarea-field" rows="8" value={essay} onChange={e => setEssay(e.target.value)} />
        </div>
        <button className="btn-submit" onClick={handleCheck} disabled={loading}>
          {loading ? "Đang phân tích..." : "Chấm & So sánh"}
        </button>
      </div>

      {/* result */}
      {result && (
        <div className="result-section">

          {/* 1. Score & Criteria */}
          <div className="score-card">
            <div className="score-big">{result.bandScore}</div>
            <div style={{ color: '#64748b', marginBottom: '15px' }}>Overall Band Score</div>

            <div className="criteria-grid">
              {/* tự động duyệt qua 4 tiêu chí TR, CC, LR, GRA */}
              {result.criteria && Object.keys(result.criteria).map((key) => (
                <div key={key}>
                  <div
                    className="criteria-badge"
                    data-tooltip-id={`tooltip-${key}`}
                    style={{ cursor: 'pointer' }} // Con trỏ chuột hình bàn tay
                  >
                    {key}: <span>{result.criteria[key].score}</span>
                  </div>

                  {/* Tooltip giải thích & Lời khuyên */}
                  <Tooltip
                    id={`tooltip-${key}`}
                    className="custom-tooltip"
                    place="bottom"
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '5px' }}>
                        {key} - {result.criteria[key].explanation}
                      </div>
                      <div style={{ borderTop: '1px solid #eee', paddingTop: '5px', marginTop: '5px' }}>
                        🎯 <strong>Lời khuyên:</strong> {result.criteria[key].advice}
                      </div>
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          {/* 2. general Feedback */}
          <div className="info-card">
            <h3>Nhận xét tổng quan</h3>
            <p>{result.feedback}</p>
          </div>

          {/* 3. split */}
          {renderDiffView()}

        </div>
      )}
    </div>
  );
}

export default App;
