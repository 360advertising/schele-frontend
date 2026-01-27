import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Pornire seed pentru utilizatorul ADMIN...');

  // Verifică dacă există deja un utilizator ADMIN
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN',
      deletedAt: null,
    },
  });

  if (existingAdmin) {
    console.log('✅ Utilizatorul ADMIN există deja. Email:', existingAdmin.email);
    console.log('⏭️  Seed-ul este idempotent - nu se creează un nou utilizator.');
    return;
  }

  // Hash parola
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Creează utilizatorul ADMIN
  const admin = await prisma.user.create({
    data: {
      email: 'admin@local.dev',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Utilizatorul ADMIN a fost creat cu succes!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Parola: admin123');
  console.log('👤 Rol:', admin.role);
  console.log('⚠️  IMPORTANT: Schimbați parola după prima autentificare!');
}

main()
  .catch((e) => {
    console.error('❌ Eroare la rularea seed-ului:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
