
function connect(ws,map){
    

    var planes = [];
    var all_flights = [];
    var n = 100;
    var planes_markers = new Array(n); for (let i=0; i<n; ++i) planes_markers[i] = 0;

				
               ws.onopen = function() {
                  
                  // Web Socket is connected, send data using send()
                  ws.send(JSON.stringify({
                    "type": "join",
                    "id":"e0e70e4f-50e0-4447-830b-56f6a0ea1d39",
                    "username": "ff"
                  }));
                  alert("Message is sent...");
               };
               ws.onmessage = function (evt) { 
                var received_msg = evt.data;
                var obj = JSON.parse(received_msg);
                // EVENTO FLIGHTS
                var flights = [];
                if (obj.type == "flights"){
                    flights =[];
                    var tbodyRef = document.getElementById('flights').getElementsByTagName('tbody')[0];
                    tbodyRef.innerHTML = "";
                    for (var key in obj.flights){
                        // alert("Recibido:");
                        var departureAirport = L.icon({
                            iconUrl: './img/aeropuerto_salida.png',
                            iconSize:     [30, 30], // size of the icon
                            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                            shadowAnchor: [4, 62],  // the same for the shadow
                            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                        });

                        var destinationAirport = L.icon({
                            iconUrl: './img/aeropuerto_llegada.png',
                            iconSize:     [30, 30], // size of the icon
                            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                            shadowAnchor: [4, 62],  // the same for the shadow
                            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                        });
                        
                        var id = key;
                        var departure = obj.flights[key]["departure"]["name"];
                        var departureLat = obj.flights[key]["departure"]["location"]["lat"];
                        var departureLong = obj.flights[key]["departure"]["location"]["long"];
                        L.marker([departureLat, departureLong], {icon: departureAirport}).addTo(map).bindPopup("id:"+obj.flights[key]["departure"]["id"]+
                        "\n name:"+obj.flights[key]["departure"]["name"]+
                        "\n city:"+obj.flights[key]["departure"]["city"]["name"]+
                        "\n country:"+obj.flights[key]["departure"]["city"]["country"]["name"]
                        );
                        var destination = obj.flights[key]["destination"]["name"];
                        var destinationLat = obj.flights[key]["destination"]["location"]["lat"];
                        var destinationLong = obj.flights[key]["destination"]["location"]["long"];
                        L.marker([destinationLat, destinationLong], {icon: destinationAirport}).addTo(map).bindPopup("id:"+obj.flights[key]["destination"]["id"]+
                        "\n name:"+obj.flights[key]["destination"]["name"]+
                        "\n city:"+obj.flights[key]["destination"]["city"]["name"]+
                        "\n country:"+obj.flights[key]["destination"]["city"]["country"]["name"]
                        );
                        //Aqui faltan agregar las líneas de rayectoria
                        var date= obj.flights[key]["departure_date"];
                        flights.push({"id": id,"departure": departure,"destination": destination,"date":date});
                        all_flights.push({"id": id,"departure": departure,"destination": destination,"date":date, "tlat": departureLat, "tlong": departureLong, "llat": destinationLat, "llong": destinationLong});
                        var latlngs = [
                            [departureLat, departureLong],
                            [destinationLat, destinationLong]
                        ];
                        var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
            

                    }

                    //Ordenar origen y luego destino
                    flights.sort((a, b) => {
                        let fa = a.id.toLowerCase(),
                            fb = b.id.toLowerCase();
                    
                        if (fa < fb) {
                            return -1;
                        }
                        if (fa > fb) {
                            return 1;
                        }
                        else{
                            let fa = a.destination.toLowerCase(),
                            fb = b.destination.toLowerCase();
                    
                            if (fa < fb) {
                                return -1;
                            }
                            if (fa > fb) {
                                return 1;
                            }
                            return 0;

                        }
                       
                    });

                    //Mostrar en la tabla
                    flights.forEach((element)=>{
                        var newRow = tbodyRef.insertRow(-1);
                        var cell = newRow.insertCell();
                        cell.innerHTML = element.id;
                        var cell = newRow.insertCell();
                        cell.innerHTML = element.departure;
                        var cell = newRow.insertCell();
                        cell.innerHTML = element.destination;
                        var cell = newRow.insertCell();
                        cell.innerHTML = element.date;
                    });
                };

                if (obj.type == "message"){
                    var tbodyRef = document.getElementById('chat').getElementsByTagName('tbody')[0];
                    var date = obj.message["date"];
                    var username = obj.message["name"];
                    var content = obj.message["content"];
                    //mensajes.push({"date": date, "username": username, "content": content});
                    var newRow = tbodyRef.insertRow(-1);
                    newRow.innerHTML = date;
                    var newRow = tbodyRef.insertRow(-1);
                    var cell = newRow.insertCell();
                    cell.innerHTML = username+ ": ";
                    var cell = newRow.insertCell();
                    cell.innerHTML = content;
                    
                    //alert(username + ":"+ content);
                };

                if (obj.type == "plane"){
                    //alert("plane");
                    var avion = obj.plane;
                    var id = avion["flight_id"];
                    var airline = avion["airline"]["name"];
                    var captain = avion["captain"];
                    var ETA = avion["ETA"];
                    var status = avion["status"];
                    var lat = avion["position"]["lat"];
                    var long = avion["position"]["long"];
                    let this_plane = planes.find(plane => plane.flight_id === id);
                    var plane = L.icon({
                        iconUrl: './img/plane.png',
                        iconSize:     [40, 40], // size of the icon
                        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });
                    var marker;
                    var index = flights.findIndex(x => x.id ===id);
                    if (planes_markers[index] == undefined){
                        
                        planes.push(JSON.stringify({"flight_id":id,
                            "airline":airline,
                            "captain":captain,
                            "ETA":ETA,
                            "status":status,
                            "lat": lat,
                            "long": long
                        }));
                        
                        setTimeout(function(){
                            marker = new  L.marker([lat, long], {icon: plane});
                            map.addLayer(marker);
                            marker.bindPopup("flight_id:"+id+
                            "\n airline:"+airline+
                            "\n captain:"+captain+
                            "\n ETA:"+ETA+
                            "\n status:"+status
                            );
                        }, 2);
                        setTimeout(function() {
                            map.removeLayer(marker);
                        }, 300);
                        
                        planes_markers[index] = marker;

                    }
                    else{
                        this_plane.lat = lat;
                        this_plane.long = long;
                        marker =planes_markers[index];
                        var newLatLng = new L.LatLng(lat, long);
                        marker.setLatLng(newLatLng); 
                        // setTimeout(function(){
                        //     marker = new  L.marker([lat, long], {icon: plane});
                        //     map.addLayer(marker);
                        //     marker.bindPopup("flight_id:"+id+
                        //     "\n airline:"+airline+
                        //     "\n captain:"+captain+
                        //     "\n ETA:"+ETA+
                        //     "\n status:"+status
                        //     );
                        // }, 2);
                        // planes_markers[index] = marker;


                    }
                    
                    // alert("flight_id:"+id+
                    // "\n airline:"+airline+
                    // "\n captain:"+captain+
                    // "\n ETA:"+ETA+
                    // "\n status:"+status);
                    var planeLine = L.icon({
                        iconUrl: './img/trayecto_avion.png',
                        iconSize:     [5, 5], // size of the icon
                        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });
                    L.marker([lat, long], {icon: planeLine}).addTo(map);
        
        
                   };

                   if (obj.type == "take-off"){
                  
                    for (let i=0; i< all_flights.length;i++){
                        if (all_flights[i].id==obj.flight_id){
                            var this_plane = all_flights[i];
                            break;
                        }
                    }
                    var takeOff = L.icon({
                        iconUrl: './img/takeoff.png',
                        iconSize:     [45, 45], // size of the icon
                        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });
        
                    var alerta = new L.marker([this_plane.tlat, this_plane.tlong], {icon: takeOff});
                    map.addLayer(alerta);
                    alerta.bindPopup("flight id: "+ obj.flight_id).openPopup();
                    setTimeout(function() {
                        map.removeLayer(alerta);
                    }, 4000);

                   };

                   if (obj.type == "landing"){
                  
                    for (let i=0; i< all_flights.length;i++){
                        if (all_flights[i].id==obj.flight_id){
                            var this_plane = all_flights[i];
                            break;
                        }
                    }
                    var Landing = L.icon({
                        iconUrl: './img/landing.png',
                        iconSize:     [45, 45], // size of the icon
                        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });
        
                    var alerta = new L.marker([this_plane.llat, this_plane.llong], {icon: Landing});
                    map.addLayer(alerta);
                    alerta.bindPopup("flight id: "+ obj.flight_id).openPopup();
                    setTimeout(function() {
                        map.removeLayer(alerta);
                    }, 4000);

                   }
           };

           
};

function sendMessage(ws){
    var mensaje = document.getElementById('mensaje');
    alert(mensaje.value);
    ws.send(JSON.stringify({
        "type": "chat",
        "content": mensaje.value
    }));
    mensaje.value = "";
}