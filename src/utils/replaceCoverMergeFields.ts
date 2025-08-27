import { Canvas as FabricCanvas, Textbox } from "fabric";
import type { Organization, Profile } from "@/integrations/supabase/organizationsApi";
import type { Report } from "@/lib/reportSchemas";
import { replaceMergeFields } from "./replaceMergeFields";

interface MergeData {
  organization?: Organization | null;
  inspector?: Profile | null;
  report?: Partial<Report> | null;
}

/**
 * Replaces merge fields in Fabric.js canvas objects with actual data
 */
export async function replaceCoverMergeFields(
  designJson: any,
  { organization, inspector, report }: MergeData
): Promise<any> {
  if (!designJson) return designJson;

  const clonedJson = JSON.parse(JSON.stringify(designJson));

  const processObject = (obj: any) => {
    if (!obj) return;

    // Handle text objects that might contain merge fields
    if (obj.type === "textbox" || obj.type === "text") {
      if (obj.text && typeof obj.text === "string") {
        obj.text = replaceMergeFields(obj.text, { organization, inspector, report });
      }
      
      // Also check custom merge field properties
      if (obj.mergeField && obj.displayToken) {
        obj.text = replaceMergeFields(obj.displayToken, { organization, inspector, report });
      }
    }

    // Handle custom merge field objects (our placeholder text objects)
    if (obj.isMergeField && obj.displayToken) {
      obj.text = replaceMergeFields(obj.displayToken, { organization, inspector, report });
      
      // Remove merge field indicators since we've replaced the content
      delete obj.isMergeField;
      delete obj.mergeField;
      delete obj.displayToken;
      
      // Update styling to look like normal text
      obj.backgroundColor = "transparent";
      obj.stroke = undefined;
      obj.strokeWidth = undefined;
      obj.strokeDashArray = undefined;
      obj.borderColor = undefined;
      obj.fill = "#000000";
    }

    // Process nested objects recursively
    if (obj.objects && Array.isArray(obj.objects)) {
      obj.objects.forEach(processObject);
    }
  };

  // Process all objects in the canvas
  if (clonedJson.objects && Array.isArray(clonedJson.objects)) {
    clonedJson.objects.forEach(processObject);
  }

  return clonedJson;
}