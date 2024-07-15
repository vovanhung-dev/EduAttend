const db = require('../config/db');

const statisticsController = {
    getAllStatistics: async (req, res) => {
        try {
            // Thống kê số lượng học sinh tham gia các kỳ thi
            const [studentParticipation] = await db.execute(`
                SELECT e.exam_id, e.subject, COUNT(el.user_id) AS student_count
                FROM exams e
                LEFT JOIN exam_list el ON e.exam_id = el.exam_id
                GROUP BY e.exam_id, e.subject
            `);

            // Thống kê số lượng kỳ thi trong mỗi lớp
            const [examsPerClass] = await db.execute(`
                SELECT c.name AS class_name, COUNT(es.id) AS exam_count
                FROM class c
                LEFT JOIN exam_schedule es ON c.id = es.class_id
                GROUP BY c.name
            `);

            // Thống kê số lượng học sinh trong mỗi lớp
            const [studentsPerClass] = await db.execute(`
                SELECT c.name AS class_name, COUNT(cu.user_id) AS student_count
                FROM class c
                LEFT JOIN class_users cu ON c.id = cu.class_id
                GROUP BY c.name
            `);

            // Trả về kết quả dưới dạng JSON
            res.status(200).json({
                studentParticipation,
                examsPerClass,
                studentsPerClass
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = statisticsController;
