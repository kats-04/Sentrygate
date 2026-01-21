import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import User from '../models/User.js';
import { register, login } from '../controllers/authController.js';

describe('Authentication Tests', () => {
  let req; let res; let next;

  beforeEach(() => {
    req = {
      body: {},
      user: null
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      cookie: sinon.stub().returnsThis()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return null (user doesn't exist)
      sinon.stub(User, 'findOne').resolves(null);

      // Mock User.prototype.save
      const saveStub = sinon.stub().resolves({
        _id: 'user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'User'
      });
      sinon.stub(User.prototype, 'save').callsFake(saveStub);

      await register(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message', 'User registered successfully');
    });

    it('should return error for existing user', async () => {
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return existing user
      sinon.stub(User, 'findOne').resolves({
        _id: 'existing_id',
        email: 'existing@example.com'
      });

      await register(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error', 'User already exists');
    });
  });

  describe('User Login', () => {
    it('should login user with correct credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'User',
        comparePassword: sinon.stub().resolves(true)
      };

      // Mock User.findOne to return user
      sinon.stub(User, 'findOne').resolves(mockUser);

      await login(req, res, next);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message', 'Login successful');
      expect(res.json.firstCall.args[0]).to.have.property('user');
      expect(res.json.firstCall.args[0]).to.have.property('token');
    });

    it('should return error for invalid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        comparePassword: sinon.stub().resolves(false)
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      await login(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('error', 'Invalid credentials');
    });
  });
});
