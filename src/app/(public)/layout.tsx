import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MainWrapper } from "@/components/layout/MainWrapper";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
