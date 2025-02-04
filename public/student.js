// Import API keys từ get-api-keys.js
import apiKeys from '../api/get-api-keys.js';  // Đảm bảo đường dẫn đúng với cấu trúc dự án của bạn

let currentKeyIndex = 0;  // Biến để theo dõi API key đang sử dụng

// Kiểm tra xem có API keys hợp lệ không
if (apiKeys.length === 0) {
    console.error("Không có API keys hợp lệ.");
} else {
    console.log(`Có ${apiKeys.length} API keys hợp lệ.`);
}
let base64Image = ""; // 🌟 Biến toàn cục để lưu ảnh bài làm
document.addEventListener("DOMContentLoaded", async function () {
    await initStudentPage();
});

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

// 🌟 1. Hàm tải dữ liệu học sinh từ `students.json`
const loadStudentData = async (studentId) => {
    try {
        const response = await fetch('/api/get-students');
        if (!response.ok) {
            throw new Error("Không thể tải danh sách học sinh.");
        }
        const studentsObject = await response.json();  // Lấy dữ liệu từ API

        // Chuyển đối tượng JSON thành mảng
        const students = Object.keys(studentsObject).map(key => ({
            id: key,
            name: studentsObject[key].name,
            role: studentsObject[key].role
        }));

        console.log("✅ Danh sách học sinh:", students);

        // Kiểm tra xem danh sách có hợp lệ không
        if (!Array.isArray(students) || students.length === 0) {
            throw new Error("Dữ liệu học sinh không phải là mảng hoặc rỗng!");
        }

        return students; // Trả về danh sách học sinh đã chuyển đổi
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách học sinh:", error);
        return [];  // Trả về mảng rỗng để tránh lỗi khi xử lý tiếp
    }
};

// 🌟 2. Hàm tải danh sách bài tập từ `problems.json`
let progressData = {};

// 🌟 2. Hàm tải danh sách bài tập từ `problems.json`
const loadProblems = async () => {
    try {
        const response = await fetch('/api/get-problems');
        if (!response.ok) {
            throw new Error("Không thể tải danh sách bài tập!");
        }
        const problems = await response.json();
        console.log("✅ Danh sách bài tập:", problems);
        displayProblemList(problems); // Hiển thị bài tập lên giao diện
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách bài tập:", error);
    }
};
// 🌟 3. Hiển thị danh sách bài tập
function displayProblemList(problems) {
    const problemContainer = document.getElementById("problemList");
    problemContainer.innerHTML = ""; // Xóa danh sách cũ nếu có
    
    problems.forEach(problem => {
        const problemBox = document.createElement("div");
        problemBox.textContent = problem.index; // Chỉ hiển thị số bài tập
        problemBox.className = "problem-box";
        problemBox.dataset.id = problem.index;

        // Màu sắc trạng thái bài tập
        function updateProblemColor() {
            // Kiểm tra nếu progressData đã có dữ liệu trước khi sử dụng
            if (progressData[problem.index]) {
                problemBox.style.backgroundColor = "green"; // Bài đã làm
            } else {
                problemBox.style.backgroundColor = "yellow"; // Bài chưa làm
            }
        }

        updateProblemColor(); // Áp dụng màu sắc

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

// 🌟 4. Hiển thị nội dung bài tập khi học sinh chọn bài
function displayProblem(problem) {
    document.getElementById("problemText").innerHTML = problem.problem; // Hiển thị đề bài
    currentProblem = problem; // Lưu bài tập hiện tại
    MathJax.typesetPromise([document.getElementById("problemText")]).catch(err => console.error("MathJax lỗi:", err));
}


// 🌟 5. Tải tiến trình học sinh từ `progress.json`
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

// 🌟 6. Cập nhật tiến trình UI (số bài đã làm & điểm TB)
function updateProgressUI() {
    document.getElementById("completedExercises").textContent = progressData.completedExercises || 0;
    document.getElementById("averageScore").textContent = progressData.averageScore || 0;
}

// 🌟 7. Sự kiện nút "Chấm bài"
document.getElementById("submitBtn").addEventListener("click", async () => {
    if (!currentProblem) {
        alert("⚠ Vui lòng chọn bài tập trước khi chấm.");
        return;
    }

    const studentId = localStorage.getItem("studentId");
    const problemText = document.getElementById("problemText").innerText.trim();
    const studentFileInput = document.getElementById("studentImage");

    if (!problemText) {
        alert("⚠ Đề bài chưa được tải.");
        return;
    }

    // 📌 Kiểm tra nếu học sinh đã tải ảnh lên hoặc chụp ảnh từ camera
    if (!base64Image && studentFileInput.files.length === 0) {
        alert("⚠ Vui lòng tải lên ảnh bài làm hoặc chụp ảnh từ camera.");
        return;
    }

    // ✅ Nếu chưa có base64Image (chưa chụp từ camera), lấy từ file ảnh
    if (!base64Image && studentFileInput.files.length > 0) {
        base64Image = await getBase64(studentFileInput.files[0]);
    }

    try {
        document.getElementById("result").innerText = "🔄 Đang chấm bài...";

        // 📌 Gửi ảnh và đề bài cho AI chấm bài
        const { studentAnswer, feedback, score } = await gradeWithGemini(base64Image, problemText, studentId);
        await saveProgress(studentId, score);

        // 📌 Hiển thị kết quả chấm bài
        document.getElementById("result").innerHTML = feedback;
        MathJax.typesetPromise([document.getElementById("result")]).catch(err => console.error("MathJax lỗi:", err));

        alert(`✅ Bài tập đã được chấm! Bạn đạt ${score}/10 điểm.`);
        progressData[currentProblem.index] = true; // Đánh dấu bài đã làm
        updateProgressUI();
    } catch (error) {
        console.error("❌ Lỗi khi chấm bài:", error);
        document.getElementById("result").innerText = `Lỗi: ${error.message}`;
    }
});

// 🌟 8. Lưu tiến trình học sinh vào `progress.json`
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

// 🌟 9. Chuyển đổi ảnh thành Base64
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
    const apiKey = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;  // Lấy API key tiếp theo theo chu kỳ
    return apiKey;
}
async function gradeWithGemini(base64Image, problemText, studentId) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent';
    const promptText = `
    Học sinh: ${studentId}
    Đề bài:
    ${problemText}
    
    Hãy thực hiện các bước sau:
    1. Nhận diện và gõ lại bài làm từ hình ảnh (định dạng Toán học giữ nguyên).
    2. Giải bài toán đúng theo chương trình lớp 6.
    3. So sánh bài làm học sinh với đáp án đúng.
    4. Chấm điểm từ 0 đến 10.
    5. Đưa ra nhận xét cải thiện.

    Trả về kết quả theo định dạng:
    - **Bài làm của học sinh:** [...]
    - **Lời giải chi tiết:** [...]
    - **Chấm điểm:** [...]
    - **Điểm số:** [...]
    - **Nhận xét:** [...]
    `;

    const requestBody = {
        contents: [
            { parts: [{ text: promptText }, { inline_data: { mime_type: "image/jpeg", data: base64Image } }] }
        ]
    };

    try {
        const response = await fetch(`${apiUrl}?key=${getNextApiKey()}`, {  // Gọi hàm lấy API key
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("Không nhận được phản hồi hợp lệ từ AI.");
        }

        const studentAnswer = responseText.match(/Bài làm của học sinh: ([\s\S]*?)(?=\nLời giải chi tiết:)/)?.[1]?.trim() || '';
        const feedback = responseText.replace(/Bài làm của học sinh: [\s\S]*?\n/, '');
        const score = parseFloat(responseText.match(/Điểm số: (\d+(\.\d+)?)/)?.[1] || '0');

        return { studentAnswer, feedback, score };
    } catch (error) {
        console.error("❌ Lỗi chấm bài với Gemini:", error);
        return { studentAnswer: '', feedback: `Đã xảy ra lỗi: ${error.message}`, score: 0 };
    }
}


