package routes

import (
	"edusphere-backend/controllers"
	"edusphere-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// ==================== AUTH ====================
	auth := api.Group("/auth")
	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)

	// ==================== PUBLIC COURSES ====================
	courses := api.Group("/courses")
	courses.Get("/", controllers.GetCourses)
	courses.Get("/:id", controllers.GetCourseDetail)

	// ==================== STUDENT (Protected) ====================
	student := api.Group("/", middleware.Protected())
	student.Post("/courses/:id/enroll", controllers.EnrollCourse)
	student.Get("/courses/:id/learn", controllers.GetLearningContent)
	student.Post("/lessons/:id/complete", controllers.CompleteLesson)
	student.Get("/user/my-courses", controllers.GetMyLearning)
	student.Get("/user/profile", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id": c.Locals("user_id"),
			"role":    c.Locals("role"),
		})
	})

	// ==================== INSTRUCTOR (Protected + Role Check) ====================
	instructor := api.Group("/instructor", middleware.Protected(), middleware.InstructorOnly())
	instructor.Get("/courses", controllers.GetInstructorCourses)
	instructor.Post("/courses", controllers.CreateCourse)
	instructor.Post("/courses/:id/modules", controllers.CreateModule)
	instructor.Post("/modules/:id/lessons", controllers.CreateLesson)
	instructor.Get("/analytics", controllers.GetInstructorAnalytics)

	// ==================== FILE UPLOAD (Protected) ====================
	api.Post("/upload", middleware.Protected(), controllers.UploadFile)
}
