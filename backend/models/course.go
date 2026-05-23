package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Course struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title        string    `gorm:"type:varchar(255);not null" json:"title"`
	Description  string    `gorm:"type:text" json:"description"`
	ThumbnailURL string    `gorm:"type:varchar(255)" json:"thumbnail_url"`
	Price        float64   `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	InstructorID uuid.UUID `gorm:"type:uuid;not null" json:"instructor_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Instructor   User      `gorm:"foreignKey:InstructorID" json:"instructor,omitempty"`
	Modules      []Module  `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE;" json:"modules,omitempty"`
	Enrollments  []Enrollment `gorm:"foreignKey:CourseID" json:"enrollments,omitempty"`
}

type Module struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null;index" json:"course_id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	SortOrder int       `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Lessons []Lesson `gorm:"foreignKey:ModuleID;constraint:OnDelete:CASCADE;" json:"lessons,omitempty"`
}

type Lesson struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ModuleID    uuid.UUID `gorm:"type:uuid;not null;index" json:"module_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	ContentType string    `gorm:"type:varchar(20);not null;default:'video'" json:"content_type"` // video, article
	ContentURL  string    `gorm:"type:varchar(255)" json:"content_url"` // path to video or article
	BodyText    string    `gorm:"type:text" json:"body_text"` // rich text for articles
	SortOrder   int       `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
