const prisma = require("../config/prisma");
require("dotenv").config();

// แปลงรูปภาพให้มีขนาดเล็กลง โดยใช้ sharp
const sharp = require("sharp");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Course
exports.create = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const imageFile = req.files.image[0];

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "LXRT-Profile-Course",
      resource_type: "image",
    });

    // สร้าง Course ในฐานข้อมูล
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        categoryId: parseInt(category),
        picture: imageUpload.secure_url,
        public_id: imageUpload.public_id,
      },
    });
    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Create not success!!!" });
  }
};

exports.listcourse = async (req, res) => {
  try {
    const userId = req.user.id; // user ID จาก JWT หรือ session

    const list = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        picture: true,
        sold: true,
        time: true,
        category: {
          select: {
            name: true,
          },
        },
        episodes: {
          select: {
            id: true,
            title: true,
            description: true,
            episodeNo: true,
            image: {
              select: {
                id: true,
                url: true,
                secure_url: true,
              },
            },
            video: {
              select: {
                id: true,
                videoData: true,
              },
            },
            benefits: {
              select: {
                id: true,
                benefit: true,
              },
            },
          },
        },
      },
    });

    const UserpurchasedBy = await prisma.purchasedCourse.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({
      list,
      UserpurchasedBy,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; // ผ่าน

exports.listcourseGuest = async (req, res) => {
  try {
    const list = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        picture: true,
        sold: true,
        time: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json(list);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; // ผ่าน

exports.ReadCourse = async (req, res) => {
  try {
    const id = Number(req.params.id); // course ID จาก URL
    const userId = req.user.id; // user ID จาก JWT หรือ session

    // ตรวจสอบว่า id เป็นตัวเลขหรือไม่
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    // ค้นหาคอร์สตาม ID ที่ส่งมา
    const course = await prisma.course.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        picture: true,
        sold: true,
        episodes: {
          select: {
            id: true,
            title: true,
            description: true,
            episodeNo: true,
            image: {
              select: {
                id: true,
                url: true,
                secure_url: true,
              },
            },
            video: {
              select: {
                id: true,
                videoData: true,
              },
            },
            benefits: {
              select: {
                id: true,
                benefit: true,
              },
            },
            progress: {
              select: {
                id: true,
                userId: true,
                isCompleted: true,
                lastWatchedAt: true,
                isAccessible: true,
              },
            },
          },
        },
      },
    });

    const UserpurchasedBy = await prisma.purchasedCourse.findFirst({
      where: {
        userId: userId,
        courseId: id,
      },
    });

    // ถ้าคอร์สไม่พบ
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // ตรวจสอบสถานะการซื้อของผู้ใช้
    const courseAccess = await prisma.purchasedCourse.findFirst({
      where: {
        userId: userId,
        courseId: id,
      },
    });

    res.status(200).json({ course, UserpurchasedBy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}; // ผ่าน

exports.ReadCourseNoToken = async (req, res) => {
  try {
    //code
    const id = Number(req.params.id);

    const course = await prisma.course.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
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
            description: true,
            episodeNo: true,
            video: {
              select: {
                id: true,
                videoData: true,
              },
            },
            benefits: {
              select: {
                id: true,
                benefit: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json({
      course,
      statuscourse: "guest",
    });
  } catch (error) {
    console.log(error, "ReadCourseNoToken error");
  }
};

exports.EditCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    const imageFile = req.files?.image?.[0];

    console.log(imageFile);

    const OldCourse = await prisma.course.findFirst({
      where: { id: Number(id) },
    });

    if (!OldCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (imageFile) {
      if (OldCourse) {
        const ImagepublicId = OldCourse.public_id; // ใช้ `OldCourse` ที่ถูกต้อง
        try {
          await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(ImagepublicId, (error, result) => {
              if (error) {
                reject("Error deleting image from Cloudinary");
              } else {
                console.log("Delete Image from Cloudinary success!!!");
                resolve(result);
              }
            });
          });

          await prisma.image.delete({
            where: { public_id: ImagepublicId },
          });

          console.log("Image deleted from Prisma successfully");
        } catch (error) {
          console.error(error);
        }
      }

      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "LXRT-images",
        resource_type: "image",
      });

      // อัปเดตข้อมูลรูปภาพใน course
      await prisma.course.update({
        where: { id: Number(id) },
        data: {
          public_id: imageUpload.public_id,
          picture: imageUpload.secure_url,
        },
      });
    }

    // อัปเดตข้อมูล Course
    const NewCourse = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        title: title !== OldCourse.title ? title : OldCourse.title,
        description:
          description !== OldCourse.description
            ? description
            : OldCourse.description,
        price: price !== OldCourse.price ? Number(price) : OldCourse.price,
        // แก้ไข category ให้ใช้ connect แทนการใช้ตัวเลขตรง ๆ
        category:
          category !== OldCourse.categoryId
            ? {
                connect: { id: Number(category) },
              }
            : undefined,
      },
    });

    console.log(NewCourse);
    res.status(200).json(NewCourse);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.RemoveCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // ตรวจสอบว่า id ที่ได้มาคือเลขจำนวนเต็ม
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const deletedCourse = await prisma.course.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Course deleted successfully",
      deletedCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

// course status check

// Episode
async function updateCourseDuration(courseId) {
  const allEpisodes = await prisma.episode.findMany({
    where: { courseId },
    include: { video: true },
  });

  const totalDurationSeconds = allEpisodes.reduce((total, ep) => {
    return total + (ep.video?.duration || 0);
  }, 0);

  const totalDurationInHours = parseFloat(
    (totalDurationSeconds / 60).toFixed(0)
  );

  await prisma.course.update({
    where: { id: courseId },
    data: { time: totalDurationInHours },
  });
}

exports.createEpisode = async (req, res) => {
  try {
    const { courseId, title, description } = req.body;
    const videoFile = req.files?.video?.[0];
    const imageFile = req.files?.image?.[0];

    const courseid = parseInt(courseId);

    if (!videoFile) {
      return res.status(400).json({ message: "Video file is required" });
    }

    // ตรวจสอบว่าคอร์สมีอยู่จริงหรือไม่
    const courseExists = await prisma.course.findUnique({
      where: { id: courseid },
    });

    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" });
    }

    // อัปโหลดวิดีโอไป Cloudinary
    const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
      folder: "LXRT-videos",
      resource_type: "video",
    });

    // บันทึกวิดีโอลงใน DB
    const newVideo = await prisma.video.create({
      data: {
        title: title || "Untitled Video",
        videoData: videoUpload.secure_url,
        duration: videoUpload.duration,
        fileSize: videoUpload.bytes,
        asset_id: videoUpload.asset_id,
        public_id: videoUpload.public_id,
        url: videoUpload.url,
      },
    });

    let newImage = null;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "LXRT-images",
        resource_type: "image",
      });

      newImage = await prisma.image.create({
        data: {
          asset_id: imageUpload.asset_id,
          public_id: imageUpload.public_id,
          url: imageUpload.url,
          secure_url: imageUpload.secure_url,
        },
      });
    }

    // ค้นหา episodeNo ล่าสุดของคอร์สนี้
    const lastEpisode = await prisma.episode.findFirst({
      where: { courseId: courseid },
      orderBy: { episodeNo: "desc" },
    });

    const nextEpisodeNo = lastEpisode ? lastEpisode.episodeNo + 1 : 1;

    // บันทึก Episode ลงใน DB
    const newEpisode = await prisma.episode.create({
      data: {
        courseId: courseid,
        title,
        description,
        episodeNo: nextEpisodeNo,
        videoId: newVideo.id, // เชื่อมกับ Video
        imageId: newImage ? newImage.id : null, // เชื่อมกับ Image ถ้ามี
      },
      include: { video: true, image: true }, // ดึงข้อมูล Video และ Image มาด้วย
    });

    await updateCourseDuration(parseInt(courseId));


    res.status(201).json(newEpisode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.EditEpisode = async (req, res) => {
  try {
    const { episodeId, title, description } = req.body;
    const videoFile = req.files?.video?.[0];
    const imageFile = req.files?.image?.[0];

    const id = Number(episodeId);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid episodeId" });
    }

    // ตรวจสอบว่า Episode นี้มีอยู่ในฐานข้อมูล
    const OldEpisode = await prisma.episode.findFirst({
      where: { id: Number(id) },
      select:{
        video:{
          select:{
            id:true,
            public_id:true,
          }
        },
        image:{
          select:{
            id:true,
            public_id:true,
          }
        }
        }
    });

    if (!OldEpisode) {
      return res.status(404).json({ error: "Episode not found" });
    }

    let newVideoId = OldEpisode.video?.id;
    let newImageId = OldEpisode.image?.id;

    // ถ้ามีการอัปโหลดวิดีโอใหม่
    if (videoFile) {
      if (OldEpisode.video) {
        const VideopublicId = OldEpisode.video.public_id;
        try {
          // ใช้ callback เพื่อทำการลบวิดีโอจาก Cloudinary
          cloudinary.uploader.destroy(VideopublicId, async (error, result) => {
            if (error) {
              throw new Error("Error deleting video from Cloudinary");
            } else {
              console.log("Delete Video from Cloudinary success!!!");

              // ลบวิดีโอจาก Prisma
              await prisma.video.delete({
                where: { id: OldEpisode.video.id },
              });

              console.log("Video deleted from Prisma successfully");
            }
          });
        } catch (error) {
          console.error(error);
        }

      }

      // อัปโหลดวิดีโอที่ย่อแล้วไป Cloudinary
      const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
        folder: "LXRT-videos",
        resource_type: "video",
        max_file_size: 50 * 1024 * 1024,
      });

      const newVideo = await prisma.video.create({
        data: {
          title: videoFile.originalname,
          videoData: videoUpload.secure_url,
          duration: videoUpload.duration,
          fileSize: videoUpload.bytes,
          asset_id: videoUpload.asset_id,
          public_id: videoUpload.public_id,
          url: videoUpload.url,
        },
      });

      newVideoId = newVideo.id;
    }

    let newImage = null;
    if (imageFile) {
      if (OldEpisode.image) {
        const ImagepublicId = OldEpisode.image.public_id;
        try {
          await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(ImagepublicId, (error, result) => {
              if (error) {
                reject("Error deleting image from Cloudinary");
              } else {
                console.log("Delete Image from Cloudinary success!!!");
                resolve(result);
              }
            });
          });

          await prisma.image.delete({
            where: { id: OldEpisode.image.id },
          });

          console.log("Image deleted from Prisma successfully");
        } catch (error) {
          console.error(error);
        }
      }

      // ใช้ sharp ย่อขนาดภาพ
      const resizedImageBuffer = await sharp(imageFile.buffer)
        .resize(720) // ย่อภาพให้มีความกว้าง 720px
        .toBuffer();

      const imageUpload = await cloudinary.uploader.upload(resizedImageBuffer, {
        folder: "LXRT-images",
        resource_type: "image",
        max_file_size: 50 * 1024 * 1024,
      });

      newImage = await prisma.image.create({
        data: {
          asset_id: imageUpload.asset_id,
          public_id: imageUpload.public_id,
          url: imageUpload.url,
          secure_url: imageUpload.secure_url,
        },
      });

      newImageId = newImage.id;
    }

    // อัปเดตข้อมูล Episode
    const UpdateEpisode = await prisma.episode.update({
      where: { id },
      data: {
        title: title || OldEpisode.title,
        description: description || OldEpisode.description,
        videoId: newVideoId,
        imageId: newImageId,
      },
    });

    const courseId = UpdateEpisode.courseId;
    await updateCourseDuration(parseInt(courseId));

    res.status(200).json(UpdateEpisode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Edit Episode Server Error" });
  }
};

exports.ReadEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const episodeId = Number(id);

    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { image: true, video: true },
    });

    res.status(200).json(episode);
  } catch (error) {
    console.error("ReadEpisode มีปัญหา", error);
    res.status(500).json({ message: "ReadEpisode มีปัญหา" });
  }
};

exports.RemoveEpisode = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid episode ID",
      });
    }

    // หาข้อมูล episode ที่จะลบก่อน เพื่อจะรู้ว่า courseId คืออะไร
    const episodeToDelete = await prisma.episode.findUnique({
      where: { id },
    });

    if (!episodeToDelete) {
      return res.status(404).json({
        message: "Episode not found",
      });
    }

    const courseId = episodeToDelete.courseId;

    // ลบ episode
    const deletedEpisode = await prisma.episode.delete({
      where: { id },
    });

    // ดึงตอนทั้งหมดของคอร์สนั้นที่เหลืออยู่ โดยเรียงตาม episodeNo
    const remainingEpisodes = await prisma.episode.findMany({
      where: { courseId },
      orderBy: { episodeNo: "asc" },
    });

    // อัปเดต episodeNo ใหม่ให้เรียงตั้งแต่ 1
    const updatePromises = remainingEpisodes.map((ep, index) => {
      return prisma.episode.update({
        where: { id: ep.id },
        data: { episodeNo: index + 1 },
      });
    });

    await Promise.all(updatePromises);

    await updateCourseDuration(parseInt(courseId));

    return res.status(200).json({
      message: "Episode deleted and reordered successfully",
      deletedEpisode,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to delete episode",
      error: error.message,
    });
  }
};

// const handleQuery = async (req, res, query) => {
//   try {
//     // ถ้าไม่มี query ให้ตอบ 400
//     if (!query) {
//       return res.status(400).json({ message: 'Missing search query' });
//     }

//     const lowerQuery = query.toLowerCase();

//     const course = await prisma.course.findMany({
//       where: {
//         OR: [
//           {
//             title: {
//               contains: lowerQuery,
//               mode: 'insensitive'
//             }
//           },
//           {
//             description: {
//               contains: lowerQuery,
//               mode: 'insensitive'
//             }
//           },
//           {
//             episodes: {
//               some: {
//                 OR: [
//                   {
//                     title: {
//                       contains: lowerQuery,
//                       mode: 'insensitive'
//                     }
//                   },
//                   {
//                     description: {
//                       contains: lowerQuery,
//                       mode: 'insensitive'
//                     }
//                   }
//                 ]
//               }
//             }
//           },
//           {
//             category: {
//               name: {
//                 contains: lowerQuery,
//                 mode: 'insensitive'
//               }
//             }
//           }
//         ]
//       },
//       include: {
//         category: true,
//       }
//     });

//     res.status(200).json(course);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error in handleQuery course' });
//   }
// };

// Search

const headleCategory = async (req, res, category) => {
  try {
    const course = await prisma.course.findMany({
      where: {
        categoryId: {
          in: category.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
      },
    });
    res.status(200).json(course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error in headleCategory product" });
  }
};

const handleQuery = async (req, res, query) => {
  // ถ้าไม่มี query ให้ตอบ 400
  if (!query) {
    return res.status(400).json({ message: "Missing search query" });
  }

  const lowerQuery = query.toLowerCase();

  // ค้นหาคอร์สที่ตรงกับ query
  try {
    // ถ้าไม่มี query ให้ตอบ 400
    if (!query) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const lowerQuery = query.toLowerCase();

    // ค้นหาคอร์สที่ตรงกับ query
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: lowerQuery,
            },
          },
          {
            description: {
              contains: lowerQuery,
            },
          },
          {
            episodes: {
              some: {
                OR: [
                  {
                    title: {
                      contains: lowerQuery,
                    },
                  },
                  {
                    description: {
                      contains: lowerQuery,
                    },
                  },
                ],
              },
            },
          },
          {
            category: {
              name: {
                contains: lowerQuery,
              },
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SearchFilters = async (req, res) => {
  try {
    const { query, category } = req.body;

    if (query) {
      return handleQuery(req, res, query);
    }

    if (category) {
      return headleCategory(req, res, category);
    }

    // ถ้าไม่มีทั้ง query และ category
    return res
      .status(400)
      .json({ message: "Missing required search parameters." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error in searchFilters product" });
  }
};

const headleCategoryUser = async (req, res, category, userId) => {
  try {
    const UserpurchasedBy = await prisma.purchasedCourse.findMany({
      where: {
        userId: userId,
      },
    });

    const list = await prisma.course.findMany({
      where: {
        categoryId: {
          in: category.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
      },
    });
    res.status(200).json({ list, UserpurchasedBy });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error in headleCategory product" });
  }
};

const handleQueryUser = async (req, res, query, userId) => {
  // ค้นหาคอร์สที่ตรงกับ query
  try {
    // ถ้าไม่มี query ให้ตอบ 400
    if (!query) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const UserpurchasedBy = await prisma.purchasedCourse.findMany({
      where: {
        userId: userId,
      },
    });

    const lowerQuery = query.toLowerCase();

    // ค้นหาคอร์สที่ตรงกับ query
    const list = await prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: lowerQuery,
            },
          },
          {
            description: {
              contains: lowerQuery,
            },
          },
          {
            episodes: {
              some: {
                OR: [
                  {
                    title: {
                      contains: lowerQuery,
                    },
                  },
                  {
                    description: {
                      contains: lowerQuery,
                    },
                  },
                ],
              },
            },
          },
          {
            category: {
              name: {
                contains: lowerQuery,
              },
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    return res.status(200).json({ list, UserpurchasedBy });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SearchFiltersUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, category } = req.body;

    if (query) {
      return handleQueryUser(req, res, query);
    }

    if (category) {
      return headleCategoryUser(req, res, category);
    }

    // ถ้าไม่มีทั้ง query และ category
    return res
      .status(400)
      .json({ message: "Missing required search parameters." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error in searchFilters product" });
  }
};

// seller
exports.BestSeller = async (req, res) => {
  try {
    const { sort, order, limit } = req.query;

    const course = await prisma.course.findMany({
      take: parseInt(limit) || 3,
      orderBy: { [sort]: order },
      select: {
        title: true,
        id: true,
        picture: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.send(course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error in BestSeller product" });
  }
};
