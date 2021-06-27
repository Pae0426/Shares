FROM golang:latest

WORKDIR /go/src/app

#COPY go.mod .
#COPY go.sum .
#RUN go mod download

COPY main.go .
COPY static/ ./static
#COPY package/ .
COPY views/ ./views

CMD ["go", "run", "main.go"]
