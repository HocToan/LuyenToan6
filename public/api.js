// 🚀 Tải danh sách học sinh
async function fetchStudents() {
    try {
        const response = await fetch('/api/get-students');
        return await response.json();
    } catch (error) {
        console.error('❌ Lỗi tải danh sách học sinh:', error);
        return [];
    }
}

// 🚀 Lưu danh sách học sinh
async function saveStudents(students) {
    try {
        await fetch('/api/save-students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students })
        });
    } catch (error) {
        console.error('❌ Lỗi lưu danh sách học sinh:', error);
    }
}

// 🚀 Khi trang tải xong, tự động tải danh sách học sinh
document.addEventListener('DOMContentLoaded', fetchStudents);
