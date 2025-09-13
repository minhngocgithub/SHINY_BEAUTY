const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user.models');
const { generateAccessToken, generateRefreshToken } = require('../utils/createToken');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/oauth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Kiểm tra user đã tồn tại chưa
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // User đã tồn tại, cập nhật thông tin OAuth
            user.googleId = profile.id;
            user.avatar = {
                public_id: profile.id,
                url: profile.photos[0].value
            };
            await user.save();
            return done(null, user);
        }
        
        // Tạo user mới
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: {
                public_id: profile.id,
                url: profile.photos[0].value
            },
            password: 'oauth_user_' + Math.random().toString(36).substr(2, 9), // Random password cho OAuth user
            isOAuthUser: true
        });
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook OAuth Strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "/api/v1/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         let user = await User.findOne({ email: profile.emails[0].value });
        
//         if (user) {
//             user.facebookId = profile.id;
//             user.avatar = {
//                 public_id: profile.id,
//                 url: profile.photos[0].value
//             };
//             await user.save();
//             return done(null, user);
//         }
        
//         user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             facebookId: profile.id,
//             avatar: {
//                 public_id: profile.id,
//                 url: profile.photos[0].value
//             },
//             password: 'oauth_user_' + Math.random().toString(36).substr(2, 9),
//             isOAuthUser: true
//         });
        
//         return done(null, user);
//     } catch (error) {
//         return done(error, null);
//     }
// }));

// Twitter OAuth Strategy
// passport.use(new TwitterStrategy({
//     consumerKey: process.env.TWITTER_CONSUMER_KEY,
//     consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//     callbackURL: "/api/v1/auth/twitter/callback",
//     includeEmail: true
// }, async (token, tokenSecret, profile, done) => {
//     try {
//         // Twitter có thể không cung cấp email, sử dụng username
//         const email = profile.emails ? profile.emails[0].value : `${profile.username}@twitter.com`;
        
//         let user = await User.findOne({ email: email });
        
//         if (user) {
//             user.twitterId = profile.id;
//             user.avatar = {
//                 public_id: profile.id,
//                 url: profile.photos[0].value
//             };
//             await user.save();
//             return done(null, user);
//         }
        
//         user = await User.create({
//             name: profile.displayName || profile.username,
//             email: email,
//             twitterId: profile.id,
//             avatar: {
//                 public_id: profile.id,
//                 url: profile.photos[0].value
//             },
//             password: 'oauth_user_' + Math.random().toString(36).substr(2, 9),
//             isOAuthUser: true
//         });
        
//         return done(null, user);
//     } catch (error) {
//         return done(error, null);
//     }
// }));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 