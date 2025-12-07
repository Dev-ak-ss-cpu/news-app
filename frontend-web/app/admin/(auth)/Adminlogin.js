"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Input, Button } from "@heroui/react";
import { genericPostApi } from "@/app/Helper";
import { setUserData } from "@/app/utils/auth";
import { addToast } from "@heroui/toast";

export default function Login({ setPageToggle }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminSecret: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

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
                addToast({
                    title: "Error",
                    description: response?.message || "Login failed",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            addToast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "error",
            });
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
                            type="password"
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
                        />

                        <Input
                            type="password"
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
                        />

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
