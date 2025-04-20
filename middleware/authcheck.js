const prisma = require('../config/prisma')
const jwt = require('jsonwebtoken')

exports.userCheck = async (req, res, next) => { 
    try {
        // ดึง Token จาก Header
        const headerToken = req.headers.authorization;
        if (!headerToken) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = headerToken.split(" ")[1];

        // แปลง JWT
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode; // มีแค่ email

        // ค้นหาผู้ใช้
        const user = await prisma.user.findFirst({
            where: { email: req.user.email }
        });

        // เช็คว่าพบผู้ใช้หรือไม่
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // เช็คว่า user ถูกปิดการใช้งานหรือไม่
        if (user.enabled === false) {
            return res.status(403).json({ message: 'User is disabled' });
        }

        next();
    } catch (error) {
        console.error('Error in userCheck:', error.message);
        res.status(500).json({ error: 'Internal server error UserCheck' });
    }
};

exports.adminCheck = async (req, res, next) => {
    try {
        const { email } = req.user  
        // console.log(email)

        // ค้นหาข้อมูล user ในตาราง
        const adminUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        //เช็ค role
        if(!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Admin resource access denied' })
        }

        next()
    }catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Internal server error adminCheck' })
    }
}