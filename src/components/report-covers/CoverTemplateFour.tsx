import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateFour: React.FC<CoverTemplateProps> = ({
  reportTitle,
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="flex flex-col w-full h-full justify-between p-10">
    <div>
      <h1 className="text-5xl font-bold mb-2">{reportTitle}</h1>
      {clientName && <p className="text-xl mb-4">{clientName}</p>}
    </div>
    {coverImage && <img src={coverImage} alt="" className="w-full max-h-80 object-cover rounded" />}
    {organizationName && <p className="text-sm text-right text-muted-foreground mt-4">{organizationName}</p>}
  </div>
);

export default CoverTemplateFour;
