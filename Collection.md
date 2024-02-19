## Admin

### create

curl --location 'http://localhost:8010/api/admin/create' \
--header 'private_api_key: si51inptQaBvh6ZzGvI1iaOl8JtJYqWmGbnyVj994Nk=' \
--header 'Content-Type: application/json' \
--data-raw '{
"fname":"Super",
"lname":"Admin",
"gender": "Male",
"email":"akshay.joshi0795@gmail.com",
"phone":"7057059846",
"password":"Roger@123"
}'

## Charger Station

### create

--data-raw '{
"clientId": "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
"station_name": "first station",
"address": {
"area": "Adarsh Nagar",
"city": "Amravati",
"postal":"444606",
"countryCode": "91",
"coordinates": {
"latitude": "20.9320° N",
"longitude": "77.7523° E"
}
}
}'
