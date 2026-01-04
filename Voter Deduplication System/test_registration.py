import requests

url = "http://localhost:8000/register-voter"
data = {
    "name": "Rahul Kumar",
    "father_name": "Suresh Kumar",
    "dob": "1999-08-12",
    "mobile": "9876543210",
    "address": "Jaipur Rajasthan"
}
files = {
    "photo": open(r"C:\Users\Harsh\OneDrive\Desktop\NSUT Delhi\Voter Deduplication System\lfw-deepfunneled\George_W_Bush\George_W_Bush_0001.jpg", "rb")
}

try:
    response = requests.post(url, data=data, files=files)
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
