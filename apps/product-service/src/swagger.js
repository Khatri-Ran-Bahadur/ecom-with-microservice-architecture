import swaggerAutogen from "swagger-autogen";


const doc = {
    info: {
        title: "Product Service API",
        description: "Product Service API",
    },
    host: "localhost:6002",
    schemes: ["http"],
}

const outputFile = "./swagger-output.json"
const endpointsFiles = ["./routes/product.router.ts"]

swaggerAutogen(outputFile, endpointsFiles, doc)