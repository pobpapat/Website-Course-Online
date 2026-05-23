package controllers

import (
	"edusphere-backend/config"
	"edusphere-backend/models"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ===== PUBLIC ENDPOINTS =====

// GET /api/courses - Get all courses with search, filter, pagination
func GetCourses(c *fiber.Ctx) error {
	var courses []models.Course
	query := config.DB.Preload("Instructor")

	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			query = query.Where("price <= ?", price)
		}
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "12"))
	offset := (page - 1) * limit

	var total int64
	config.DB.Model(&models.Course{}).Count(&total)
	query.Limit(limit).Offset(offset).Find(&courses)

	return c.JSON(fiber.Map{
		"courses": courses,
		"meta": fiber.Map{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// GET /api/courses/:id - Get course detail with all modules and lessons
func GetCourseDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	var course models.Course

	err := config.DB.
		Preload("Instructor").
		Preload("Modules", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Preload("Modules.Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		First(&course, "id = ?", id).Error

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Course not found"})
	}

	return c.JSON(course)
}

// POST /api/courses/:id/enroll - Enroll in a course (protected)
func EnrollCourse(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	if role == "instructor" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Instructors cannot enroll in courses"})
	}

	userIDStr, _ := c.Locals("user_id").(string)
	userID, _ := uuid.Parse(userIDStr)
	courseID, _ := uuid.Parse(c.Params("id"))

	var existing models.Enrollment
	if err := config.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Already enrolled in this course"})
	}

	enrollment := models.Enrollment{UserID: userID, CourseID: courseID}
	if err := config.DB.Create(&enrollment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to enroll"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Enrolled successfully", "enrollment": enrollment})
}

// GET /api/courses/:id/learn - Get learning content with user progress
func GetLearningContent(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("user_id").(string)
	userID, _ := uuid.Parse(userIDStr)
	courseID, _ := uuid.Parse(c.Params("id"))

	var course models.Course
	if err := config.DB.
		Preload("Modules", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("Modules.Lessons", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		First(&course, "id = ?", courseID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Course not found"})
	}

	var enrollment models.Enrollment
	if err := config.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrollment).Error; err != nil {
		if course.InstructorID != userID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You are not enrolled in this course"})
		}
	}

	var progressList []models.Progress
	config.DB.Where("user_id = ?", userID).Find(&progressList)

	progressMap := make(map[string]bool)
	for _, p := range progressList {
		progressMap[p.LessonID.String()] = p.IsCompleted
	}

	return c.JSON(fiber.Map{"course": course, "progress": progressMap})
}

// POST /api/lessons/:id/complete - Mark a lesson as completed
func CompleteLesson(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("user_id").(string)
	userID, _ := uuid.Parse(userIDStr)
	lessonID, _ := uuid.Parse(c.Params("id"))

	var progress models.Progress
	result := config.DB.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&progress)

	now := time.Now()
	if result.Error != nil {
		progress = models.Progress{UserID: userID, LessonID: lessonID, IsCompleted: true, CompletedAt: &now}
		config.DB.Create(&progress)
	} else {
		config.DB.Model(&progress).Updates(models.Progress{IsCompleted: true, CompletedAt: &now})
	}

	return c.JSON(fiber.Map{"message": "Lesson marked as completed"})
}

// POST /api/upload - Upload image or video file, save to local storage
func UploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file provided"})
	}

	filename := uuid.New().String() + filepath.Ext(file.Filename)
	savePath := "./uploads/" + filename
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	return c.JSON(fiber.Map{"message": "File uploaded successfully", "url": "/uploads/" + filename})
}
