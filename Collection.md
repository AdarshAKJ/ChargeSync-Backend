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
