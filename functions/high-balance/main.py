import boto3
import json
import os

def lambda_handler(event, context):
    ses = boto3.client('ses')
    
    print(event)

    sender_email = os.environ['SENDER_EMAIL']  # Asume que 'SENDER_EMAIL' se pasa como una variable de entorno
    recipient_email = os.environ['RECIPIENT_EMAIL']  # Asume que 'RECIPIENT_EMAIL' se pasa como una variable de entorno
    subject = 'Alerta de umbral de dinero'
    body = event['Records'][0]['body']  # Asume que 'message' se pasa en el evento

    # Envía el correo de alerta
    response = ses.send_email(
        Source=sender_email,
        Destination={'ToAddresses': [recipient_email]},
        Message={
            'Subject': {'Data': subject},
            'Body': {'Text': {'Data': body}}
        },
        ConfigurationSetName=os.environ['CONFIGURATION_SET']
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Correo de alerta enviado con éxito'})
    }
