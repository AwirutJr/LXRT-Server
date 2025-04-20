const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body

    //เช็ค email
    const existingUser = await prisma.user.findUnique({
      where:{ email: email}
    })

    if(existingUser){
      return res.status(400).json({ message: 'มีผู้ใช้ Email นี้ไปแล้ว' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
        role: 'user',
      }
    });
    console.log(email, password, username)

    res.json({
      message: 'User registered successfully',
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
      }
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body

    //check email
    const user = await prisma.user.findFirst({
        where: {
            email: email
        }
    })
    // console.log(user)

    //check email in DB
    if(!user){
        return res.status(401).json({ message: 'Email นี้ไม่พบผู้ใช้งาน' })
    }

    //check password
    const IsMatch = await bcrypt.compare(password, user.password)

    if(!IsMatch){
        return res.status(401).json({ message: 'รหัสไม่ถูกต้อง' })
    }

    //create payload
    const payload = {
        id: user.id,
        email: user.email,  
        username: user.username,
        role: user.role
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
        if(err) {
            return res.status(500).json({ message: 'Error signing token form function login' })
        }
        res.json({
            message: 'User logged in successfully',
            payload: payload,
            token: token
        })
    })

    console.log(payload)

  }catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.currntUser = async(req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email
      },select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    })

    res.json({
      message: 'Current user',
      user
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal server error currntUser' })
  }
}


