const request = require('supertest');
const assert = require('assert');
const app = require('../../src/app');
const configureTests = require('../test-helpers/setup');
const TaskModel = require('../../src/models/task');
const { createValidTask } = require('../test-helpers/factory');

const testObj = {
  id: '5b743ebf3b188904e4e8f74d',
  name: 'john',
  description: 'John cool man',
  timestamp: new Date(2018, 7, 16).toISOString(),
};
const wrongId = '5b743ebf3b188904e4e8f';
const wrongIdErr = {
  code: 400,
  message: 'Task validation failed: _id: Cast to ObjectID failed for value "5b743ebf3b188904e4e8f" at path "_id"',
};
const alreadyExistsErr = {
  code: 409,
  message: "E11000 duplicate key error index: todosdb.tasks.$_id_ dup key: { : ObjectId('5b743ebf3b188904e4e8f74d') }",
};
const wrongTimestampErr = {
  code: 400,
  message: 'Task validation failed: timestamp: Cast to Date failed for value "wrongTimeStamp" at path "timestamp"',
};
const wrongNameErr = {
  code: 400,
  message: 'Task validation failed: name: Path `name` (`fdafasdfasdfsadfsadfsafsadfsadfsadfsadfsdfsadfsadfsadfasdfsafs`) is longer than the maximum allowed length (50).',
};
const noNameErr = {
  code: 400,
  message: 'Task validation failed: name: Path `name` is required.',
};
const noDataErr = {
  code: 400,
  message: "you don't pass any data",
};

describe('Tasks API', () => {
  describe('POST /task', () => {
    function requestFunc(sendObj, status) {
      return request(app)
        .post('/todo')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(sendObj))
        .expect(status);
    }

    describe('creating a valid task with passed id', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        requestFunc(testObj, 201)
          .end((err, res) => {
            if (err) return done(err);
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, testObj);
      });
      it('Should create valid document in db', async () => {
        const doc = await TaskModel.findById(testObj.id);
        const findObj = doc.toObject();
        assert.deepEqual(findObj, testObj);
      });
    });

    describe('creating a valid task without id and timestamp', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        const testObj2 = Object.assign({}, testObj);
        delete testObj2.id;
        delete testObj2.timestamp;
        requestFunc(testObj2, 201)
          .end((err, res) => {
            if (err) return done(err);
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert(respObj.id);
        assert.deepEqual(respObj.name, testObj.name);
        assert.deepEqual(respObj.description, testObj.description);
        assert.deepEqual(respObj.timestamp, testObj.timestamp);
        return true;
      });
      it('Should create valid document in db', async () => {
        const doc = await TaskModel.findById(respObj.id);
        const savedObj = doc.toObject();
        assert.deepEqual(savedObj, respObj);
      });
    });

    describe('creating a task with invalid id', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        const testObj2 = Object.assign({}, testObj);
        testObj2.id = wrongId;
        requestFunc(testObj2, 400)
          .end((err, res) => {
            if (err) return done(err);
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, wrongIdErr);
      });
      it('Should not create document in db', async () => {
        const result = await TaskModel.findOne({});
        assert(!result);
      });
    });

    describe('creating a task with an id of the already existed task', () => {
      let respObj;
      before(configureTests);
      before(async () => {
        const createdObj = Object.assign({}, testObj);
        createdObj._id = createdObj.id;
        await TaskModel.create(createdObj);
      });
      before((done) => {
        requestFunc(testObj, 409)
          .end((err, res) => {
            if (err) return done(err);
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, alreadyExistsErr);
      });
      it('Should not create another document in db', async () => {
        const result = await TaskModel.find({});
        assert(result.length === 1);
      });
    });

    describe('creating a task passing an invalid timestamp', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        const testObj2 = Object.assign({}, testObj);
        testObj2.timestamp = 'wrongTimeStamp';
        requestFunc(testObj2, 400)
          .end((err, res) => {
            if (err) return done(err);
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, wrongTimestampErr);
      });
      it('Should not create document in db', async () => {
        const doc = await TaskModel.findById(testObj.id);
        assert(!doc);
      });
    });

    describe('creating a task without name', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        const testObj2 = Object.assign({}, testObj);
        testObj2.name = '';
        requestFunc(testObj2, 400)
          .end((err, res) => {
            if (err) return done(err);
            respObj = res.body;
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, noNameErr);
      });
      it('Should not create document in db', async () => {
        const doc = await TaskModel.findById(testObj.id);
        assert(!doc);
      });
    });

    describe('creating a task with invalid name', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        const testObj2 = Object.assign({}, testObj);
        testObj2.name = 'fdafasdfasdfsadfsadfsafsadfsadfsadfsadfsdfsadfsadfsadfasdfsafs';
        requestFunc(testObj2, 400)
          .end((err, res) => {
            if (err) return err;
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response object', () => {
        assert.deepEqual(respObj, wrongNameErr);
      });
      it('Should not create document in db', async () => {
        const doc = await TaskModel.findById(testObj.id);
        assert(!doc);
      });
    });

    describe('creating a task without req.body', () => {
      let respObj;
      before(configureTests);
      before((done) => {
        requestFunc({}, 400)
          .end((err, res) => {
            if (err) return err;
            respObj = Object.assign({}, res.body);
            return done();
          });
      });

      it('Should return valid response', () => {
        assert.deepEqual(respObj, noDataErr);
      });
      it('Should not create document in db', async () => {
        const doc = await TaskModel.findById(testObj.id);
        assert(!doc);
      });
    });
  });

  describe('GET /task/:id', () => {
    describe('reading a task', () => {
      before(async () => {
        await configureTests();
        await createValidTask(testObj);
      });
      it('should return valid response', (done) => {
        request(app)
          .get(`/todo/${testObj.id}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            assert.deepEqual(res.body, testObj);
            return done();
          });
      });
    });

    describe('reading a task passing an invalid id', () => {
      before(async () => {
        await configureTests();
        await createValidTask(testObj);
      });
      it('should return valid response', (done) => {
        request(app)
          .get(`/todo/${wrongId}`)
          .expect(400, { code: 400, message: 'wrong id' }, done);
      });
    });

    describe('reading a task passing id of the non-existed task', () => {
      before(async () => {
        await configureTests();
        await createValidTask(testObj);
      });
      it('should return valid response', (done) => {
        const anotherId = testObj.id.replace('d', 'c');
        request(app)
          .get(`/todo/${anotherId}`)
          .expect(404, { code: 404, message: 'Task not found' }, done);
      });
    });
  });

  describe('PUT /task/:id', () => {
    function putFunc(sendObj, id) {
      return request(app)
        .put(`/todo/${id}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(sendObj));
    }
    const newData = { name: 'Vasya', description: 'new description' };

    describe('updating a task passing name and description', () => {
      const expectedObj = Object.assign({}, testObj, newData);
      let respObj;
      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc(newData, testObj.id);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 201);
        assert.deepEqual(respObj.body, expectedObj);
      });

      it('should update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        return assert.deepEqual(doc, expectedObj);
      });
    });

    describe('updating a task passing only name', () => {
      const newData2 = Object.assign({}, newData);
      delete newData2.description;
      const expectedObj = Object.assign({}, testObj, newData2);
      let respObj;
      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc(newData2, testObj.id);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 201);
        assert.deepEqual(respObj.body, expectedObj);
      });

      it('should update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        assert.deepEqual(doc, expectedObj);
      });
    });

    describe('updating passing empty request object', () => {
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc({}, testObj.id);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 400);
        assert.deepEqual(respObj.body, noDataErr);
      });

      it('should not update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        assert.deepEqual(doc, testObj);
      });
    });

    describe('updating a task passing an invalid id', () => {
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc(newData, wrongId);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 400);
        assert.deepEqual(respObj.body, { code: 400, message: 'wrong id' });
      });

      it('should not update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        assert.deepEqual(doc, testObj);
      });
    });

    describe('updating a task passing id of the non-existed task', () => {
      const anotherId = testObj.id.replace('d', 'c');
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc(newData, anotherId);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 404);
        assert.deepEqual(respObj.body, { code: 404, message: 'Task not found' });
      });

      it('should not update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        assert.deepEqual(doc, testObj);
      });

      it('should not create another task in db', async () => {
        const anotherDoc = await TaskModel.findById(anotherId);
        assert(!anotherDoc);
      });
    });

    describe('updating a task passing forbidden params', () => {
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await putFunc(testObj, testObj.id);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 403);
        assert.deepEqual(respObj.body, { code: 403, message: 'You try to update forbidden parameter id' });
      });

      it('should not update task in db', async () => {
        const newDoc = await TaskModel.findById(testObj.id);
        const doc = newDoc.toObject();
        assert.deepEqual(doc, testObj);
      });
    });
  });

  describe('DELETE /task/:id', () => {
    describe('delete a task passing a valid id', () => {
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await request(app).delete(`/todo/${testObj.id}`);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 204);
      });

      it('should delete task from db', async () => {
        const result = await TaskModel.findById(testObj.id);
        assert(!result);
      });
    });

    describe('deleting a task passing an invalid id', () => {
      let respObj;

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await request(app).delete(`/todo/${wrongId}`);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 400);
        assert.deepEqual(respObj.body, { code: 400, message: 'wrong id' });
      });
    });

    describe('deleting a task passing id of the non-existed task', () => {
      let respObj;
      const anotherId = testObj.id.replace('d', 'c');

      before(async () => {
        await configureTests();
        await createValidTask(testObj);
        respObj = await request(app).delete(`/todo/${anotherId}`);
      });

      it('should return valid response', () => {
        assert.deepEqual(respObj.status, 404);
        assert.deepEqual(respObj.body, { code: 404, message: 'Task not found' });
      });
    });
  });

  describe('GET /tasks (get all tasks from db)', () => {
    const tasksArray = [
      testObj,
      {
        id: '5b743ebf3b188904e4e8f74c',
        name: 'vasya',
        description: 'Vasya cool man',
        timestamp: new Date(2018, 7, 17).toISOString(),
      }, {
        id: '5b743ebf3b188904e4e8f74e',
        name: 'will',
        description: 'Will cool man',
        timestamp: new Date(2018, 7, 18).toISOString(),
      },
    ];

    describe('reading all tasks without query params', () => {
      before(async () => {
        await configureTests();
        await createValidTask(tasksArray[0]);
        await createValidTask(tasksArray[1]);
        await createValidTask(tasksArray[2]);
      });

      it('should return valid response', async () => {
        const res = await request(app).get('/todos');
        assert.deepEqual(res.status, 200);
        assert.deepEqual(res.body, tasksArray.reverse());
      });
    });

    describe('reading all tasks with params { sortBy: "name", sortOrder: "asc" }', () => {
      before(async () => {
        await configureTests();
        await createValidTask(tasksArray[0]);
        await createValidTask(tasksArray[1]);
        await createValidTask(tasksArray[2]);
      });

      it('should return valid response', async () => {
        const res = await request(app).get('/todos?sortBy=name&sortOrder=asc');
        assert.deepEqual(res.status, 200);
        assert.deepEqual(res.body, tasksArray.reverse());
      });
    });

    describe('reading all tasks with params { limit: 1, offset: 2 }', () => {
      before(async () => {
        await configureTests();
        await createValidTask(tasksArray[0]);
        await createValidTask(tasksArray[1]);
        await createValidTask(tasksArray[2]);
      });

      it('should return valid response', async () => {
        const res = await request(app).get('/todos?limit=1&offset=2');
        assert.deepEqual(res.status, 200);
        assert.deepEqual(res.body, [tasksArray[0]]);
      });
    });

    describe('reading all tasks with params { sortBy: "description", sortOrder: "desc", limit: 1, offset: 2 }', () => {
      before(async () => {
        await configureTests();
        await createValidTask(tasksArray[0]);
        await createValidTask(tasksArray[1]);
        await createValidTask(tasksArray[2]);
      });

      it('should return valid response', async () => {
        const res = await request(app).get('/todos?sortBy=name&sortOrder=desc&limit=1&offset=2');
        assert.deepEqual(res.status, 200);
        assert.deepEqual(res.body, [tasksArray[0]]);
      });
    });
  });
});
