const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let map, userMarker;

function initMap() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 15,
      });

      userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here",
        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      document.getElementById("status").innerText = "Ready to request a ride.";
    },
    () => {
      alert("Unable to fetch your location");
    }
  );
}

window.initMap = initMap;

function requestRide() {
  if (!userMarker) {
    alert("Location not ready yet.");
    return;
  }

  const pickup = userMarker.getPosition().toJSON();
  const destination = {
    lat: pickup.lat + 0.01,
    lng: pickup.lng + 0.01,
  };

  const rideRequest = {
    riderName: "User1",
    pickup,
    destination,
    status: "requested",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  db.collection("RideRequests").add(rideRequest).then(docRef => {
    document.getElementById("status").innerText = "Ride requested!";
    showDriverDetails(docRef.id);
  });
}

function showDriverDetails(requestId) {
  setTimeout(() => {
    const driver = {
      name: "John Driver",
      car: "Toyota Prius",
      location: {
        lat: userMarker.getPosition().lat + 0.005,
        lng: userMarker.getPosition().lng + 0.005
      }
    };

    new google.maps.Marker({
      position: driver.location,
      map: map,
      title: driver.name,
      icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    });

    document.getElementById("driver-info").innerHTML = `
      <strong>Driver Assigned:</strong><br>
      Name: ${driver.name}<br>
      Car: ${driver.car}<br>
      ETA: ~3 mins
    `;

    document.getElementById("status").innerText = "Driver is on the way!";
  }, 2000);
}
