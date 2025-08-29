import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateFour: React.FC<CoverTemplateProps> = ({ title, subtitle, image, company }) => (
  <div className="flex flex-col w-full h-full justify-between p-10">
    <div>
      <h1 className="text-5xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-xl mb-4">{subtitle}</p>}
    </div>
    {image && <img src={image} alt="" className="w-full max-h-80 object-cover rounded" />}
    {company && <p className="text-sm text-right text-muted-foreground mt-4">{company}</p>}
  </div>
);

export default CoverTemplateFour;
