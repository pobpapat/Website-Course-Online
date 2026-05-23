package main

import (
	"edusphere-backend/config"
	"edusphere-backend/models"
	"edusphere-backend/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found, using environment variables")
	}

	// Connect to Database
	config.ConnectDB()

	// Auto Migrate the database schema
	log.Println("Running AutoMigrate...")
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Module{},
		&models.Lesson{},
		&models.Enrollment{},
		&models.Progress{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate database: ", err)
	}
	log.Println("Database migration completed.")

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName: "EduSphere LMS API",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // In production, replace with specific domain e.g., "http://localhost:5173"
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Basic route
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "EduSphere API is running smoothly",
		})
	})

	// Setup API Routes
	routes.SetupRoutes(app)

	// Serve uploaded files as static content
	app.Static("/uploads", "./uploads")

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
