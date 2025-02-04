const STUDENTS_URL = '/data/students.json';

// Tải danh sách học sinh
async function loadStudents() {
    try {
        const response = await fetch(STUDENTS_URL);
        studentsData = await response.json();
        displayStudentList();
    } catch (error) {
        console.error('❌ Lỗi tải danh sách học sinh:', error);
    }
}

// Hiển thị danh sách học sinh
function displayStudentList() {
    const container = document.getElementById('studentList');
    container.innerHTML = '';
    
    Object.keys(studentsData).forEach(id => {
        const row = `<tr><td>${id}</td><td>${studentsData[id].name}</td>
            <td><button onclick="deleteStudent('${id}')">❌ Xoá</button></td></tr>`;
        container.innerHTML += row;
    });
}

// Xoá học sinh
async function deleteStudent(studentId) {
    delete studentsData[studentId];
    await saveStudents();
    displayStudentList();
}

// Lưu danh sách học sinh
async function saveStudents() {
    await fetch('/api/save-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentsData)
    });
}
