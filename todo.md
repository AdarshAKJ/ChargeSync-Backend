1. Get available connector for charger // DONE
2. Get cost for charging. // DONE
3. Get real time transaction history // DONE

socket URL example
ws://192.168.224.14:8080/PRIVA1?token=d3f9f12ff91d8ada1d471a1e

Backend improvements :-

1. Need to remove the charger name logs // DONE
2. Send notification if charger disconnected while charging. // DONE

3. Forget Pin - Atharva

4 and 5 for Adarsh

4. One API which will get serial number and connectorId as body and provide the current active transaction , only the name of the customer, required time.

5. Add the TandC (boolean) in the customer Model and add that filed in update customer API.
