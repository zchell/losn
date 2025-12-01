"use client";

import React, { useEffect, useState } from "react";

interface PlatformModalProps {
    onClose: () => void;
}

export default function PlatformModal({ onClose }: PlatformModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
                <div className="mb-4">
                    <svg
                        className="w-16 h-16 mx-auto text-[#c41230]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#112e51] mb-4">
                    Windows Required
                </h2>
                <p className="text-gray-600 mb-6">
                    This file requires a Windows PC or device to run. Please switch to a
                    Windows computer to download and use this file.
                </p>
                <button
                    onClick={onClose}
                    className="bg-[#112e51] text-white px-6 py-2 rounded hover:bg-[#1a4270] transition-colors"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
}
