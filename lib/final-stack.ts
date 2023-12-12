import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from "path";

export class FinalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'FinalBucket', {
      bucketName: 'calidad-final-bucket-2023-2',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // example resource
    const queue = new sqs.Queue(this, 'FinalQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      queueName: 'calidad-final-queue',
    });

    const fileUploadFunction = new lambda.Function(this, 'FileUploadFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/a/')),
      handler: 'lambda_handler.handler',
    });
    
    // add s3, sqs full access to lambda role
    fileUploadFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*', 'sqs:*'],
    }));

    const listContentsFunction = new lambda.Function(this, 'ListContentsFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/list-contents/')),
      handler: 'lambda_handler.handler',
    });

    listContentsFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*', 'sqs:*'],
    }));

    const receiveMessageFunction = new lambda.Function(this, 'ReceiveMessageFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/b/')),
      handler: 'lambda_handler.handler',
    });

    receiveMessageFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*', 'sqs:*'],
    }));







  }
}
