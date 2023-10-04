"use server";

import { updateEnvironment } from "@formbricks/lib/environment/service";
import { TEnvironment, TEnvironmentUpdateInput } from "@formbricks/types/v1/environment";

export async function updateEnvironmentAction(
  environmentId: string,
  data: Partial<TEnvironmentUpdateInput>
): Promise<TEnvironment> {
  return await updateEnvironment(environmentId, data);
}
