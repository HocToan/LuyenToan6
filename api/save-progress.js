const fetch = require('node-fetch');
const { stringify } = require('flatted'); // Dùng flatted để xử lý vòng lặp (nếu cần)

// Lấy GITHUB_TOKEN từ biến môi trường
const githubToken = process.env.GITHUB_TOKEN;
const repo = "OnToanAnhDuong/LuyenToan6";
const filePath = "data/progress.json";
const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

async function saveProgress(progressData) {
    try {
        // Kiểm tra dữ liệu đầu vào để tránh vòng lặp
        console.log("Progress Data:", progressData);

        // Loại bỏ các thuộc tính không cần thiết hoặc không thể stringify
        const cleanedProgressData = {
            ...progressData,  // Làm sạch dữ liệu (nếu cần)
        };

        // Lấy thông tin hiện tại từ GitHub
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
            }
        });

        const existingData = await response.json();
        const sha = existingData.sha;  // Lấy sha của file để cập nhật

        // Mã hóa nội dung thành base64 sử dụng Buffer (Node.js)
        const base64Content = Buffer.from(stringify(cleanedProgressData)).toString('base64');

        const updatedData = {
            message: "Cập nhật tiến trình học sinh",
            content: base64Content,  // Mã hóa nội dung thành base64
            sha: sha,
        };

        // Cập nhật tiến trình học sinh lên GitHub
        const updateResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
            },
            body: JSON.stringify(updatedData),
        });

        if (!updateResponse.ok) {
            throw new Error('Không thể lưu tiến trình học sinh');
        }

        console.log('✅ Tiến trình đã được lưu thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu tiến trình:', error);
    }
}

// Xuất hàm saveProgress dưới dạng CommonJS
module.exports = saveProgress;
