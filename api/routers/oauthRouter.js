const express = require('express');
const passport = require('passport');
const { authenticate } = require('../middleware/auth.middleware');
const {
    oauthSuccess,
    oauthFailure,
    getOAuthUrls,
    linkOAuthAccount,
    unlinkOAuthAccount
} = require('../controller/oauthController');

const router = express.Router();

// Get OAuth URLs
router.get('/urls', getOAuthUrls);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/api/v1/auth/oauth/failure' }),
    oauthSuccess
);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/api/v1/auth/oauth/failure' }),
    oauthSuccess
);

// Twitter OAuth Routes
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/api/v1/auth/oauth/failure' }),
    oauthSuccess
);

// OAuth Failure Route
router.get('/failure', oauthFailure);

// Link/Unlink OAuth accounts (requires authentication)
router.post('/link', authenticate, linkOAuthAccount);
router.post('/unlink', authenticate, unlinkOAuthAccount);

module.exports = router; 