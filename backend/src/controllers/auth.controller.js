import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwttoken.js";
import { verifyToken } from "../utils/jwttoken.js";

// Helper function to generate random string (if not already available)
const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const login = async (req, res) => {
    const { email, password, adminSecret } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
            data: null,
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                data: null,
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null,
            });
        }

        // Check if user is trying to login as admin
        if (user.role === "admin") {
            // Verify admin secret
            const requiredAdminSecret = process.env.ADMIN_SECRET || "AdmLog@1234";
            console.log("my",requiredAdminSecret,"ur",adminSecret)
            if (!adminSecret || adminSecret !== requiredAdminSecret) {
                return res.status(403).json({
                    success: false,
                    message: "Admin secret is required for admin login",
                    data: null,
                });
            }
        }

        // Email verification check - COMMENTED OUT
        // if (!user.verified) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Please verify your email before logging in",
        //         data: {
        //             verified: false,
        //             email: user.email,
        //         },
        //     });
        // }

        // Generate token
        const tokenResponse = await generateToken(user._id, res);
        if (!tokenResponse) throw new Error("Token generation failed");

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: tokenResponse, // Also return token in response for frontend storage
            },
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login",
            data: null,
        });
    }
};

export const signup = async (req, res) => {
    try {
        const { name, lastName, email, password, role, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
                data: null,
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
                data: null,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token - COMMENTED OUT FOR NOW
        // const verificationToken = generateRandomString(20);

        // Create new user - Auto verify for now
        const newUser = await User.create({
            name,
            lastName,
            email,
            password: hashedPassword,
            // verificationToken,
            role: role || "user",
            phone,
            verified: true, // Auto verify for now
        });

        // Email verification - COMMENTED OUT
        // const emailResponse = await sendEmail({
        //     name: newUser.name,
        //     email: newUser.email,
        //     verificationToken: newUser.verificationToken,
        //     type: "verify"
        // });
        // 
        // if (!emailResponse.success) {
        //     console.error("⚠️ Verification email failed:", emailResponse.message);
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to send verification email. Please try again later.",
        //         data: null,
        //     });
        // }

        // Generate token and login immediately after signup
        const tokenResponse = await generateToken(newUser._id, res);

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                verified: newUser.verified,
                token: tokenResponse,
            },
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error during signup.",
            error: error.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the httpOnly cookie
        res.clearCookie("authUser", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            domain: process.env.NODE_ENV === "production" ? ".gymfreak.store" : undefined
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
            data: null,
        });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during logout",
            data: null,
        });
    }
};

export const verifyAuth = async (req, res) => {
    try {
        // Get token from cookie (httpOnly cookie)
        const token = req.cookies?.authUser;
        
        // Also check Authorization header as fallback
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;
        
        // Use cookie token first, then header token
        const tokenToVerify = token || headerToken;
        
        if (!tokenToVerify) {
            return res.status(401).json({
                success: false,
                message: "No authentication token found",
                data: null,
            });
        }

        // Verify token
        const decoded = verifyToken(tokenToVerify);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
                data: null,
            });
        }

        // Get user data
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Authentication verified",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in verifyAuth:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during verification",
            data: null,
        });
    }
};

