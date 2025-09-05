import React from "react";

// InterNACHI Standards of Practice content sections
const internachiSections = [
  {
    id: "definitions",
    title: "1. Definitions and Scope",
    content: [
      {
        number: "1.1",
        text: "A home inspection is a non-invasive, visual examination of the accessible areas of a residential property (as delineated below), performed for a fee, which is designed to identify defects within specific systems and components defined by these Standards that are both observed and deemed material by the inspector. The scope of work may be modified by the Client and Inspector prior to the inspection process."
      },
      {
        text: "The home inspection is based on the observations made on the date of the inspection, and not a prediction of future conditions."
      },
      {
        text: "The home inspection will not reveal every issue that exists or ever could exist, but only those material defects observed on the date of the inspection."
      },
      {
        number: "1.2",
        text: "A material defect is a specific issue with a system or component of a residential property that may have a significant, adverse impact on the value of the property, or that poses an unreasonable risk to people. The fact that a system or component is near, at, or beyond the end of its normal, useful life is not, in itself, a material defect."
      },
      {
        number: "1.3",
        text: "A home inspection report shall identify, in written format, defects within specific systems and components defined by these Standards that are both observed and deemed material by the inspector. Inspection reports may include additional comments and recommendations."
      }
    ]
  },
  {
    id: "limitations",
    title: "2. Limitations, Exceptions and Exclusions",
    content: [
      {
        subtitle: "2.1. Limitations:",
        items: [
          "An inspection is not technically exhaustive.",
          "An inspection will not identify concealed or latent defects.",
          "An inspection will not deal with aesthetic concerns, or what could be deemed matters of taste, cosmetic defects, etc.",
          "An inspection will not determine the suitability of the property for any use.",
          "An inspection does not determine the market value of the property or its marketability.",
          "An inspection does not determine the insurability of the property.",
          "An inspection does not determine the advisability or inadvisability of the purchase of the inspected property.",
          "An inspection does not determine the life expectancy of the property or any components or systems therein.",
          "An inspection does not include items not permanently installed.",
          "This Standards of Practice applies to properties with four or fewer residential units and their attached garages and carports."
        ]
      },
      {
        subtitle: "2.2. Exclusions:",
      },
      {
        subtitle: "I. The inspector is not required to determine:",
        items: [
          "property boundary lines or encroachments.",
          "the condition of any component or system that is not readily accessible.",
          "the service life expectancy of any component or system.",
          "the size, capacity, BTU, performance or efficiency of any component or system.",
          "the cause or reason of any condition.",
          "the cause for the need of correction, repair or replacement of any system or component.",
          "future conditions.",
          "compliance with codes or regulations.",
          "the presence of evidence of rodents, birds, bats, animals, insects, or other pests.",
          "the presence of mold, mildew or fungus.",
          "the presence of airborne hazards, including radon.",
          "the air quality.",
          "the existence of environmental hazards, including lead paint, asbestos or toxic drywall.",
          "the existence of electromagnetic fields.",
          "any hazardous waste conditions.",
          "any manufacturers' recalls or conformance with manufacturer installation, or any information included for consumer protection purposes.",
          "acoustical properties.",
          "correction, replacement or repair cost estimates.",
          "estimates of the cost to operate any given system."
        ]
      },
      {
        subtitle: "II. The inspector is not required to operate:",
        items: [
          "any system that is shut down.",
          "any system that does not function properly.",
          "or evaluate low-voltage electrical systems, such as, but not limited to:",
          {
            subitems: [
              "phone lines;",
              "cable lines;", 
              "satellite dishes;",
              "antennae;",
              "lights; or",
              "remote controls."
            ]
          },
          "any system that does not turn on with the use of normal operating controls.",
          "any shut-off valves or manual stop valves.",
          "any electrical disconnect or over-current protection devices.",
          "any alarm systems.",
          "moisture meters, gas detectors or similar equipment."
        ]
      },
      {
        subtitle: "III. The inspector is not required to:",
        items: [
          "move any personal items or other obstructions, such as, but not limited to: throw rugs, carpeting, wall coverings, furniture, ceiling tiles, window coverings, equipment, plants, ice, debris, snow, water, dirt, pets, or anything else that might restrict the visual inspection.",
          "dismantle, open or uncover any system or component.",
          "enter or access any area that may, in the inspector's opinion, be unsafe.",
          "enter crawl spaces or other areas that may be unsafe or not readily accessible.",
          "inspect underground items, such as, but not limited to: lawn-irrigation systems, or underground storage tanks (or indications of their presence), whether abandoned or actively used.",
          "do anything that may, in the inspector's opinion, be unsafe or dangerous to the inspector or others, or damage property, such as, but not limited to: walking on roof surfaces, climbing ladders, entering attic spaces, or negotiating with pets.",
          "inspect decorative items.",
          "inspect common elements or areas in multi-unit housing.",
          "inspect intercoms, speaker systems or security systems.",
          "offer guarantees or warranties.",
          "offer or perform any engineering services.",
          "offer or perform any trade or professional service other than a home inspection.",
          "research the history of the property, or report on its potential for alteration, modification, extendibility or suitability for a specific or proposed use for occupancy.",
          "determine the age of construction or installation of any system, structure or component of a building, or differentiate between original construction and subsequent additions, improvements, renovations or replacements.",
          "determine the insurability of a property.",
          "perform or offer Phase 1 or environmental audits.",
          "inspect any system or component that is not included in these Standards."
        ]
      }
    ]
  },
  {
    id: "structural",
    title: "3. Structural Components",
    content: [
      {
        subtitle: "3.1. The inspector shall inspect:",
        items: [
          "the foundation.",
          "the basement.",
          "the crawl space.",
          "structural components."
        ]
      },
      {
        subtitle: "3.2. The inspector shall describe:",
        items: [
          "the type of foundation.",
          "the location of the access to the under-floor space."
        ]
      },
      {
        subtitle: "3.3. The inspector shall report as in need of correction:",
        items: [
          "observed foundation movement, settling, or abnormal or excessive foundation or floor movement.",
          "damaged or deteriorated foundation components.",
          "observed foundation and floor-structure penetrations that are not properly sealed, caulked, or otherwise weather-sealed."
        ]
      }
    ]
  }
];

// Render the full standards content for inclusion in reports
export const renderInternachiStandards = () => {
  const renderContent = (content: any) => {
    return content.map((item: any, idx: number) => {
      if (item.number && item.text) {
        return (
          <div key={idx} className="mb-3">
            <span className="font-medium">{item.number}.</span> {item.text}
          </div>
        );
      }
      
      if (item.text && !item.number) {
        return (
          <div key={idx} className="mb-2 ml-4">
            {item.text}
          </div>
        );
      }
      
      if (item.subtitle) {
        return (
          <div key={idx} className="mt-4 mb-2">
            <div className="font-medium">{item.subtitle}</div>
            {item.items && (
              <ul className="mt-2 ml-6 space-y-1">
                {item.items.map((listItem: any, listIdx: number) => {
                  if (typeof listItem === 'string') {
                    return <li key={listIdx} className="list-disc">{listItem}</li>;
                  }
                  if (listItem.subitems) {
                    return (
                      <li key={listIdx} className="list-disc">
                        <ul className="ml-6 mt-1 space-y-1">
                          {listItem.subitems.map((subitem: string, subIdx: number) => (
                            <li key={subIdx} className="list-circle">{subitem}</li>
                          ))}
                        </ul>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            )}
          </div>
        );
      }
      
      return null;
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">
          InterNACHI Standards of Practice
        </h1>
        <p className="text-sm text-muted-foreground">
          International Association of Certified Home Inspectors
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          This inspection was performed in accordance with these standards.
        </p>
      </div>

      {internachiSections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            {section.title}
          </h2>
          <div className="text-sm space-y-2">
            {renderContent(section.content)}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-muted/20 rounded border text-center">
        <p className="text-xs text-muted-foreground">
          For the most current version of the InterNACHI Standards of Practice, 
          visit: <span className="font-mono">https://www.nachi.org/sop.htm</span>
        </p>
      </div>
    </div>
  );
};

// Get text-only version for PDF generation
export const getInternachiStandardsText = () => {
  return internachiSections
    .map(section => {
      const contentText = section.content
        .map((item: any) => {
          if (item.number && item.text) {
            return `${item.number}. ${item.text}`;
          }
          if (item.text && !item.number) {
            return `    ${item.text}`;
          }
          if (item.subtitle) {
            let result = item.subtitle;
            if (item.items) {
              result += '\n' + item.items
                .map((listItem: any) => {
                  if (typeof listItem === 'string') {
                    return `  • ${listItem}`;
                  }
                  if (listItem.subitems) {
                    return listItem.subitems
                      .map((subitem: string) => `    ○ ${subitem}`)
                      .join('\n');
                  }
                  return '';
                })
                .join('\n');
            }
            return result;
          }
          return '';
        })
        .join('\n\n');
      
      return `${section.title}\n\n${contentText}`;
    })
    .join('\n\n---\n\n');
};