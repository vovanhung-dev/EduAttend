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

            // Thống kê số lượng kỳ thi
            const [examsCount] = await db.execute(`
                SELECT COUNT(*) AS total_exams
                FROM exams
            `);

            // Thống kê số lượng tài khoản
            const [accountsCount] = await db.execute(`
                SELECT COUNT(*) AS total_accounts
                FROM users
            `);

            // Trả về kết quả dưới dạng JSON
            res.status(200).json({
                studentParticipation,
                examsCount,
                accountsCount
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = statisticsController;
