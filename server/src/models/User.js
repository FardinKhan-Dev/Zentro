import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        googleId: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Please provide a phone number'],
            trim: true,
        },
        addresses: [
            {
                street: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                zipCode: { type: String, required: true },
                country: { type: String, default: 'India' },
                phoneNumber: { type: String }, // Contact for this specific address
                isDefault: { type: Boolean, default: false },
            }
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            default: null,
            select: false,
        },
        emailVerificationTokenExpire: {
            type: Date,
            default: null,
            select: false,
        },
        passwordResetToken: {
            type: String,
            default: null,
            select: false,
        },
        passwordResetTokenExpire: {
            type: Date,
            default: null,
            select: false,
        },
        refreshTokenVersion: {
            type: Number,
            default: 1,
        },
        loginOTP: {
            type: String,
            select: false,
        },
        loginOTPExpire: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generateEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token; // Return unencrypted token to send to user
};

userSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetTokenExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    return token; // Return unencrypted token to send to user
};

userSchema.methods.invalidateTokens = function () {
    this.refreshTokenVersion += 1;
};

const User = mongoose.model('User', userSchema);
export default User;
// Named export for compatibility if needed
export { User };
