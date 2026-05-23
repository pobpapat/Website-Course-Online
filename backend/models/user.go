package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email        string       `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string       `gorm:"type:varchar(255);not null" json:"-"` // Not returning password in JSON
	FullName     string       `gorm:"type:varchar(100);not null" json:"full_name"`
	Role         string       `gorm:"type:varchar(20);default:'student'" json:"role"` // student, instructor, admin
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Enrollments  []Enrollment `gorm:"foreignKey:UserID" json:"enrollments,omitempty"`
}
