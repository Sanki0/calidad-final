#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FinalStack } from '../lib/final-stack';

const cdk_env: any = {};
Object.keys(process.env)
  // .filter((k) => k.startsWith("CDK_PARAM")) // filter only CDK_PARAM_*
  .map((k) => (cdk_env[k] = process.env[k]));

const app = new cdk.App();
new FinalStack(app, 'FinalStack', {
  region: process.env["CDK_DEPLOY_REGION"],
  account: process.env["CDK_DEPLOY_ACCOUNT"],
  ...cdk_env,  
});