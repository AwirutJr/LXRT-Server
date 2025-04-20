const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

///////////////////////////////////////////////////// Profile Management /////////////////////////////////////////////////

// ดึงข้อมูล user
exports.ProfileUser = async (req, res) => {
  const userId = Number(req.params.id);
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        picture: true,
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("user", user);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// แก้ไขข้อมูล user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, email, phone, address, birthday } =
      req.body;
    const imageFile = req.files?.image?.[0];

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { profile: true },
    });

    // ตรวจสอบว่า email ถูกใช้งานแล้วหรือไม่
    if (email !== existingUser.email) {
      const emailUsedByOther = await prisma.user.findUnique({
        where: { email: email },
      });

      if (emailUsedByOther) {
        return res
          .status(400)
          .json({ message: "มี user กำลังใช้งาน email นี้อยู่" });
      }
    }

    // ตรวจสอบว่าเบอร์โทรศัพท์ถูกใช้งานแล้วหรือไม่
    const phoneUsedByOther = await prisma.user.findFirst({
      where: {
        profile: { phone: phone },
        NOT: { id: Number(id) },
      },
    });

    if (phoneUsedByOther) {
      return res.status(400).json({ error: "เบอร์นี้มีผู้ใช้งานแล้ว" });
    }

    // ตรวจสอบการอัปโหลดภาพ
    if (imageFile) {
      const ImagepublicId = existingUser.public_id;
      try {
        await cloudinary.uploader.destroy(ImagepublicId);
        console.log("Delete Image from Cloudinary success!!!");
      } catch (error) {
        console.error(error);
      }

      // อัปโหลดภาพใหม่
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "LXRT-images",
        resource_type: "image",
      });

      // อัปเดตข้อมูลภาพใน Prisma
      await prisma.user.update({
        where: { id: Number(id) },
        data: {
          public_id:
            imageFile !== existingUser.public_id
              ? imageUpload.public_id
              : existingUser.public_id,
          picture:
            imageFile !== existingUser.picture
              ? imageUpload.secure_url
              : existingUser.picture,
        },
      });
    }

    let parsedBirthday = null;
    if (birthday && typeof birthday === "string" && birthday.trim() !== "") {
      const d = new Date(birthday);
      if (!isNaN(d)) {
        parsedBirthday = d;
      }
    }

    // อัปเดตข้อมูลผู้ใช้และโปรไฟล์
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username: username || existingUser.username,
        email: email || existingUser.email,
        profile: existingUser.profile
          ? {
              update: {
                birthday:
                  parsedBirthday !== existingUser.profile.birthday
                    ? parsedBirthday
                    : existingUser.profile.birthday,
                firstName: firstName || existingUser.profile.firstName,
                lastName: lastName || existingUser.profile.lastName,
                phone: phone || existingUser.profile.phone,
                address: address || existingUser.profile.address,
              },
            }
          : {
              create: {
                birthday: parsedBirthday,
                firstName: firstName || "",
                lastName: lastName || "",
                phone: phone || null,
                address: address || "",
              },
            },
      },
      select: {
        id: true,
        email: true,
        username: true,
        picture: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthday: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, phone, address, birthday } =
      req.body;
    const imageFile = req?.files?.image?.[0];

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { profile: true },
    });

    // ตรวจสอบว่าเบอร์โทรศัพท์ถูกใช้งานแล้วหรือไม่ (ยกเว้นของตัวเอง)
    const phoneUsedByOther = await prisma.user.findFirst({
      where: {
        profile: { phone },
        NOT: { id: Number(id) },
      },
    });

    if (phoneUsedByOther) {
      return res.status(400).json({ error: "เบอร์นี้มีผู้ใช้งานแล้ว" });
    }

    // หากมีการอัปโหลดภาพใหม่
    if (imageFile) {
      if (!imageFile.path) {
        return res.status(400).json({ error: "ไม่พบ path ของรูปภาพ" });
      }

      const oldPublicId = existingUser.public_id;

      // ลบรูปเดิมออกจาก Cloudinary
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log("ลบรูปภาพเก่าออกจาก Cloudinary แล้ว");
        } catch (err) {
          console.error("เกิดข้อผิดพลาดขณะลบรูปภาพ:", err);
        }
      }

      // อัปโหลดรูปใหม่
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "LXRT-images",
        resource_type: "image",
      });

      // อัปเดตรูปใหม่ใน user
      await prisma.user.update({
        where: { id: Number(id) },
        data: {
          public_id: imageUpload.public_id,
          picture: imageUpload.secure_url,
        },
      });
    }

    // แปลงวันเกิด
    let parsedBirthday = null;
    if (birthday && typeof birthday === "string" && birthday.trim() !== "") {
      const d = new Date(birthday);
      if (!isNaN(d)) {
        parsedBirthday = d;
      }
    }

    // อัปเดต user และ profile
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username: username || existingUser.username,
        profile: existingUser.profile
          ? {
              update: {
                ...(parsedBirthday !== null &&
                  parsedBirthday.getTime() !==
                    new Date(existingUser.profile.birthday).getTime() && {
                    birthday: parsedBirthday,
                  }),
                firstName: firstName || existingUser.profile.firstName,
                lastName: lastName || existingUser.profile.lastName,
                phone: phone || existingUser.profile.phone,
                address: address || existingUser.profile.address,
              },
            }
          : {
              create: {
                birthday: parsedBirthday,
                firstName: firstName || "",
                lastName: lastName || "",
                phone: phone || null,
                address: address || "",
              },
            },
      },
      select: {
        id: true,
        email: true,
        username: true,
        picture: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthday: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    console.log("updatedUser:", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

// เปลี่ยนรหัสใหม่
exports.updatePassword = async (req, res) => {
  const { password, Newpassword } = req.body;
  const userId = req.params.id;

  try {
    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสไม่ถูกต้อง" });
    }

    const hashedPassword = await bcrypt.hash(Newpassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: "Update Password success!!!",
      update: updatedUser,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.UploadImagesUser = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "LXRT-E-learning",
    });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload Images User Error" });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    const result = await cloudinary.uploader.destroy(public_id);

    res.send({ message: "Remove image success!", result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error in remove image" });
  }
};

exports.ChangeStatus = async (req, res) => {
  try {
    //code
    const { id, enabled } = req.body;
    await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled },
    });
    console.log("ChangeStatus Ok!!!");
    res.status(200).json({ message: "ChangeStatus Ok!!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error in changestatus" });
  }
};

exports.ChangeRole = async (req, res) => {
  try {
    //code
    const { id, role } = req.body;
    console.log(id, role);
    // await prisma.user.update({
    //     where: { id: Number(id)},
    //     data: { role}
    // })
    res.status(200).json({ message: "Change role OK!!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error in changeRole!!!" });
  }
};

///////////////////////////////////////////////////// User Management /////////////////////////////////////////////////

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    res.status(200).json({
      message: "List All user success",
      users,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

exports.readUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        picture: true,
        username: true,
        role: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};

exports.AdminEditUser = async (req, res) => {
  const {
    username,
    email,
    Newpassword,
    firstName,
    lastName,
    phone,
    address,
    birthday,
  } = req.body;

  try {
    const userId = Number(req.params.id);

    // เช็คบัญชีก่อน
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    console.log(existingUser);

    if (!existingUser) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    // ตรวจสอบว่า email มีการใช้งานโดยผู้ใช้คนอื่นหรือไม่
    if (email) {
      const emailUsedByOther = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: { id: userId },
        },
      });
      if (emailUsedByOther) {
        return res.status(400).json({ message: "Email นี้มีผู้ใช้งานแล้ว" });
      }
    }

    // ตรวจสอบว่า phone มีการใช้งานโดยผู้ใช้คนอื่นหรือไม่
    if (phone) {
      const phoneUsedByOther = await prisma.user.findFirst({
        where: {
          profile: { phone: phone },
          NOT: { id: userId },
        },
      });
      if (phoneUsedByOther) {
        return res.status(400).json({ message: "เบอร์นี้มีผู้ใช้งานแล้ว" });
      }
    }

    // Hash รหัสผ่านใหม่ถ้ามีการเปลี่ยนแปลง
    let hashedPassword = existingUser.password;
    if (Newpassword && Newpassword.trim() !== "") {
      hashedPassword = await bcrypt.hash(Newpassword, 10);
    }

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username?.trim() !== "" ? username : existingUser.username,
        email: email?.trim() !== "" ? email : existingUser.email,
        password: hashedPassword,
        profile: existingUser.profile
          ? {
              update: {
                birthday: birthday
                  ? convertToISODate(birthday)
                  : existingUser.profile.birthday,
                firstName:
                  firstName?.trim() !== ""
                    ? firstName
                    : existingUser.profile.firstName,
                lastName:
                  lastName?.trim() !== ""
                    ? lastName
                    : existingUser.profile.lastName,
                phone:
                  phone?.trim() !== "" ? phone : existingUser.profile.phone,
                address:
                  address?.trim() !== ""
                    ? address
                    : existingUser.profile.address,
              },
            }
          : {
              create: {
                birthday: birthday ? convertToISODate(birthday) : null,
                firstName: firstName || "",
                lastName: lastName || "",
                phone: phone || null,
                address: address || "",
              },
            },
      },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        picture: true,
        role: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthday: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.RemoveUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    console.log(userId);

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "Delete success!!!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete Error", error: error.message });
  }
};

// cart เหลือ ต้องเพิ่ม token
exports.addCoursetoCart = async (req, res) => {
  try {
    const { cart } = req.body;

    let user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    // ลบคอร์สเก่าออกจากตะกร้าก่อน
    await prisma.cousreOnCart.deleteMany({
      where: { cart: { userId: user.id } },
    });
    // ลบข้อมูลในตะกร้าที่ส่งมาด้วย
    await prisma.cart.deleteMany({
      where: { userId: user.id },
    });

    let course = cart.map((item) => ({
      courseId: item.id,
      price: item.price,
    }));

    let cartTotal = course.reduce((sum, item) => sum + item.price, 0);

    const newCart = await prisma.cart.create({
      data: {
        courses: {
          create: course,
        },
        cartTotal,
        userId: user.id,
      },
    });

    console.log("Create cart success!!!", newCart);
    res.send("Add cart ok");
  } catch (error) {
    console.log(error);
  }
};

exports.addCoursetoBuy = async (req, res) => {
  try {
    const { course } = req.body;

    let user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    // ลบคอร์สเก่าออกจากตะกร้าก่อน
    await prisma.cousreOnCart.deleteMany({
      where: { cart: { userId: user.id } },
    });
    // ลบข้อมูลในตะกร้าที่ส่งมาด้วย
    await prisma.cart.deleteMany({
      where: { userId: user.id },
    });

    const newCart = await prisma.cart.create({
      data: {
        courses: {
          create: {
            courseId: course.course.id,
            price: course.course.price,
          },
        },
        cartTotal: course.course.price,
        userId: user.id,
      },
    });

    console.log("Create cart success!!!", newCart);
    res.send("Add cart ok from Buy course");
  } catch (error) {
    console.log(error);
  }
};

// ดึงสินค้าจาก cart
exports.getUserCart = async (req, res) => {
  try {
    console.time("Get Cart");

    const cart = await prisma.cart.findFirst({
      where: { userId: Number(req.user.id) },
      select: {
        cartTotal: true,
        courses: {
          select: {
            price: true,
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    console.timeEnd("Get Cart");

    res.status(200).json({
      course: cart.courses,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.log(error);
  }
};

// ชำระเงิน
exports.saveOrder = async (req, res) => {
  try {
    const { id, amount, status, currency } = req.body?.paymentIntent ?? {};
    console.log("req.body", req.body);

    // 🔐 ตรวจสอบว่า body มี paymentIntent มาหรือไม่
    if (!req.body.paymentIntent) {
      return res
        .status(400)
        .json({ error: "Missing paymentIntent in request body" });
    }

    // 🛒 ดึง cart ของ user พร้อม course ในตะกร้า
    const usercart = await prisma.cart.findFirst({
      where: { userId: Number(req.user.id) },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!usercart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // 🧾 เตรียมข้อมูลคำสั่งซื้อ (รายการคอร์สและราคา)
    const orderItems = usercart.courses.map((item) => ({
      courseId: item.courseId,
      price: item.price,
    }));

    const amountTHB = Number(usercart.cartTotal);

    // 🧾 สร้างคำสั่งซื้อ (order) พร้อมรายการสินค้า
    const order = await prisma.order.create({
      data: {
        paymentId: id,
        amount: amountTHB,
        status,
        currency,
        cartTotal: usercart.cartTotal,
        items: {
          create: orderItems,
        },
        user: {
          connect: { id: Number(req.user.id) },
        },
      },
    });

    const updateCourse = usercart.courses.map((item) => ({
      where: { id: item.courseId },
      data: { sold: { increment: 1 } },
    }));

    // 🛒 courseIds ที่อยู่ใน cart
    const courseIds = usercart.courses.map((item) => item.courseId);
    const userId = Number(req.user.id);

    // 📦 ตรวจสอบว่าซื้อคอร์สพวกนี้ไปแล้วหรือยัง
    const existingPurchased = await prisma.purchasedCourse.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
      },
      select: { courseId: true },
    });

    const existingCourseIds = existingPurchased.map((item) => item.courseId);

    // 📌 เตรียมรายการ purchased ใหม่ (เฉพาะคอร์สที่ยังไม่เคยซื้อ)
    const newPurchasedCourses = courseIds
      .filter((id) => !existingCourseIds.includes(id))
      .map((id) => ({
        userId,
        courseId: id,
        paymentStatus: "paid",
      }));

    // 🛒 เพิ่ม purchasedCourse ใหม่
    if (newPurchasedCourses.length > 0) {
      await prisma.purchasedCourse.createMany({ data: newPurchasedCourses });
    }

    // 🖊️ อัปเดตคอร์สที่เคยซื้อไว้อยู่แล้วให้เป็น paid
    await prisma.purchasedCourse.updateMany({
      where: {
        userId,
        courseId: { in: courseIds },
      },
      data: { paymentStatus: "paid" },
    });

    // 🎬 ดึง episode ของคอร์สที่ซื้อ
    const episodes = await prisma.episode.findMany({
      where: {
        courseId: { in: courseIds },
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    const episodeIds = episodes.map((e) => e.id);

    // 👀 ตรวจสอบ progress ที่มีอยู่แล้ว
    const existingProgress = await prisma.episodeProgress.findMany({
      where: {
        userId,
        episodeId: { in: episodeIds },
      },
      select: { episodeId: true },
    });

    const existingEpisodeIds = existingProgress.map((e) => e.episodeId);

    // 🆕 สร้าง episodeProgress ใหม่เฉพาะตอนที่ยังไม่มี
    const newProgress = episodes
      .filter((ep) => !existingEpisodeIds.includes(ep.id))
      .map((ep) => ({
        userId,
        episodeId: ep.id,
        isAccessible: true,
      }));

    if (newProgress.length > 0) {
      await prisma.episodeProgress.createMany({
        data: newProgress,
      });
    }

    // 🔓 อัปเดต progress ที่มีอยู่แล้วให้สามารถเข้าถึงได้
    await prisma.episodeProgress.updateMany({
      where: {
        userId,
        episodeId: { in: existingEpisodeIds },
      },
      data: { isAccessible: true },
    });

    // 📈 อัปเดตยอดขายของคอร์สแบบ transaction
    await prisma.$transaction(
      usercart.courses.map((item) =>
        prisma.course.update({
          where: { id: item.courseId },
          data: { sold: { increment: 1 } },
        })
      )
    );

    await Promise.all(
      updateCourse.map((update) => prisma.course.update(update))
    );

    await prisma.cart.deleteMany({
      where: { userId: Number(req.user.id) },
    });

    // ✅ ส่งข้อมูลคำสั่งซื้อกลับไป
    console.log("order", order);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.Mycourse = async (req, res) => {
  try {
    //code
    const userId = Number(req.user.id);
    const purchasedCourse = await prisma.purchasedCourse.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            picture: true,
            category: {
              select: {
                name: true,
              },
            },
            episodes: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json({
      message: "My course success!!!",
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

///////////////////////////////////////////////////// Recommerdation /////////////////////////////////////////////////
// ยังไม่ได้ใช้งาน
// exports.Recommendation = async (req, res) => {
//   try {
//     const userId = Number(req.user.id);

//     // คอร์สที่ซื้อไปแล้ว
//     const purchasedCourses = await prisma.purchasedCourse.findMany({
//       where: { userId },
//       select: { courseId: true },
//     });
//     const purchasedCourseIds = purchasedCourses.map((c) => c.courseId);

//     // ดึงคอร์สที่ยังไม่ซื้อ และเรียงตามวันที่สร้าง
//     const recommendedCourses = await prisma.course.findMany({
//       where: {
//         id: { notIn: purchasedCourseIds },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 10,
//       include: {
//         category: true,
//         episodes: true,
//       },
//     });

//     console.log(recommendedCourses);

//     // res.status(200).json(recommendedCourses);
//   } catch (error) {
//     console.error("Recommendation error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.RecommendationViewCount = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    // 1. ดึงกิจกรรมทั้งหมดของ user พร้อม category
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    // 2. นับจำนวนการดูในแต่ละ category
    const categoryCount = {};
    for (const activity of activities) {
      const categoryId = activity.course?.categoryId;
      if (!categoryId) continue;
      categoryCount[categoryId] =
        (categoryCount[categoryId] || 0) + activity.viewCount;
    }

    // 3. เรียง category จากมากไปน้อย
    const sortedCategoryIds = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => Number(id));

    // 4. คอร์สที่ซื้อไปแล้ว
    const purchased = await prisma.purchasedCourse.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const purchasedCourseIds = purchased.map((p) => p.courseId);

    let recommendedCourses = [];

    // 5. แนะนำตามลำดับ category ที่ดูบ่อย
    for (const categoryId of sortedCategoryIds) {
      if (recommendedCourses.length >= 10) break;

      const courses = await prisma.course.findMany({
        where: {
          categoryId,
          id: {
            notIn: [
              ...purchasedCourseIds,
              ...recommendedCourses.map((c) => c.id),
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10 - recommendedCourses.length,
        include: { category: true, episodes: true },
      });

      recommendedCourses = [...recommendedCourses, ...courses];
    }

    // 6. ถ้ายังไม่ครบ 10 → เติมจากหมวดอื่น
    if (recommendedCourses.length < 10) {
      const filler = await prisma.course.findMany({
        where: {
          id: {
            notIn: [
              ...purchasedCourseIds,
              ...recommendedCourses.map((c) => c.id),
            ],
          },
          categoryId: {
            notIn: sortedCategoryIds,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10 - recommendedCourses.length,
        include: { category: true, episodes: true },
      });

      recommendedCourses = [...recommendedCourses, ...filler];
    }

    // 7. fallback: กรณี user ยังไม่เคยดูอะไรเลย
    if (recommendedCourses.length === 0) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          id: { notIn: purchasedCourseIds },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { category: true, episodes: true },
      });
    }

    // console.log("recommendedCourses:", recommendedCourses);
    res.status(200).json(recommendedCourses);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// อิงจากการ click course
const handleUserViewCourse = async (userId, courseId) => {
  const existing = await prisma.userActivity.findFirst({
    where: { userId, courseId },
  });

  if (existing) {
    // อัปเดต viewCount และเวลา
    return await prisma.userActivity.update({
      where: { id: existing.id },
      data: {
        viewCount: { increment: 1 },
        lastViewed: new Date(),
      },
    });
  } else {
    // สร้างใหม่
    return await prisma.userActivity.create({
      data: {
        userId,
        courseId,
        viewCount: 1,
      },
    });
  }
};

exports.viewCourse = async (req, res) => {
  const userId = Number(req.user.id);
  const courseId = Number(req.params.id);

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { episodes: true, category: true },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // ✅ สร้าง/อัปเดต userActivity
    await handleUserViewCourse(userId, courseId);

    // console.log("res", activityRes);
    return res.status(200).json({ message: "View course success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
