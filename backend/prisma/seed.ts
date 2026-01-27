import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function ensureDefaultAdmin() {
  console.log('🌱 Verificare/creare utilizator ADMIN implicit (admin@local.dev)...');

  // Verifică dacă există deja un utilizator ADMIN implicit
  const existingDefaultAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@local.dev',
    },
  });

  if (existingDefaultAdmin) {
    console.log('✅ Utilizatorul ADMIN implicit există deja. Email:', existingDefaultAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@local.dev',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Utilizatorul ADMIN implicit a fost creat cu succes!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Parola: admin123');
}

async function ensureScheleAdmin() {
  console.log('🌱 Verificare/creare utilizator ADMIN pentru schele.360digital.ro (admin@schele.com)...');

  const existingScheleAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@schele.com',
    },
  });

  if (existingScheleAdmin) {
    console.log('✅ Utilizatorul ADMIN admin@schele.com există deja.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin098', 10);

  const adminSchele = await prisma.user.create({
    data: {
      email: 'admin@schele.com',
      password: hashedPassword,
      name: 'Admin Schele',
      role: 'ADMIN',
    },
  });

  console.log('✅ Utilizatorul ADMIN pentru schele.360digital.ro a fost creat cu succes!');
  console.log('📧 Email:', adminSchele.email);
  console.log('🔑 Parola: Admin098');
}

async function main() {
  console.log('🌱 Pornire seed pentru utilizatori ADMIN...');

  await ensureDefaultAdmin();
  await ensureScheleAdmin();

  console.log('🌱 Seed pentru utilizatori ADMIN finalizat.');
}

main()
  .catch((e) => {
    console.error('❌ Eroare la rularea seed-ului:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
