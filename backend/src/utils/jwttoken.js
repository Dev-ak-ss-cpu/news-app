import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


export const generateToken = async (userId, res) => {
    if (!userId) return null;
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        const isProd = process.env.NODE_ENV === "production";
        const domain = isProd ? ".jkkhabarnow.com" : undefined;

        // Setting Cookie
        res.cookie("authUser", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            path: "/",
            domain
        });

        console.log("Token Generated Successfully");
        return token;
    } catch (error) {
        console.log("Getting Error in token generation ", error);
        return null;
    }
};

// Verify token function
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};
