import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { IntegrationFramework } from '../';
import { callbackParams } from '../schemas';
import { parseQueryParams } from './utils';

type CallBackParams = z.infer<typeof callbackParams>;

export const makeCallback = (framework: IntegrationFramework) => {
  return async (req: NextRequest) => {
    const { state, error } = parseQueryParams(
      req,
      callbackParams
    ) as CallBackParams;
    const { name, clientRedirectPath } = state;

    if (error) {
      return NextResponse.json({ error, status: 400 });
    }

    const plugin = framework.getPlugin(name);

    if (!plugin) {
      return NextResponse.json({
        error: `Callback state cannot locate plugin: "${name}"`,
        status: 400,
      });
    }

    await plugin.getAuthenticator().processCallback(req.url);

    const redirectUri = new URL(
      clientRedirectPath || '',
      req.nextUrl.protocol + '//' + req.nextUrl.host
    );

    return NextResponse.redirect(redirectUri);
  };
};