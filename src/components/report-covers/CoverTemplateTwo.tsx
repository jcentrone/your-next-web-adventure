import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateTwo: React.FC<CoverTemplateProps> = ({ title, subtitle, image, company }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {image && (
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
    )}
    <div className="relative bg-black/60 w-full h-full flex flex-col items-center justify-center text-center p-10 text-white">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-xl mb-4">{subtitle}</p>}
      {company && <p className="text-sm">{company}</p>}
    </div>
  </div>
);

export default CoverTemplateTwo;
