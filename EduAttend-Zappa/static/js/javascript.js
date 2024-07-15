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
    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);

    var fileInput = document.querySelector('input[type="file"]');
    var file = fileInput.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
        var base64Image = reader.result.split(',')[1];
        formData.append('imageBase64', base64Image);

        displayImageFromFile(file);

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

                if (data.match) {
                    // Hiển thị thông báo đã điểm danh thành công
                    let resultElement = document.getElementById('result');
                    resultElement.innerHTML = '<p>Đã điểm danh thành công. Vui lòng chạy lại trang web để xem danh sách sinh viên đã điểm danh!</p>';


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
    const photoContainer = document.getElementById('photo-container');
    photoContainer.innerHTML = '';
    const constraints = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            videoStream = stream;
            const video = document.createElement('video');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('id', 'camera');
            video.srcObject = stream;
            document.getElementById('photo-container').appendChild(video);

            const canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'canvas');
            canvas.style.display = 'none';
            document.getElementById('photo-container').appendChild(canvas);
        })
        .catch(function (err) {
            console.error('Error accessing the camera: ', err);
        });
}

function takeSnapshot() {
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

                if (data.match && data.matched_faces.length > 0) {
                    // Hiển thị thông báo đã điểm danh thành công
                    let resultElement = document.getElementById('result');
                    resultElement.innerHTML = '<p>Đã điểm danh thành công. Vui lòng chạy lại trang web để xem danh sách sinh viên đã điểm danh!</p>';
                } else {
                    // No matching result found
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
    document.getElementById('upload-file-section').classList.remove('hidden');
    document.getElementById('camera-section').classList.add('hidden');
}

function showCameraOption() {
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
    document.getElementById('loading-text').innerText = 'Đang tải...';
}

// Function to get selected schedule
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
                    <p class="text-white text-lg pt-10">Môn học: ${data.lich_thi.mon_hoc}</p>
                    <p class="text-white">Ngày thi: ${new Date(data.lich_thi.ngay).toLocaleDateString('vi-VN')}</p>
                    <p class="text-white">Phòng thi: ${data.lich_thi.phong}</p>
                    <p class="text-white">Giám thị:
                    <ul class="text-white">
                        ${data.lich_thi.giam_thi_1 ? `<li>${data.lich_thi.giam_thi_1}</li>` : ''}
                        ${data.lich_thi.giam_thi_2 ? `<li>${data.lich_thi.giam_thi_2}</li>` : ''}
                        ${data.lich_thi.giam_thi_3 ? `<li>${data.lich_thi.giam_thi_3}</li>` : ''}
                        ${data.lich_thi.giam_thi_4 ? `<li>${data.lich_thi.giam_thi_4}</li>` : ''}
                    </ul>
                </p>
                
                    <p class="text-white">Danh sách thí sinh:</p>
                    <div class="overflow-x-auto">
                    <table class="px-4 mt-4 min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead class="bg-gray-800 text-white">
                            <tr>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">STT</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Họ và tên</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Mã sinh viên</th>
                                <th scope="col" class="py-3 text-center text-xs font-medium uppercase tracking-wider">Điểm danh</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">`;

                // Loop through danh_sach_thi (candidates list)
                data.danh_sach_thi.forEach((candidate, index) => {
                    const diemDanhText = candidate.diem_danh === 1 ? 'Đã điểm danh' : 'Chưa điểm danh';
                    const diemDanhClass = candidate.diem_danh === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';

                    html += `
                        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                            <td class="py-4 whitespace-nowrap text-center">${index + 1}</td>
                            <td class="py-4 whitespace-nowrap">${candidate.hoten}</td>
                            <td class="py-4 whitespace-nowrap">${candidate.student_id}</td>
                            <td class="py-4 whitespace-nowrap text-center">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${diemDanhClass}">${diemDanhText}</span>
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

