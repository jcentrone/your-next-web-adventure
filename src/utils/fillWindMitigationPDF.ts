/* eslint-disable @typescript-eslint/no-explicit-any */
import {PDFDocument} from "pdf-lib";
import {WIND_MITIGATION_FIELD_MAP} from "@/lib/windMitigationFieldMap";

// Keys that are handled manually elsewhere in the code (e.g. custom logic
// for building code options) and should be ignored when reporting unmapped
// data keys.
const MANUALLY_HANDLED_KEY_PREFIXES = [
    "reportData.1_building_code",
    "reportData.2_roof_covering.overall_compliance",
    "reportData.3_roof_deck_attachment.selectedOption",
    "reportData.4_roof_to_wall_attachment.selectedOption",
    "reportData.5_roof_geometry",
    "reportData.6_secondary_water_resistance.selectedOption",
    "reportData.7_opening_protection.glazedOverall",
    "reportData.7_opening_protection.nonGlazedSubclass",
];

function parseAddress(full: string): {street: string; city: string; state: string; zip: string} {
    const [street = "", city = "", stateZip = ""] =
        (full || "").split(",").map((p) => p.trim());
    const [state = "", zip = ""] = stateZip.split(/\s+/);
    return {street, city, state, zip};
}

function flattenObject(obj: any, prefix = ""): Record<string, any> {
    if (!obj || typeof obj !== "object") {
        return {}; // nothing to flatten
    }

    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(acc, flattenObject(value, newKey));
        } else {
            acc[newKey] = value;
        }
        return acc;
    }, {} as Record<string, any>);
}

export function debugFieldMapping(reportData: Record<string, any>, pdfForm: any) {
    const flatData = flattenObject(reportData);
    console.log("FlatData: ", flatData);

    const dataKeys = Object.keys(flatData);
    const mapKeys = Object.keys(WIND_MITIGATION_FIELD_MAP);

    // 1. Keys in data but not mapped, excluding those handled manually
    const unmappedDataKeys = dataKeys.filter(
        (k) =>
            !mapKeys.includes(k) &&
            !MANUALLY_HANDLED_KEY_PREFIXES.some((prefix) => k.startsWith(prefix))
    );
    if (unmappedDataKeys.length > 0) {
        console.warn("⚠️ Unmapped data keys:", unmappedDataKeys);
    }

    // 2. Keys in map but missing in data
    const missingDataForMap = mapKeys.filter((k) => !(k in flatData));
    if (missingDataForMap.length > 0) {
        console.warn("⚠️ Map keys with no data:", missingDataForMap);
    }

    // 3. Keys in map but not in PDF form fields
    const pdfFields = pdfForm.getFields().map((f: any) => f.getName());
    console.log("📄 PDF field names:", pdfFields);
    const missingInPdf = Object.values(WIND_MITIGATION_FIELD_MAP).filter(
        (fieldName) => !pdfFields.includes(fieldName)
    );
    if (missingInPdf.length > 0) {
        console.warn("⚠️ Map field names not in PDF:", missingInPdf);
    }
    console.log("✅ Debug check complete");
}

export async function fillWindMitigationPDF(report: any): Promise<Blob> {
    console.log("🔍 fillWindMitigationPDF called with:", report);
    
    const formUrl = "/templates/wind_mitigation_template.pdf";
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    console.log("📄 Available PDF fields:", form.getFields().map((f: any) => f.getName()));

    // Surface mapping/debug information as soon as the form is loaded
    debugFieldMapping(report, form);

    // console.log("📋 All PDF fields and current values:");
    // form.getFields().forEach((field) => {
    //     const name = field.getName();
    //     let value: any;
    //
    //     try {
    //         // Try text first
    //         if ("getText" in field) {
    //             value = (field as any).getText();
    //         }
    //         // Try checkbox state
    //         else if ("isChecked" in field) {
    //             value = (field as any).isChecked();
    //         }
    //     } catch {
    //         value = "(unreadable)";
    //     }
    //
    //     console.log(`- ${name}:`, value);
    // });

    // Create a data object that includes both report properties and flattened reportData
    const {street, city, zip} = parseAddress(report.address || "");

    const dataToMap = {
        clientName: report.clientName,
        street,
        city,
        zip,
        phoneHome: report.phoneHome,
        phoneWork: report.phoneWork,
        phoneCell: report.phoneCell,
        email: report.email,
        insuranceCompany: report.insuranceCompany,
        policyNumber: report.policyNumber,
        inspectionDate: report.inspectionDate
            ? new Date(report.inspectionDate).toLocaleDateString()
            : '',

        ...flattenObject(report.reportData || {}, "reportData")
    };

    console.log("🔑 Data to map:", dataToMap);
    console.log("🔑 Flattened data keys:", Object.keys(dataToMap));

    // 🔎 Debug: show what's being flattened vs mapped
    const unmappedKeys = Object.keys(dataToMap).filter(
        (k) =>
            !(k in WIND_MITIGATION_FIELD_MAP) &&
            !MANUALLY_HANDLED_KEY_PREFIXES.some((prefix) => k.startsWith(prefix))
    );
    if (unmappedKeys.length) {
        console.warn("⚠️ Unmapped data keys:", unmappedKeys);
    }

    const mapKeysWithoutData = Object.keys(WIND_MITIGATION_FIELD_MAP).filter(
        (k) => dataToMap[k] === undefined
    );
    if (mapKeysWithoutData.length) {
        console.warn("⚠️ Map keys with no data:", mapKeysWithoutData);
    }

    // Handle Building Code (Q1) separately
    const buildingCode = report.reportData?.["1_building_code"];
    if (buildingCode?.selectedOption) {
        const option = String(buildingCode.selectedOption).toUpperCase();
        const checkboxName = `buildingCode${option}`;
        try {
            form.getCheckBox(checkboxName as never).check();
            console.log(`✅ Checked building code option "${option}" → "${checkboxName}"`);
        } catch (err) {
            console.warn(`⚠️ Could not check building code option "${option}"`, err);
        }

        const yearBuilt = buildingCode.fields?.year_built;
        if (yearBuilt) {
            const yearFieldName = `buildingCode${option}YearBuilt`;
            try {
                form.getTextField(yearFieldName as never).setText(String(yearBuilt));
                console.log(`✅ Set "${yearFieldName}" to "${yearBuilt}"`);
            } catch (err) {
                console.warn(`⚠️ Could not set year built for option "${option}"`, err);
            }
        }
    }

    // Handle Roof Covering Overall Compliance (Q2)
    const roofCoveringValue = report.reportData?.["2_roof_covering"]?.overall_compliance;
    if (roofCoveringValue) {
        const option = String(roofCoveringValue).toUpperCase();
        const checkboxName = `roofCovering${option}`;
        try {
            const checkbox = form.getCheckBox(checkboxName as never);
            checkbox.check();
            ["A", "B", "C", "D"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`roofCovering${letter}` as never).uncheck();
                    } catch (err) {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked roof covering compliance option "${option}"`);
        } catch (err) {
            console.warn(
                `⚠️ Could not check roof covering compliance option "${option}"`,
                err
            );
        }
    }

    // Handle Roof Deck Attachment (Q3)
    const roofDeckValue = report.reportData?.["3_roof_deck_attachment"]?.selectedOption;
    if (roofDeckValue) {
        const option = String(roofDeckValue).toUpperCase();
        try {
            const checkbox = form.getCheckBox(`roofDeck${option}` as never);
            checkbox.check();
            ["A", "B", "C", "D", "E", "F", "G"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`roofDeck${letter}` as never).uncheck();
                    } catch (err) {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked roof deck attachment option "${option}"`);
        } catch (err) {
            console.warn(
                `⚠️ Could not check roof deck attachment option "${option}"`,
                err
            );
        }
    }

    // Handle Roof to Wall Attachment (Q4)
    const roofWallValue = report.reportData?.["4_roof_to_wall_attachment"]?.selectedOption;
    if (roofWallValue) {
        const option = String(roofWallValue).toUpperCase();
        try {
            const checkbox = form.getCheckBox(`roofWall${option}` as never);
            checkbox.check();
            ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`roofWall${letter}` as never).uncheck();
                    } catch (err) {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked roof to wall attachment option "${option}"`);
        } catch (err) {
            console.warn(
                `⚠️ Could not check roof to wall attachment option "${option}"`,
                err
            );
        }
    }

    // Handle Roof Geometry (Q5)
    const geom = report.reportData?.["5_roof_geometry"];
    if (geom?.selectedOption) {
        const option = String(geom.selectedOption).toUpperCase();
        try {
            const checkbox = form.getCheckBox(`roofGeometry${option}` as never);
            checkbox.check();
            ["A", "B", "C"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`roofGeometry${letter}` as never).uncheck();
                    } catch {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked roof geometry option "${option}"`);
        } catch (err) {
            console.warn(`⚠️ Could not check roof geometry option "${option}"`, err);
        }

        const fields = geom.fields || {};
        if (option === "A") {
            if (fields.total_roof_system_perimeter_ft) {
                try {
                    form
                        .getTextField("feet Total roof system perimeter" as never)
                        .setText(String(fields.total_roof_system_perimeter_ft));
                } catch (err) {
                    console.warn("⚠️ Could not set total roof system perimeter", err);
                }
            }
            if (fields.non_hip_feature_total_length_ft) {
                try {
                    form
                        .getTextField("Total length of nonhip features" as never)
                        .setText(String(fields.non_hip_feature_total_length_ft));
                } catch (err) {
                    console.warn("⚠️ Could not set non-hip feature total length", err);
                }
            }
        } else if (option === "B") {
            if (fields.area_lt_2to12_sqft) {
                try {
                    form
                        .getTextField(
                            "less than 212 Roof area with slope less than 212" as never
                        )
                        .setText(String(fields.area_lt_2to12_sqft));
                } catch (err) {
                    console.warn("⚠️ Could not set low slope area", err);
                }
            }
            if (fields.total_roof_area_sqft) {
                try {
                    form
                        .getTextField("sq ft Total roof area" as never)
                        .setText(String(fields.total_roof_area_sqft));
                } catch (err) {
                    console.warn("⚠️ Could not set total roof area", err);
                }
            }
        }
    }

    // Handle Secondary Water Resistance (Q6)
    const swrValue = report.reportData?.["6_secondary_water_resistance"]?.selectedOption;
    if (swrValue) {
        const option = String(swrValue).toUpperCase();
        try {
            const checkbox = form.getCheckBox(`swr${option}` as never);
            checkbox.check();
            ["A", "B", "C"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`swr${letter}` as never).uncheck();
                    } catch {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked secondary water resistance option "${option}"`);
        } catch (err) {
            console.warn(
                `⚠️ Could not check secondary water resistance option "${option}"`,
                err
            );
        }
    }

    // Handle Opening Protection (Q7)
    const openingProtection = report.reportData?.["7_opening_protection"];

    const glazedOverall = openingProtection?.glazedOverall;
    if (glazedOverall) {
        const option = String(glazedOverall).toUpperCase();
        try {
            const checkbox = form.getCheckBox(`opl${option}` as never);
            checkbox.check();
            ["A", "B", "C", "N", "X"].forEach((letter) => {
                if (letter !== option) {
                    try {
                        form.getCheckBox(`opl${letter}` as never).uncheck();
                    } catch {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked glazed overall option "${option}"`);
        } catch (err) {
            console.warn(`⚠️ Could not check glazed overall option "${option}"`, err);
        }
    }

    const nonGlazedSubclass = openingProtection?.nonGlazedSubclass;
    if (nonGlazedSubclass) {
        const normalized = String(nonGlazedSubclass)
            .toUpperCase()
            .replace(/\./g, "");
        const subclasses = [
            "A1",
            "A2",
            "A3",
            "B1",
            "B2",
            "B3",
            "C1",
            "C2",
            "C3",
            "N1",
            "N2",
            "N3",
        ];
        try {
            const checkbox = form.getCheckBox(`opl${normalized}` as never);
            checkbox.check();
            subclasses.forEach((code) => {
                if (code !== normalized) {
                    try {
                        form.getCheckBox(`opl${code}` as never).uncheck();
                    } catch {
                        // Ignore missing checkboxes
                    }
                }
            });
            console.log(`✅ Checked non-glazed subclass option "${normalized}"`);
        } catch (err) {
            console.warn(
                `⚠️ Could not check non-glazed subclass option "${normalized}"`,
                err
            );
        }
    }

    for (const [dataKey, pdfFieldName] of Object.entries(WIND_MITIGATION_FIELD_MAP)) {
        const value = dataToMap[dataKey];
        if (value === undefined || value === null) continue;

        console.log(`🔗 Mapping ${dataKey} = "${value}" → PDF field "${pdfFieldName}"`);

        try {
            const field = form.getField(pdfFieldName as never);
            if ("check" in field && "uncheck" in field) {
                const checkbox = form.getCheckBox(pdfFieldName as never);
                if (typeof value === "boolean") {
                    if (value) {
                        checkbox.check();
                    } else {
                        checkbox.uncheck();
                    }
                } else if (value) {
                    // Attempt to check using export value if provided
                    (checkbox as any).check(value);
                } else {
                    checkbox.uncheck();
                }
                console.log(`✅ Set checkbox "${pdfFieldName}" to ${value}`);
            } else if ("setText" in field) {
                if (typeof value === "boolean") {
                    (field as any).setText(value ? "X" : "");
                    console.log(
                        `✅ Set text field "${pdfFieldName}" to "${value ? "X" : ""}"`
                    );
                } else {
                    (field as any).setText(String(value));
                    console.log(`✅ Set text field "${pdfFieldName}" to "${value}"`);
                }
            } else {
                console.warn(`⚠️ Unsupported field type for '${pdfFieldName}'`);
            }
        } catch (err) {
            console.warn(
                `⚠️ Could not set PDF field '${pdfFieldName}' from data key '${dataKey}'`,
                err
            );
        }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], {type: "application/pdf"});
}