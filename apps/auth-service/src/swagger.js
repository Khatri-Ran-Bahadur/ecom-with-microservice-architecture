import swaggerAutogen from "swagger-autogen";


const doc = {
    info: {
        title: "Auth Service API",
        description: "Auth Service API",
    },
    host: "localhost:6001",
    schemes: ["http"],
}

const outputFile = "./swagger-output.json"
const endpointsFiles = ["./routes/auth.router.ts"]

swaggerAutogen(outputFile, endpointsFiles, doc)