const prisma = require('../config/prisma')

exports.create = async (req, res) => {
    try {
        //code
        const { name } = req.body

        const existingCategory = await prisma.category.findFirst({
            where: {
                name: name
            }
        })

        if (existingCategory) {
            return res.status(400).json({ message: 'คุณมี Category นี้แล้ว' })
        }

        const category = await prisma.category.create({
            data: {
                name: name
            }
        })

        res.send(category)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Category can not create!!!' })
    }
}

exports.list = async (req, res) => {
    try {
        //code
        const category = await prisma.category.findMany()
        res.send(category)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Category can not list!!!' })
    }
}

exports.remove = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.category.delete({
            where: {
                id: Number(id)
            }
        })

        res.status(200).json({ message: 'delete success'})
    }catch(error){
        console.error(error.message)
        res.status(500).json({ error: 'Category can not delete!!!' })
    }
    
}