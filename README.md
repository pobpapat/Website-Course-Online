# Golang React Project

This repository contains a full-stack application with:

- `frontend/` - React application built with Vite
- `backend/` - Go backend API

## Project Structure

- `frontend/`
  - React + Vite frontend
- `backend/`
  - Go backend service

## Frontend

This folder contains the React frontend application built with Vite.

### Setup

1. Open a terminal in `frontend/`.
2. Install dependencies:
   - `npm install` or `pnpm install`

### Run

- `npm run dev` or `pnpm dev`

### Notes

- This project uses React with Vite.
- If you add TypeScript later, update the project configuration and ESLint settings.

## Backend

This folder contains the Go backend service for the project.

### Setup

1. Open a terminal in `backend/`.
2. Install dependencies:
   - `go mod tidy`

### Run

- `go run ./...`

### Notes

- Make sure Go is installed.
- Configure any environment variables or database settings before running.

## General Setup

1. Start backend
   - Open terminal in `backend/`
   - Follow the backend instructions above

2. Start frontend
   - Open terminal in `frontend/`
   - Follow the frontend instructions above

## General Notes

- Use `npm install` or `pnpm install` in `frontend/` before running the React app.
- Use `go mod tidy` in `backend/` before running the backend.
- Adjust ports and configuration values in the code as needed.
