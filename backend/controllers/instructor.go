package controllers

import (
	"edusphere-backend/config"
	"edusphere-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GET /api/instructor/courses - Get courses owned by the instructor
func GetInstructorCourses(c *fiber.Ctx) error {
	instructorIDStr, _ := c.Locals("user_id").(string)
	instructorID, _ := uuid.Parse(instructorIDStr)

	var courses []models.Course
	config.DB.
		Where("instructor_id = ?", instructorID).
		Preload("Modules", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Preload("Modules.Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Find(&courses)

	return c.JSON(fiber.Map{"courses": courses})
}

// POST /api/instructor/courses - Create a new course
func CreateCourse(c *fiber.Ctx) error {
	instructorIDStr, _ := c.Locals("user_id").(string)
	instructorID, _ := uuid.Parse(instructorIDStr)

	type CreateCourseInput struct {
		Title        string  `json:"title"`
		Description  string  `json:"description"`
		ThumbnailURL string  `json:"thumbnail_url"`
		Price        float64 `json:"price"`
	}

	var input CreateCourseInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title is required"})
	}

	course := models.Course{
		Title:        input.Title,
		Description:  input.Description,
		ThumbnailURL: input.ThumbnailURL,
		Price:        input.Price,
		InstructorID: instructorID,
	}

	if err := config.DB.Create(&course).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create course"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Course created", "course": course})
}

// POST /api/instructor/courses/:id/modules - Add a module to a course
func CreateModule(c *fiber.Ctx) error {
	courseID, _ := uuid.Parse(c.Params("id"))

	type Input struct {
		Title     string `json:"title"`
		SortOrder int    `json:"sort_order"`
	}
	var input Input
	if err := c.BodyParser(&input); err != nil || input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title is required"})
	}

	module := models.Module{
		CourseID:  courseID,
		Title:     input.Title,
		SortOrder: input.SortOrder,
	}

	if err := config.DB.Create(&module).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create module"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Module created", "module": module})
}

// POST /api/instructor/modules/:id/lessons - Add a lesson to a module
func CreateLesson(c *fiber.Ctx) error {
	moduleID, _ := uuid.Parse(c.Params("id"))

	type Input struct {
		Title       string `json:"title"`
		ContentType string `json:"content_type"` // video or article
		ContentURL  string `json:"content_url"`
		BodyText    string `json:"body_text"`
		SortOrder   int    `json:"sort_order"`
	}
	var input Input
	if err := c.BodyParser(&input); err != nil || input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title is required"})
	}

	contentType := "article"
	if input.ContentType == "video" {
		contentType = "video"
	} else if input.ContentURL != "" && input.BodyText != "" {
		contentType = "mixed"
	} else if input.ContentURL != "" {
		contentType = "video"
	}

	lesson := models.Lesson{
		ModuleID:    moduleID,
		Title:       input.Title,
		ContentType: contentType,
		ContentURL:  input.ContentURL,
		BodyText:    input.BodyText,
		SortOrder:   input.SortOrder,
	}

	if err := config.DB.Create(&lesson).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create lesson"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Lesson created", "lesson": lesson})
}

// GET /api/instructor/analytics - Dashboard stats: students, revenue, popular courses
func GetInstructorAnalytics(c *fiber.Ctx) error {
	instructorIDStr, _ := c.Locals("user_id").(string)
	instructorID, _ := uuid.Parse(instructorIDStr)

	// Get all courses by this instructor
	var courses []models.Course
	config.DB.Where("instructor_id = ?", instructorID).Find(&courses)

	courseIDs := make([]uuid.UUID, len(courses))
	for i, co := range courses {
		courseIDs[i] = co.ID
	}

	// Total students (unique enrollments)
	var totalStudents int64
	config.DB.Model(&models.Enrollment{}).Where("course_id IN ?", courseIDs).Count(&totalStudents)

	// Total revenue
	var totalRevenue float64
	config.DB.Model(&models.Enrollment{}).
		Joins("JOIN courses ON courses.id = enrollments.course_id").
		Where("courses.instructor_id = ?", instructorID).
		Select("COALESCE(SUM(courses.price), 0)").
		Scan(&totalRevenue)

	// Popular courses (with enrollment count)
	type CourseStat struct {
		ID           uuid.UUID `json:"id"`
		Title        string    `json:"title"`
		ThumbnailURL string    `json:"thumbnail_url"`
		Price        float64   `json:"price"`
		StudentCount int64     `json:"student_count"`
	}

	var courseStats []CourseStat
	config.DB.Model(&models.Course{}).
		Select("courses.id, courses.title, courses.thumbnail_url, courses.price, COUNT(enrollments.id) as student_count").
		Joins("LEFT JOIN enrollments ON enrollments.course_id = courses.id").
		Where("courses.instructor_id = ?", instructorID).
		Group("courses.id").
		Order("student_count DESC").
		Scan(&courseStats)

	return c.JSON(fiber.Map{
		"total_courses":  len(courses),
		"total_students": totalStudents,
		"total_revenue":  totalRevenue,
		"top_courses":    courseStats,
	})
}

// GET /api/user/my-courses - Student dashboard: enrolled courses + progress
func GetMyLearning(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("user_id").(string)
	userID, _ := uuid.Parse(userIDStr)

	type EnrolledCourse struct {
		models.Course
		TotalLessons     int64   `json:"total_lessons"`
		CompletedLessons int64   `json:"completed_lessons"`
		Progress         float64 `json:"progress_percent"`
	}

	var enrollments []models.Enrollment
	config.DB.Where("user_id = ?", userID).Find(&enrollments)

	var result []EnrolledCourse
	for _, en := range enrollments {
		var course models.Course
		config.DB.First(&course, "id = ?", en.CourseID)

		var totalLessons int64
		config.DB.Model(&models.Lesson{}).
			Joins("JOIN modules ON modules.id = lessons.module_id").
			Where("modules.course_id = ?", en.CourseID).
			Count(&totalLessons)

		var completedLessons int64
		config.DB.Model(&models.Progress{}).
			Joins("JOIN lessons ON lessons.id = progresses.lesson_id").
			Joins("JOIN modules ON modules.id = lessons.module_id").
			Where("progresses.user_id = ? AND modules.course_id = ? AND progresses.is_completed = true", userID, en.CourseID).
			Count(&completedLessons)

		percent := 0.0
		if totalLessons > 0 {
			percent = float64(completedLessons) / float64(totalLessons) * 100
		}

		result = append(result, EnrolledCourse{
			Course:           course,
			TotalLessons:     totalLessons,
			CompletedLessons: completedLessons,
			Progress:         percent,
		})
	}

	return c.JSON(fiber.Map{"my_courses": result})
}

// ensure gorm is used
var _ *gorm.DB
