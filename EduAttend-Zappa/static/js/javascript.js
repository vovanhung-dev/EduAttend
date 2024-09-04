function displayImageFromFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var imageElement = document.createElement('img');
        imageElement.src = e.target.result;
        imageElement.classList.add('uploaded-image');
        document.getElementById('photo-container').appendChild(imageElement);
    };
    reader.readAsDataURL(file);
}

function displayImageFromCanvas(canvas) {
    var imageElement = document.createElement('img');
    imageElement.src = canvas.toDataURL('image/jpeg');
    imageElement.classList.add('uploaded-image');
    document.getElementById('photo-container').appendChild(imageElement);
}

function uploadImage() {
    hideResult();

    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);

    var fileInput = document.querySelector('input[type="file"]');
    var file = fileInput.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
        var base64Image = reader.result.split(',')[1];
        formData.append('imageBase64', base64Image);

        // displayImageFromFile(file);

        var maLichThi = document.getElementById('examSchedule').value;

        formData.append('ma_lich_thi', maLichThi);

        // Hiển thị loading
        var loading = document.getElementById('loading');
        var loadingText = document.getElementById('loading-text');
        loading.style.display = 'block';
        loadingText.innerText = 'Đang xử lý...';

        fetch('/compare', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loadingText.style.display = 'none';
                console.log(data);

                let resultElement = document.getElementById('result');
                resultElement.innerHTML = '';

                if (data.match) {
                    if (data.attended_students.length > 0) {
                        // Hiển thị thông báo đã điểm danh thành công
                        data.attended_students.forEach(student => {
                            let studentElement = document.createElement('p');
                            studentElement.innerText = `Sinh viên ${student.hoten} (${student.student_id}) đã được điểm danh.`;
                            studentElement.classList.add('text-xl', 'text-white', 'p-2');
                            resultElement.appendChild(studentElement);
                        });

                        let successMessage = document.createElement('p');
                        successMessage.innerText = 'Đã điểm danh thành công. Vui lòng chạy lại trang web để xem danh sách sinh viên đã điểm danh!';
                        successMessage.classList.add('text-xl', 'text-white', 'p-8');
                        resultElement.appendChild(successMessage);
                    } else {
                        // Nếu attended_students rỗng
                        let noStudentsElement = document.createElement('p');
                        noStudentsElement.innerText = 'Không có sinh viên nào được điểm danh!';
                        noStudentsElement.classList.add('text-xl', 'text-white', 'p-8');
                        resultElement.appendChild(noStudentsElement);
                    }
                } else {
                    // Nếu không tìm thấy kết quả nào
                    let noResultElement = document.createElement('div');
                    noResultElement.innerText = 'Không tìm thấy kết quả nào';
                    noResultElement.classList.add('text-xl', 'text-white', 'p-8');
                    resultElement.appendChild(noResultElement);
                }


                // Ẩn loading sau khi nhận kết quả
                loading.style.display = 'none';
            })
            .catch(error => {
                console.error('Error:', error);
                // Xử lý khi có lỗi
                loadingText.innerText = 'Đã xảy ra lỗi!';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 2000); // Ẩn loading sau 2 giây nếu có lỗi
            });
    };

    reader.onerror = function (error) {
        console.error('Error:', error);
        // Xử lý khi có lỗi
    };
}


let videoStream = null;

function startCamera() {
    hideResult();
    const photoContainer = document.getElementById('photo-container');
    photoContainer.innerHTML = ''; // Xóa nội dung hiện có của photoContainer

    const constraints = {
        video: { facingMode: 'environment' } // Chỉ sử dụng camera sau
    };

    let video; // Biến video để lưu trữ element video
    let canvas; // Biến canvas để lưu trữ element canvas

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            videoStream = stream;

            video = document.createElement('video');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('id', 'camera');
            video.srcObject = stream;

            canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'canvas');
            canvas.style.display = 'none';

            // Gọi hàm để thêm video và canvas sau khi đã được tạo
            addVideoAndCanvasToContainer(video, canvas);
        })
        .catch(function (err) {
            console.error('Error accessing the camera: ', err);
        });

    function addVideoAndCanvasToContainer(videoElement, canvasElement) {
        // Thêm video và canvas vào photoContainer
        photoContainer.appendChild(videoElement);
        photoContainer.appendChild(canvasElement);
    }
}



function takeSnapshot() {
    hideResult();
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.srcObject.getVideoTracks().forEach(track => track.stop());

    const photoContainer = document.getElementById('photo-container');
    photoContainer.innerHTML = '';

    displayImageFromCanvas(canvas);

    // Convert canvas image to blob
    canvas.toBlob(function (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'camera.jpg');

        const maLichThi = document.getElementById('examSchedule').value;
        formData.append('ma_lich_thi', maLichThi);

        // Display loading spinner
        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loading-text');
        loading.style.display = 'block';
        loadingText.innerText = 'Đang xử lý...';

        // Send image data to server for processing
        fetch('/compare', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loading.style.display = 'none';
                console.log(data);
                loadingText.style.display = 'none';

                let resultElement = document.getElementById('result');
                resultElement.innerHTML = '';

                if (data.match) {
                    if (data.attended_students.length > 0) {
                        // Hiển thị thông báo đã điểm danh thành công
                        data.attended_students.forEach(student => {
                            let studentElement = document.createElement('p');
                            studentElement.innerText = `Sinh viên ${student.hoten} (${student.student_id}) đã được điểm danh.`;
                            studentElement.classList.add('text-xl', 'text-white', 'p-2');
                            resultElement.appendChild(studentElement);
                        });

                        let successMessage = document.createElement('p');
                        successMessage.innerText = 'Đã điểm danh thành công. Vui lòng chạy lại trang web để xem danh sách sinh viên đã điểm danh!';
                        successMessage.classList.add('text-xl', 'text-white', 'p-8');
                        resultElement.appendChild(successMessage);
                    } else {
                        // Nếu attended_students rỗng
                        let noStudentsElement = document.createElement('p');
                        noStudentsElement.innerText = 'Không có sinh viên nào được điểm danh!';
                        noStudentsElement.classList.add('text-xl', 'text-white', 'p-8');
                        resultElement.appendChild(noStudentsElement);
                    }
                } else {
                    // Nếu không tìm thấy kết quả nào
                    let noResultElement = document.createElement('div');
                    noResultElement.innerText = 'Không tìm thấy kết quả nào';
                    noResultElement.classList.add('text-xl', 'text-white', 'p-8');
                    resultElement.appendChild(noResultElement);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                loadingText.innerText = 'Đã xảy ra lỗi!';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 2000); // Hide loading after 2 seconds on error
            });
    }, 'image/jpeg');
}


function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function showUploadOption() {
    hideResult();
    document.getElementById('upload-file-section').classList.remove('hidden');
    document.getElementById('camera-section').classList.add('hidden');
}

function showCameraOption() {
    hideResult();
    document.getElementById('upload-file-section').classList.add('hidden');
    document.getElementById('camera-section').classList.remove('hidden');
}

fetch('/lich_thi')
    .then(response => response.json())
    .then(data => {
        const examScheduleDropdown = document.getElementById('examSchedule');
        data.lich_thi_list.forEach(schedule => {
            const option = document.createElement('option');
            option.value = schedule.ma_lich_thi;
            option.innerText = `Mã lịch thi ${schedule.ma_lich_thi} - Môn ${schedule.mon_hoc} - Ngày ${new Date(schedule.ngay).toLocaleDateString('vi-VN')}`;
            examScheduleDropdown.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching exam schedules:', error));


// Function to handle showing loading spinner
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading-text').classList.remove('hidden');
    document.getElementById('loading-text').innerText = '';
}

// Function to hide result
function hideResult() {
    document.getElementById('result').innerHTML = '';
}

function getSelectedSchedule() {
    const selectedScheduleId = document.getElementById('examSchedule').value;
    if (selectedScheduleId) {
        showLoading();
        fetch(`/lich_thi/${selectedScheduleId}`)
            .then(response => response.json())
            .then(data => {
                const resultDiv = document.getElementById('result-2');

                // Construct HTML to display schedule details
                let html = `
                 <div class="overflow-x-auto py-5">
    <table class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg mx-auto">
        <thead>
           <tr>
                <th class="py-4 px-6 bg-blue-500 text-white text-center align-middle text-lg font-semibold">Thông tin</th>
                <th class="py-4 px-6 bg-blue-500 text-white text-center align-middle text-lg font-semibold">Chi tiết</th>
            </tr>
        </thead>
        <tbody class="text-gray-700">
            <tr class="border-t">
                <td class="py-4 px-6">📚 Môn học</td>
                <td class="py-4 px-6">${data.lich_thi.mon_hoc}</td>
            </tr>
            <tr class="border-t">
                <td class="py-4 px-6">🗓️ Ngày thi</td>
                <td class="py-4 px-6">${new Date(data.lich_thi.ngay).toLocaleDateString('vi-VN')}</td>
            </tr>
            <tr class="border-t">
                <td class="py-4 px-6">🏫 Phòng thi</td>
                <td class="py-4 px-6">${data.lich_thi.phong}</td>
            </tr>
            <tr class="border-t">
                <td class="py-4 px-6">👨‍🏫 Giám thị</td>
                <td class="py-4 px-6">
                    <ol class="list-inside">
                        ${data.lich_thi.giam_thi_1 ? `<li>${data.lich_thi.giam_thi_1}</li>` : ''}
                        ${data.lich_thi.giam_thi_2 ? `<li>${data.lich_thi.giam_thi_2}</li>` : ''}
                        ${data.lich_thi.giam_thi_3 ? `<li>${data.lich_thi.giam_thi_3}</li>` : ''}
                        ${data.lich_thi.giam_thi_4 ? `<li>${data.lich_thi.giam_thi_4}</li>` : ''}
                    </ol>
                </td>
            </tr>
        </tbody>
    </table>
</div>
                
                    <p class="text-white">Danh sách thí sinh:</p>
                    <div class="overflow-x-auto">
                    <table class="px-4 mt-4 min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead class="bg-gray-800 text-white">
                            <tr>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">STT</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Họ và tên</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Mã sinh viên</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Điểm danh</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">`;

                // Loop through danh_sach_thi (candidates list)
                data.danh_sach_thi.forEach((candidate, index) => {
                    const diemDanhText = {
                        1: 'Đã điểm danh',
                        0: 'Chưa điểm danh',
                        2: 'Chưa nhận dạng được',
                        3: 'Sinh viên cho thi hộ'
                    }[candidate.diem_danh] || 'Chưa điểm danh';

                    const diemDanhClass = {
                        1: 'bg-green-500 text-white',
                        0: 'bg-red-500 text-white',
                        2: 'bg-yellow-500 text-white',
                        3: 'bg-purple-500 text-white'
                    }[candidate.diem_danh] || 'bg-red-500 text-white';

                    html += `
                        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                            <td class="py-4 whitespace-nowrap text-center">${index + 1}</td>
                            <td class="py-4 whitespace-nowrap">${candidate.hoten}</td>
                            <td class="py-4 whitespace-nowrap">${candidate.student_id}</td>
                            <td class="py-4 whitespace-nowrap text-center">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${diemDanhClass}">${diemDanhText}</span>
                            </td>
                           <td class="py-4 whitespace-nowrap text-center">
                                <select class="attendance-status px-2 py-1 bg-gray-800 text-white rounded" data-exam-id="${selectedScheduleId}" data-user-id="${candidate.ma_user}">
                                    <option value="1" ${candidate.diem_danh === 1 ? 'selected' : ''}>Đã điểm danh</option>
                                    <option value="0" ${candidate.diem_danh === 0 ? 'selected' : ''}>Chưa điểm danh</option>
                                    <option value="2" ${candidate.diem_danh === 2 ? 'selected' : ''}>Chưa nhận dạng được</option>
                                    <option value="3" ${candidate.diem_danh === 3 ? 'selected' : ''}>Sinh viên cho thi hộ</option>
                                </select>
                                <button class="update-button px-3 py-1 mt-1 ml-2 bg-blue-600 text-white rounded" onclick="updateAttendanceStatus(${selectedScheduleId}, ${candidate.ma_user})">Cập nhật</button>
                            </td>
                        </tr>`;
                });

                html += `
                        </tbody>
                    </table>
                    </div>`;

                // Set innerHTML of resultDiv to display the constructed HTML
                resultDiv.innerHTML = html;

                // Hide loading indicator
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('loading-text').classList.add('hidden');
            })
            .catch(error => console.error('Error fetching exam schedule details:', error));
    } else {
        alert('Vui lòng chọn mã lịch thi trước khi xem chi tiết.');
    }
}

function updateAttendanceStatus(examId, userId) {
    const selectElement = document.querySelector(`select[data-exam-id="${examId}"][data-user-id="${userId}"]`);
    const newStatus = selectElement.value;

    fetch('/update_attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            exam_id: examId,
            user_id: userId,
            new_status: newStatus
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Trạng thái điểm danh đã được cập nhật');
            } else {
                alert('Có lỗi xảy ra khi cập nhật trạng thái điểm danh');
            }
        })
        .catch(error => console.error('Error updating attendance status:', error));
}