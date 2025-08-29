import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateFive: React.FC<CoverTemplateProps> = ({
  reportTitle,
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-muted">
    <h1 className="text-4xl font-bold mb-2">{reportTitle}</h1>
    {clientName && <p className="text-xl mb-4">{clientName}</p>}
    {coverImage && <img src={coverImage} alt="" className="max-h-72 mb-4 object-contain rounded" />}
    {organizationName && <p className="text-sm text-muted-foreground">{organizationName}</p>}
  </div>
);

export default CoverTemplateFive;
