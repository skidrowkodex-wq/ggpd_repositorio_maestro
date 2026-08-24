import base64
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def get_drive_service(access_token):
    creds = Credentials(token=access_token)
    return build('drive', 'v3', credentials=creds)

def get_gmail_service(access_token):
    creds = Credentials(token=access_token)
    return build('gmail', 'v1', credentials=creds)

def send_notification_email(access_token, to_email, subject, body_text):
    if not access_token or not to_email:
        return False
        
    try:
        service = get_gmail_service(access_token)
        message = EmailMessage()
        message.set_content(body_text)
        message['To'] = to_email
        message['From'] = 'me'
        message['Subject'] = subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}
        
        service.users().messages().send(userId="me", body=create_message).execute()
        return True
    except Exception as e:
        print(f"Error sending email via Gmail API: {e}")
        return False

def upload_to_drive(access_token, file_path, folder_id, mime_type, name):
    if not access_token:
        return None
        
    try:
        service = get_drive_service(access_token)
        file_metadata = {
            'name': name,
            'parents': [folder_id]
        }
        media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        return file.get('id')
    except Exception as e:
        print(f"Error uploading to Drive API: {e}")
        return None
