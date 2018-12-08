const request = require('supertest');
const assert = require('assert');
const app = require('../../src/app');

describe('GET /', () => {
  it('respond with status 200 and json', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.alive, true);
        return done();
      });
  });
});
