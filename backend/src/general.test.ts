import { createBenchmark, getBenchmarks, getUserBenchmarks } from "./controllers/benchmarksController";
import { registerUser } from "./controllers/userController";
import { prisma } from "./utils/db";

// Note about DB resetting:
//  Executing "npx prisma migrate reset" inside before jest, rather than executing it inside the beforeAll.
//  Check npm "test" command in package.json.
beforeAll(async () => {
  // Prisma seeding for testing.

  const numOfUsers = Math.floor(Math.random() * 5) + 1;
  let users = [];

  for (let i = 0; i < numOfUsers; i++) {
    const user = await prisma.user.create({
      data: {
        username: 'testing' + i,
        password: 'some_password',
        password_salt: 'some_password_salt'
      }
    });
    users.push(user);
  }

  for (let i = 0; i < 12; i++) {
    const userRandIndex = Math.floor(Math.random() * numOfUsers);
    // Not sure why I need to await this.
    //  All prisma (Promise) queries are being resolved internally and I'm also not returning anything,
    //  but doing getBenchmarks doesn't return anything if I don't await createBenchmark.
    await createBenchmark({
      username: users[userRandIndex].username,
      elapsedTime: Math.floor(Math.random() * 20),
      WPM: Math.floor(Math.random() * 200)
    });
  }
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe('Benchmarks route functionality', () => {
  it('Should return 10 recent benchmarks', async () => {
    const benchmarks = await getBenchmarks();
    expect(benchmarks).toHaveLength(10);
  });

  it('Should return zero or more of the user\'s benchmarks.', async () => {
    const benchmarks = await getUserBenchmarks('testing'); 
    expect(benchmarks.length).toBeGreaterThanOrEqual(0);
  });

  it('Should return no benchmarks for an invalid user.', async () => {
    const benchmarks = await getUserBenchmarks('invalid_user');
    expect(benchmarks).toHaveLength(0);
  });
});

describe('User route functionality', () => {
  it('Should register the user successfully.', async () => {
    const registerObj = await registerUser('test983240905', '3294238948238942893');
    expect(registerObj.user).not.toBeNull();
  });

  it('Should throw a Zod validation error on invalid registration field.', async () => {
    const registerObj = await registerUser('!_test', 'asdsf123');
    expect(registerObj.registerError).not.toBeNull();
  });

  it('Should throw a user already exists error if registering with taken username.', async () => {
    const registerObj = await registerUser('testing0', 'asdsf123');
    expect(registerObj.registerError).not.toBeNull();
  });
});
