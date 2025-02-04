// api/save-students.js (Sử dụng CommonJS)

const fetch = require('node-fetch');  // Dùng require để nhập thư viện
const { stringify } = require('flatted'); // Nếu cần xử lý vòng lặp

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST method is allowed" });
    }

    const { studentId, studentName } = req.body;
    if (!studentId || !studentName) {
        return res.status(400).json({ error: "Missing required data" });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repo = "OnToanAnhDuong/LuyenToan6";
    const filePath = "data/students.json";
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    try {
        // Lấy dữ liệu file hiện tại từ GitHub
        const fileResponse = await fetch(apiUrl, {
            headers: { Authorization: `token ${githubToken}` }
        });

        const fileData = await fileResponse.json();
        const sha = fileData.sha || null;
        let studentList = fileData.content ? JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8')) : {};

        // Cập nhật danh sách học sinh
        studentList[studentId] = { studentName };

        // Mã hóa lại dữ liệu danh sách học sinh thành base64
        const updatedContent = Buffer.from(JSON.stringify(studentList, null, 2)).toString("base64");

        // Cập nhật nội dung lên GitHub
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                Authorization: `token ${githubToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Update student list`,
                content: updatedContent,
                sha
            })
        });

        if (!response.ok) throw new Error("Failed to update student list");

        return res.status(200).json({ message: "Student list updated successfully" });
    } catch (error) {
        console.error("❌ Error updating student list:", error);
        return res.status(500).json({ error: "Failed to update student list" });
    }
}

// Xuất hàm handler dưới dạng CommonJS
module.exports = handler;
