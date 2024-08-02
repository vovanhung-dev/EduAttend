from flask import Flask, render_template, request, jsonify
import boto3
from flask_mysqldb import MySQL
import os
import tempfile
from PIL import Image  # Import thư viện Image từ PIL
import traceback
from flask import session

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'database-1.cpqwqaawsjr7.ap-southeast-2.rds.amazonaws.com'
app.config['MYSQL_USER'] = 'admin'
app.config['MYSQL_PASSWORD'] = 'Vovanhung77h'
app.config['MYSQL_DB'] = 'eduattend'
app.config['MYSQL_PORT'] = 3306

mysql = MySQL(app)

# Khởi tạo client Rekognition và S3
rekognition_client = boto3.client('rekognition', region_name='ap-southeast-2', aws_access_key_id='AKIAZQ3DR2KZG7ZGRQHV', 
                         aws_secret_access_key='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')
s3_client = boto3.client('s3', 
                         region_name='ap-southeast-2', 
                         aws_access_key_id='AKIAZQ3DR2KZG7ZGRQHV', 
                         aws_secret_access_key='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')


# Đường dẫn tạm thời để lưu trữ các khuôn mặt được nhận dạng
temp_face_dir = tempfile.gettempdir()

# Route để lấy danh sách các lịch thi

@app.route('/lich_thi', methods=['GET'])
def get_lich_thi_list():
    try:
        # Lấy user_id từ session
        user_id = request.cookies.get('user_id')

        print(user_id)

        with app.app_context():
            cur = mysql.connection.cursor()

            # Truy vấn lấy danh sách các lịch thi và các giám thị
            cur.execute('''
                SELECT exams.exam_id AS ma_lich_thi, exams.date AS ngay, exams.subject AS mon_hoc, exams.room AS phong, 
                    exams.invigilator_1 AS giam_thi_1, exams.invigilator_2 AS giam_thi_2, 
                    exams.invigilator_3 AS giam_thi_3, exams.invigilator_4 AS giam_thi_4
                FROM exams
            ''')
            lich_thi_list = cur.fetchall()


            # Lọc các giám thị trùng với user_id
            lich_thi_list_json = []
            for row in lich_thi_list:
                exam = {
                    'ma_lich_thi': row[0],
                    'ngay': row[1],
                    'mon_hoc': row[2],
                    'phong': row[3],
                    'giam_thi_1': row[4],
                    'giam_thi_2': row[5],
                    'giam_thi_3': row[6],
                    'giam_thi_4': row[7]
                }
                print(exam)

                for key in ['giam_thi_1', 'giam_thi_2', 'giam_thi_3', 'giam_thi_4']:
                    if exam[key] is not None and int(exam[key]) == int(user_id):
                        print("đã vô")
                        lich_thi_list_json.append(exam)
                        break


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
               SELECT exams.exam_id AS ma_lich_thi, exams.date AS ngay, exams.subject AS mon_hoc, exams.room AS phong, 
                    user_1.username AS giam_thi_1, user_2.username AS giam_thi_2, 
                    user_3.username AS giam_thi_3, user_4.username AS giam_thi_4
                FROM exams
                LEFT JOIN users AS user_1 ON exams.invigilator_1 = user_1.id
                LEFT JOIN users AS user_2 ON exams.invigilator_2 = user_2.id
                LEFT JOIN users AS user_3 ON exams.invigilator_3 = user_3.id
                LEFT JOIN users AS user_4 ON exams.invigilator_4 = user_4.id
                WHERE exams.exam_id = %s
            ''', (ma_lich_thi,))
            lich_thi_data = cur.fetchone()

            if not lich_thi_data:
                return jsonify({'error': 'Lich thi not found'})

            # Chuyển đổi dữ liệu lịch thi thành dictionary
            lich_thi_columns = ['ma_lich_thi', 'ngay', 'mon_hoc', 'phong', 'giam_thi_1', 'giam_thi_2', 'giam_thi_3', 'giam_thi_4']
            lich_thi_data_json = dict(zip(lich_thi_columns, lich_thi_data))

           # Truy vấn lấy danh sách user tham gia thi với thêm trường student_id
            cur.execute('''
                SELECT exam_list.user_id AS ma_user, users.username AS hoten, users.student_id, exam_list.attendance AS diem_danh
                FROM exam_list
                INNER JOIN users ON exam_list.user_id = users.id
                WHERE exam_list.exam_id = %s
            ''', (ma_lich_thi,))
            users_data = cur.fetchall()


           # Chuyển đổi dữ liệu danh sách thi thành danh sách dictionary với student_id
            user_columns = ['ma_user', 'hoten', 'student_id', 'diem_danh']
            users_data_json = [dict(zip(user_columns, row)) for row in users_data]

            cur.close()

            return jsonify({
                'lich_thi': lich_thi_data_json,
                'danh_sach_thi': users_data_json
            })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

@app.route('/update_attendance', methods=['POST'])
def update_attendance():
    try:
        data = request.get_json()
        exam_id = data.get('exam_id')
        user_id = data.get('user_id')
        new_status = data.get('new_status')

        if not exam_id or not user_id or new_status is None:
            return jsonify({'error': 'Exam ID, User ID and new status are required'}), 400

        with app.app_context():
            cur = mysql.connection.cursor()
            cur.execute('''
                UPDATE exam_list
                SET attendance = %s
                WHERE exam_id = %s AND user_id = %s
            ''', (new_status, exam_id, user_id))
            mysql.connection.commit()
            cur.close()

        return jsonify({'success': True, 'message': 'Attendance status updated successfully'})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login')
def login2():
    return render_template('login.html')

@app.route('/dashboard')
def index():
    return render_template('index.html')

def get_users_for_exam(ma_lich_thi):
    try:
        with app.app_context():
            cur = mysql.connection.cursor()

            # Truy vấn lấy danh sách user từ lịch thi
            cur.execute('''
                SELECT exam_list.user_id AS ma_user, users.username AS hoten, users.phone AS sdt, users.email, users.student_id
                FROM exam_list
                INNER JOIN users ON exam_list.user_id = users.id
                WHERE exam_list.exam_id = %s
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
                    'email': user[3],
                    'student_id': user[4]
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
        attended_students = []

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
                        matched_face_name = os.path.splitext(os.path.basename(target_image_name))[0].split('-')[0]
                        for user in users_data:
                            if user['student_id'] == matched_face_name:  # Điều kiện so sánh có thể thay đổi tùy vào cách bạn lưu trữ
                                # Cập nhật điểm danh thành True (1)
                                with app.app_context():
                                    cur = mysql.connection.cursor()
                                    cur.execute('''
                                        UPDATE exam_list
                                        SET attendance = TRUE
                                        WHERE exam_id = %s AND user_id = %s
                                    ''', (ma_lich_thi, user['ma_user']))
                                    mysql.connection.commit()
                                    cur.close()

                                # Thêm thông tin sinh viên vào danh sách đã điểm danh
                                attended_students.append(user)

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

        # Trả về kết quả các khuôn mặt khớp được tìm thấy cùng danh sách sinh viên đã điểm danh
        return jsonify({'match': True, 'matched_faces': matched_faces, 'attended_students': attended_students})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
