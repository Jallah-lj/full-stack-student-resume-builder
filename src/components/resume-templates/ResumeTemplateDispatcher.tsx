import React from "react";
import { ResumeData } from "./types";
import { ModernTechTemplate } from "./ModernTechTemplate";
import { IvyLeagueTemplate } from "./IvyLeagueTemplate";
import { MinimalCorpTemplate } from "./MinimalCorpTemplate";
import { AcademicResearchTemplate } from "./AcademicResearchTemplate";

export function ResumeTemplateDispatcher({ data }: { data: ResumeData }) {
  const templateKey = data.resume.template || "modern_tech";

  switch (templateKey) {
    case "ivy_league":
      return <IvyLeagueTemplate data={data} />;
    case "minimal_corp":
      return <MinimalCorpTemplate data={data} />;
    case "academic_research":
      return <AcademicResearchTemplate data={data} />;
    case "modern_tech":
    default:
      return <ModernTechTemplate data={data} />;
  }
}
