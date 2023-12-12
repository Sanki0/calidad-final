import json
import boto3
import os

def lambda_handler(event, context):
    bucket = os.environ['BUCKET']
    s3 = boto3.client('s3')
    contents = s3.list_objects_v2(Bucket=bucket)['Contents']
    return {
        'statusCode': 200,
        'body': json.dumps(contents)
    }

