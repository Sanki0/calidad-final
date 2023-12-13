import json
import boto3
import os
import csv

# will transform a csv file to a json file
def lambda_handler(event, context):
    
    bucket_input = os.environ['BUCKET_INPUT_NAME']
    bucket_output = os.environ['BUCKET_OUTPUT_NAME']
    s3 = boto3.client('s3')

    print(event)
    
    # get the file name from the event
    file_name = event['Records'][0]['s3']['object']['key']

    # get the file from s3
    file_obj = s3.get_object(Bucket=bucket_input, Key=file_name)

    # read the file contents in memory
    file_content = file_obj["Body"].read().decode('utf-8')

    print("file_content", file_content)

    # create a list to hold the data
    data = []

    # create a csv reader object
    csv_reader = csv.DictReader(file_content.splitlines())

    for row in csv_reader:
        data.append({
        'name': row['name'],
        'lastname': row['lastname'],
        'age': int(row['age']),
        'balance': float(row['balance'])
    })
        


    print("data", data)

    json_data = json.dumps(data)

    print("json_data", json_data)

    # create a json file in the same bucket
    json_file_name = file_name.split(".")[0] + ".json"

    s3.put_object(Bucket=bucket_output, Key=json_file_name, Body=json_data)

    print("bucket_output+json_file_name", bucket_output+"/"+json_file_name)

    # send the location of the json file in s3 to a queue
    sqs = boto3.client('sqs')
    queue_url = os.environ['QUEUE_URL']
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(bucket_output+"/"+json_file_name))


    # return the location of the json file in s3

    return {
        'statusCode': 200,
        'body': json.dumps(bucket_output+"/"+json_file_name)
    }





