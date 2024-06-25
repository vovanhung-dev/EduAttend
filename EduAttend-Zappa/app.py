from flask import Flask, render_template, request, jsonify
import boto3
import os
import tempfile
from PIL import Image  # Import thư viện Image từ PIL
import traceback

app = Flask(__name__)

# Khởi tạo client Rekognition và S3
rekognition_client = boto3.client('rekognition', region_name='ap-southeast-2')
s3_client = boto3.client('s3', region_name='ap-southeast-2')  # Thay đổi khu vực AWS tương ứng

# Đường dẫn tạm thời để lưu trữ các khuôn mặt được nhận dạng
temp_face_dir = tempfile.gettempdir()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compare', methods=['POST'])
def compare_faces():
    try:
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
    app.run(debug=True)
