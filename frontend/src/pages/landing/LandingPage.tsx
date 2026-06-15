import React from 'react';
import {
    HeroSection, TrustSection, FeaturesSection, LearningPathsSection,
    HowItWorksSection,
    TestimonialsSection,
    Footer,
} from '../../components/landing';

export function LandingPage() {
    return (
        <div className="bg-white overflow-x-hidden">
            <HeroSection />
            <TrustSection />
            <FeaturesSection />
            <LearningPathsSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <Footer />
        </div>
    );
}
 
