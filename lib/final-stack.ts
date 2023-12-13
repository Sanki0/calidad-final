import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from "path";
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

export class FinalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'FinalBucket', {
      bucketName: 'calidad-final-bucket-2023-2',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const bucket2 = new s3.Bucket(this, 'FinalBucket2', {
      bucketName: 'calidad-final-bucket2-2023-2',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const dynamoTable = new dynamodb.Table(this, 'FinalTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'bank', type: dynamodb.AttributeType.STRING },
      tableName: 'calidad-final-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // example resource
    const queue = new sqs.Queue(this, 'FinalQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      queueName: 'calidad-final-queue',
    });

    const queueLowBalance = new sqs.Queue(this, 'FinalQueueLowBalance', {
      visibilityTimeout: cdk.Duration.seconds(300),
      queueName: 'calidad-final-queue-low-balance',
    });

    const queueHighBalance = new sqs.Queue(this, 'FinalQueueHighBalance', {
      visibilityTimeout: cdk.Duration.seconds(300),
      queueName: 'calidad-final-queue-high-balance',
    });

    const fileUploadFunction = new lambda.Function(this, 'FileUploadFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/file-upload/')),
      handler: 'main.lambda_handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });
    
    // add s3, sqs full access to lambda role
    fileUploadFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }));

    const readFileFunction = new lambda.Function(this, 'readFileFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/read-file/')),
      handler: 'main.lambda_handler',
      environment: {
        BUCKET_INPUT_NAME: bucket.bucketName,
        BUCKET_OUTPUT_NAME: bucket2.bucketName,
        QUEUE_URL: queue.queueUrl,
      },
    });

    readFileFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*', 'sqs:*'],
    }));

    const s3PutEventSource = new lambdaEventSources.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
    });

    readFileFunction.addEventSource(s3PutEventSource);

    const receiveMessageFunction = new lambda.Function(this, 'ReceiveMessageFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/receive-message/')),
      handler: 'main.lambda_handler',
      environment: {
        BUCKET_OUTPUT_NAME: bucket2.bucketName,
        QUEUE_LOW_BALANCE_URL: queueLowBalance.queueUrl,
        QUEUE_HIGH_BALANCE_URL: queueHighBalance.queueUrl,
      },
    });

    receiveMessageFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*', 'sqs:*'],
    }));

    const sqsEventSource = new lambdaEventSources.SqsEventSource(queue);

    receiveMessageFunction.addEventSource(sqsEventSource);


    const lowBalanceFunction = new lambda.Function(this, 'LowBalanceFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/low-balance/')),
      handler: 'main.lambda_handler',
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });

    lowBalanceFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['dynamodb:*'],
    }));

    const sqsEventSourceLowBalance = new lambdaEventSources.SqsEventSource(queueLowBalance);

    lowBalanceFunction.addEventSource(sqsEventSourceLowBalance);

    const highBalanceFunction = new lambda.Function(this, 'HighBalanceFunction', {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions/high-balance/')),
      handler: 'main.lambda_handler',
      environment: {
        SENDER_EMAIL: "sebastian.ferreyra.c@uni.pe",
        RECIPIENT_EMAIL: "sebas_elias_999@hotmail.com",
        CONFIGURATION_SET: "my-first-configuration-set"
      },
    });

    highBalanceFunction.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['ses:*'],
    }));

    const sqsEventSourceHighBalance = new lambdaEventSources.SqsEventSource(queueHighBalance);

    highBalanceFunction.addEventSource(sqsEventSourceHighBalance);




  }
}
