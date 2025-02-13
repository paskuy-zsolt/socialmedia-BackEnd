import * as chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { responseError, responseServerError } from '../utils/responseUtils.js';

const { expect } = chai;

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        sinon.restore();  // Ensure no lingering stubs
        req = { headers: {} };
        res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 401 if authorization token is missing', () => {
        authMiddleware(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ success: false, error: { message: 'Authorization token is missing' } })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should call next() if the token is valid', () => {
        const token = 'valid-token';
        req.headers['authorization'] = `Bearer ${token}`;

        const tokenData = { userID: '123' };
        sinon.stub(jwt, 'verify').returns(tokenData);

        authMiddleware(req, res, next);

        expect(jwt.verify.calledWith(token, process.env.JWT_SECRET)).to.be.true;
        expect(req.user).to.deep.equal({ ...tokenData, _id: tokenData.userID });
        expect(next.calledOnce).to.be.true;
    });

    it('should return 401 if the token has expired', () => {
        const token = 'expired-token';
        req.headers['authorization'] = `Bearer ${token}`;

        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        sinon.stub(jwt, 'verify').throws(error);

        authMiddleware(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ success: false, error: { message: 'Token has expired.' } })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should return 403 if the token is invalid', () => {
        const token = 'invalid-token';
        req.headers['authorization'] = `Bearer ${token}`;

        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        sinon.stub(jwt, 'verify').throws(error);

        authMiddleware(req, res, next);

        expect(res.status.calledWith(403)).to.be.true;
        expect(res.json.calledWith({ success: false, error: { message: 'Invalid token.' } })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should return 500 if there is an unexpected error', () => {
        const token = 'unexpected-error-token';
        req.headers['authorization'] = `Bearer ${token}`;

        const error = new Error('Unexpected error');
        sinon.stub(jwt, 'verify').throws(error);

        authMiddleware(req, res, next);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ success: false, error: { message: 'Internal Server Error.' } })).to.be.true;
        expect(next.called).to.be.false;
    });
});