import React from "react";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";

/**
 * InterNACHI SOP page with:
 * - Sticky TOC (left)
 * - Structured content parser that respects headings (I./II.), sub-points (A./B.), numerals (1./2.), and bullets
 * - Readable typography (prose)
 */

/* =========================================================================
   DATA (add/adjust groups/titles as you like)
   ========================================================================= */
type Section = {
    id: string;
    title: string;
    group?: string;
    content: string;
};

const sections: Section[] = [
    {
        id: "definitions",
        title: "1. Definitions and Scope",
        group: "1. General",
        content: `1.1.  A home inspection is a non-invasive, visual examination of the accessible areas of a residential property (as delineated below), performed for a fee, which is designed to identify defects within specific systems and components defined by these Standards that are both observed and deemed material by the inspector.  The scope of work may be modified by the Client and Inspector prior to the inspection process.

The home inspection is based on the observations made on the date of the inspection, and not a prediction of future conditions.

The home inspection will not reveal every issue that exists or ever could exist, but only those material defects observed on the date of the inspection.
1.2.  A material defect is a specific issue with a system or component of a residential property that may have a significant, adverse impact on the value of the property, or that poses an unreasonable risk to people.  The fact that a system or component is near, at, or beyond the end of its normal, useful life is not, in itself, a material defect.

1.3.  A home inspection report shall identify, in written format, defects within specific systems and components defined by these Standards that are both observed and deemed material by the inspector.  Inspection reports may include additional comments and recommendations.`
    },
    {
        id: "limitations",
        title: "2. Limitations, Exceptions and Exclusions",
        group: "2. Limitations & Exclusions",
        content: `2.1. Limitations:
An inspection is not technically exhaustive.
An inspection will not identify concealed or latent defects. 
An inspection will not deal with aesthetic concerns, or what could be deemed matters of taste, cosmetic defects, etc. 
An inspection will not determine the suitability of the property for any use. 
An inspection does not determine the market value of the property or its marketability.
An inspection does not determine the insurability of the property. 
An inspection does not determine the advisability or inadvisability of the purchase of the inspected property. 
An inspection does not determine the life expectancy of the property or any components or systems therein. 
An inspection does not include items not permanently installed. 
This Standards of Practice applies to properties with four or fewer residential units and their attached garages and carports.


2.2. Exclusions:
I. The inspector is not required to determine:

property boundary lines or encroachments.
the condition of any component or system that is not readily accessible. 
the service life expectancy of any component or system. 
the size, capacity, BTU, performance or efficiency of any component or system. 
the cause or reason of any condition. 
the cause for the need of correction, repair or replacement of any system or component. 
future conditions. 
compliance with codes or regulations. 
the presence of evidence of rodents, birds, bats, animals, insects, or other pests. 
the presence of mold, mildew or fungus.
the presence of airborne hazards, including radon. 
the air quality. 
the existence of environmental hazards, including lead paint, asbestos or toxic drywall.
the existence of electromagnetic fields. 
any hazardous waste conditions. 
any manufacturers' recalls or conformance with manufacturer installation, or any information included for consumer protection purposes.
acoustical properties.
correction, replacement or repair cost estimates. 
estimates of the cost to operate any given system.
II. The inspector is not required to operate:

any system that is shut down.
any system that does not function properly. 
or evaluate low-voltage electrical systems, such as, but not limited to:
1. phone lines;
2. cable lines;
3. satellite dishes;
4. antennae;
5. lights; or
6. remote controls.
any system that does not turn on with the use of normal operating controls. 
any shut-off valves or manual stop valves. 
any electrical disconnect or over-current protection devices. 
any alarm systems. 
moisture meters, gas detectors or similar equipment.
III. The inspector is not required to:

move any personal items or other obstructions, such as, but not limited to:  throw rugs, carpeting, wall coverings, furniture, ceiling tiles, window coverings, equipment, plants, ice, debris, snow, water, dirt, pets, or anything else that might restrict the visual inspection.
dismantle, open or uncover any system or component.
enter or access any area that may, in the inspector's opinion, be unsafe. 
enter crawl spaces or other areas that may be unsafe or not readily accessible. 
inspect underground items, such as, but not limited to: lawn-irrigation systems, or underground storage tanks (or indications of their presence), whether abandoned or actively used. 
do anything that may, in the inspector's opinion, be unsafe or dangerous to the inspector or others, or damage property, such as, but not limited to:  walking on roof surfaces, climbing ladders, entering attic spaces, or negotiating with pets. 
inspect decorative items. 
inspect common elements or areas in multi-unit housing. 
inspect intercoms, speaker systems or security systems.
offer guarantees or warranties. 
offer or perform any engineering services. 
offer or perform any trade or professional service other than a home inspection. 
research the history of the property, or report on its potential for alteration, modification, extendibility or suitability for a specific or proposed use for occupancy. 
determine the age of construction or installation of any system, structure or component of a building, or differentiate between original construction and subsequent additions, improvements, renovations or replacements. 
determine the insurability of a property.
perform or offer Phase 1 or environmental audits.
inspect any system or component that is not included in these Standards.`
    },
    {
        id: "roof",
        title: "3.1. Roof",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect from ground level or the eaves:
the roof-covering materials;
the gutters;
the downspouts;
the vents, flashing, skylights, chimney, and other roof penetrations; and 
the general structure of the roof from the readily accessible panels, doors or stairs.
II. The inspector shall describe:
A. the type of roof-covering materials.
III. The inspector shall report as in need of correction:
A. observed indications of active roof leaks.
IV. The inspector is not required to:
walk on any roof surface.
predict the service life expectancy. 
inspect underground downspout diverter drainage pipes. 
remove snow, ice, debris or other conditions that prohibit the observation of the roof surfaces.
move insulation. 
inspect antennae, satellite dishes, lightning arresters, de-icing equipment, or similar attachments.
walk on any roof areas that appear, in the inspector's opinion, to be unsafe.
walk on any roof areas if doing so might, in the inspector's opinion, cause damage. 
perform a water test.
warrant or certify the roof.
confirm proper fastening or installation of any roof-covering material.`
    },
    {
        id: "exterior",
        title: "3.2. Exterior",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the exterior wall-covering materials; 
the eaves, soffits and fascia;
a representative number of windows;
all exterior doors;
flashing and trim;
adjacent walkways and driveways;
stairs, steps, stoops, stairways and ramps;
porches, patios, decks, balconies and carports;
railings, guards and handrails; and 
vegetation, surface drainage, retaining walls and grading of the property, where they may adversely affect the structure due to moisture intrusion. 
II. The inspector shall describe:
the type of exterior wall-covering materials.
III. The inspector shall report as in need of correction:
any improper spacing between intermediate balusters, spindles and rails.
IV. The inspector is not required to:
inspect or operate screens, storm windows, shutters, awnings, fences, outbuildings, or exterior accent lighting.
inspect items that are not visible or readily accessible from the ground, including window and door flashing. 
inspect or identify geological, geotechnical, hydrological or soil conditions. 
inspect recreational facilities or playground equipment. 
inspect seawalls, breakwalls or docks. 
inspect erosion-control or earth-stabilization measures. 
inspect for safety-type glass. 
inspect underground utilities. 
inspect underground items. 
inspect wells or springs. 
inspect solar, wind or geothermal systems. 
inspect swimming pools or spas. 
inspect wastewater treatment systems, septic systems or cesspools. 
inspect irrigation or sprinkler systems. 
inspect drainfields or dry wells. 
determine the integrity of multiple-pane window glazing or thermal window seals.`
    },
    {
        id: "basement",
        title: "3.3. Basement, Foundation, Crawl Space and Structure",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the foundation;
the basement;
the crawl space; and
structural components.
II. The inspector shall describe:
the type of foundation; and
the location of the access to the under-floor crawl space.
III. The inspector shall report as in need of correction:
observed indications of wood in contact with or near soil;
observed indications of active water penetration; 
observed indications of possible foundation movement, such as sheetrock cracks, brick cracks, out-of-square door frames, and unlevel floors; and
any observed cutting, notching and boring of framing members that may, in the inspector's opinion, present a structural or safety concern.
IV. The inspector is not required to:
enter any crawl space that is not readily accessible, or where entry could cause damage or pose a hazard to the inspector.
move stored items or debris. 
operate sump pumps with inaccessible floats. 
identify the size, spacing, span or location or determine the adequacy of foundation bolting, bracing, joists, joist spans or support systems. 
provide any engineering or architectural service. 
report on the adequacy of any structural system or component.`
    },
    {
        id: "heating",
        title: "3.4. Heating",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the heating system, using normal operating controls.
II. The inspector shall describe:
the location of the thermostat for the heating system;
the energy source; and
the heating method.
III. The inspector shall report as in need of correction:
any heating system that did not operate; and
if the heating system was deemed inaccessible.
IV. The inspector is not required to:
inspect, measure, or evaluate the interior of flues or chimneys, fire chambers, heat exchangers, combustion air systems, fresh-air intakes, makeup air, humidifiers, dehumidifiers, electronic air filters, geothermal systems, or solar heating systems.
inspect fuel tanks or underground or concealed fuel supply systems. 
determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the heating system. 
light or ignite pilot flames. 
activate heating, heat pump systems, or other heating systems when ambient temperatures or other circumstances are not conducive to safe operation or may damage the equipment. 
override electronic thermostats. 
evaluate fuel quality.
verify thermostat calibration, heat anticipation, or automatic setbacks, timers, programs or clocks.
measure or calculate the air for combustion, ventilation, or dilution of flue gases for appliances.`
    },
    {
        id: "cooling",
        title: "3.5. Cooling",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the cooling system, using normal operating controls.
II. The inspector shall describe:
the location of the thermostat for the cooling system; and
the cooling method.
III. The inspector shall report as in need of correction:
any cooling system that did not operate; and
if the cooling system was deemed inaccessible.
IV. The inspector is not required to:
determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the cooling system.
inspect portable window units, through-wall units, or electronic air filters. 
operate equipment or systems if the exterior temperature is below 65° Fahrenheit, or when other circumstances are not conducive to safe operation or may damage the equipment. 
inspect or determine thermostat calibration, cooling anticipation, or automatic setbacks or clocks. 
examine electrical current, coolant fluids or gases, or coolant leakage.`
    },
    {
        id: "plumbing",
        title: "3.6. Plumbing",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the main water supply shut-off valve;
the main fuel supply shut-off valve;
the water heating equipment, including the energy source, venting connections, temperature/pressure-relief (TPR) valves, Watts 210 valves, and seismic bracing;
interior water supply, including all fixtures and faucets, by running the water;
all toilets for proper operation by flushing;
all sinks, tubs and showers for functional drainage;
the drain, waste and vent system; and
drainage sump pumps with accessible floats.
II. The inspector shall describe:
whether the water supply is public or private based upon observed evidence;
the location of the main water supply shut-off valve;
the location of the main fuel supply shut-off valve;
the location of any observed fuel-storage system; and
the capacity of the water heating equipment, if labeled.
III. The inspector shall report as in need of correction:
deficiencies in the water supply by viewing the functional flow in two fixtures operated simultaneously;
deficiencies in the installation of hot and cold water faucets;
active plumbing water leaks that were observed during the inspection; and  
toilets that were damaged, had loose connections to the floor, were leaking, or had tank components that did not operate.
IV. The inspector is not required to:
light or ignite pilot flames.
measure the capacity, temperature, age, life expectancy or adequacy of the water heater. 
inspect the interior of flues or chimneys, combustion air systems, water softener or filtering systems, well pumps or tanks, safety or shut-off valves, floor drains, lawn sprinkler systems, or fire sprinkler systems. 
determine the exact flow rate, volume, pressure, temperature or adequacy of the water supply. 
determine the water quality, potability or reliability of the water supply or source. 
open sealed plumbing access panels. 
inspect clothes washing machines or their connections. 
operate any valve.
test shower pans, tub and shower surrounds or enclosures for leakage or for functional overflow protection. 
evaluate the compliance with conservation, energy or building standards, or the proper design or sizing of any water, waste or venting components, fixtures or piping. 
determine the effectiveness of anti-siphon, back-flow prevention or drain-stop devices. 
determine whether there are sufficient cleanouts for effective cleaning of drains. 
evaluate fuel storage tanks or supply systems.
inspect wastewater treatment systems.
inspect water treatment systems or water filters. 
inspect water storage tanks, pressure pumps, or bladder tanks. 
evaluate wait time to obtain hot water at fixtures, or perform testing of any kind to water heater elements. 
evaluate or determine the adequacy of combustion air. 
test, operate, open or close: safety controls, manual stop valves, temperature/pressure-relief valves, control valves, or check valves.
examine ancillary or auxiliary systems or components, such as, but not limited to, those related to solar water heating and hot water circulation.
determine the existence or condition of polybutylene, polyethylene, or similar plastic piping.
inspect or test for gas or fuel leaks, or indications thereof.`
    },
    {
        id: "electrical",
        title: "3.7. Electrical",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
the service drop;
the overhead service conductors and attachment point;
the service head, gooseneck and drip loops;
the service mast, service conduit and raceway;
the electric meter and base;
service-entrance conductors;
the main service disconnect;
panelboards and over-current protection devices (circuit breakers and fuses);
service grounding and bonding;
a representative number of switches, lighting fixtures and receptacles, including receptacles observed and deemed to be arc-fault circuit interrupter (AFCI)-protected using the AFCI test button, where possible;
all ground-fault circuit interrupter receptacles and circuit breakers observed and deemed to be GFCIs using a GFCI tester, where possible; and
for the presence of smoke and carbon monoxide detectors.
II. The inspector shall describe:
the main service disconnect's amperage rating, if labeled; and 
the type of wiring observed.
III. The inspector shall report as in need of correction:
deficiencies in the integrity of the service-entrance conductors’ insulation, drip loop, and vertical clearances from grade and roofs;
any unused circuit-breaker panel opening that was not filled;
the presence of solid conductor aluminum branch-circuit wiring, if readily visible;
any tested receptacle in which power was not present, polarity was incorrect, the cover was not in place, the GFCI devices were not properly installed or did not operate properly, evidence of arcing or excessive heat, and where the receptacle was not grounded or was not secured to the wall; and
the absence of smoke and/or carbon monoxide detectors.
IV. The inspector is not required to:
insert any tool, probe or device into the main panelboard, sub-panels, distribution panelboards, or electrical fixtures.
operate electrical systems that are shut down. 
remove panelboard cabinet covers or dead fronts.
operate or re-set over-current protection devices or overload devices. 
operate or test smoke or carbon monoxide detectors or alarms.
inspect, operate or test any security, fire or alarm systems or components, or other warning or signaling systems.
measure or determine the amperage or voltage of the main service equipment, if not visibly labeled.
inspect ancillary wiring or remote-control devices. 
activate any electrical systems or branch circuits that are not energized. 
inspect low-voltage systems, electrical de-icing tapes, swimming pool wiring, or any time-controlled devices. 
verify the service ground. 
inspect private or emergency electrical supply sources, including, but not limited to: generators, windmills, photovoltaic solar collectors, or battery or electrical storage facility. 
inspect spark or lightning arrestors.
inspect or test de-icing equipment. 
conduct voltage-drop calculations. 
determine the accuracy of labeling.
inspect exterior lighting.`
    },
    {
        id: "fireplace",
        title: "3.8. Fireplace",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
readily accessible and visible portions of the fireplaces and chimneys;
lintels above the fireplace openings;
damper doors by opening and closing them, if readily accessible and manually operable; and
cleanout doors and frames.
II. The inspector shall describe:
the type of fireplace.
III. The inspector shall report as in need of correction:
evidence of joint separation, damage or deterioration of the hearth, hearth extension or chambers;
manually operated dampers that did not open and close;
the lack of a smoke detector in the same room as the fireplace;
the lack of a carbon monoxide detector in the same room as the fireplace; and
cleanouts not made of metal, pre-cast cement, or other non-combustible material.
IV. The inspector is not required to:
inspect the flue or vent system.
inspect the interior of chimneys or flues, fire doors or screens, seals or gaskets, or mantels. 
determine the need for a chimney sweep. 
operate gas fireplace inserts. 
light pilot flames. 
determine the appropriateness of any installation. 
inspect automatic fuel-fed devices. 
inspect combustion and/or make-up air devices. 
inspect heat-distribution assists, whether gravity-controlled or fan-assisted. 
ignite or extinguish fires. 
determine the adequacy of drafts or draft characteristics. 
move fireplace inserts, stoves or firebox contents. 
perform a smoke test.
dismantle or remove any component.
perform a National Fire Protection Association (NFPA)-style inspection.
perform a Phase I fireplace and chimney inspection.`
    },
    {
        id: "attic",
        title: "3.9. Attic, Insulation and Ventilation",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
insulation in unfinished spaces, including attics, crawl spaces and foundation areas;
ventilation of unfinished spaces, including attics, crawl spaces and foundation areas; and
mechanical exhaust systems in the kitchen, bathrooms and laundry area.
II. The inspector shall describe:
the type of insulation observed; and
the approximate average depth of insulation observed at the unfinished attic floor area or roof structure.
III. The inspector shall report as in need of correction:
the general absence of insulation or ventilation in unfinished spaces.
IV. The inspector is not required to:
enter the attic or any unfinished spaces that are not readily accessible, or where entry could cause damage or, in the inspector's opinion, pose a safety hazard.
move, touch or disturb insulation. 
move, touch or disturb vapor retarders. 
break or otherwise damage the surface finish or weather seal on or around access panels or covers. 
identify the composition or R-value of insulation material. 
activate thermostatically operated fans. 
determine the types of materials used in insulation or wrapping of pipes, ducts, jackets, boilers or wiring.
determine the adequacy of ventilation.`
    },
    {
        id: "doors",
        title: "3.10. Doors, Windows and Interior",
        group: "3. Standards of Practice",
        content: `I. The inspector shall inspect:
a representative number of doors and windows by opening and closing them;
floors, walls and ceilings;
stairs, steps, landings, stairways and ramps;
railings, guards and handrails; and
garage vehicle doors and the operation of garage vehicle door openers, using normal operating controls.
II. The inspector shall describe:
a garage vehicle door as manually-operated or installed with a garage door opener.
III. The inspector shall report as in need of correction:
improper spacing between intermediate balusters, spindles and rails for steps, stairways, guards and railings;
photo-electric safety sensors that did not operate properly; and
any window that was obviously fogged or displayed other evidence of broken seals.
IV. The inspector is not required to:
inspect paint, wallpaper, window treatments or finish treatments.
inspect floor coverings or carpeting.
inspect central vacuum systems. 
inspect for safety glazing. 
inspect security systems or components. 
evaluate the fastening of islands, countertops, cabinets, sink tops or fixtures. 
move furniture, stored items, or any coverings, such as carpets or rugs, in order to inspect the concealed floor structure. 
move suspended-ceiling tiles. 
inspect or move any household appliances. 
inspect or operate equipment housed in the garage, except as otherwise noted. 
verify or certify the proper operation of any pressure-activated auto-reverse or related safety feature of a garage door. 
operate or evaluate any security bar release and opening mechanisms, whether interior or exterior, including their compliance with local, state or federal standards. 
operate any system, appliance or component that requires the use of special keys, codes, combinations or devices. 
operate or evaluate self-cleaning oven cycles, tilt guards/latches, or signal lights. 
inspect microwave ovens or test leakage from microwave ovens. 
operate or examine any sauna, steam-generating equipment, kiln, toaster, ice maker, coffee maker, can opener, bread warmer, blender, instant hot-water dispenser, or other small, ancillary appliances or devices. 
inspect elevators. 
inspect remote controls. 
inspect appliances. 
inspect items not permanently installed.
discover firewall compromises. 
inspect pools, spas or fountains.
determine the adequacy of whirlpool or spa jets, water force, or bubble effects. 
determine the structural integrity or leakage of pools or spas.`
    },
    {
        id: "glossary",
        title: "4. Glossary of Terms",
        group: "4. Glossary",
        content: `accessible:  In the opinion of the inspector, can be approached or entered safely, without difficulty, fear or danger.
activate:  To turn on, supply power, or enable systems, equipment or devices to become active by normal operating controls. Examples include turning on the gas or water supply valves to the fixtures and appliances, and activating electrical breakers or fuses.
adversely affect:  To constitute, or potentially constitute, a negative or destructive impact.
alarm system:  Warning devices, installed or freestanding, including, but not limited to: carbon monoxide detectors, flue gas and other spillage detectors, security equipment, ejector pumps, and smoke alarms.
appliance:  A household device operated by the use of electricity or gas. Not included in this definition are components covered under central heating, central cooling or plumbing.
architectural service:  Any practice involving the art and science of building design for construction of any structure or grouping of structures, and the use of space within and surrounding the structures or the design, design development, preparation of construction contract documents, and administration of the construction contract.
component:  A permanently installed or attached fixture, element or part of a system.
condition:  The visible and conspicuous state of being of an object.
correction:  Something that is substituted or proposed for what is incorrect, deficient, unsafe, or a defect.
cosmetic defect:  An irregularity or imperfection in something, which could be corrected, but is not required.
crawl space:  The area within the confines of the foundation and between the ground and the underside of the lowest floor's structural component.
decorative:  Ornamental; not required for the operation of essential systems or components of a home.
describe:  To report in writing a system or component by its type or other observed characteristics in order to distinguish it from other components used for the same purpose.
determine:  To arrive at an opinion or conclusion pursuant to examination.
dismantle:  To open, take apart or remove any component, device or piece that would not typically be opened, taken apart or removed by an ordinary occupant.
engineering service:  Any professional service or creative work requiring engineering education, training and experience, and the application of special knowledge of the mathematical, physical and engineering sciences to such professional service or creative work as consultation, investigation, evaluation, planning, design and supervision of construction for the purpose of assuring compliance with the specifications and design, in conjunction with structures, buildings, machines, equipment, works and/or processes.
enter:  To go into an area to observe visible components.
evaluate:  To assess the systems, structures and/or components of a property.
evidence:  That which tends to prove or disprove something; something that makes plain or clear; grounds for belief; proof.
examine:  To visually look (see inspect).
foundation:  The base upon which the structure or wall rests, usually masonry, concrete or stone, and generally partially underground.
function:  The action for which an item, component or system is specially fitted or used, or for which an item, component or system exists; to be in action or perform a task.
functional:  Performing, or able to perform, a function.
functional defect:  A lack of or an abnormality in something that is necessary for normal and proper functioning and operation, and, therefore, requires further evaluation and correction.
general home inspection:  See "home inspection."
home inspection:  The process by which an inspector visually examines the readily accessible systems and components of a home and operates those systems and components utilizing this Standards of Practice as a guideline.
household appliances:  Kitchen and laundry appliances, room air conditioners, and similar appliances.
identify:  To notice and report.
indication:  That which serves to point out, show, or make known the present existence of something under certain conditions.
inspect:  To examine readily accessible systems and components safely, using normal operating controls, and accessing readily accessible areas, in accordance with this Standards of Practice.
inspected property:  The readily accessible areas of the home, house, or building, and the components and systems included in the inspection. 
inspection report:  A written communication (possibly including images) of any material defects observed during the inspection.
inspector:  One who performs a real estate inspection.
installed:  Attached or connected such that the installed item requires a tool for removal.
material defect:  A specific issue with a system or component of a residential property that may have a significant, adverse impact on the value of the property, or that poses an unreasonable risk to people.  The fact that a system or component is near, at, or beyond the end of its normal, useful life is not, in itself, a material defect.
normal operating controls:  Describes the method by which certain devices (such as thermostats) can be operated by ordinary occupants, as they require no specialized skill or knowledge.
observe:  To visually notice.
operate:  To cause systems to function or turn on with normal operating controls.
readily accessible:  A system or component that, in the judgment of the inspector, is capable of being safely observed without the removal of obstacles, detachment or disengagement of connecting or securing devices, or other unsafe or difficult procedures to gain access.
recreational facilities:  Spas, saunas, steam baths, swimming pools, tennis courts, playground equipment, and other exercise, entertainment and athletic facilities.
report (verb form): To express, communicate or provide information in writing; give a written account of.  (See also inspection report.)
representative number:  A number sufficient to serve as a typical or characteristic example of the item(s) inspected.
residential property:  Four or fewer residential units.
residential unit:  A home; a single unit providing complete and independent living facilities for one or more persons, including permanent provisions for living, sleeping, eating, cooking and sanitation.
safety glazing:  Tempered glass, laminated glass, or rigid plastic.
shut down:  Turned off, unplugged, inactive, not in service, not operational, etc.
structural component:  A component that supports non-variable forces or weights (dead loads) and variable forces or weights (live loads).
system:  An assembly of various components which function as a whole.
technically exhaustive:  A comprehensive and detailed examination beyond the scope of a real estate home inspection that would involve or include, but would not be limited to:  dismantling, specialized knowledge or training, special equipment, measurements, calculations, testing, research, analysis, or other means.
unsafe:  In the inspector's opinion, a condition of an area, system, component or procedure that is judged to be a significant risk of injury during normal, day-to-day use. The risk may be due to damage, deterioration, improper installation, or a change in accepted residential construction standards.
verify:  To confirm or substantiate.`
    }
];

/* =========================================================================
   PARSER – builds structure from raw SOP text
   ========================================================================= */
type Node =
    | { kind: "h"; level: 2 | 3; text: string; children: Node[] }
    | { kind: "ol"; items: string[] }
    | { kind: "ul"; items: string[] }
    | { kind: "p"; text: string };

const RX = {
    headingTop: /^([IVXLC]+\.|\d+\.)\s+(.+?):\s*$/i, // e.g., "I. The inspector shall inspect:"
    romanItem: /^([IVXLC]+)\.\s+(.*)$/i,             // I. item
    alphaItem: /^([A-Z])\.\s+(.*)$/,                 // A. item
    numItem: /^(\d+)\.\s+(.*)$/,                     // 1. item
    bullet: /^[-–•]\s+(.*)$/,                        // - item
};

function parseContent(text: string): Node[] {
    const lines = text.split("\n").map((l) => l.trim());
    const nodes: Node[] = [];
    let curHeading: Node | null = null; // last "h"
    let pendingList: { kind: "ol" | "ul"; items: string[] } | null = null;

    const flushList = () => {
        if (!pendingList) return;
        if (curHeading && curHeading.kind === "h") {
            curHeading.children.push({kind: pendingList.kind, items: pendingList.items});
        } else {
            nodes.push({kind: pendingList.kind, items: pendingList.items});
        }
        pendingList = null;
    };

    const pushParagraph = (txt: string) => {
        if (!txt) return;
        flushList();
        const p: Node = {kind: "p", text: txt};
        if (curHeading && curHeading.kind === "h") curHeading.children.push(p);
        else nodes.push(p);
    };

    const startHeading = (text: string, level: 2 | 3) => {
        flushList();
        curHeading = {kind: "h", level, text, children: []};
        nodes.push(curHeading);
    };

    // If a line ends with ";" and not a heading, treat as list-ish content
    const looksLikeLooseList = (s: string) =>
        !!s && !RX.headingTop.test(s) && (/[;•]$/.test(s) || RX.bullet.test(s));

    let paragraphBuf: string[] = [];

    for (const raw of lines) {
        const line = raw;

        if (!line) {
            // blank line: end of paragraph/list
            pushParagraph(paragraphBuf.join(" "));
            paragraphBuf = [];
            flushList();
            continue;
        }

        // Top-level mini-headings (I./1.) ending with colon
        const mTop = line.match(RX.headingTop);
        if (mTop) {
            const headingText = mTop[2].trim();
            // treat as level-2 subheading within the section
            startHeading(headingText, 2);
            continue;
        }

        // List item flavors (roman/alpha/number/bullet)
        const mRoman = line.match(RX.romanItem);
        const mAlpha = line.match(RX.alphaItem);
        const mNum = line.match(RX.numItem);
        const mBullet = line.match(RX.bullet);

        if (mRoman || mAlpha || mNum || mBullet || looksLikeLooseList(line)) {
            if (!pendingList) {
                pendingList = {kind: mBullet ? "ul" : "ol", items: []};
            }
            const item =
                (mRoman && mRoman[2]) ||
                (mAlpha && mAlpha[2]) ||
                (mNum && mNum[2]) ||
                (mBullet && mBullet[1]) ||
                line.replace(/[;•]$/, "");
            if (paragraphBuf.length) {
                // flush any paragraph before list item begins
                pushParagraph(paragraphBuf.join(" "));
                paragraphBuf = [];
            }
            pendingList.items.push(item.trim());
            continue;
        }

        // Fallback: accumulate into paragraph buffer
        paragraphBuf.push(line);
    }

    // flush any remaining buffers
    pushParagraph(paragraphBuf.join(" "));
    flushList();

    return nodes;
}

/* =========================================================================
   RENDERERS
   ========================================================================= */
function RenderNodes({nodes}: { nodes: Node[] }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {nodes.map((n, i) => {
                if (n.kind === "h") {
                    const H = n.level === 2 ? "h4" : "h5";
                    return (
                        <div key={i} className="mt-6">
                            <H className={cn(n.level === 2 ? "text-base font-semibold" : "text-sm font-semibold text-foreground/90")}>
                                {n.text}
                            </H>
                            {n.children.length > 0 && <RenderNodes nodes={n.children}/>}
                        </div>
                    );
                }
                if (n.kind === "ol") {
                    return (
                        <ol key={i} className="list-decimal pl-6 space-y-1">
                            {n.items.map((it, idx) => (
                                <li key={idx}>{it}</li>
                            ))}
                        </ol>
                    );
                }
                if (n.kind === "ul") {
                    return (
                        <ul key={i} className="list-disc pl-6 space-y-1">
                            {n.items.map((it, idx) => (
                                <li key={idx}>{it}</li>
                            ))}
                        </ul>
                    );
                }
                return (
                    <p key={i} className="leading-7">
                        {n.text}
                    </p>
                );
            })}
        </div>
    );
}

function groupBy<T extends { group?: string }>(items: T[]) {
    const map = new Map<string, T[]>();
    for (const it of items) {
        const key = it.group ?? "__ungrouped__";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(it);
    }
    return map;
}

/* =========================================================================
   PAGE
   ========================================================================= */
const InternachiSOP: React.FC = () => {
    const hasSections = sections.length > 0;
    const [current, setCurrent] = React.useState<string | null>(hasSections ? sections[0].id : null);
    const currentSection = hasSections ? sections.find((s) => s.id === current) ?? sections[0] : null;

    const grouped = React.useMemo(() => groupBy(sections), []);
    const parsedCache = React.useRef<Record<string, Node[]>>({});

    const ensureParsed = (s: Section) => {
        if (!parsedCache.current[s.id]) {
            parsedCache.current[s.id] = parseContent(s.content);
        }
        return parsedCache.current[s.id];
    };

    // Arrow key nav through TOC
    React.useEffect(() => {
        const ids = sections.map((s) => s.id);
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            e.preventDefault();
            const idx = current ? ids.indexOf(current) : 0;
            const nextIdx = e.key === "ArrowDown" ? Math.min(idx + 1, ids.length - 1) : Math.max(idx - 1, 0);
            const next = ids[nextIdx];
            setCurrent(next);
            document.getElementById(next)?.scrollIntoView({behavior: "smooth", block: "start"});
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [current]);

    if (!hasSections) {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
                No sections to display.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <Seo
                title="InterNACHI Standards of Practice"
                description="InterNACHI standards of practice"
                canonical="/internachi-standards"
            />

            {/* LEFT NAV */}
            <aside
                className="sticky top-0 h-screen w-[22rem] shrink-0 bg-muted/20 border-r border-border overflow-y-auto">
                <div className="p-6 pb-3">
                    <h1 className="text-2xl font-bold">InterNACHI SOP</h1>
                    <p className="text-sm text-muted-foreground mt-1">Table of Contents</p>
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Search sections…"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => {
                                const q = e.target.value.toLowerCase().trim();
                                if (!q) return;
                                const hit = sections.find((s) => s.title.toLowerCase().includes(q));
                                if (hit) setCurrent(hit.id);
                            }}
                        />
                    </div>
                </div>

                <nav className="px-2 pb-6">
                    {[...grouped.entries()].map(([groupKey, items]) => (
                        <div key={groupKey} className="mb-4">
                            {groupKey !== "__ungrouped__" && (
                                <div className="px-3 py-2 text-[0.8rem] font-semibold text-foreground/80 tracking-wide">
                                    {groupKey}
                                </div>
                            )}

                            <ul className="space-y-1">
                                {items.map((item) => {
                                    const active = current === item.id;
                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => {
                                                    setCurrent(item.id);
                                                    document.getElementById(item.id)?.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start"
                                                    });
                                                }}
                                                className={cn(
                                                    "group w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                                )}
                                            >
                        <span
                            className={cn(
                                "h-4 w-1 rounded-sm transition-colors",
                                active ? "bg-primary-foreground" : "bg-transparent group-hover:bg-foreground/30"
                            )}
                        />
                                                <span className="truncate">{item.title}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* CONTENT */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8 lg:p-10">
                    <header className="mb-6">
                        <h2 className="text-3xl font-semibold tracking-tight">{currentSection?.title}</h2>
                        {currentSection?.group && (
                            <p className="text-sm text-muted-foreground mt-1">{currentSection.group}</p>
                        )}
                    </header>

                    <div className="space-y-12">
                        {sections.map((s) => {
                            const parsed = ensureParsed(s);
                            return (
                                <section key={s.id} id={s.id} className="scroll-mt-20">
                                    <h3
                                        className={cn(
                                            "text-2xl font-semibold mb-3",
                                            s.id === current && "text-primary"
                                        )}
                                    >
                                        {s.title}
                                    </h3>
                                    <RenderNodes nodes={parsed}/>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InternachiSOP;
