// Import các module cần thiết
const db = require('../config/db');

const { google } = require('googleapis');
const credentials = require('../config/eduattend-3f61132a1d0b.json');

// Thiết lập Google Sheets API client
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '1v7rLdvX9dO96-GlRRPTEuV4CCx12PoDioHkNzwzMl6Q';

const classController = {
    // Hàm tạo class mới
    createClass: async (req, res) => {
        try {
            const { name, description, image } = req.body;

            const [checkClassExist] = await db.execute('SELECT * FROM class WHERE name = ?', [name]);

            if (checkClassExist.length > 0) {
                return res.status(400).json({ message: 'Class with this name already exists' });
            }

            const createQuery = 'INSERT INTO class (name, description, image) VALUES (?, ?, ?)';
            const values = [name, description, image];

            const [result] = await db.execute(createQuery, values);

            res.status(201).json({ message: 'Class created successfully', classId: result.insertId });
        } catch (error) {
            console.error('Error creating class:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateClass: async (req, res) => {
        try {
            const classId = req.params.id;
            const { name, description, image } = req.body;

            const updateValues = {};

            if (name) updateValues.name = name;
            if (description) updateValues.description = description;
            if (image) updateValues.image = image;

            if (Object.keys(updateValues).length === 0) {
                return res.status(400).json({ message: 'No data to update' });
            }

            let updateQuery = 'UPDATE class SET';
            const updateFields = Object.keys(updateValues);
            updateFields.forEach((field, index) => {
                updateQuery += ` ${field} = ?`;
                if (index < updateFields.length - 1) updateQuery += ',';
            });
            updateQuery += ' WHERE id = ?';

            const values = [...Object.values(updateValues), classId];

            const [result] = await db.execute(updateQuery, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            res.status(200).json({ message: 'Class updated successfully' });
        } catch (error) {
            console.error('Error updating class:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm xóa một class
    deleteClass: async (req, res) => {
        try {
            const classId = req.params.id;

            const deleteQuery = 'DELETE FROM class WHERE id = ?';

            const [result] = await db.execute(deleteQuery, [classId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error) {
            console.error('Error deleting class:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm tìm kiếm class theo tên
    searchClassByName: async (req, res) => {
        try {
            const { name } = req.query;

            const searchQuery = 'SELECT * FROM class WHERE name LIKE ?';
            const searchTerm = `%${name}%`;

            const [classes] = await db.execute(searchQuery, [searchTerm]);

            res.status(200).json({ classes });
        } catch (error) {
            console.error('Error searching class by name:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getAllClasses: async (req, res) => {
        try {
            const query = 'SELECT * FROM class';

            const [classes] = await db.execute(query);

            res.status(200).json({ classes });
        } catch (error) {
            console.error('Error getting all classes:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm lấy thông tin của một class theo ID
    getClassById: async (req, res) => {
        try {
            const classId = req.params.id;

            const query = 'SELECT * FROM class WHERE id = ?';

            const [classInfo] = await db.execute(query, [classId]);

            if (classInfo.length === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            res.status(200).json({ classInfo: classInfo[0] });
        } catch (error) {
            console.error('Error getting class by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    addUserToClass: async (req, res) => {
        try {
            const { userId, classId } = req.body;

            // Validate that the user exists and has the role 'isClient'
            const [user] = await db.execute('SELECT * FROM users WHERE id = ? AND role = ?', [userId, 'isStudent']);

            if (user.length === 0) {
                return res.status(400).json({ message: 'User does not exist or does not have the role isStudent' });
            }

            // Check if the class exists
            const [classData] = await db.execute('SELECT * FROM class WHERE id = ?', [classId]);
            if (classData.length === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            // Add the user to the class
            const insertQuery = 'INSERT INTO class_users (class_id, user_id) VALUES (?, ?)';
            await db.execute(insertQuery, [classId, userId]);

            res.status(200).json({ message: 'User added to class successfully' });
        } catch (error) {
            console.error('Error adding user to class:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Hàm lấy danh sách sinh viên theo ID của lớp
    getStudentsByClassId: async (req, res) => {
        try {
            const classId = req.params.id;

            // Kiểm tra xem lớp học có tồn tại hay không
            const [classExists] = await db.execute('SELECT * FROM class WHERE id = ?', [classId]);
            if (classExists.length === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            // Truy vấn danh sách sinh viên thuộc lớp
            const query = `
                SELECT users.id, users.username, users.email , users.image
                FROM users 
                INNER JOIN class_users ON users.id = class_users.user_id
                WHERE class_users.class_id = ?
            `;
            const [students] = await db.execute(query, [classId]);

            res.status(200).json({ students });
        } catch (error) {
            console.error('Error getting students by class ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    removeUserFromClass: async (req, res) => {
        try {
            const { userId, classId } = req.body;

            // Kiểm tra xem sinh viên có tồn tại trong lớp học hay không
            const [userInClass] = await db.execute('SELECT * FROM class_users WHERE class_id = ? AND user_id = ?', [classId, userId]);

            if (userInClass.length === 0) {
                return res.status(404).json({ message: 'User is not enrolled in this class' });
            }

            // Xóa sinh viên khỏi lớp học
            const deleteQuery = 'DELETE FROM class_users WHERE class_id = ? AND user_id = ?';
            await db.execute(deleteQuery, [classId, userId]);

            res.status(200).json({ message: 'User removed from class successfully' });
        } catch (error) {
            console.error('Error removing user from class:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    createExamSchedule: async (req, res) => {
        try {
            const { subject, classId, teacherId, examDate, startTime, endTime, room } = req.body;

            // Kiểm tra xem lớp học có tồn tại hay không
            const [classExists] = await db.execute('SELECT * FROM class WHERE id = ?', [classId]);
            if (classExists.length === 0) {
                return res.status(404).json({ message: 'Lớp học không tồn tại' });
            }

            // Kiểm tra xem giáo viên có tồn tại và có vai trò là 'teacher' hay không
            const [teacherExists] = await db.execute('SELECT * FROM users WHERE id = ? AND role = ?', [teacherId, 'isTeacher']);
            if (teacherExists.length === 0) {
                return res.status(404).json({ message: 'Giáo viên không tồn tại hoặc không có vai trò là giáo viên' });
            }

            // Lấy tên lớp và tên giáo viên
            const className = classExists[0].name;
            const teacherName = teacherExists[0].username;

            // Lấy danh sách sinh viên của lớp
            const studentQuery = `
                SELECT u.id, u.username, u.email, u.image 
                FROM users u
                INNER JOIN class_users cu ON u.id = cu.user_id
                WHERE cu.class_id = ?
            `;
            const [students] = await db.execute(studentQuery, [classId]);

            const { data } = await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: false,
            });

            const sheetTitleExists = `${classId}-${subject}-${examDate}-${room}`;
            const sheetExists = data.sheets.some(sheet => sheet.properties.title === sheetTitleExists);

            if (sheetExists) {
                return res.status(200).json({ message: 'Sheet với tiêu đề này đã tồn tại' });
            }

            // Tạo sheet mới trên Google Sheets
            const response = await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: `${classId}-${subject}-${examDate}-${room}`
                                }
                            }
                        }
                    ]
                }
            });

            const sheetId = response.data.replies[0].addSheet.properties.sheetId;
            const sheetTitle = response.data.replies[0].addSheet.properties.title;

            // Tạo lịch thi mới
            const createQuery = `
             INSERT INTO exam_schedule (subject, class_id, teacher_id, exam_date, start_time, end_time, room)
             VALUES (?, ?, ?, ?, ?, ?, ?)
         `;
            const values = [subject, classId, teacherId, examDate, startTime, endTime, room];

            const [result] = await db.execute(createQuery, values);

            // Thêm dữ liệu vào sheet mới
            const studentRows = students.map(student => [student.id, student.username, student.email, student.image]);
            const sheetData = [
                [`Thông tin thi của môn ${subject} tại lớp ${className} với giáo viên giám thị là ${teacherName}`], // Tiêu đề sheet
                ['Môn học', 'Mã lớp', 'Tên lớp', 'Mã giáo viên', 'Tên giáo viên', 'Ngày thi', 'Giờ bắt đầu', 'Giờ kết thúc', 'Phòng thi'],
                [subject, classId, className, teacherId, teacherName, examDate, startTime, endTime, room],
                [],
                ['Danh sách sinh viên'],
                ['Mã sinh viên', 'Tên sinh viên', 'Email', 'Ảnh'],
                ...studentRows
            ];

            // Cập nhật dữ liệu vào sheet mới
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetTitle}!A1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: sheetData
                }
            });

            // Định dạng sheet
            const formatRequests = [
                // Định dạng tiêu đề chính
                {
                    mergeCells: {
                        range: {
                            sheetId,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: 9,
                        },
                        mergeType: 'MERGE_ALL'
                    }
                },
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: 9,
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER',
                                textFormat: {
                                    fontSize: 16,
                                    bold: true,
                                    foregroundColor: {
                                        red: 0.2,
                                        green: 0.2,
                                        blue: 0.7
                                    }
                                },
                                backgroundColor: {
                                    red: 0.9,
                                    green: 0.9,
                                    blue: 0.98
                                }
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                // Định dạng tiêu đề các cột thông tin thi
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: 1,
                            endRowIndex: 2,
                            startColumnIndex: 0,
                            endColumnIndex: 9,
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: {
                                    red: 0.8,
                                    green: 0.9,
                                    blue: 1
                                },
                                textFormat: {
                                    bold: true,
                                    foregroundColor: {
                                        red: 0.1,
                                        green: 0.1,
                                        blue: 0.6
                                    }
                                },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                // Định dạng tiêu đề danh sách sinh viên và hợp nhất ô
                {
                    mergeCells: {
                        range: {
                            sheetId,
                            startRowIndex: 4,
                            endRowIndex: 5,
                            startColumnIndex: 0,
                            endColumnIndex: 4,
                        },
                        mergeType: 'MERGE_ALL'
                    }
                },
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: 4,
                            endRowIndex: 5,
                            startColumnIndex: 0,
                            endColumnIndex: 4,
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER',
                                textFormat: {
                                    bold: true,
                                    fontSize: 14,
                                    foregroundColor: {
                                        red: 0.3,
                                        green: 0.3,
                                        blue: 0.3
                                    }
                                },
                                backgroundColor: {
                                    red: 0.85,
                                    green: 0.95,
                                    blue: 0.85
                                }
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                // Định dạng tiêu đề các cột trong danh sách sinh viên
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: 5,
                            endRowIndex: 6,
                            startColumnIndex: 0,
                            endColumnIndex: 4,
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: {
                                    red: 0.8,
                                    green: 0.9,
                                    blue: 0.8
                                },
                                textFormat: {
                                    bold: true,
                                    foregroundColor: {
                                        red: 0.2,
                                        green: 0.5,
                                        blue: 0.2
                                    }
                                },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                // Căn giữa thông tin chung
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: 2,
                            endRowIndex: 3,
                            startColumnIndex: 0,
                            endColumnIndex: 9,
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(horizontalAlignment)'
                    }
                }
            ];

            // Gửi yêu cầu định dạng
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: formatRequests
                }
            });

            res.status(201).json({ message: 'Tạo lịch thi thành công', examId: result.insertId });
        } catch (error) {
            console.error('Lỗi khi tạo lịch thi:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    },


    getAllExamSchedules: async (req, res) => {
        try {
            // Query lấy thông tin từ bảng exam_schedule, class và users
            const query = `
                SELECT 
                    es.id,
                    es.subject,
                    es.class_id,
                    c.name AS className,
                    es.teacher_id,
                    u.username AS teacherName,
                    es.exam_date,
                    es.start_time,
                    es.end_time,
                    es.room,
                    es.created_at,
                    es.updated_at
                FROM 
                    exam_schedule es
                LEFT JOIN 
                    class c ON es.class_id = c.id
                LEFT JOIN 
                    users u ON es.teacher_id = u.id
            `;

            // Thực thi query
            const [schedules] = await db.execute(query);

            // Trả về kết quả
            res.status(200).json({ schedules });
        } catch (error) {
            console.error('Error getting all exam schedules:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getExamScheduleById: async (req, res) => {
        try {
            const examId = req.params.id;

            // Query lấy thông tin từ bảng exam_schedule, class và users cho một lịch thi cụ thể
            const query = `
                SELECT 
                    es.id,
                    es.subject,
                    es.class_id,
                    c.name AS className,
                    es.teacher_id,
                    u.username AS teacherName,
                    es.exam_date,
                    es.start_time,
                    es.end_time,
                    es.room,
                    es.created_at,
                    es.updated_at
                FROM 
                    exam_schedule es
                LEFT JOIN 
                    class c ON es.class_id = c.id
                LEFT JOIN 
                    users u ON es.teacher_id = u.id
                WHERE 
                    es.id = ?
            `;

            // Thực thi query với examId
            const [scheduleInfo] = await db.execute(query, [examId]);

            // Kiểm tra nếu không tìm thấy lịch thi
            if (scheduleInfo.length === 0) {
                return res.status(404).json({ message: 'Exam schedule not found' });
            }

            // Trả về kết quả
            res.status(200).json({ scheduleInfo: scheduleInfo[0] });
        } catch (error) {
            console.error('Error getting exam schedule by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    searchExamSchedule: async (req, res) => {
        try {
            const { name } = req.query;

            // Tìm kiếm theo tên (subject) trong bảng exam_schedule
            const query = `
                SELECT 
                    es.id,
                    es.subject,
                    es.class_id,
                    c.name AS className,
                    es.teacher_id,
                    u.username AS teacherName,
                    es.exam_date,
                    es.start_time,
                    es.end_time,
                    es.room,
                    es.created_at,
                    es.updated_at
                FROM 
                    exam_schedule es
                LEFT JOIN 
                    class c ON es.class_id = c.id
                LEFT JOIN 
                    users u ON es.teacher_id = u.id
                WHERE 
                    es.subject LIKE ?
            `;

            // Sử dụng phần trăm (%) để tìm kiếm các đối tượng có chứa từ khóa trong tên (subject)
            const [schedules] = await db.execute(query, [`%${name}%`]);

            // Trả về kết quả tìm kiếm
            res.status(200).json({ schedules });
        } catch (error) {
            console.error('Error searching exam schedules:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },


    updateExamSchedule: async (req, res) => {
        try {
            const examId = req.params.id;
            const { subject, classId, teacherId, examDate, startTime, endTime, room } = req.body;

            // Kiểm tra xem lịch thi có tồn tại hay không
            const [examExists] = await db.execute('SELECT * FROM exam_schedule WHERE id = ?', [examId]);
            if (examExists.length === 0) {
                return res.status(404).json({ message: 'Exam schedule not found' });
            }

            // Kiểm tra xem lớp học có tồn tại hay không
            const [classExists] = await db.execute('SELECT * FROM class WHERE id = ?', [classId]);
            if (classExists.length === 0) {
                return res.status(404).json({ message: 'Class not found' });
            }

            // Kiểm tra xem giáo viên có tồn tại và có vai trò là 'teacher' hay không
            const [teacherExists] = await db.execute('SELECT * FROM users WHERE id = ? AND role = ?', [teacherId, 'isTeacher']);
            if (teacherExists.length === 0) {
                return res.status(404).json({ message: 'Teacher not found or is not a teacher' });
            }


            // Tìm và cập nhật Google Sheet tương ứng
            const { data } = await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: false,
            });

            // Tạo tiêu đề sheet dựa trên các thông tin cập nhật
            const sheetTitle = `${classId}-${subject}-${examDate}-${room}`;

            const [currentExamSchedule] = await db.execute('SELECT * FROM exam_schedule WHERE id = ?', [examId]);
            if (currentExamSchedule.length === 0) {
                return res.status(404).json({ message: 'Exam schedule not found' });
            }
            const formattedExamDate = new Date(currentExamSchedule[0].exam_date).toISOString().split('T')[0];

            // Tìm sheet dựa trên tiêu đề hiện tại của lịch thi
            const currentSheetTitle = `${currentExamSchedule[0].class_id}-${currentExamSchedule[0].subject}-${examDate}-${currentExamSchedule[0].room}`;
            console.log(currentSheetTitle)
            const sheet = data.sheets.find(sheet => sheet.properties.title === currentSheetTitle);

            if (sheet) {
                const sheetId = sheet.properties.sheetId;

                // Cập nhật tiêu đề sheet nếu có thay đổi
                if (sheetTitle !== currentSheetTitle) {
                    await sheets.spreadsheets.batchUpdate({
                        spreadsheetId,
                        requestBody: {
                            requests: [
                                {
                                    updateSheetProperties: {
                                        properties: {
                                            sheetId,
                                            title: sheetTitle
                                        },
                                        fields: 'title'
                                    }
                                }
                            ]
                        }
                    });
                }

                // Cập nhật dữ liệu vào sheet
                const studentRows = students.map(student => [student.id, student.username, student.email, student.image]);
                const sheetData = [
                    [`Thông tin thi của môn ${subject} tại lớp ${className} với giáo viên giám thị là ${teacherName}`], // Tiêu đề sheet
                    ['Môn học', 'Mã lớp', 'Tên lớp', 'Mã giáo viên', 'Tên giáo viên', 'Ngày thi', 'Giờ bắt đầu', 'Giờ kết thúc', 'Phòng thi'],
                    [subject, classId, className, teacherId, teacherName, examDate, startTime, endTime, room],
                    [],
                    ['Danh sách sinh viên'],
                    ['Mã sinh viên', 'Tên sinh viên', 'Email', 'Ảnh'],
                    ...studentRows
                ];

                // Xóa dữ liệu cũ từ vị trí bắt đầu dữ liệu trong sheet
                await sheets.spreadsheets.values.clear({
                    spreadsheetId,
                    range: `${sheetTitle}!A1:Z`
                });

                // Thêm dữ liệu mới vào sheet
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${sheetTitle}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: sheetData
                    }
                });


                // Lấy tên lớp và tên giáo viên
                const className = classExists[0].name;
                const teacherName = teacherExists[0].username;

                // Lấy danh sách sinh viên hiện tại của lớp
                const studentQuery = `
                SELECT u.id, u.username, u.email, u.image 
                FROM users u
                INNER JOIN class_users cu ON u.id = cu.user_id
                WHERE cu.class_id = ?
            `;
                const [students] = await db.execute(studentQuery, [classId]);

                // Cập nhật thông tin lịch thi trong cơ sở dữ liệu
                const updateQuery = `
                UPDATE exam_schedule
                SET subject = ?, class_id = ?, teacher_id = ?, exam_date = ?, start_time = ?, end_time = ?, room = ?
                WHERE id = ?
            `;
                const values = [subject, classId, teacherId, examDate, startTime, endTime, room, examId];
                const [result] = await db.execute(updateQuery, values);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Exam schedule not found' });
                }
            } else {
                return res.status(404).json({ message: 'Google Sheet not found for the specified exam schedule' });
            }

            res.status(200).json({ message: 'Exam schedule updated successfully' });
        } catch (error) {
            console.error('Error updating exam schedule:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },


    deleteExamSchedule: async (req, res) => {
        try {
            const examId = req.params.id;

            const deleteQuery = 'DELETE FROM exam_schedule WHERE id = ?';

            const [result] = await db.execute(deleteQuery, [examId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Exam schedule not found' });
            }

            res.status(200).json({ message: 'Exam schedule deleted successfully' });
        } catch (error) {
            console.error('Error deleting exam schedule:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = classController;