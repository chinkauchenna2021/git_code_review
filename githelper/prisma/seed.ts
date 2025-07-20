
import { PrismaClient, Plan, SubscriptionStatus, AccountType, TeamRole } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      name: 'Test User',
      githubUsername: 'testuser',
      emailVerified: new Date(),
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Create a subscription for the user
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: Plan.PRO,
      status: SubscriptionStatus.ACTIVE,
      reviewsLimit: 100,
      repositoriesLimit: 10,
      teamMembersLimit: 5,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log(`Created subscription with id: ${subscription.id}`);

  // Create a GitHub installation for the user
  const installation = await prisma.githubInstallation.create({
    data: {
      userId: user.id,
      installationId: Math.floor(Math.random() * 1000000),
      accountType: AccountType.USER,
      accountLogin: 'testuser',
    },
  });

  console.log(`Created GitHub installation with id: ${installation.id}`);

  // Create a repository
  const repository = await prisma.repository.create({
    data: {
      ownerId: user.id,
      installationId: installation.id,
      githubId: Math.floor(Math.random() * 10000000),
      name: 'saas-helper',
      fullName: 'testuser/saas-helper',
      private: true,
      language: 'TypeScript',
      defaultBranch: 'main',
      isActive: true,
      autoReview: true,
    },
  });

  console.log(`Created repository with id: ${repository.id}`);

  // Create a team
  const team = await prisma.team.create({
    data: {
      ownerId: user.id,
      name: 'Test Team',
      slug: 'test-team',
    },
  });

  console.log(`Created team with id: ${team.id}`);

  // Add the user as a member of the team
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: user.id,
      role: TeamRole.OWNER,
    },
  });

  console.log(`Added user ${user.id} to team ${team.id} as an owner`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
