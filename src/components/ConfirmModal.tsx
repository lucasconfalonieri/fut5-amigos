"use client";

import { useEffect, useRef } from "react";

type ConfirmModalProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "Eliminar",
    cancelLabel = "Cancelar",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    if (!open) return null;

    return (
        <dialog
            ref={dialogRef}
            onCancel={(e) => {
                e.preventDefault();
                if (!loading) onCancel();
            }}
            className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            style={{ colorScheme: "dark" }}
        >
            <div className="p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{message}</p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm font-medium hover:border-white/20 hover:bg-zinc-800 disabled:opacity-40 transition"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40 transition"
                    >
                        {loading ? "Eliminando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
