const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _const = require('../config/constant');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const authController = {
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            const [checkEmailExist] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);

            if (checkEmailExist.length > 0) {
                return res.status(200).json('Email is exist');
            }

            // Thêm người dùng mới vào cơ sở dữ liệu
            const [rows] = await db.execute(
                'INSERT INTO users (username, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
                [req.body.username, req.body.email, hashed, req.body.phone, req.body.role, req.body.status]
            );

            const user = {
                id: rows.insertId,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                status: req.body.status
            };

            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json('Register fails');
        }
    },

    login: async (req, res) => {
        try {
            // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
            const user = rows[0];

            if (!user) {
                return res.status(200).json({ message: 'Unregistered account!', status: false });
            }

            // So sánh mật khẩu
            const validatePassword = await bcrypt.compare(req.body.password, user.password);

            if (!validatePassword) {
                res.status(400).json({ message: 'Wrong password!', status: false });
            }

            if (user && validatePassword) {
                // Tạo mã thông báo JWT
                const token = jwt.sign({ user: user }, _const.JWT_ACCESS_KEY, { expiresIn: '30d' });

                res.header('Authorization', token);
                res.status(200).json({ user, token, status: true });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const token = crypto.randomBytes(20).toString('hex');
    
            const [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
            const user = userRows[0];
    
            if (!user) {
                return res.status(400).json({ message: 'Unregistered account!', status: false });
            }
    
            let resetURL = 'http://localhost:3500'; // URL mặc định
    
            // Kiểm tra xem user có vai trò là isAdmin không
            if (user.role === 'isAdmin') {
                resetURL = 'http://localhost:3000';
            }
    
            await db.execute('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [user.id, token, new Date(Date.now() + 3600000)] // Thời gian hết hạn sau 1 giờ
            );
    
            const transporter = nodemailer.createTransport({
                host: 'mail49.vietnix.vn',
                port: 465, 
                auth: {
                    user: 'admin@evertrip.io.vn',
                    pass: 'evertrip052024',
                },
            });
    
            const mailOptions = {
                from: 'coms@gmail.com',
                to: user.email,
                subject: 'Reset Password',
                text: `To reset your password, click on the following link: ${resetURL}/reset-password/${token}`,
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Failed to send reset email!', status: false });
                }
                console.log(`Email sent: ${info.response}`);
                res.status(200).json({ message: 'Reset email sent!', status: true });
            });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const token = req.body.token;

            // Tìm mã xác thực trong cơ sở dữ liệu
            const [tokenRows] = await db.execute('SELECT * FROM password_reset_tokens WHERE token = ?', [token]);
            const resetToken = tokenRows[0];

            if (!resetToken || resetToken.expires_at < new Date()) {
                return res.status(400).json({ message: 'Invalid or expired token!', status: false });
            }

            // Cập nhật mật khẩu cho người dùng
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

            await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetToken.user_id]);

            // Xóa mã xác thực đã sử dụng
            await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

            res.status(200).json({ message: 'Password reset successful!', status: true });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },
   
};

module.exports = authController;
