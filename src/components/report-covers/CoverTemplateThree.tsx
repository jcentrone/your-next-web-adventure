import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateThree: React.FC<CoverTemplateProps> = ({ title, subtitle, image, company }) => (
  <div className="flex w-full h-full">
    {image && <img src={image} alt="" className="w-1/2 h-full object-cover" />}
    <div className="flex flex-col flex-1 justify-center items-start p-10">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-xl mb-4">{subtitle}</p>}
      {company && <p className="text-sm text-muted-foreground">{company}</p>}
    </div>
  </div>
);

export default CoverTemplateThree;
