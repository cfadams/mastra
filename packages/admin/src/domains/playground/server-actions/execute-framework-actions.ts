'use server';

import type { IntegrationActionExcutorParams } from '@arkw/core';

import { future } from '../../../../example.future.config';

interface Props {
  integrationName?: string;
  action: string;
  payload: IntegrationActionExcutorParams<any>;
}

export async function executeFrameworkAction(props: Props): Promise<void> {
  await future.executeAction(props);
}