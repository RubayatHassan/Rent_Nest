import "dotenv/config";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log(`Database connected successfully on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDatabase();
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
