import Image from "next/image";

export default function Avatar2D({
    seed,
    size = 44,
    className = "",
}: {
    seed: string;
    size?: number;
    className?: string;
}) {
    // DiceBear (SVG) via URL — no SDK, cero dependencia
    // estilos: adventurer, avataaars, bottts, fun-emoji, lorelei, micah, etc.
    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0b1220`;

    return (
        <div
            className={[
                "overflow-hidden rounded-2xl border border-white/10 bg-zinc-950",
                className,
            ].join(" ")}
            style={{ width: size, height: size }}
        >
            <Image
                src={url}
                alt="avatar"
                width={size}
                height={size}
                className="h-full w-full object-cover"
                unoptimized
            />
        </div>
    );
}
