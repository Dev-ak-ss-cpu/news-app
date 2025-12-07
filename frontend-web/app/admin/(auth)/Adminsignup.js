"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Input, Button } from "@heroui/react";
import { genericPostApi } from "@/app/Helper";
import { setUserData } from "@/app/utils/auth";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";

export default function Signup({ setPageToggle }) {
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "error",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "error",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await genericPostApi("/api/auth/signup", {
                name: formData.name,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: "admin", // Default role, can be changed later
            });

            if (response?.success) {
                // Store user data only (no token)
                setUserData(response.data);

                addToast({
                    title: "Success",
                    description: response.message || "User registered successfully",
                    variant: "success",
                });

                // Redirect based on role
                if (response.data.role === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/");
                }
            } else {
                addToast({
                    title: "Error",
                    description: response?.message || "Signup failed",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Signup error:", error);
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
                        Create Account
                    </h4>
                    <p className="text-center text-zinc-500 mt-1 text-sm">
                        Enter your details to create an account
                    </p>
                </CardHeader>

                <CardBody>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center justify-center my-4 w-full gap-4"
                    >
                        <Input
                            type="text"
                            label="First Name"
                            variant="bordered"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Enter your first name"
                            className="w-full"
                            isRequired
                        />

                        <Input
                            type="text"
                            label="Last Name"
                            variant="bordered"
                            value={formData.lastName}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            placeholder="Enter your last name"
                            className="w-full"
                        />

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
                            type="tel"
                            label="Phone (Optional)"
                            variant="bordered"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                }))
                            }
                            placeholder="Enter your phone number"
                            className="w-full"
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
                            minLength={6}
                        />

                        <Input
                            type="password"
                            label="Confirm Password"
                            variant="bordered"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                }))
                            }
                            placeholder="Confirm your password"
                            className="w-full"
                            isRequired
                            minLength={6}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            color="primary"
                            isLoading={isLoading}
                        >
                            Sign Up
                        </Button>
                    </form>

                    {setPageToggle && (
                        <p className="text-center text-sm text-zinc-500 mt-4">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setPageToggle(0)}
                                className="text-blue-600 hover:underline font-medium bg-transparent border-none outline-none cursor-pointer"
                            >
                                Login
                            </button>
                        </p>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}