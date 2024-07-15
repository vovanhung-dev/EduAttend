const db = require('../config/db');

const examController = {
    getAllExams: async (req, res) => {
        try {
            const query = 'SELECT * FROM exams';
            const [exams] = await db.execute(query);
            res.status(200).json({ data: exams });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getExamListByExamId: async (req, res) => {
        const examId = req.params.id;
        try {
            const query = `
                SELECT exam_list.*, users.*, exams.date, exams.subject, exams.room
                FROM exam_list
                INNER JOIN users ON exam_list.user_id = users.id
                INNER JOIN exams ON exam_list.exam_id = exams.exam_id
                WHERE exam_list.exam_id = ?
            `;
            const [examList] = await db.execute(query, [examId]);
            res.status(200).json({ data: examList });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteStudentFromExamList: async (req, res) => {

        const { examId, userId } = req.body;

        try {
            if (!Number.isInteger(examId) || !Number.isInteger(userId)) {
                return res.status(400).json({ message: 'Invalid examId or userId' });
            }

            const deleteQuery = 'DELETE FROM exam_list WHERE exam_id = ? AND user_id = ?';
            const [result] = await db.execute(deleteQuery, [examId, userId]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found in the exam list' });
            }
            res.status(200).json({ message: 'Student removed from exam list successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    addStudentToExamList: async (req, res) => {
        const { examId, userId } = req.body;

        try {
            // Check if the exam and user exist
            const examQuery = 'SELECT * FROM exams WHERE exam_id = ?';
            const [exam] = await db.execute(examQuery, [examId]);
            if (exam.length === 0) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            const userQuery = 'SELECT * FROM users WHERE id = ?';
            const [user] = await db.execute(userQuery, [userId]);
            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the student is already in the exam list
            const checkQuery = 'SELECT * FROM exam_list WHERE exam_id = ? AND user_id = ?';
            const [existingStudent] = await db.execute(checkQuery, [examId, userId]);
            if (existingStudent.length > 0) {
                return res.status(400).json({ message: 'Student already assigned to the exam' });
            }

            // Add student to exam_list
            const insertQuery = 'INSERT INTO exam_list (exam_id, user_id) VALUES (?, ?)';
            await db.execute(insertQuery, [examId, userId]);

            res.status(201).json({ message: 'Student added to exam list successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    addStudentToExamList2: async (req, res) => {
        const { examId, studentId } = req.body;
    
        try {
            // Check if the exam and student exist
            const examQuery = 'SELECT * FROM exams WHERE exam_id = ?';
            const [exam] = await db.execute(examQuery, [examId]);
            if (exam.length === 0) {
                return res.status(404).json({ message: 'Exam not found' });
            }
    
            // Find the user_id associated with the student_id
            const userQuery = 'SELECT id FROM users WHERE student_id = ?';
            const [user] = await db.execute(userQuery, [studentId]);
            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userId = user[0].id;
    
            // Check if the student is already in the exam list
            const checkQuery = 'SELECT * FROM exam_list WHERE exam_id = ? AND user_id = ?';
            const [existingStudent] = await db.execute(checkQuery, [examId, userId]);
            if (existingStudent.length > 0) {
                return res.status(400).json({ message: 'Student already assigned to the exam' });
            }
    
            // Add student to exam_list
            const insertQuery = 'INSERT INTO exam_list (exam_id, user_id) VALUES (?, ?)';
            await db.execute(insertQuery, [examId, userId]);
    
            res.status(201).json({ message: 'Student added to exam list successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },


    getExamById: async (req, res) => {
        const examId = req.params.id;
        try {
            const query = 'SELECT * FROM exams WHERE exam_id = ?';
            const [exam] = await db.execute(query, [examId]);
            if (exam.length === 0) {
                res.status(404).json({ message: 'Exam not found' });
            } else {
                res.status(200).json({ data: exam[0] });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    createExam: async (req, res) => {
        const { date, subject, room, invigilator_1, invigilator_2, invigilator_3, invigilator_4 } = req.body;
        try {
            let fields = [];
            let values = [];

            if (date) {
                fields.push('date');
                values.push(date);
            }
            if (subject) {
                fields.push('subject');
                values.push(subject);
            }
            if (room) {
                fields.push('room');
                values.push(room);
            }
            if (invigilator_1 !== undefined) {
                fields.push('invigilator_1');
                values.push(invigilator_1);
            }
            if (invigilator_2 !== undefined) {
                fields.push('invigilator_2');
                values.push(invigilator_2);
            }
            if (invigilator_3 !== undefined) {
                fields.push('invigilator_3');
                values.push(invigilator_3);
            }
            if (invigilator_4 !== undefined) {
                fields.push('invigilator_4');
                values.push(invigilator_4);
            }

            if (fields.length === 0) {
                return res.status(400).json({ message: 'No valid fields provided for creating exam' });
            }

            const placeholders = fields.map(() => '?').join(', ');
            const query = `INSERT INTO exams (${fields.join(', ')}) VALUES (${placeholders})`;
            const [result] = await db.execute(query, values);

            const examId = result.insertId;
            res.status(201).json({ message: 'Exam created successfully', exam_id: examId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateExam: async (req, res) => {
        const examId = req.params.id;
        const { date, subject, room, invigilator_1, invigilator_2, invigilator_3, invigilator_4 } = req.body;
        try {
            const query = 'UPDATE exams SET date = ?, subject = ?, room = ?, invigilator_1 = ?, invigilator_2 = ?, invigilator_3 = ?, invigilator_4 = ? WHERE exam_id = ?';
            const [result] = await db.execute(query, [date, subject, room, invigilator_1, invigilator_2, invigilator_3, invigilator_4, examId]);
            if (result.affectedRows === 0) {
                res.status(404).json({ message: 'Exam not found' });
            } else {
                res.status(200).json({ message: 'Exam updated successfully' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteExam: async (req, res) => {
        const examId = req.params.id;
        try {
            const query = 'DELETE FROM exams WHERE exam_id = ?';
            const [result] = await db.execute(query, [examId]);
            if (result.affectedRows === 0) {
                res.status(404).json({ message: 'Exam not found' });
            } else {
                res.status(200).json({ message: 'Exam deleted successfully' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    searchExams: async (req, res) => {
        const keyword = req.query.keyword;
        try {
            const query = 'SELECT * FROM exams WHERE subject LIKE ? OR room LIKE ?';
            const [exams] = await db.execute(query, [`%${keyword}%`, `%${keyword}%`]);
            res.status(200).json({ data: exams });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = examController;
