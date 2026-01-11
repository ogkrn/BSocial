import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('Karan@123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: '230050101076@uktech.net.in' },
    update: {
      passwordHash,
    },
    create: {
      email: '230050101076@uktech.net.in',
      passwordHash,
      fullName: 'Karan Joshi',
      username: 'karan_joshi',
      branch: 'Computer Science',
      year: '3rd Year',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Created test user:', testUser.email);
  console.log('   Username:', testUser.username);
  console.log('   Password: Karan@123');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
