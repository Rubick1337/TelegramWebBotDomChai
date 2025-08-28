const jwt = require("jsonwebtoken");
const { User } = require("../models/models");

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: "30m"
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "3d"
        });

        return {
            accessToken,
            refreshToken
        };
    }

    async save(userId, refreshToken) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Пользователь не найден');
            }

            user.refreshToken = refreshToken;
            await user.save();
            return user;
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    }
}

module.exports = new TokenService();