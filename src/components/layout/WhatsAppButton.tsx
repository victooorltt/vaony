import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hi Vaony! I'd like to know more about your tutoring.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3.5 text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6" />
    </a>
  );
}
