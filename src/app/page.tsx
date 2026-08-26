import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VisitStats from "@/components/VisitStats";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Products from "@/components/Products";
import ClientReviews from "@/components/ClientReviews";
import HireSection from "@/components/HireSection";
import Certificates from "@/components/Certificates";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import { getApprovedReviews, getContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const content = getContent();
  const vis = content.sectionVisibility;
  const reviews = getApprovedReviews();
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 5;

  return (
    <main className="flex-1">
      <Navbar content={content} />
      {vis.hero !== false && <Hero content={content} />}
      {vis.stats !== false && (
        <VisitStats content={content} rating={rating} reviewCount={reviewCount} />
      )}
      {vis.summary !== false && <About content={content} />}
      {vis.experience !== false && <Experience content={content} />}
      {vis.education !== false && <Education content={content} />}
      {vis.skills !== false && <Skills content={content} />}
      {vis.projects !== false && <Projects content={content} />}
      {vis.shop !== false && <Products content={content} />}
      {vis.reviews !== false && (
        <ClientReviews content={content} reviews={reviews} />
      )}
      {vis.hire !== false && <HireSection content={content} />}
      {vis.certificates !== false && <Certificates content={content} />}
      {vis.footer !== false && <Footer content={content} />}
      {vis.ai !== false && <AIAssistant content={content} />}
    </main>
  );
}
