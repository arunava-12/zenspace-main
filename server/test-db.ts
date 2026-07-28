import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    datasources: { db: { url: "postgresql://postgres.ppsnnamnfylbfsywxmez:arunava1202@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=10" } }
});
async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log("Success:", user);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
