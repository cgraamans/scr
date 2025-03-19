<template>
  <button @click="connect()">Connect</button>
  <button @click="disconnect()">Disconnect</button>
  <button @click="login()">Login (john,changeit)</button>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "ConnectionManager",

  methods: {
    connect() {
      socket.connect();
    },
    disconnect() {
      socket.disconnect();
    },
    created() {
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "john", password:"changeit" })
      };
      fetch("https://localhost:3000/login", requestOptions)
        .then(response => response.json())
        .then(data => (this.postId = data.id));
    }
  }
}
</script>