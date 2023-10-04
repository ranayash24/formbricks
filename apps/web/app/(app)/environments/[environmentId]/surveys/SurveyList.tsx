import { UsageAttributesUpdater } from "@/app/(app)/FormbricksClient";
import SurveyDropDownMenu from "@/app/(app)/environments/[environmentId]/surveys/SurveyDropDownMenu";
import SurveyStarter from "@/app/(app)/environments/[environmentId]/surveys/SurveyStarter";
import SurveyStatusIndicator from "@/components/shared/SurveyStatusIndicator";
import { SURVEY_BASE_URL } from "@formbricks/lib/constants";
import { getEnvironment, getEnvironments } from "@formbricks/lib/environment/service";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { getSurveys } from "@formbricks/lib/survey/service";
import type { TEnvironment } from "@formbricks/types/v1/environment";
import { Badge } from "@formbricks/ui";
import { ComputerDesktopIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { generateSurveySingleUseId } from "@/lib/singleUseSurveys";

export default async function SurveysList({ environmentId }: { environmentId: string }) {
  const product = await getProductByEnvironmentId(environmentId);
  if (!product) {
    throw new Error("Product not found");
  }

  const environment = await getEnvironment(environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }
  const surveys = await getSurveys(environmentId);

  const environments: TEnvironment[] = await getEnvironments(product.id);
  const otherEnvironment = environments.find((e) => e.type !== environment.type)!;

  if (surveys.length === 0) {
    return <SurveyStarter environmentId={environmentId} environment={environment} product={product} />;
  }

  return (
    <>
      <ul className="grid place-content-stretch gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 ">
        <Link href={`/environments/${environmentId}/surveys/templates`}>
          <li className="col-span-1 h-56">
            <div className="delay-50 flex h-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-slate-900 to-slate-800 font-light text-white shadow transition ease-in-out hover:scale-105 hover:from-slate-800 hover:to-slate-700">
              <div id="main-cta" className="px-4 py-8 sm:p-14 xl:p-10">
                <PlusIcon className="stroke-thin mx-auto h-14 w-14" />
                Create Survey
              </div>
            </div>
          </li>
        </Link>
        {surveys
          .sort((a, b) => b.updatedAt?.getTime() - a.updatedAt?.getTime())
          .map((survey) => {
            const isSingleUse = survey.singleUse?.enabled ?? false;
            const isEncrypted = survey.singleUse?.isEncrypted ?? false;
            const singleUseId = isSingleUse ? generateSurveySingleUseId(isEncrypted) : undefined;
            return (
              <li key={survey.id} className="relative col-span-1 h-56">
                <div className="delay-50 flex h-full flex-col justify-between rounded-md bg-white shadow transition ease-in-out hover:scale-105">
                  <div className="px-6 py-4">
                    <Badge
                      StartIcon={survey.type === "link" ? LinkIcon : ComputerDesktopIcon}
                      startIconClassName="mr-2"
                      text={
                        survey.type === "link"
                          ? "Link Survey"
                          : survey.type === "web"
                          ? "In-Product Survey"
                          : ""
                      }
                      type="gray"
                      size={"tiny"}
                      className="font-base"></Badge>
                    <p className="my-2 line-clamp-3 text-lg">{survey.name}</p>
                  </div>
                  <Link
                    href={
                      survey.status === "draft"
                        ? `/environments/${environmentId}/surveys/${survey.id}/edit`
                        : `/environments/${environmentId}/surveys/${survey.id}/summary`
                    }
                    className="absolute h-full w-full"></Link>
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between px-4 py-2 text-right sm:px-6">
                      <div className="flex items-center">
                        {survey.status !== "draft" && (
                          <>
                            <SurveyStatusIndicator status={survey.status} tooltip environment={environment} />
                          </>
                        )}
                        {survey.status === "draft" && (
                          <span className="text-xs italic text-slate-400">Draft</span>
                        )}
                      </div>
                      <SurveyDropDownMenu
                        survey={survey}
                        key={`surveys-${survey.id}`}
                        environmentId={environmentId}
                        environment={environment}
                        otherEnvironment={otherEnvironment!}
                        surveyBaseUrl={SURVEY_BASE_URL}
                        singleUseId={singleUseId}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      <UsageAttributesUpdater numSurveys={surveys.length} />
    </>
  );
}
