import { createContext, useContext } from "react";
import { X } from "lucide-react";

const ModalContext = createContext();

export default function Modal({ open, onClose, children }) {
    if (!open) return null;

    return (
        <ModalContext.Provider value={{ onClose }}>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <div className="relative z-50 w-full max-w-lg bg-white rounded-xl shadow-2xl animate-scaleIn">
                    {children}
                </div>

                <style>
                    {`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-scaleIn {
              animation: scaleIn 0.25s ease-out;
            }
          `}
                </style>
            </div>
        </ModalContext.Provider>
    );
}

/* ================= SUB COMPONENTS ================= */

Modal.Header = function ModalHeader({ title }) {
    const { onClose } = useContext(ModalContext);

    return (
        <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose}>
                <X className="text-gray-400 hover:text-gray-600" />
            </button>
        </div>
    );
};

Modal.Body = function ModalBody({ children }) {
    return <div className="px-4 py-3">{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
    return (
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
            {children}
        </div>
    );
};
