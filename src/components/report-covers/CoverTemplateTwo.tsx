import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateTwo: React.FC<CoverTemplateProps> = ({
  reportTitle,
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {coverImage && (
      <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
    )}
    <div className="relative bg-black/60 w-full h-full flex flex-col items-center justify-center text-center p-10 text-white">
      <h1 className="text-4xl font-bold mb-2">{reportTitle}</h1>
      {clientName && <p className="text-xl mb-4">{clientName}</p>}
      {organizationName && <p className="text-sm">{organizationName}</p>}
    </div>
  </div>
);

export default CoverTemplateTwo;
