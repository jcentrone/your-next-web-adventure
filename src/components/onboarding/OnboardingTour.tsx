import React, { useEffect } from 'react';
import Shepherd from 'shepherd.js';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {

  useEffect(() => {
    // Wait for DOM to be ready and navigation to be fully rendered
    const startTour = () => {
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shadow-md bg-card text-card-foreground rounded-lg border',
          scrollTo: { behavior: 'smooth', block: 'center' },
          modalOverlayOpeningPadding: 4,
        },
      });

      const steps = [
        {
          id: 'welcome',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">Welcome to HomeReportPro! 🎉</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Let's take a quick tour to help you get started with your inspection business platform.
              </p>
            </div>
          `,
          attachTo: { element: '#main-content', on: 'top' as const },
          buttons: [
            {
              text: 'Start Tour',
              action: function() {
                return this.next();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md'
            },
            {
              text: 'Skip',
              action: function() {
                return this.complete();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md ml-2'
            }
          ]
        },
        {
          id: 'navigation',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">Main Navigation</h3>
              <p class="text-sm text-muted-foreground">
                Your main navigation bar gives you access to all key features of your inspection business.
              </p>
            </div>
          `,
          attachTo: { element: 'header nav', on: 'bottom' as const },
          buttons: [
            {
              text: 'Previous',
              action: function() {
                return this.back();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md'
            },
            {
              text: 'Next',
              action: function() {
                return this.next();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md ml-2'
            }
          ]
        },
        {
          id: 'reports',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">Reports Section</h3>
              <p class="text-sm text-muted-foreground">
                Create, manage, and customize your inspection reports. This is where you'll spend most of your time creating professional inspection documents.
              </p>
            </div>
          `,
          attachTo: { element: 'a[href="/reports"]', on: 'bottom' as const },
          buttons: [
            {
              text: 'Previous',
              action: function() {
                return this.back();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md'
            },
            {
              text: 'Next',
              action: function() {
                return this.next();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md ml-2'
            }
          ]
        },
        {
          id: 'calendar',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">Calendar & Scheduling</h3>
              <p class="text-sm text-muted-foreground">
                Schedule appointments, track your inspection timeline, and manage your availability.
              </p>
            </div>
          `,
          attachTo: { element: 'a[href="/calendar"]', on: 'bottom' as const },
          buttons: [
            {
              text: 'Previous',
              action: function() {
                return this.back();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md'
            },
            {
              text: 'Next',
              action: function() {
                return this.next();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md ml-2'
            }
          ]
        },
        {
          id: 'contacts',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">Contacts & Accounts</h3>
              <p class="text-sm text-muted-foreground">
                Manage your client relationships, track contact information, and organize your business accounts.
              </p>
            </div>
          `,
          attachTo: { element: 'a[href="/contacts"]', on: 'bottom' as const },
          buttons: [
            {
              text: 'Previous',
              action: function() {
                return this.back();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md'
            },
            {
              text: 'Next',
              action: function() {
                return this.next();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md ml-2'
            }
          ]
        },
        {
          id: 'settings',
          text: `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">⚙️ Settings (Important!)</h3>
              <p class="text-sm text-muted-foreground mb-3">
                <strong>Don't forget to set up your profile!</strong> Configure your business information, report templates, and preferences here.
              </p>
              <p class="text-xs text-muted-foreground">
                Click on your avatar in the top right to access settings.
              </p>
            </div>
          `,
          attachTo: { element: 'button:has(img[alt="avatar"])', on: 'left' as const },
          buttons: [
            {
              text: 'Previous',
              action: function() {
                return this.back();
              },
              classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md'
            },
            {
              text: 'Finish Tour',
              action: function() {
                return this.complete();
              },
              classes: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md ml-2'
            }
          ]
        }
      ];

      const handleTourComplete = () => {
        onComplete();
      };

      steps.forEach(step => tour.addStep(step));

      tour.on('complete', handleTourComplete);
      tour.on('cancel', handleTourComplete);

      console.log('Starting onboarding tour');
      tour.start();

      return () => {
        tour.complete();
      };
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(startTour, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

return null;
};

export default OnboardingTour;