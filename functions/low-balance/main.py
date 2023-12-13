import boto3
import json
import os

def lambda_handler(event, context):
    dynamodb_table = os.environ['DYNAMO_TABLE_NAME']

    dynamodb = boto3.client('dynamodb')
    print(event)


    body = event['Records'][0]['body']  # Asume que 'message' se pasa en el evento

    #actualiza el item en dynamodb
    response = dynamodb.update_item(
        TableName=dynamodb_table,
        Key={
            'id': {'S': '1'},
            'bank': {'S': 'BCP'}
        },
        UpdateExpression="SET balance = :balance",
        ExpressionAttributeValues={
            ':balance': {'N': body}
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Correo de alerta enviado con éxito'})
    }
