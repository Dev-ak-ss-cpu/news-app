"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from '@heroui/react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onOpenChange,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    type = "danger",
    icon: CustomIcon,
    showWarning = true,
    warningText = "This action cannot be undone."
}) {
    const icons = {
        danger: AlertTriangle,
        warning: AlertTriangle,
        info: Info,
        success: CheckCircle
    };

    const colorSchemes = {
        danger: {
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            warningBg: "bg-red-50",
            warningBorder: "border-red-200",
            warningTitleColor: "text-red-900",
            warningTextColor: "text-red-700",
            buttonClass: "bg-red-600 hover:bg-red-700"
        },
        warning: {
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            warningBg: "bg-amber-50",
            warningBorder: "border-amber-200",
            warningTitleColor: "text-amber-900",
            warningTextColor: "text-amber-700",
            buttonClass: "bg-amber-600 hover:bg-amber-700"
        },
        info: {
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            warningBg: "bg-blue-50",
            warningBorder: "border-blue-200",
            warningTitleColor: "text-blue-900",
            warningTextColor: "text-blue-700",
            buttonClass: "bg-blue-600 hover:bg-blue-700"
        },
        success: {
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            warningBg: "bg-green-50",
            warningBorder: "border-green-200",
            warningTitleColor: "text-green-900",
            warningTextColor: "text-green-700",
            buttonClass: "bg-green-600 hover:bg-green-700"
        }
    };

    const Icon = CustomIcon || icons[type] || AlertTriangle;
    const colors = colorSchemes[type] || colorSchemes.danger;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                                    <Icon size={24} className={colors.iconColor} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <p className="text-gray-700">{message}</p>
                                {showWarning && (
                                    <div className={`p-4 ${colors.warningBg} border ${colors.warningBorder} rounded-lg`}>
                                        <div className="flex items-start gap-3">
                                            <div className="space-y-1">
                                                <p className={`text-sm ${colors.warningTextColor}`}>
                                                    {warningText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="bordered"
                                onPress={onClose}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                color={type === 'success' ? 'success' : type === 'info' ? 'primary' : 'danger'}
                                onPress={() => {
                                    onConfirm?.();
                                    onClose();
                                }}
                                className={colors.buttonClass}
                            >
                                {confirmText}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
