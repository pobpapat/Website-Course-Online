# Backend Dockerfile for Go Fiber API
FROM golang:1.26-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o /app/edusphere-backend ./...

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=builder /app/edusphere-backend /app/edusphere-backend

EXPOSE 8080
ENV PORT=8080
CMD ["/app/edusphere-backend"]
