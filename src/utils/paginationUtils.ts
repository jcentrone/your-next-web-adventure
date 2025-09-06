export interface SectionContentAnalysis {
  sectionId: string;
  sectionKey: string;
  title: string;
  estimatedHeight: number;
  isEmpty: boolean;
  findingsCount: number;
  mediaCount: number;
}

export interface PageGroup {
  pageId: string;
  sections: SectionContentAnalysis[];
  estimatedHeight: number;
  isOverflow: boolean;
}

// Height constants for content estimation
const HEIGHTS = {
  SECTION_HEADER: 60,
  SECTION_INFO_BASE: 40,
  SECTION_INFO_PER_LINE: 20,
  EMPTY_SECTION_TEXT: 40,
  FINDING_BASE: 100,
  FINDING_PER_MEDIA: 60,
  FINDING_NARRATIVE_PER_CHAR: 0.05, // Rough estimate
  PAGE_HEIGHT: 1056, // 11 inches minus margins
  PAGE_MARGIN: 60,
  GROUP_SPACING: 30, // Space between sections on same page
} as const;

/**
 * Analyzes a section to estimate its content height
 */
export function analyzeSectionContent(section: any): SectionContentAnalysis {
  const findingsCount = section.findings?.length || 0;
  const mediaCount = section.findings?.reduce((acc: number, f: any) => acc + (f.media?.length || 0), 0) || 0;
  const isEmpty = findingsCount === 0;
  
  let estimatedHeight = HEIGHTS.SECTION_HEADER;
  
  // Add section info height (estimated based on content)
  const infoLines = Object.keys(section.info || {}).length;
  estimatedHeight += HEIGHTS.SECTION_INFO_BASE + (infoLines * HEIGHTS.SECTION_INFO_PER_LINE);
  
  if (isEmpty) {
    // Empty section just has "No material defects noted"
    estimatedHeight += HEIGHTS.EMPTY_SECTION_TEXT;
  } else {
    // Add height for each finding
    section.findings.forEach((finding: any) => {
      estimatedHeight += HEIGHTS.FINDING_BASE;
      estimatedHeight += (finding.media?.length || 0) * HEIGHTS.FINDING_PER_MEDIA;
      
      // Add height based on narrative length
      const narrativeLength = (finding.narrative?.length || 0) + (finding.recommendation?.length || 0);
      estimatedHeight += narrativeLength * HEIGHTS.FINDING_NARRATIVE_PER_CHAR;
    });
  }
  
  return {
    sectionId: section.id,
    sectionKey: section.key,
    title: section.title,
    estimatedHeight,
    isEmpty,
    findingsCount,
    mediaCount,
  };
}

/**
 * Groups sections into pages based on content size and smart pagination rules
 */
export function calculatePageLayout(sections: any[]): PageGroup[] {
  const analysisResults = sections
    .filter(sec => sec.key !== 'report_details') // Skip report details
    .map(analyzeSectionContent);
  
  const pageGroups: PageGroup[] = [];
  let currentPageSections: SectionContentAnalysis[] = [];
  let currentPageHeight = 0;
  let pageCounter = 1;
  
  const availablePageHeight = HEIGHTS.PAGE_HEIGHT - HEIGHTS.PAGE_MARGIN;
  
  for (const analysis of analysisResults) {
    const sectionWithSpacing = analysis.estimatedHeight + 
      (currentPageSections.length > 0 ? HEIGHTS.GROUP_SPACING : 0);
    
    // Decision logic for page placement
    const canFitOnCurrentPage = currentPageHeight + sectionWithSpacing <= availablePageHeight;
    const isLargeSection = analysis.estimatedHeight > availablePageHeight * 0.6; // More than 60% of page
    const currentPageHasContent = currentPageSections.length > 0;
    
    // Force new page conditions:
    // 1. Section is too large and current page has content
    // 2. Adding this section would exceed page height
    if ((!canFitOnCurrentPage || isLargeSection) && currentPageHasContent) {
      // Finalize current page
      pageGroups.push({
        pageId: `page-${pageCounter}`,
        sections: [...currentPageSections],
        estimatedHeight: currentPageHeight,
        isOverflow: false,
      });
      
      // Start new page
      currentPageSections = [];
      currentPageHeight = 0;
      pageCounter++;
    }
    
    // Add section to current page
    currentPageSections.push(analysis);
    currentPageHeight += sectionWithSpacing;
    
    // If this section is very large, force it to have its own page
    if (isLargeSection && currentPageSections.length === 1) {
      pageGroups.push({
        pageId: `page-${pageCounter}`,
        sections: [...currentPageSections],
        estimatedHeight: currentPageHeight,
        isOverflow: analysis.estimatedHeight > availablePageHeight,
      });
      
      currentPageSections = [];
      currentPageHeight = 0;
      pageCounter++;
    }
  }
  
  // Add any remaining sections
  if (currentPageSections.length > 0) {
    pageGroups.push({
      pageId: `page-${pageCounter}`,
      sections: currentPageSections,
      estimatedHeight: currentPageHeight,
      isOverflow: false,
    });
  }
  
  return pageGroups;
}

/**
 * Gets section grouping statistics for debugging/optimization
 */
export function getPageLayoutStats(pageGroups: PageGroup[]) {
  const totalSections = pageGroups.reduce((acc, group) => acc + group.sections.length, 0);
  const emptySections = pageGroups.reduce((acc, group) => 
    acc + group.sections.filter(s => s.isEmpty).length, 0
  );
  const singleSectionPages = pageGroups.filter(group => group.sections.length === 1).length;
  const multiSectionPages = pageGroups.filter(group => group.sections.length > 1).length;
  
  return {
    totalPages: pageGroups.length,
    totalSections,
    emptySections,
    singleSectionPages,
    multiSectionPages,
    averageSectionsPerPage: totalSections / pageGroups.length,
  };
}