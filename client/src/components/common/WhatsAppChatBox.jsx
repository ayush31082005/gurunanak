import { X } from "lucide-react";
import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "918423573070";
const DEFAULT_MESSAGE =
    "Hello Gurunanak Pharmacy, I need help with my order and medicines.";

const WhatsAppChatBox = ({
    className = "",
    bottomOffsetClassName = "bottom-[96px] sm:bottom-[92px]",
}) => {
    const [isPromptVisible, setIsPromptVisible] = useState(true);

    const whatsappUrl = useMemo(() => {
        const query = new URLSearchParams({ text: DEFAULT_MESSAGE }).toString();
        return `https://wa.me/${WHATSAPP_NUMBER}?${query}`;
    }, []);

    return (
        <div
            className={`fixed right-4 z-50 flex flex-col items-end gap-3 ${bottomOffsetClassName} ${className}`.trim()}
        >
            {isPromptVisible ? (
                <div className="w-[260px] rounded-[24px] border border-emerald-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                    <button
                        type="button"
                        onClick={() => setIsPromptVisible(false)}
                        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close WhatsApp prompt"
                    >
                        <X size={14} />
                    </button>

                    <p className="pr-5 text-sm font-semibold text-slate-900">
                        Need help with medicines or orders?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Chat with our support team on WhatsApp for quick help.
                    </p>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5b]"
                    >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white p-[2px]">
                            <img
                                src="/whatsapp-logo.svg"
                                alt=""
                                aria-hidden="true"
                                className="block h-full w-full rounded-full object-contain"
                            />
                        </span>
                        Chat on WhatsApp
                    </a>
                </div>
            ) : null}

            <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open WhatsApp chat"
                className="block h-14 w-14 overflow-hidden rounded-full bg-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] transition hover:scale-105"
            >
                <img
                    src="/whatsapp-logo.svg"
                    alt=""
                    aria-hidden="true"
                    className="block h-full w-full rounded-full"
                />
            </a>
        </div>
    );
};

export default WhatsAppChatBox;
