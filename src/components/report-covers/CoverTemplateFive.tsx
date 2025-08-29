import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateFive: React.FC<CoverTemplateProps> = ({ title, subtitle, image, company }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-muted">
    <h1 className="text-4xl font-bold mb-2">{title}</h1>
    {subtitle && <p className="text-xl mb-4">{subtitle}</p>}
    {image && <img src={image} alt="" className="max-h-72 mb-4 object-contain rounded" />}
    {company && <p className="text-sm text-muted-foreground">{company}</p>}
  </div>
);

export default CoverTemplateFive;
