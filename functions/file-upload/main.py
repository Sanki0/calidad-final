import json
import boto3
import os

# will create a s3 presigned url
def lambda_handler(event, context):

    s3 = boto3.client('s3')
    bucket_name = os.environ['BUCKET_NAME']
    file_name = event['file_name']
    presigned_url = s3.generate_presigned_url('put_object', Params={'Bucket': bucket_name, 'Key': file_name}, ExpiresIn=36000, HttpMethod='PUT')

    # return the presigned url
    
    return {
        'statusCode': 200,
        'body': json.dumps(presigned_url)
    }
