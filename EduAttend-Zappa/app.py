from flask import Flask, render_template, request, jsonify
import boto3
from flask_mysqldb import MySQL
import os
import tempfile
from PIL import Image  # Import thư viện Image từ PIL
import traceback

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'eduattend-v2'

mysql = MySQL(app)

# Khởi tạo client Rekognition và S3
rekognition_client = boto3.client('rekognition', region_name='ap-southeast-2')
s3_client = boto3.client('s3', region_name='ap-southeast-2')

# Đường dẫn tạm thời để lưu trữ các khuôn mặt được nhận dạng
temp_face_dir = tempfile.gettempdir()

# Hàm tạo bảng nếu chưa tồn tại
def create_tables():
    with app.app_context():
        cur = mysql.connection.cursor()

        # Tạo bảng user
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user (
                ma_user INT PRIMARY KEY AUTO_INCREMENT,
                hoten VARCHAR(255) NOT NULL,
                sdt VARCHAR(15) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                mat_khau VARCHAR(255) NOT NULL,
                vai_tro ENUM('student', 'teacher', 'admin') NOT NULL,
                lop VARCHAR(50)
            )
        ''')

        # Tạo bảng lich_thi
        cur.execute('''
            CREATE TABLE IF NOT EXISTS lich_thi (
                ma_lich_thi INT PRIMARY KEY AUTO_INCREMENT,
                ngay DATE NOT NULL,
                mon_hoc VARCHAR(100) NOT NULL,
                phong VARCHAR(50) NOT NULL,
                giam_thi_1 INT NOT NULL,
                giam_thi_2 INT NOT NULL,
                giam_thi_3 INT,
                giam_thi_4 INT,
                FOREIGN KEY (giam_thi_1) REFERENCES user(ma_user),
                FOREIGN KEY (giam_thi_2) REFERENCES user(ma_user),
                FOREIGN KEY (giam_thi_3) REFERENCES user(ma_user),
                FOREIGN KEY (giam_thi_4) REFERENCES user(ma_user)
            )
        ''')

        # Tạo bảng danh_sach_thi
        cur.execute('''
            CREATE TABLE IF NOT EXISTS danh_sach_thi (
                ma_lich_thi INT,
                ma_user INT,
                diem_danh BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (ma_lich_thi, ma_user),
                FOREIGN KEY (ma_lich_thi) REFERENCES lich_thi(ma_lich_thi),
                FOREIGN KEY (ma_user) REFERENCES user(ma_user)
            )
        ''')

        # Commit thay đổi và đóng kết nối
        mysql.connection.commit()
        cur.close()

# Route để lấy danh sách các lịch thi

@app.route('/lich_thi', methods=['GET'])
def get_lich_thi_list():
    try:
        with app.app_context():
            cur = mysql.connection.cursor()

            # Truy vấn lấy danh sách các lịch thi
            cur.execute('''
                SELECT ma_lich_thi, ngay, mon_hoc, phong, giam_thi_1, giam_thi_2, giam_thi_3, giam_thi_4 FROM lich_thi
            ''')
            lich_thi_list = cur.fetchall()

            # Chuyển đổi kết quả truy vấn thành danh sách dictionary
            columns = ['ma_lich_thi', 'ngay', 'mon_hoc', 'phong', 'giam_thi_1', 'giam_thi_2', 'giam_thi_3', 'giam_thi_4']
            lich_thi_list_json = [dict(zip(columns, row)) for row in lich_thi_list]

            cur.close()

            return jsonify({'lich_thi_list': lich_thi_list_json})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


@app.route('/lich_thi/<int:ma_lich_thi>', methods=['GET'])
def get_lich_thi(ma_lich_thi):
    try:
        with app.app_context():
            cur = mysql.connection.cursor()

            # Truy vấn lấy thông tin lịch thi và tên giám thị
            cur.execute('''
               SELECT lich_thi.ma_lich_thi, lich_thi.ngay, lich_thi.mon_hoc, lich_thi.phong, 
                    user_1.hoten AS giam_thi_1, user_2.hoten AS giam_thi_2, 
                    user_3.hoten AS giam_thi_3, user_4.hoten AS giam_thi_4
                FROM lich_thi
                LEFT JOIN user AS user_1 ON lich_thi.giam_thi_1 = user_1.ma_user
                LEFT JOIN user AS user_2 ON lich_thi.giam_thi_2 = user_2.ma_user
                LEFT JOIN user AS user_3 ON lich_thi.giam_thi_3 = user_3.ma_user
                LEFT JOIN user AS user_4 ON lich_thi.giam_thi_4 = user_4.ma_user
                WHERE lich_thi.ma_lich_thi = %s

            ''', (ma_lich_thi,))
            lich_thi_data = cur.fetchone()

            if not lich_thi_data:
                return jsonify({'error': 'Lich thi not found'})

            # Chuyển đổi dữ liệu lịch thi thành dictionary
            lich_thi_columns = ['ma_lich_thi', 'ngay', 'mon_hoc', 'phong', 'giam_thi_1', 'giam_thi_2', 'giam_thi_3', 'giam_thi_4']
            lich_thi_data_json = dict(zip(lich_thi_columns, lich_thi_data))

            # Truy vấn lấy danh sách user tham gia thi
            cur.execute('''
                SELECT user.ma_user, user.hoten, danh_sach_thi.diem_danh
                FROM user
                INNER JOIN danh_sach_thi ON user.ma_user = danh_sach_thi.ma_user
                WHERE danh_sach_thi.ma_lich_thi = %s
            ''', (ma_lich_thi,))
            users_data = cur.fetchall()

            # Chuyển đổi dữ liệu danh sách thi thành danh sách dictionary
            user_columns = ['ma_user', 'hoten', 'diem_danh']
            users_data_json = [dict(zip(user_columns, row)) for row in users_data]

            cur.close()

            return jsonify({
                'lich_thi': lich_thi_data_json,
                'danh_sach_thi': users_data_json
            })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


@app.route('/')
def index():
    return render_template('index.html')

def get_users_for_exam(ma_lich_thi):
    try:
        with app.app_context():
            cur = mysql.connection.cursor()

            # Truy vấn lấy danh sách user từ lịch thi
            cur.execute('''
                SELECT user.ma_user, user.hoten, user.sdt, user.email
                FROM user
                INNER JOIN danh_sach_thi ON user.ma_user = danh_sach_thi.ma_user
                WHERE danh_sach_thi.ma_lich_thi = %s
            ''', (ma_lich_thi,))
            users_data = cur.fetchall()

            cur.close()

            # Chuyển đổi kết quả từ tuple sang danh sách dictionaries
            users_list = []
            for user in users_data:
                user_dict = {
                    'ma_user': user[0],
                    'hoten': user[1],
                    'sdt': user[2],
                    'email': user[3]
                }
                users_list.append(user_dict)

            return users_list

    except Exception as e:
        traceback.print_exc()
        return None

@app.route('/compare', methods=['POST'])
def compare_faces():
    try:
        # Kiểm tra và lấy ma_lich_thi từ dữ liệu form
        ma_lich_thi = request.form.get('ma_lich_thi')
        print(f"ma_lich_thi: {ma_lich_thi}")

        if not ma_lich_thi:
            return jsonify({'error': 'Ma lich thi is required'})

        # Lấy danh sách user từ lịch thi
        users_data = get_users_for_exam(ma_lich_thi)

        print(users_data)

        if not users_data:
            return jsonify({'error': 'Failed to fetch users for exam'})

        if 'file' in request.files:
            # Nếu người dùng upload ảnh từ file
            file = request.files['file']
            group_image_path = os.path.join(temp_face_dir, 'group_image.jpg')
            file.save(group_image_path)
        else:
            return jsonify({'error': 'No file found in request'})

        # Gọi API Rekognition để phân tích và nhận dạng các khuôn mặt trong ảnh nhóm
        response = rekognition_client.detect_faces(
            Image={
                'Bytes': open(group_image_path, 'rb').read()
            },
            Attributes=['DEFAULT']
        )

        # Danh sách các khuôn mặt nhận dạng được
        detected_faces = response['FaceDetails']

        # Danh sách các kết quả so sánh khuôn mặt khớp
        matched_faces = []

        # Nếu có các khuôn mặt được nhận dạng
        for face_detail in detected_faces:
            # Lấy bounding box của khuôn mặt
            bounding_box = face_detail['BoundingBox']

            # Cắt và lưu trữ ảnh khuôn mặt
            face_image_path = os.path.join(temp_face_dir, f'face_{len(matched_faces)+1}.jpg')
            with open(group_image_path, 'rb') as image_file:
                image = Image.open(image_file)
                width, height = image.size
                left = int(width * bounding_box['Left'])
                top = int(height * bounding_box['Top'])
                face_width = int(width * bounding_box['Width'])
                face_height = int(height * bounding_box['Height'])
                face_image = image.crop((left, top, left + face_width, top + face_height))
                face_image.save(face_image_path)

            # Gọi API Rekognition để so sánh khuôn mặt với các ảnh trong S3
            bucket_name = 'zappa-60fsmljw6'
            objects_response = s3_client.list_objects_v2(Bucket=bucket_name)

            for obj in objects_response.get('Contents', []):
                target_image_name = obj['Key']

                # Kiểm tra nếu đối tượng là file hình ảnh (jpg, jpeg, png, gif)
                if target_image_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                    # Gọi API Rekognition để so sánh khuôn mặt
                    compare_response = rekognition_client.compare_faces(
                        SourceImage={
                            'Bytes': open(face_image_path, 'rb').read()
                        },
                        TargetImage={
                            'S3Object': {
                                'Bucket': bucket_name,
                                'Name': target_image_name
                            }
                        }
                    )

                    # Nếu tìm thấy khuôn mặt khớp
                    if len(compare_response['FaceMatches']) > 0:

                        matched_face_name = os.path.splitext(os.path.basename(target_image_name))[0]
                        for user in users_data:
                            if user['hoten'] == matched_face_name:  # Điều kiện so sánh có thể thay đổi tùy vào cách bạn lưu trữ
                                # Cập nhật điểm danh thành True (1)
                                with app.app_context():
                                    cur = mysql.connection.cursor()
                                    cur.execute('''
                                        UPDATE danh_sach_thi
                                        SET diem_danh = TRUE
                                        WHERE ma_lich_thi = %s AND ma_user = %s
                                    ''', (ma_lich_thi, user['ma_user']))
                                    mysql.connection.commit()
                                    cur.close()

                        # Tạo URL công khai cho ảnh từ S3
                        presigned_url = s3_client.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': bucket_name, 'Key': target_image_name},
                            ExpiresIn=3600  # Thời gian URL có hiệu lực (ví dụ: 1 giờ)
                        )
                        matched_faces.append({
                            'source_face': face_image_path,
                            'target_image': {
                                'name':  os.path.splitext(os.path.basename(target_image_name))[0],
                                'url': presigned_url
                            },
                            'similarity': compare_response['FaceMatches'][0]['Similarity']
                        })

        # Trả về kết quả các khuôn mặt khớp được tìm thấy
        return jsonify({'match': True, 'matched_faces': matched_faces})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
