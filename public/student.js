// student.js (Sử dụng ESM)

let currentKeyIndex = 0;  // Biến để theo dõi API key đang sử dụng
let apiKeys = [];  // Biến lưu API keys

let base64Image = ""; // Biến toàn cục để lưu ảnh bài làm
let progressData = {}; // Biến lưu tiến trình học sinh
let currentProblem = null; // Biến lưu bài tập hiện tại

// Tải API keys từ server
async function loadApiKeys() {
    try {
        const response = await fetch('/api/get-api-keys'); // Gọi API get-api-keys
        if (!response.ok) {
            throw new Error('Không thể tải API keys');
        }
        const data = await response.json();
        apiKeys = data.apiKeys;  // Lấy dữ liệu API keys
        console.log('API Keys:', apiKeys);

        if (apiKeys.length === 0) {
            console.error("Không có API keys hợp lệ.");
        } else {
            console.log(`Có ${apiKeys.length} API keys hợp lệ.`);
        }
    } catch (error) {
        console.error('Lỗi khi tải API keys:', error);
    }
}

// Hàm khởi tạo trang học sinh
async function initStudentPage() {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
        alert("⚠ Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        window.location.href = "index.html"; // Chuyển hướng về trang đăng nhập
        return;
    }

    console.log(`🔹 Đang tải dữ liệu học sinh: ${studentId}`);
    await loadStudentData(studentId);
    await loadProblems();
    await loadProgress(studentId);
    console.log("✅ Trang học sinh đã khởi tạo hoàn tất!");
}

// Hàm tải dữ liệu học sinh từ `students.json`
const loadStudentData = async (studentId) => {
    try {
        const response = await fetch('/api/get-students');
        if (!response.ok) {
            throw new Error("Không thể tải danh sách học sinh.");
        }
        const studentsObject = await response.json();  // Lấy dữ liệu từ API

        const students = Object.keys(studentsObject).map(key => ({
            id: key,
            name: studentsObject[key].name,
            role: studentsObject[key].role
        }));

        console.log("✅ Danh sách học sinh:", students);
        return students;
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách học sinh:", error);
        return [];
    }
};

// Hàm tải danh sách bài tập từ `problems.json`
const loadProblems = async () => {
    try {
        const response = await fetch('/api/get-problems');
        if (!response.ok) {
            throw new Error("Không thể tải danh sách bài tập!");
        }
        const problems = await response.json();
        console.log("✅ Danh sách bài tập:", problems);
        displayProblemList(problems);
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách bài tập:", error);
    }
};

// Hiển thị danh sách bài tập
function displayProblemList(problems) {
    const problemContainer = document.getElementById("problemList");
    problemContainer.innerHTML = ""; // Xóa danh sách cũ nếu có

    problems.forEach(problem => {
        const problemBox = document.createElement("div");
        problemBox.textContent = problem.index;
        problemBox.className = "problem-box";
        problemBox.dataset.id = problem.index;

        function updateProblemColor() {
            if (progressData[problem.index]) {
                problemBox.style.backgroundColor = "green"; // Bài đã làm
            } else {
                problemBox.style.backgroundColor = "yellow"; // Bài chưa làm
            }
        }

        updateProblemColor();

        problemBox.addEventListener("click", async () => {
            if (progressData[problem.index]) {
                alert("📌 Bài tập này đã làm! Vui lòng chọn bài tập khác hoặc chọn bài tương tự.");
                return;
            }
            displayProblem(problem); // Hiển thị nội dung bài tập
        });

        problemContainer.appendChild(problemBox);
    });

    console.log("✅ Danh sách bài tập đã cập nhật.");
}

// Hiển thị nội dung bài tập khi học sinh chọn bài
function displayProblem(problem) {
    document.getElementById("problemText").innerHTML = problem.problem; // Hiển thị đề bài
    currentProblem = problem; // Lưu bài tập hiện tại
    MathJax.typesetPromise([document.getElementById("problemText")]).catch(err => console.error("MathJax lỗi:", err));
}

// Tải tiến trình học sinh
async function loadProgress(studentId) {
    try {
        const response = await fetch(`/api/get-progress?studentId=${studentId}`);
        const progress = await response.json();
        progressData = progress || {}; // Lưu vào biến toàn cục
        console.log(`✅ Tiến trình của học sinh ${studentId}:`, progressData);
        updateProgressUI();
    } catch (error) {
        console.error("❌ Lỗi khi tải tiến trình:", error);
    }
}

// Cập nhật tiến trình UI
function updateProgressUI() {
    document.getElementById("completedExercises").textContent = progressData.completedExercises || 0;
    document.getElementById("averageScore").textContent = progressData.averageScore || 0;
}

// Lưu tiến trình học sinh vào `progress.json`
async function saveProgress(studentId, score) {
    try {
        let completedExercises = progressData.completedExercises || 0;
        let totalScore = (progressData.averageScore || 0) * completedExercises;
        completedExercises += 1;
        let averageScore = (totalScore + score) / completedExercises;

        progressData.completedExercises = completedExercises;
        progressData.averageScore = averageScore;

        await fetch("/api/save-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, completedExercises, averageScore })
        });

        console.log(`✅ Tiến trình đã được cập nhật: ${completedExercises} bài, Điểm TB: ${averageScore.toFixed(2)}`);
    } catch (error) {
        console.error("❌ Lỗi khi lưu tiến trình:", error);
    }
}

// Chuyển đổi ảnh thành Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = error => reject(error);
    });
}

// Hàm lấy API key tiếp theo từ danh sách
function getNextApiKey() {
    const apiKey = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return apiKey;
}

// Hàm gọi API Gemini để chấm bài
async function gradeWithGemini(base64Image, problemText, studentId) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent';
    const promptText = `
        Học sinh: ${studentId}
        Đề bài:
        ${problemText}
        Hãy thực hiện các bước sau:
        1. Nhận diện và gõ lại bài làm của học sinh từ hình ảnh thành văn bản một cách chính xác...
        2. Giải bài toán và cung cấp lời giải chi tiết...
        3. So sánh bài làm của học sinh với đáp án đúng...
        4. Chấm điểm bài làm của học sinh trên thang điểm 10...
        5. Đưa ra nhận xét chi tiết và đề xuất cải thiện.
    `;
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: promptText },
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
            }
        ]
    };

    try {
        const data = await makeApiRequest(apiUrl, requestBody);
        const response = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!response) {
            throw new Error('Không nhận được phản hồi hợp lệ từ API');
        }
        const studentAnswer = response.match(/Bài làm của học sinh: ([\s\S]*?)(?=\nLời giải chi tiết:)/)?.[1]?.trim() || '';
        const feedback = response.replace(/Bài làm của học sinh: [\s\S]*?\n/, '');
        const score = parseFloat(response.match(/Điểm số: (\d+(\.\d+)?)/)?.[1] || '0');
        return { studentAnswer, feedback, score };
    } catch (error) {
        console.error('Lỗi:', error);
        return { studentAnswer: '', feedback: `Đã xảy ra lỗi: ${error.message}`, score: 0 };
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadApiKeys(); // Tải API keys khi trang được tải
    await initStudentPage();
});
