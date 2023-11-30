const fs = require('fs');
const parser = require('fast-xml-parser');

function obtenerDatosAudiometria(archivo) {

  const xml = parser.parse(fs.readFileSync(archivo, {
    encoding: 'utf8',
    flag: 'r'
  }));

  const results = {
    Right: {
      Frequency: [],
      IntensityUT: [],
      SignalType: ""
    },
    Left: {
      Frequency: [],
      IntensityUT: [],
      SignalType: ""
    }
  };


  const Test = xml?.SaData?.Session?.Test;
  const TestOne = Array.isArray(Test) ? Test.find(t => t.TestName === 'Tone') : Test;

  const Measured = TestOne?.Data?.RecordedData?.Measured;
  const MeasuredArray = Array.isArray(Measured) ? Measured : [Measured];

  for (measure of MeasuredArray) {

    const earside = measure?.Tone?.Earside;

    if (measure?.Tone?.Earside in results) {

      results[earside].SignalType = measure?.Tone?.SignalType;
	  
	  const TonePoint = measure?.Tone?.TonePoint;
	  const TonePointArray = Array.isArray(TonePoint) ? TonePoint : [TonePoint];

      for (let tonePoint of TonePointArray) {
        results[earside].Frequency.push(tonePoint?.Frequency)
        results[earside].IntensityUT.push(tonePoint?.IntensityUT)
      }
    }
  }

  return results;
}

function obtenerDatosCorticales(archivo) {

  const data = parser.parse(fs.readFileSync(archivo, {
    encoding: 'utf8',
    flag: 'r'
  }), {
    ignoreAttributes: false
  });

  // const gain = parseInt(data.EPxxWaveforms.Waveform.Gain);
  // const ipsiA = data.EPxxWaveforms.Waveform.Response.IPSI_A_Raw.Value;
  // const ipsiB = data.EPxxWaveforms.Waveform.Response.IPSI_B_Raw.Value;

  // const voltageRatio = Math.pow(10, (gain / 20))
  // const f = 1000000 * (1.6 / voltageRatio) / 32768;
  // const ipsi = ipsiA.map((_, i) => ((f * ipsiA[i] + f * ipsiB[i]) / 2).toFixed(3));

  const nombreArchivo = archivo.slice(archivo.lastIndexOf('/') + 1);;

  const result = {
    id_xml: nombreArchivo,
    filename: nombreArchivo,
    patient_id: data?.EPxxWaveforms?.Waveform?.PatientID,
    protocol: data?.EPxxWaveforms?.Waveform?.TestName,
    stimulus_type: data?.EPxxWaveforms?.Waveform?.StimuliType,
    frequency: data?.EPxxWaveforms?.Waveform?.Burst?.Frequency,
    stimulus_polarity: data?.EPxxWaveforms?.Waveform?.StimulusPolarity,
    stimulus_rate: data?.EPxxWaveforms?.Waveform?.StimulusRate,
    sweeps_measured: data?.EPxxWaveforms?.Waveform?.NumberOfMeasurements,
    sweeps_rejected: data?.EPxxWaveforms?.Waveform?.NumberOfRejected,
    high_pass_hardware: data?.EPxxWaveforms?.Waveform?.HighPassHW,
    low_pass_hardware: data?.EPxxWaveforms?.Waveform?.LowPassHW,
    gain: parseInt(data?.EPxxWaveforms?.Waveform?.Gain),
    ipsi_a: data?.EPxxWaveforms?.Waveform?.Response?.IPSI_A_Raw?.Value,
    ipsi_b: data?.EPxxWaveforms?.Waveform?.Response?.IPSI_B_Raw?.Value,
    contra_a: data?.EPxxWaveforms?.Waveform?.Response?.Contra_A_Raw?.Value,
    contra_b: data?.EPxxWaveforms?.Waveform?.Response?.Contra_B_Raw?.Value
  }

  if ('@_DayOfBirth' in data?.EPxxWaveforms?.Waveform) {
    const value = data?.EPxxWaveforms?.Waveform['@_DayOfBirth'];
    result.birth_date = new Date(value);
  }

  if ('@_Date' in data?.EPxxWaveforms?.Waveform) {
    const value = data?.EPxxWaveforms?.Waveform['@_Date'];
    result.session_date = new Date(value);
  }

  if ('@_StimuliSide' in data?.EPxxWaveforms?.Waveform) {
    result.stimulus_side = data?.EPxxWaveforms?.Waveform['@_StimuliSide'];
  }

  if ('@_Intensity' in data?.EPxxWaveforms?.Waveform) {
    result.intensity = data?.EPxxWaveforms?.Waveform['@_Intensity'];
  }

  return result;
}



module.exports = {
  obtenerDatosAudiometria,
  obtenerDatosCorticales
}
