package models

import (
	"time"

	"github.com/google/uuid"
)

type Enrollment struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_course" json:"user_id"`
	CourseID   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_course" json:"course_id"`
	EnrolledAt time.Time `gorm:"autoCreateTime" json:"enrolled_at"`
}

type Progress struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_lesson" json:"user_id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_lesson" json:"lesson_id"`
	IsCompleted bool      `gorm:"default:false" json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}
