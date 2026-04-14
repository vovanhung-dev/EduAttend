# EduAttend - Hệ Thống Điểm Danh Sinh Viên

## Danh Mục
Ứng Dụng Web, Machine Learning

## Giới Thiệu
EduAttend là hệ thống điểm danh sinh viên sử dụng nhận diện khuôn mặt, bao gồm Backend API, trang Admin quản trị và module nhận diện khuôn mặt (Zappa/AWS Lambda).

## Chức Năng
- Điểm danh bằng nhận diện khuôn mặt
- Quản lý danh sách sinh viên
- Thống kê điểm danh theo lớp, môn học
- Trang Admin quản lý
- Deploy nhận diện khuôn mặt lên AWS Lambda (Zappa)

## Công Nghệ Sử Dụng
- **Backend**: Node.js, Express
- **Admin**: React
- **Nhận diện khuôn mặt**: Python, Zappa (AWS Lambda)
- **Database**: MongoDB/MySQL

## Yêu Cầu Hệ Thống
- Node.js >= 14
- Python >= 3.8
- npm

## Cài Đặt
### Backend
```bash
cd EduAttend-Backend
npm install
```

### Admin
```bash
cd EduAttend-Admin
npm install
```

## Chạy Ứng Dụng
### Backend
```bash
cd EduAttend-Backend
npm start
```

### Admin
```bash
cd EduAttend-Admin
npm start
```
