FROM golang:latest

WORKDIR /go/src/app

RUN apt-get update -y && apt-get install -y git
RUN go get github.com/go-sql-driver/mysql
RUN go get github.com/joho/godotenv

COPY main.go .
COPY static/ ./static
#COPY package/ .
COPY views/ ./views

EXPOSE 9000
CMD ["go", "run", "main.go"]
