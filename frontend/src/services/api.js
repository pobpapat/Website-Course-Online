const BASE_URL = 'http://localhost:8080/api'

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

// AUTH
export const registerAPI = (data) =>
  fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json())

export const loginAPI = (data) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json())

// COURSES
export const getCoursesAPI = (params = '') =>
  fetch(`${BASE_URL}/courses${params}`).then(r => r.json())

export const getCourseDetailAPI = (id) =>
  fetch(`${BASE_URL}/courses/${id}`).then(r => r.json())

export const enrollCourseAPI = (id, token) =>
  fetch(`${BASE_URL}/courses/${id}/enroll`, { method: 'POST', headers: getHeaders(token) }).then(r => r.json())

export const getLearningContentAPI = (id, token) =>
  fetch(`${BASE_URL}/courses/${id}/learn`, { headers: getHeaders(token) }).then(r => r.json())

export const completeLessonAPI = (lessonId, token) =>
  fetch(`${BASE_URL}/lessons/${lessonId}/complete`, { method: 'POST', headers: getHeaders(token) }).then(r => r.json())

// STUDENT DASHBOARD
export const getMyCoursesAPI = (token) =>
  fetch(`${BASE_URL}/user/my-courses`, { headers: getHeaders(token) }).then(r => r.json())

// INSTRUCTOR
export const getInstructorCoursesAPI = (token) =>
  fetch(`${BASE_URL}/instructor/courses`, { headers: getHeaders(token) }).then(r => r.json())

export const createCourseAPI = (data, token) =>
  fetch(`${BASE_URL}/instructor/courses`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) }).then(r => r.json())

export const createModuleAPI = (courseId, data, token) =>
  fetch(`${BASE_URL}/instructor/courses/${courseId}/modules`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) }).then(r => r.json())

export const createLessonAPI = (moduleId, data, token) =>
  fetch(`${BASE_URL}/instructor/modules/${moduleId}/lessons`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) }).then(r => r.json())

export const getInstructorAnalyticsAPI = (token) =>
  fetch(`${BASE_URL}/instructor/analytics`, { headers: getHeaders(token) }).then(r => r.json())

// FILE UPLOAD
export const uploadFileAPI = (file, token) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${BASE_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }).then(r => r.json())
}
