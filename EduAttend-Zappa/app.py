from flask import Flask, render_template, request, jsonify
import boto3
import os
import tempfile
import base64

app = Flask(__name__)

# Khởi tạo client Rekognition và S3
rekognition_client = boto3.client('rekognition', region_name='ap-southeast-2')
s3_client = boto3.client('s3', region_name='ap-southeast-2')  # Thay đổi khu vực AWS tương ứng

# Đường dẫn tạm thời để lưu trữ ảnh tạm
temp_image_dir = tempfile.gettempdir()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compare', methods=['POST'])
def compare_faces():
    try:
        if 'file' in request.files:
            # Nếu người dùng upload ảnh từ file
            file = request.files['file']
            temp_image_path = os.path.join(temp_image_dir, 'face.jpg')
            file.save(temp_image_path)
        elif 'image' in request.files:
            # Nếu người dùng upload ảnh từ camera
            image_data = request.files['image'].read()
            temp_image_path = os.path.join(temp_image_dir, 'face.jpg')
            with open(temp_image_path, 'wb') as f:
                f.write(image_data)
        else:
            return jsonify({'error': 'No file found in request'})

        # Gọi API Rekognition để so sánh khuôn mặt
        with open(temp_image_path, 'rb') as image_file:
            image_data = image_file.read()

        bucket_name = 'zappa-60fsmljw6'  # Thay 'your_bucket_name' bằng tên bucket S3 của bạn
        objects_response = s3_client.list_objects_v2(Bucket=bucket_name)

        if 'Contents' in objects_response:
            for obj in objects_response['Contents']:
                target_image_name = obj['Key']

                response = rekognition_client.compare_faces(
                    SourceImage={
                        'Bytes': image_data
                    },
                    TargetImage={
                        'S3Object': {
                            'Bucket': bucket_name,
                            'Name': target_image_name
                        }
                    }
                )

                print(response)

                if len(response['FaceMatches']) > 0:
                    matched_image_url = s3_client.generate_presigned_url(
                        ClientMethod='get_object',
                        Params={
                            'Bucket': bucket_name,
                            'Key': target_image_name
                        },
                        ExpiresIn=3600  # Thời gian URL được phép tồn tại (tính bằng giây)
                    )

                    return jsonify({'match': True, 'target_image': matched_image_url})

        return jsonify({'match': False})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
