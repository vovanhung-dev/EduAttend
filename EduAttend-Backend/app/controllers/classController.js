// Import các module cần thiết
const db = require('../config/db');

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
};

module.exports = classController;