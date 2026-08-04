import {
  AnnouncementBar,
  ChromeStateProvider,
  MobileMenu,
  SearchOverlay,
  SiteFooter,
  SiteHeader,
} from "@/shared/layout";
import { CollectionSection } from "./CollectionSection";
import { DiscoverySection } from "./DiscoverySection";
import { ExploreSection } from "./ExploreSection";
import { HeroSection } from "./HeroSection";
import { KitsSection } from "./KitsSection";
import { ManifestoSection } from "./ManifestoSection";
import { NewsletterSection } from "./NewsletterSection";
import { PassportSection } from "./PassportSection";

export function LandingPage() {
  return (
    <ChromeStateProvider>
      <AnnouncementBar />
      <SiteHeader />
      <MobileMenu />
      <main>
        <HeroSection />
        <ManifestoSection />
        <DiscoverySection />
        <ExploreSection />
        <CollectionSection />
        <PassportSection />
        <KitsSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
      <SearchOverlay />
    </ChromeStateProvider>
  );
}
