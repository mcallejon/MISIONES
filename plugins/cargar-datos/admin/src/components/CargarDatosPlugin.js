import React, { Component } from 'react';

function show(data) {
  const pData = document.getElementById('data');
  const h3 = document.createElement("h3");
  h3.innerHTML=data;
  pData.appendChild(h3);
  pData.appendChild(document.createElement("br"));
}

class CargarDatosPlugin extends Component {
    
  constructor(props){
    super(props);

    if (!confirm('¿Cargar datos?')) { 
      window.history.back();
      return;
    }

    this.data = '';
    const socket = (location.protocol === 'http:') ? 
      new WebSocket(`ws://${location.hostname}:8082`) :
      new WebSocket(`wss://${location.hostname}:8082`);

    socket.onerror = function () {
      console.log('Error desconocido');
    };

    /*
    socket.onopen = function () {
      show('Connected. Starting...');
    };
    */

    socket.onmessage = function (e) {
      if (typeof e.data === 'string') {
        //console.log(e.data);
        show(e.data);
      }
    };
  }

  render() {
    return (
      <div className="col-md-12">
        <br></br>
        <p id="data">
          {this.data}
        </p>
      </div>
    );
  }
}
export default CargarDatosPlugin