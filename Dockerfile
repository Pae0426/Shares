FROM golang:latest

WORKDIR /go/src/app

RUN apt-get update -y && apt-get install -y git
RUN go get github.com/go-sql-driver/mysql

COPY main.go .
COPY static/ ./static
#COPY package/ .
COPY views/ ./views

CMD ["go", "run", "main.go"]
