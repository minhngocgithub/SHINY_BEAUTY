const User = require('../models/user.models');
const { generateAccessToken, generateRefreshToken } = require('../utils/createToken');

// OAuth Success Handler
const oauthSuccess = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'OAuth authentication failed'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.isAdmin);
        const refreshToken = generateRefreshToken(user._id);

        // Update refresh token in database
        await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

        // Remove sensitive data
        const { password, refreshToken: _, ...userData } = user.toObject();

        // Redirect to frontend with tokens
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const redirectUrl = `${frontendBaseUrl}/oauth-success?` + 
            `accessToken=${accessToken}&` +
            `refreshToken=${refreshToken}&` +
            `userData=${encodeURIComponent(JSON.stringify(userData))}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('OAuth Success Error:', error);
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        res.redirect(`${frontendBaseUrl}/oauth-error?message=${encodeURIComponent('Authentication failed')}`);
    }
};

// OAuth Failure Handler
const oauthFailure = (req, res) => {
    console.error('OAuth Failure:', req.query);
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendBaseUrl}/oauth-error?message=${encodeURIComponent('Authentication failed')}`);
};

// Get OAuth URLs
const getOAuthUrls = (req, res) => {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    const oauthUrls = {
        google: `${baseUrl}/api/v1/auth/oauth/google`,
        facebook: `${baseUrl}/api/v1/auth/oauth/facebook`,
        twitter: `${baseUrl}/api/v1/auth/oauth/twitter`
    };

    res.json({
        success: true,
        oauthUrls
    });
};

// Link OAuth account to existing user
const linkOAuthAccount = async (req, res) => {
    try {
        const { provider, providerId } = req.body;
        const userId = req.user._id;

        const updateData = {};
        updateData[`${provider}Id`] = providerId;
        updateData.isOAuthUser = true;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: `${provider} account linked successfully`,
            user
        });

    } catch (error) {
        console.error('Link OAuth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to link OAuth account'
        });
    }
};

// Unlink OAuth account
const unlinkOAuthAccount = async (req, res) => {
    try {
        const { provider } = req.body;
        const userId = req.user._id;

        const updateData = {};
        updateData[`${provider}Id`] = null;

        // Check if user has password before unlinking
        const user = await User.findById(userId);
        if (!user.password || user.password.startsWith('oauth_user_')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot unlink OAuth account. Please set a password first.'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: `${provider} account unlinked successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Unlink OAuth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlink OAuth account'
        });
    }
};

module.exports = {
    oauthSuccess,
    oauthFailure,
    getOAuthUrls,
    linkOAuthAccount,
    unlinkOAuthAccount
}; 