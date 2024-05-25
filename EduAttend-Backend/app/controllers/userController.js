const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _const = require('../config/constant');

const userController = {
    getAllUsers: async (req, res) => {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10000;
        const offset = (page - 1) * limit;

        try {
            const query = `SELECT * FROM users LIMIT ${offset}, ${limit}`;

            const [users] = await db.execute(query);
            res.status(200).json({ data: users });
        } catch (err) {
            res.status(500).json(err);
        }
    },


    createUser: async (req, res) => {
        try {
            const inputEmail = req.body.email;
            const inputPhone = req.body.phone;
    
            // Check if email already exists
            const [checkEmailExist] = await db.execute('SELECT * FROM users WHERE email = ?', [inputEmail]);
            if (checkEmailExist.length > 0) {
                return res.status(200).json("User with this email already exists");
            }
    
            // Check if phone already exists
            const [checkPhoneExist] = await db.execute('SELECT * FROM users WHERE phone = ?', [inputPhone]);
            if (checkPhoneExist.length > 0) {
                return res.status(200).json("User with this phone number already exists");
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
    
            const { email, phone, username, role, status } = req.body;
    
            const values = [email || null, phone || null, username || null, hashed || null, role || null, status || null];
    
            const query = 'INSERT INTO users (email, phone, username, password, role, status) VALUES (?, ?, ?, ?, ?, ?)';
    
            const [result] = await db.execute(query, values);
            const userId = result.insertId;
    
            res.status(200).json({ id: userId, email, phone, username, role, status });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    


    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            const [checkUserExist] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

            if (checkUserExist.length === 0) {
                return res.status(404).json("User not found");
            }

            const deleteQuery = 'DELETE FROM users WHERE id = ?';
            await db.execute(deleteQuery, [userId]);

            res.status(200).json("Delete success");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, email, password, role, phone, status } = req.body;
    
            const [checkEmailExist] = await db.execute('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
    
            if (checkEmailExist.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
    
            const updateFields = [];
            const updateValues = [];
    
            if (username) {
                updateFields.push('username = ?');
                updateValues.push(username);
            }
            if (email) {
                updateFields.push('email = ?');
                updateValues.push(email);
            }
            if (password) {
                updateFields.push('password = ?');
                updateValues.push(password);
            }
            if (role) {
                updateFields.push('role = ?');
                updateValues.push(role);
            }
            if (phone) {
                updateFields.push('phone = ?');
                updateValues.push(phone);
            }
            if (status) {
                updateFields.push('status = ?');
                updateValues.push(status);
            }
    
            if (updateFields.length === 0) {
                return res.status(400).json({ message: 'No fields to update' });
            }
    
            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            const updatedValues = [...updateValues, userId];
    
            const [result] = await db.execute(updateQuery, updatedValues);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.status(200).json("Update success");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    

    logout: async (req, res) => {
    },

    searchUserByEmail: async (req, res) => {
        const email = req.query.email;
    
        try {
            const query = 'SELECT * FROM users WHERE email LIKE ?';
            const searchTerm = `%${email}%`;
    
            const [userList] = await db.execute(query, [searchTerm]);
            res.status(200).json({ data: userList });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    

    getProfile: async (req, res) => {
        jwt.verify(req.headers.authorization, _const.JWT_ACCESS_KEY, async (err, decodedToken) => {
            if (err) {
                res.status(401).send('Unauthorized');
            } else {
                try {
                    const userId = decodedToken.user.id;

                    console.log(decodedToken)
    
                    // Thực hiện truy vấn để lấy thông tin người dùng dựa trên userId
                    const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
                    if (user.length === 0) {
                        return res.status(404).json({ message: 'User not found' });
                    }
    
                    // Trả về thông tin người dùng theo định dạng yêu cầu
                    const formattedUser = {
                        user: {
                            id: user[0].id,
                            email: user[0].email,
                            phone: user[0].phone,
                            username: user[0].username,
                            password: user[0].password,
                            role: user[0].role,
                            status: user[0].status,
                            image: user[0].image,
                            created_at: user[0].created_at,
                            updated_at: user[0].updated_at
                        },
                        iat: decodedToken.iat,
                        exp: decodedToken.exp
                    };
    
                    res.status(200).json(formattedUser);
                } catch (err) {
                    console.log(err);
                    res.status(500).json(err);
                }
            }
        });
    },
    

    updateProfile: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, email, phone, status, image, role } = req.body;
    
            const updateFields = [];
            const updatedValues = [];
    
            if (username) {
                updateFields.push('username = ?');
                updatedValues.push(username);
            }
            if (email) {
                updateFields.push('email = ?');
                updatedValues.push(email);
            }
            if (phone) {
                updateFields.push('phone = ?');
                updatedValues.push(phone);
            }
            if (status) {
                updateFields.push('status = ?');
                updatedValues.push(status);
            }
            if (image) {
                updateFields.push('image = ?');
                updatedValues.push(image);
            }
            if (role) {
                updateFields.push('role = ?');
                updatedValues.push(role);
            }
    
            if (updateFields.length === 0) {
                return res.status(400).json({ message: 'No fields to update' });
            }
    
            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            updatedValues.push(userId);
    
            const [result] = await db.execute(updateQuery, updatedValues);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.status(200).json("Profile updated successfully");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    

    changePassword: async (req, res) => {
        try {
            const userId = req.params.id;
            const { currentPassword, newPassword } = req.body;

            const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

            if (user.length === 0) {
                return res.status(200).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);

            if (!isPasswordValid) {
                return res.status(200).json({ message: 'Current password is incorrect' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';

            const updatedValues = [
                hashedNewPassword || null,
                userId
            ];

            await db.execute(updateQuery, updatedValues);

            res.status(200).json("Password changed successfully");
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

};

module.exports = userController;
