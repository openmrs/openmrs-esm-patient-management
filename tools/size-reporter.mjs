import { reportFileSizeImpact, readGitHubWorkflowEnv } from '@jsenv/file-size-impact';

await reportFileSizeImpact({
  ...readGitHubWorkflowEnv(),
  buildCommand: 'npx lerna run build',
  installCommand: 'npx lerna bootstrap',
  fileSizeReportModulePath: './tools/size-generator.mjs#fileSizeReport',
  projectDirectoryUrl: new URL('../', import.meta.url),
});
