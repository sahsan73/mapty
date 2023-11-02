"use strict";

// prettier-ignore
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// console.log(navigator.geolocation);

navigator.geolocation.getCurrentPosition(
  function (position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    /* The map method accepts an "id" of an html element inside which the
     * map will be rendered. And "L" is a namespace of Leaflet library, just
     * like "Intl" for Interlization.
     *
     * The second parameter the "setView" accepts for zoom in/out, larger
     * value for zoom in and smaller value for zoom out.
     */
    const map = L.map("map").setView(coords, 13);

    /* The map we see on the page is basically made up of small tiles and the
     * tiles come from the URL ("https://tile.openstreetmap.org/{z}/{x}/{y}.png" <-- openstreetmap
     * is opensource map, leaflet works with all kinds of map, for e.g., googlemaps).
     *
     * We can also use that URL to change the apperance of the map
     */
    // L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(coords).addTo(map).bindPopup("You're currently here!").openPopup();
  },
  function () {
    alert("Couldn't get your location!");
  }
);
