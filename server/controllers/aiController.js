const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.checkEssay = async (req, res) => {
  try {
    const { topic, essay } = req.body;
    console.log("Đang chấm bài chủ đề:", topic);

    if (!topic || !essay) {
      return res.status(400).json({ error: "Thiếu đề bài hoặc nội dung" });
    }

    // prompt đưa cho API
    const systemPrompt = `
      You are a strict IELTS Examiner. The user is a Vietnamese student.
      
      TASK:
      1. Grade the essay based on IELTS criteria.
      2. Rewrite the essay to Band 8.0+ quality (Academic English).
      3. Analyze differences and explain mistakes.

      CRITICAL LANGUAGE RULES:
      - 'correctedEssay' MUST be in ENGLISH.
      - 'feedback', 'explanation', and 'advice' MUST be in VIETNAMESE (Tiếng Việt).

      RETURN JSON ONLY:
      {
        "bandScore": (number 0-9),
        "criteria": {
          "TR": { "score": (number), "explanation": "Giải thích ngắn tiêu chí TR trong bài này", "advice": "Lời khuyên cải thiện TR (Tiếng Việt)" },
          "CC": { "score": (number), "explanation": "Giải thích ngắn tiêu chí CC", "advice": "Lời khuyên cải thiện CC" },
          "LR": { "score": (number), "explanation": "Giải thích ngắn tiêu chí LR", "advice": "Lời khuyên cải thiện LR" },
          "GRA": { "score": (number), "explanation": "Giải thích ngắn tiêu chí GRA", "advice": "Lời khuyên cải thiện GRA" }
        },
        "feedback": "Nhận xét chi tiết tổng quan bằng Tiếng Việt.",
        "correctedEssay": "The full rewritten version in English.",
        "explanationMapping": [
           { 
             "original": "phrase in original essay", 
             "correction": "phrase in corrected essay", 
             "explanation": "Giải thích chi tiết tại sao sai và tại sao từ mới hay hơn bằng Tiếng Việt." 
           }
        ]
      }
    `;

    const userPrompt = `
      Topic: ${topic}
      Essay: ${essay}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiContent = completion.choices[0].message.content;
    const result = JSON.parse(aiContent);

    console.log("Đã chấm xong! Band:", result.bandScore);
    res.json(result);

  } catch (error) {
    console.error("Lỗi OpenAI:", error.message);
    if (error.status === 429) return res.status(429).json({ error: "Hết tiền API" });
    res.status(500).json({ error: "Lỗi hệ thống." });
  }
};