import {PDFDocument} from "pdf-lib";
import {WIND_MITIGATION_FIELD_MAP} from "@/lib/windMitigationFieldMap";

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

    // 1. Keys in data but not mapped
    const unmappedDataKeys = dataKeys.filter((k) => !mapKeys.includes(k));
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
    const missingInPdf = Object.values(WIND_MITIGATION_FIELD_MAP).filter(
        (fieldName) => !pdfFields.includes(fieldName)
    );
    if (missingInPdf.length > 0) {
        console.warn("⚠️ Map field names not in PDF:", missingInPdf);
    }
    console.log("✅ Debug check complete");
}

export async function fillWindMitigationPDF(reportData: any): Promise<Blob> {
    // ✅ Now we expect *just* reportData
    const formUrl = "/templates/wind_mitigation_template.pdf";
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();

    console.log("📋 All PDF fields and current values:");
    form.getFields().forEach((field) => {
        const name = field.getName();
        let value: any;

        try {
            // Try text first
            if ("getText" in field) {
                value = (field as any).getText();
            }
            // Try checkbox state
            else if ("isChecked" in field) {
                value = (field as any).isChecked();
            }
        } catch {
            value = "(unreadable)";
        }

        console.log(`- ${name}:`, value);
    });


    const flatData = flattenObject(reportData);
    console.log("🔑 Flattened data keys:", Object.keys(flatData));

    // 🔎 Debug: show what’s being flattened vs mapped
    const unmappedKeys = Object.keys(flatData).filter(
        (k) => !(k in WIND_MITIGATION_FIELD_MAP)
    );
    if (unmappedKeys.length) {
        console.warn("⚠️ Unmapped data keys:", unmappedKeys);
    }

    const mapKeysWithoutData = Object.keys(WIND_MITIGATION_FIELD_MAP).filter(
        (k) => flatData[k] === undefined
    );
    if (mapKeysWithoutData.length) {
        console.warn("⚠️ Map keys with no data:", mapKeysWithoutData);
    }

    for (const [dataKey, pdfFieldName] of Object.entries(WIND_MITIGATION_FIELD_MAP)) {
        const value = flatData[dataKey];
        if (value === undefined || value === null) continue;

        try {
            if (typeof value === "boolean") {
                const checkbox = form.getCheckBox(pdfFieldName as never);
                value ? checkbox.check() : checkbox.uncheck();
            } else {
                const field = form.getTextField(pdfFieldName as never);
                field.setText(String(value));
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