/* eslint-disable @typescript-eslint/no-explicit-any */
import {PDFDocument} from "pdf-lib";
import {WIND_MITIGATION_FIELD_MAP} from "@/lib/windMitigationFieldMap";

// Keys that are handled manually elsewhere in the code (e.g. custom logic
// for building code options) and should be ignored when reporting unmapped
// data keys.
const MANUALLY_HANDLED_KEY_PREFIXES = [
    "reportData.1_building_code",
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
                (field as any).setText(String(value));
                console.log(`✅ Set text field "${pdfFieldName}" to "${value}"`);
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