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

let map, mapEvent;

// navigator.geolocation.getCurrentPosition(..., ...); // async operation
navigator.geolocation.getCurrentPosition(function (position) {
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
  map = L.map("map").setView(coords, 13);
  // console.log(map);

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

  // L.marker(coords).addTo(map).bindPopup("You're currently here!").openPopup();
  /*
   * We can't simply use "addEventListener" method to listen to events, because we
   * won't have a way to knowing the coordinates of point where the click event
   * actually ocurred!
   *
   * The "on" method is coming from Leaflet library itself!
   */
  map.on(
    "click",
    function (mapE) {
      // console.log(mapEvent);
      mapEvent = mapE;
      form.classList.remove("hidden");
      inputDistance.focus();
    },
    function () {
      alert("Couldn't get your location!");
    }
  );

  /* Whenever we hit "Enter" key in any of the input field
   * element, a submit event gets triggered!
   */
  form.addEventListener("submit", function (e) {
    // default behavior of forms is to reload the page after submitting
    // we my do NOT want that...!
    e.preventDefault();

    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    // after submitting the form, display the marker since we want to display
    // form data on map markers
    const { lat, lng } = mapEvent.latlng;
    /* We want to customize the popup message appears on the marker
     * and also the msg disappers as soon as we click for other
     * markers, but we want the popup message to persist!
     *                We can achieve this by passing-in an options
     * object!
     *
     * "autoClose" and "closeOnClick" are for not to close popups,
     * and "className" is a css class name for styling the popup.
     *
     * "openPopup" is actually the method which opens up the marker!
     */
    // L.marker([lat, lng]).addTo(map).bindPopup("Workout").openPopup();
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
  });
});

/* Whenever we select an option in a <select> element, a "change"
 * event is triggered!
 */
inputType.addEventListener("change", function () {
  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
});
