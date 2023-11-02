"use strict";

// console.log(navigator.geolocation);

class Workout {
  date = new Date();
  // Our application is very small, we can create ids like this. Otherwise, in
  // real world, always use 3rd-party library for creating unique ids
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    /* the sentence/comment "prettier-ignore" ignores prettier formatting on the next line */
    // prettier-ignore
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    /* if we would call this method in parent class, the "type" property will NOT
     * be available */
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const cyc = new Cycling([124, -53], 23, 95, 523);
// console.log(cyc);

///////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    /* Whenever we hit "Enter" key in any of the input field
     * element, a submit event gets triggered!
     *
     * Inside the callback function, the "this" keyword will point
     * to an HTML element where the event listener attached to.
     */
    form.addEventListener("submit", this._newWorkout.bind(this));

    /* Whenever we select an option in a <select> element, a "change"
     * event is triggered!
     */
    inputType.addEventListener("change", this._toggleElevationField);

    /* we have to use event delegation (event listener on parent element) because
     * we don't have the element yet where we want to attach the event listener
     */
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    /*
     * navigator.geolocation.getCurrentPosition(..., ...); // async operation
     * The callback function "_loadMap" invoked by the "getCurrentPosition" is just like
     * a regular function call where "this" keyword is set to undefined, so we need to bind
     * the callback function.
     */
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Sorry...! Couldn't get your location");
      }
    );
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude, longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    /* The map method accepts an "id" of an html element inside which the
     * map will be rendered. And "L" is a namespace of Leaflet library, just
     * like "Intl" for Interlization.
     *
     * The second parameter the "setView" accepts for zoom in/out, larger
     * value for zoom in and smaller value for zoom out.
     */
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
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
    }).addTo(this.#map);

    // L.marker(coords).addTo(map).bindPopup("You're currently here!").openPopup();
    /* HANDLING CLICK EVENTS ON MAP
     * We can't simply use "addEventListener" method to listen to events, because we
     * won't have a way to knowing the coordinates of point where the click event
     * actually ocurred!
     *
     * The "on" method is coming from Leaflet library itself!
     */
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    // console.log(mapEvent);
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    /* because an animation (for 1s) is set on the "form" element, if we simply add
     * the "hidden" class, our workout list item will slide up because of animation
     * which doesn't look so good!
     *
     * So we can use the below trick to avoid animation while hiding the form element.
     *
     * Now, you might ask a question if we want to avoid animation then why do u even
     * use it? --> because we want that animation when the form element appears
     */
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    // default behavior of forms is to reload the page after submitting
    // we my do NOT want that...!
    e.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    /* CREATE NEW WORKOUT */
    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If the workout is running, create running object
    /* <option value="running">Running</option>
     * The type is checked against the value property set in the option element
     */
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Check for data validation
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Input have to be positive numbers");
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If the workout is cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      // Check for data validation
      /* elevation could be -ve while going down the mountain */
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Input have to be positive numbers");
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workouts array
    this.#workouts.push(workout);

    // Render workout on map as a marker
    /* After submitting the form, display the marker since we want to display form data on map markers */
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + Clear input fields
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    /* We want to customize the popup message appears on the marker and also the msg disappers as
     * soon as we click for other markers, but we want the popup message to persist!
     *                We can achieve this by passing-in an options object!
     *
     * "autoClose" and "closeOnClick" are for not to close popups, and "className" is a css
     *  class name for styling the popup.
     *
     * "openPopup" is actually the method which opens up the marker!
     */
    // L.marker([lat, lng]).addTo(map).bindPopup("Workout").openPopup();
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">Running on April 14</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🏃" : "🚴‍♀️"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === "running") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    } else {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;

    console.log(workoutEl);

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    // console.log(this.#workouts);
    // console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

// start the application
const app = new App();
