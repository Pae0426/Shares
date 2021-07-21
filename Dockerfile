FROM golang:latest

WORKDIR /go/src/app

RUN apt-get update -y && apt-get install -y git
RUN go get github.com/go-sql-driver/mysql
RUN go get github.com/joho/godotenv

COPY go.mod .
COPY go.sum .
COPY main.go .
COPY static/ ./static
#COPY package/ .
COPY views/ ./views
COPY .env .

EXPOSE 9000
CMD ["go", "run", "main.go"]
