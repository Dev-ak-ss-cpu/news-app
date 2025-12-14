"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Input, Button } from "@heroui/react";
import { genericPostApi } from "@/app/Helper";
import { setUserData } from "@/app/utils/auth";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ setPageToggle }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminSecret: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminSecret, setShowAdminSecret] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setError(""); // Clear previous errors

        try {
            const response = await genericPostApi("/api/auth/login", {
                email: formData.email,
                password: formData.password,
                adminSecret: formData.adminSecret,
            });

            if (response?.success) {
                // Store user data only (no token)
                setUserData(response.data);

                addToast({
                    title: "Success",
                    description: response.message || "User logged in successfully",
                    variant: "success",
                });

                // Check if user is admin and redirect to dashboard
                if (response.data.role === "admin") {
                    window.location.href = "/admin/dashboard";
                } else {
                    window.location.href = "/";
                }
            } else {
                const errorMsg = response?.message || "Login failed";
                setError(errorMsg);
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error?.message || "Something went wrong. Please try again.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md p-4 shadow-lg">
                <CardHeader className="flex flex-col gap-1">
                    <h4
                        className="text-2xl font-semibold text-center"
                        style={{ fontFamily: '"Geist Fallback"' }}
                    >
                        Admin Login
                    </h4>
                    <p className="text-center text-zinc-500 mt-1 text-sm">
                        Enter your email, password, and admin secret to continue
                    </p>
                </CardHeader>

                <CardBody>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center justify-center my-4 w-full gap-4"
                    >
                        <Input
                            type="email"
                            label="Email"
                            variant="bordered"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            placeholder="Enter your email"
                            className="w-full"
                            isRequired
                        />

                        <Input
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            variant="bordered"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                            placeholder="Enter your password"
                            className="w-full"
                            isRequired
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="text-gray-500" size={18} />
                                    ) : (
                                        <Eye className="text-gray-500" size={18} />
                                    )}
                                </button>
                            }
                        />

                        <Input
                            type={showAdminSecret ? "text" : "password"}
                            label="Admin Secret"
                            variant="bordered"
                            value={formData.adminSecret}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    adminSecret: e.target.value,
                                }))
                            }
                            placeholder="Enter admin secret"
                            className="w-full"
                            isRequired
                            description="Required for admin login"
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowAdminSecret((prev) => !prev)}
                                    className="focus:outline-none"
                                >
                                    {showAdminSecret ? (
                                        <EyeOff className="text-gray-500" size={18} />
                                    ) : (
                                        <Eye className="text-gray-500" size={18} />
                                    )}
                                </button>
                            }
                        />

                        {/* Error Display */}
                        {error && (
                            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            color="primary"
                            isLoading={isLoading}
                        >
                            Login
                        </Button>
                    </form>

                    {setPageToggle && (
                        <p className="text-center text-sm text-zinc-500 mt-4">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setPageToggle(1)}
                                className="text-blue-600 hover:underline font-medium bg-transparent border-none outline-none cursor-pointer"
                            >
                                Sign Up
                            </button>
                        </p>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
