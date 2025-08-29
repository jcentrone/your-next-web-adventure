import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateThree: React.FC<CoverTemplateProps> = ({
  reportTitle,
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="flex w-full h-full">
    {coverImage && <img src={coverImage} alt="" className="w-1/2 h-full object-cover" />}
    <div className="flex flex-col flex-1 justify-center items-start p-10">
      <h1 className="text-4xl font-bold mb-2">{reportTitle}</h1>
      {clientName && <p className="text-xl mb-4">{clientName}</p>}
      {organizationName && <p className="text-sm text-muted-foreground">{organizationName}</p>}
    </div>
  </div>
);

export default CoverTemplateThree;
