import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);

socket.on("connect", () => {
  console.log('connected');
  state.connected = true;
});

socket.on("disconnect", () => {
  console.log('disconnected');
  state.connected = false;
});

socket.on("foo", (...args) => {

    console.log(args);

//   state.fooEvents.push(args);
});

socket.on("bar", (...args) => {

    console.log(args);

//   state.barEvents.push(args);
});