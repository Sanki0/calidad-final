import json
import boto3
import os

def lambda_handler(event, context):
    bucket = os.environ['BUCKET_OUTPUT_NAME']
    print("event", event)
    file_name = event['Records'][0]['body']
    file_name = file_name.split("/")[1].split(".")[0] + ".json"

    print("file_name", file_name)


    s3 = boto3.client('s3')
    file_obj = s3.get_object(Bucket=bucket, Key=file_name)
    file_content = file_obj["Body"].read().decode('utf-8')

    print("file_content", file_content)

    sum = 0

    for row in json.loads(file_content):
        balance = row['balance']
        sum += balance

    print("sum", sum)

    sqs = boto3.client('sqs')

    QUEUE_LOW_BALANCE_URL = os.environ['QUEUE_LOW_BALANCE_URL']
    QUEUE_HIGH_BALANCE_URL = os.environ['QUEUE_HIGH_BALANCE_URL']

    if sum > 21000:
        sqs.send_message(QueueUrl=QUEUE_HIGH_BALANCE_URL, MessageBody=json.dumps(sum))
    else:
        sqs.send_message(QueueUrl=QUEUE_LOW_BALANCE_URL, MessageBody=json.dumps(sum))
        print("The sum is less than 21000")


    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

