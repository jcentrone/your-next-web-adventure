import React, { useEffect } from 'react';
import Shepherd from 'shepherd.js';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {

  useEffect(() => {
    // Helper function to wait for an element to exist
    const waitForElement = (selector: string, timeout = 10000): Promise<Element | null> => {
      return new Promise((resolve) => {
        const existingElement = document.querySelector(selector);
        if (existingElement) {
          resolve(existingElement);
          return;
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Timeout fallback
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, timeout);
      });
    };

    // Helper function to get fallback elements
    const getElementSelector = (selectors: string[]): string | null => {
      for (const selector of selectors) {
        if (document.querySelector(selector)) {
          return selector;
        }
      }
      return null;
    };

    const startTour = async () => {
      try {
        console.log('Initializing onboarding tour...');
        
        // Wait for main content to be ready
        await waitForElement('#main-content, main, body', 5000);
        
        const tour = new Shepherd.Tour({
          useModalOverlay: true,
          defaultStepOptions: {
            classes: 'shepherd-theme-custom',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 12
          },
        });

        // Dynamically build steps based on available elements
        const buildSteps = () => {
          const steps = [];

          // Welcome step - always show this
          steps.push({
            id: 'welcome',
            text: `
              <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">Welcome to HomeReportPro! 🎉</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Let's take a quick tour to help you get started with your inspection business platform.
                </p>
              </div>
            `,
            attachTo: { element: getElementSelector(['#main-content', 'main', 'body']) || 'body', on: 'top' as const },
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
          });

          // Navigation step - if header nav exists
          const navSelector = getElementSelector(['header nav', 'nav', 'header']);
          if (navSelector) {
            steps.push({
              id: 'navigation',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">Main Navigation</h3>
                  <p class="text-sm text-muted-foreground">
                    Your main navigation bar gives you access to all key features of your inspection business.
                  </p>
                </div>
              `,
              attachTo: { element: navSelector, on: 'bottom' as const },
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
            });
          }

          // Reports step - if reports link exists
          const reportsSelector = getElementSelector(['a[href="/reports"]', 'a[href*="reports"]']);
          if (reportsSelector) {
            steps.push({
              id: 'reports',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">Reports Section</h3>
                  <p class="text-sm text-muted-foreground">
                    Create, manage, and customize your inspection reports. This is where you'll spend most of your time creating professional inspection documents.
                  </p>
                </div>
              `,
              attachTo: { element: reportsSelector, on: 'bottom' as const },
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
            });
          }

          // Calendar step - if calendar link exists
          const calendarSelector = getElementSelector(['a[href="/calendar"]', 'a[href*="calendar"]']);
          if (calendarSelector) {
            steps.push({
              id: 'calendar',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">Calendar & Scheduling</h3>
                  <p class="text-sm text-muted-foreground">
                    Schedule appointments, track your inspection timeline, and manage your availability.
                  </p>
                </div>
              `,
              attachTo: { element: calendarSelector, on: 'bottom' as const },
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
            });
          }

          // Contacts step - if contacts link exists
          const contactsSelector = getElementSelector(['a[href="/contacts"]', 'a[href*="contacts"]']);
          if (contactsSelector) {
            steps.push({
              id: 'contacts',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">Contacts & Accounts</h3>
                  <p class="text-sm text-muted-foreground">
                    Manage your client relationships, track contact information, and organize your business accounts.
                  </p>
                </div>
              `,
              attachTo: { element: contactsSelector, on: 'bottom' as const },
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
            });
          }

          // Settings step - try to find avatar/settings button
          const settingsSelector = getElementSelector([
            'button img[alt="avatar"]', 
            'button:has(img[alt="avatar"])',
            '[data-testid="avatar"]',
            '.avatar',
            'button[class*="avatar"]',
            'button[class*="rounded-full"]',
            'a[href="/settings"]',
            'a[href*="settings"]'
          ]);
          
          if (settingsSelector) {
            steps.push({
              id: 'settings',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">⚙️ Settings (Important!)</h3>
                  <p class="text-sm text-muted-foreground mb-3">
                    <strong>Don't forget to set up your profile!</strong> Configure your business information, report templates, and preferences here.
                  </p>
                  <p class="text-xs text-muted-foreground">
                    ${settingsSelector.includes('avatar') ? 'Click on your avatar in the top right to access settings.' : 'Click here to access settings.'}
                  </p>
                </div>
              `,
              attachTo: { element: settingsSelector, on: 'left' as const },
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
            });
          } else {
            // If no settings element found, add a general completion step
            steps.push({
              id: 'complete',
              text: `
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">🎉 You're All Set!</h3>
                  <p class="text-sm text-muted-foreground mb-3">
                    You've completed the tour! Don't forget to set up your profile in the settings when you have a chance.
                  </p>
                  <p class="text-xs text-muted-foreground">
                    You can restart this tour anytime from your account settings.
                  </p>
                </div>
              `,
              attachTo: { element: getElementSelector(['#main-content', 'main', 'body']) || 'body', on: 'top' as const },
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
            });
          }

          return steps;
        };

        const steps = buildSteps();
        console.log(`Built ${steps.length} tour steps based on available elements`);

        if (steps.length === 0) {
          console.warn('No tour steps could be created - no suitable elements found');
          onComplete();
          return;
        }

        const handleTourComplete = () => {
          console.log('Tour completed');
          onComplete();
        };

        // Add error handling for each step
        steps.forEach((step, index) => {
          try {
            tour.addStep(step);
          } catch (error) {
            console.error(`Failed to add step ${index}:`, error);
          }
        });

        tour.on('complete', handleTourComplete);
        tour.on('cancel', handleTourComplete);

        // Add error handling for tour start
        tour.on('start', () => {
          console.log('Tour started successfully');
        });

        console.log('Starting onboarding tour');
        tour.start();

        return () => {
          try {
            tour.complete();
          } catch (error) {
            console.error('Error completing tour:', error);
          }
        };

      } catch (error) {
        console.error('Error initializing onboarding tour:', error);
        // Still call onComplete to prevent blocking the user
        onComplete();
      }
    };

    // Add longer delay and retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const initTour = async () => {
      try {
        await startTour();
      } catch (error) {
        console.error(`Tour initialization failed (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying tour initialization in 2 seconds...`);
          setTimeout(initTour, 2000);
        } else {
          console.error('Max retries reached, giving up on tour');
          onComplete();
        }
      }
    };

    // Initial delay before starting - longer delay for navigation
    const timer = setTimeout(initTour, 5000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  return null;
};

export default OnboardingTour;