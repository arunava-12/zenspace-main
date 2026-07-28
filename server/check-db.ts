import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ take: 5 })
  const projects = await prisma.project.findMany({ take: 5 })
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })))
  console.log('Projects:', projects.map(p => ({ id: p.id, name: p.name })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
