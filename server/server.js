const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const essayRoutes = require('./routes/essayRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use('/api/essay', essayRoutes);

// Database Connection (Xử lý lỗi nếu chưa có DB để Server không bị crash)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB'))
    .catch(err => console.log('⚠️ Lỗi kết nối MongoDB (Có thể bỏ qua nếu đang test Mock):', err.message));
} else {
  console.log('⚠️ Chưa cấu hình MONGO_URI trong file .env');
}

// Chạy Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;