import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateOne: React.FC<CoverTemplateProps> = ({ title, subtitle, image, company }) => (
  <div className="flex flex-col items-center justify-center text-center p-10">
    {image && <img src={image} alt="" className="max-h-96 mb-6 object-contain rounded" />}
    <h1 className="text-4xl font-bold mb-2">{title}</h1>
    {subtitle && <p className="text-xl mb-4">{subtitle}</p>}
    {company && <p className="text-sm text-muted-foreground">{company}</p>}
  </div>
);

export default CoverTemplateOne;
