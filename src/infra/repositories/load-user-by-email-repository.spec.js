const { MongoClient } = require('mongodb');
const LoadUserByEmailRepository = require('./load-user-by-email-repository');

let connection;
let db;

const makeSut = () => {
  const userModel = db.collection('users');
  const sut = new LoadUserByEmailRepository(userModel);
  return { sut, userModel };
};

describe('LoadUserByEmailRepository', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany();
  });

  afterAll(async () => {
    connection.close();
  });

  test('Should return null if no user is found', async () => {
    const { sut } = makeSut();
    const user = await sut.load('invalid_email@email.com');
    expect(user).toBeNull();
  });

  test('Should return an user if user is found', async () => {
    const { sut, userModel } = makeSut();
    const userData = {
      email: 'any_email@email.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password',
    };
    const { insertedId } = await userModel.insertOne(userData);
    const user = await sut.load('any_email@email.com');
    expect(user).toEqual({
      _id: insertedId,
      password: userData.password,
    });
  });
});
