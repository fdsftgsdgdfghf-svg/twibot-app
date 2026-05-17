def handler(event, context):
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": "{\"id\": 1, \"title\": \"Тестовый чат\", \"likes_count\": 0}"
    }