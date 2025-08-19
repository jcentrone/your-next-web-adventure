import {PDFDocument} from "pdf-lib";
import {WIND_MITIGATION_FIELD_MAP} from "@/lib/windMitigationFieldMap";

export async function fillWindMitigationPDF(data: unknown): Promise<Blob> {
    const formUrl = "/templates/wind_mitigation_template.pdf";
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();

    for (const [editorKey, pdfFieldName] of Object.entries(WIND_MITIGATION_FIELD_MAP)) {
        const value = data[editorKey];
        if (value === undefined || value === null) continue;

        try {
            if (typeof value === "boolean") {
                (form.getCheckBox(pdfFieldName as never)).check();
            } else {
                (form.getTextField(pdfFieldName as never)).setText(String(value));
            }
        } catch {
            console.warn(`⚠️ Could not set PDF field '${pdfFieldName}' from '${editorKey}'`);
        }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], {type: "application/pdf"});
}
