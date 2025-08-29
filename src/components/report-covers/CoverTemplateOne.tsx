import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateOne: React.FC<CoverTemplateProps> = ({
  reportTitle,
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="flex flex-col items-center justify-center text-center p-10">
    {coverImage && <img src={coverImage} alt="" className="max-h-96 mb-6 object-contain rounded" />}
    <h1 className="text-4xl font-bold mb-2">{reportTitle}</h1>
    {clientName && <p className="text-xl mb-4">{clientName}</p>}
    {organizationName && <p className="text-sm text-muted-foreground">{organizationName}</p>}
  </div>
);

export default CoverTemplateOne;
