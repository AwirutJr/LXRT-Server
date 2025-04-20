const express = require('express')
const Router = express.Router()

//middleware
const { upload } = require("../middleware/upload");
const { uploadImage } = require("../middleware/uploadImage");
const { userCheck, adminCheck } = require('../middleware/authcheck')

//controller
const {
  create,
  EditCourse,
  listcourse,
  ReadCourse,
  ReadCourseNoToken,
  RemoveCourse,
  createEpisode,
  EditEpisode,
  ReadEpisode,
  RemoveEpisode,
  SearchFilters,
  BestSeller,
  listcourseGuest,
  SearchFiltersUser,
} = require("../controller/course");

// Course
Router.post('/course',uploadImage,create) // ผ่าน
Router.get("/list-course", userCheck, listcourse); 
Router.get("/list-course-guest", listcourseGuest);
Router.get('/read-course/:id',userCheck, ReadCourse)
Router.get('/read-course/guest/:id', ReadCourseNoToken)

Router.put('/edit-course/:id',upload, EditCourse)
Router.delete('/delete-course/:id', RemoveCourse)

// Episode
Router.post("/create-episode",upload, createEpisode);
Router.get('/read-episode/:id', ReadEpisode)
Router.put('/edit-episode',upload, EditEpisode)
Router.delete('/delete-episode/:id', RemoveEpisode)

// Search
Router.post('/Search-course',SearchFilters)
Router.post("/Search-course-user",userCheck, SearchFiltersUser);
Router.get("/Search-best-course",BestSeller);




module.exports = Router