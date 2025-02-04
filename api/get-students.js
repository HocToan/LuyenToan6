// api/get-students.js (Sử dụng CommonJS)

const { Octokit } = require("@octokit/rest");  // Dùng require thay cho import

async function handler(req, res) {
    try {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error("GITHUB_TOKEN chưa được cấu hình.");
        }

        const octokit = new Octokit({ auth: githubToken });
        const repo = "OnToanAnhDuong/LuyenToan6";
        const filePath = "data/students.json";

        // 🔍 Lấy dữ liệu từ GitHub
        const { data } = await octokit.repos.getContent({
            owner: "OnToanAnhDuong",
            repo: "LuyenToan6",
            path: filePath
        });

        const fileContent = Buffer.from(data.content, "base64").toString("utf-8");
        const students = JSON.parse(fileContent);

        console.log("✅ Danh sách học sinh đã tải thành công!", students);
        res.status(200).json(students);

    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách học sinh:", error.message);
        res.status(500).json({ error: "❌ Không thể tải danh sách học sinh." });
    }
}

// Xuất hàm handler dưới dạng CommonJS
module.exports = handler;
